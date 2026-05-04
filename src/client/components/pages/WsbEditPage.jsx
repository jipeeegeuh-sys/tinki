import { useState, useEffect, useCallback, useMemo } from 'react';
import { getRecord } from '../../services/ApiService.js';
import { guardEditPage, navigateTo } from '../../services/NavigationService.js';
import { getTomorrowISO, isWeekend } from '../../lib/dateUtils.js';
import { buildAriaError, FormError } from '../../lib/useFocusError.js';
import { WsbButton } from '../ui/WsbButton.jsx';
import './WsbEditPage.css';

const PARKING_OPTIONS = [
  { value: 'none',       label: 'Aucun parking' },
  { value: 'thermique',  label: 'Thermique' },
  { value: 'electrique', label: 'Électrique (⚡)' },
];

const PARKING_HINTS = {
  none:       'Votre réservation ne comprendra aucune place de stationnement.',
  electrique: '8 places électriques dans le parc.',
};

const TYPE_LABELS = {
  'openspace-classique':  'Open Space classique',
  'openspace-specialise': 'Open Space spécialisé',
  'bureau':               'Bureau',
  'phonebox':             'Phone Box',
  'meetingroom':          'Meeting Room',
  'parking-electrique':   'Parking Électrique',
  'parking-thermique':    'Parking Thermique',
};

const FLOOR_LABELS = {
  '2': '2e étage', '3': '3e étage',
  '4': '4e étage', '5': '5e étage',
  'ss': 'Sous-sol', '-1': 'Sous-sol',
};

function normalizeTime(val) {
  return val ? String(val).slice(0, 5) : '';
}

function validateSchedule(date, arrival, depart) {
  const errors = {};
  if (date && isWeekend(date)) {
    errors.date = 'Les réservations ne sont possibles que les jours ouvrés.';
  }
  if (arrival && depart && depart <= arrival) {
    errors.depart = "L'heure de départ doit être postérieure à l'heure d'arrivée.";
  }
  return errors;
}

function parseBooking(raw) {
  let extra = {};
  try { extra = JSON.parse(raw.short_description); } catch { /* text fallback */ }
  return {
    sysId:         raw.sys_id,
    number:        raw.number || '',
    spaceId:       extra.spaceId  || raw.u_space_id || '—',
    type:          extra.type     || '—',
    floor:         extra.floor    || '—',
    date:          raw.u_booking_date  || extra.date  || raw.opened_at?.slice(0, 10) || '',
    arrivalTime:   normalizeTime(raw.u_arrival_time   || extra.start),
    departureTime: normalizeTime(raw.u_departure_time || extra.end),
    parking:       raw.u_parking_space || 'none',
  };
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonField() {
  return <div className="wsb-skeleton wsb-edit__skeleton-field" aria-hidden="true" />;
}

function SkeletonSection({ labelWidth = '25%', children }) {
  return (
    <div className="wsb-edit__fieldset">
      <div className="wsb-skeleton wsb-skeleton--line" style={{ width: labelWidth, marginBottom: 16 }} aria-hidden="true" />
      {children}
    </div>
  );
}

function SkeletonEditForm() {
  return (
    <div className="wsb-edit" aria-busy="true" aria-label="Chargement de la réservation">
      <div className="wsb-edit__header">
        <div className="wsb-skeleton wsb-skeleton--badge" style={{ width: 70, marginBottom: 8 }} aria-hidden="true" />
        <div className="wsb-skeleton wsb-skeleton--title" style={{ width: '50%', height: 36, marginBottom: 8 }} aria-hidden="true" />
        <div className="wsb-skeleton wsb-skeleton--line" style={{ width: '30%' }} aria-hidden="true" />
      </div>
      <div className="wsb-edit__card">
        <SkeletonSection labelWidth="18%">
          <div className="wsb-edit__fields-row">
            <SkeletonField /><SkeletonField /><SkeletonField />
          </div>
        </SkeletonSection>
        <SkeletonSection labelWidth="22%">
          <div className="wsb-edit__workspace-info">
            <SkeletonField /><SkeletonField /><SkeletonField />
          </div>
        </SkeletonSection>
        <SkeletonSection labelWidth="26%">
          <div className="wsb-edit__radios">
            {[70, 90, 100].map((w) => (
              <div key={w} className="wsb-skeleton wsb-skeleton--line" style={{ width: w }} aria-hidden="true" />
            ))}
          </div>
        </SkeletonSection>
        <div className="wsb-edit__actions">
          <div className="wsb-skeleton wsb-skeleton--btn" style={{ width: 200 }} aria-hidden="true" />
          <div className="wsb-skeleton wsb-skeleton--btn" style={{ width: 110 }} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

// ── Error state ───────────────────────────────────────────────────────────────

const WarningIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <path d="M24 5L45 41H3L24 5Z" stroke="var(--wsb-color-warning)" strokeWidth="2.5"
      strokeLinejoin="round" strokeOpacity="0.5" />
    <path d="M24 19V30" stroke="var(--wsb-color-warning)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="24" cy="36" r="2" fill="var(--wsb-color-warning)" />
  </svg>
);

function ErrorState({ onRetry }) {
  return (
    <div className="wsb-edit">
      <div className="wsb-edit__error" role="alert">
        <div className="wsb-edit__error-icon"><WarningIcon /></div>
        <h1 className="wsb-edit__error-title">Impossible de charger la réservation</h1>
        <p className="wsb-edit__error-desc">
          Une erreur est survenue lors de la récupération des données. Veuillez réessayer.
        </p>
        <div className="wsb-edit__error-actions">
          <WsbButton variant="primary" onClick={onRetry}>Réessayer</WsbButton>
          <a href="x_wsb_flexoffice_reservations.do" className="wsb-edit__error-link">
            ← Mes réservations
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function WsbEditPage() {
  const [guard]   = useState(() => guardEditPage());
  const [status,  setStatus]  = useState('loading');
  const [booking, setBooking] = useState(null);
  const [date,    setDate]    = useState('');
  const [arrival, setArrival] = useState('');
  const [depart,  setDepart]  = useState('');
  const [parking, setParking] = useState('none');
  const minDate = useMemo(() => getTomorrowISO(), []);
  const errors  = useMemo(() => validateSchedule(date, arrival, depart), [date, arrival, depart]);
  const allFieldsFilled = date && arrival && depart;
  const canSave = allFieldsFilled && Object.keys(errors).length === 0;

  const load = useCallback(async () => {
    if (!guard.valid) return;
    setStatus('loading');
    try {
      const raw    = await getRecord('sc_req_item', guard.params.sys_id);
      const parsed = parseBooking(raw);
      setBooking(parsed);
      setDate(parsed.date);
      setArrival(parsed.arrivalTime);
      setDepart(parsed.departureTime);
      setParking(parsed.parking);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [guard]);

  useEffect(() => { load(); }, [load]);

  if (!guard.valid)         return null;
  if (status === 'loading') return <SkeletonEditForm />;
  if (status === 'error')   return <ErrorState onRetry={load} />;

  const typeLabel  = TYPE_LABELS[booking.type]    || booking.type;
  const floorLabel = FLOOR_LABELS[booking.floor]  || booking.floor;

  return (
    <div className="wsb-edit">
      <div className="wsb-edit__header">
        <span className="wsb-edit__badge">ÉDITION</span>
        <h1 className="wsb-edit__title">Modifier ma réservation</h1>
        {booking.number && (
          <p className="wsb-edit__subtitle">Réservation #{booking.number}</p>
        )}
      </div>

      <div className="wsb-edit__card">
        {/* ── Horaires ─────────────────────────────────────────────────── */}
        <fieldset className="wsb-edit__fieldset">
          <legend className="wsb-edit__legend">Horaires</legend>
          <div className="wsb-edit__fields-row">
            <div className="wsb-edit__field">
              <label htmlFor="wsb-edit-date" className="wsb-edit__label">Date</label>
              <input
                type="date"
                id="wsb-edit-date"
                className="wsb-edit__input"
                value={date}
                min={minDate}
                onChange={e => setDate(e.target.value)}
                {...buildAriaError('date', errors.date)}
              />
              <FormError fieldName="date" error={errors.date} />
            </div>
            <div className="wsb-edit__field">
              <label htmlFor="wsb-edit-arrival" className="wsb-edit__label">
                Heure d'arrivée
              </label>
              <input
                type="time"
                id="wsb-edit-arrival"
                className="wsb-edit__input"
                value={arrival}
                onChange={e => setArrival(e.target.value)}
              />
            </div>
            <div className="wsb-edit__field">
              <label htmlFor="wsb-edit-depart" className="wsb-edit__label">
                Heure de départ
              </label>
              <input
                type="time"
                id="wsb-edit-depart"
                className="wsb-edit__input"
                value={depart}
                onChange={e => setDepart(e.target.value)}
                {...buildAriaError('depart', errors.depart)}
              />
              <FormError fieldName="depart" error={errors.depart} />
            </div>
          </div>
        </fieldset>

        {/* ── Espace de travail (non-éditable) ─────────────────────────── */}
        <div className="wsb-edit__workspace">
          <h2 className="wsb-edit__workspace-title">Espace de travail</h2>
          <div className="wsb-edit__workspace-info">
            <div className="wsb-edit__workspace-detail">
              <span className="wsb-edit__workspace-label">N° de place</span>
              <span className="wsb-edit__workspace-value">{booking.spaceId}</span>
            </div>
            <div className="wsb-edit__workspace-detail">
              <span className="wsb-edit__workspace-label">Étage</span>
              <span className="wsb-edit__workspace-value">{floorLabel}</span>
            </div>
            <div className="wsb-edit__workspace-detail">
              <span className="wsb-edit__workspace-label">Type</span>
              <span className="wsb-edit__workspace-value">{typeLabel}</span>
            </div>
          </div>
          <p className="wsb-edit__workspace-note">
            La place réservée ne peut pas être modifiée. Pour changer d'espace,
            annulez cette réservation et effectuez une nouvelle recherche.
          </p>
        </div>

        {/* ── Stationnement ─────────────────────────────────────────────── */}
        <fieldset className="wsb-edit__fieldset">
          <legend className="wsb-edit__legend">Place de stationnement</legend>
          <div className="wsb-edit__radios" role="radiogroup" aria-label="Type de stationnement souhaité">
            {PARKING_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className={`wsb-edit__radio-label${parking === value ? ' wsb-edit__radio-label--checked' : ''}`}
              >
                <input
                  type="radio"
                  name="wsb-parking"
                  value={value}
                  checked={parking === value}
                  onChange={() => setParking(value)}
                  className="wsb-sr-only"
                />
                <span className="wsb-edit__radio-mark" aria-hidden="true" />
                {label}
              </label>
            ))}
          </div>
          {PARKING_HINTS[parking] && (
            <p className="wsb-edit__parking-hint" aria-live="polite">
              {PARKING_HINTS[parking]}
            </p>
          )}
        </fieldset>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        <div className="wsb-edit__actions">
          <WsbButton variant="primary" disabled={!canSave}>
            Enregistrer les modifications
          </WsbButton>
          <WsbButton variant="secondary" onClick={() => navigateTo('reservations')}>
            Annuler
          </WsbButton>
        </div>
      </div>
    </div>
  );
}
