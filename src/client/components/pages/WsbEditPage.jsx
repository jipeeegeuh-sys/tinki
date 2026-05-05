import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { getRecord, updateRecord, createRecord, fetchTablePage } from '../../services/ApiService.js';
import { guardEditPage, navigateTo, buildPageUrl } from '../../services/NavigationService.js';
import { getTomorrowISO, isWeekend } from '../../lib/dateUtils.js';
import { buildAriaError, FormError } from '../../lib/useFocusError.js';
import { useToast } from '../../lib/useToast.js';
import { WsbButton } from '../ui/WsbButton.jsx';
import './WsbEditPage.css';

const TYPE_LABELS = {
  'openspace-classique':  'Open Space classique',
  'openspace-specialise': 'Open Space spécialisé',
  'bureau':               'Bureau',
  'phonebox':             'Phone Box',
  'meetingroom':          'Meeting Room',
};

const FLOOR_LABELS = {
  '2': '2e étage', '3': '3e étage',
  '4': '4e étage', '5': '5e étage',
  'ss': 'Sous-sol', '-1': 'Sous-sol',
};

const PARKING_TYPE_OPTIONS = [
  { value: 'thermique', label: 'Thermique 🚗' },
  { value: 'electric',  label: 'Électrique ⚡' },
];

const PARKING_TYPE_LABELS = { thermique: 'Thermique', electric: 'Électrique' };
const PARKING_CAPACITY = { electric: 8, thermique: 20 };

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
  const ref = raw.request;
  return {
    sysId:         raw.sys_id,
    requestId:     typeof ref === 'object' ? ref.value : ref,
    number:        raw.number || '',
    spaceId:       extra.spaceId  || raw.u_space_id || '—',
    type:          extra.type     || '—',
    floor:         extra.floor    || '—',
    date:          raw.u_booking_date  || extra.date  || raw.opened_at?.slice(0, 10) || '',
    arrivalTime:   normalizeTime(raw.u_arrival_time   || extra.start),
    departureTime: normalizeTime(raw.u_departure_time || extra.end),
  };
}

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
      <nav className="wsb-edit__breadcrumb" aria-label="Fil d'Ariane">
        <a href={buildPageUrl('reservations')} className="wsb-edit__breadcrumb-link">
          ← Mes réservations
        </a>
      </nav>
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
          <a href={buildPageUrl('reservations')} className="wsb-edit__error-link">
            ← Mes réservations
          </a>
        </div>
      </div>
    </div>
  );
}

function RadioOption({ name, value, checked, onChange, label, error }) {
  return (
    <label className={`wsb-edit__radio-label${checked ? ' wsb-edit__radio-label--checked' : ''}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="wsb-sr-only"
        aria-invalid={error ? 'true' : undefined}
      />
      <span className="wsb-edit__radio-mark" aria-hidden="true" />
      {label}
    </label>
  );
}

export function WsbEditPage() {
  const [guard]            = useState(() => guardEditPage());
  const [status, setStatus]             = useState('loading');
  const [booking, setBooking]           = useState(null);
  const [existingParking, setExistingParking] = useState(null);
  const [date, setDate]                 = useState('');
  const [arrival, setArrival]           = useState('');
  const [depart, setDepart]             = useState('');
  const [parkingMode, setParkingMode]   = useState('keep');
  const [parkingType, setParkingType]   = useState('thermique');
  const [saving, setSaving]             = useState(false);
  const [conflictError, setConflictError] = useState(null);
  const [parkingError, setParkingError]   = useState(null);
  const { toast }        = useToast();
  const conflictRef      = useRef(null);
  const parkingErrRef    = useRef(null);
  const minDate          = useMemo(() => getTomorrowISO(), []);
  const errors           = useMemo(() => validateSchedule(date, arrival, depart), [date, arrival, depart]);
  const allFieldsFilled  = date && arrival && depart;
  const needsParkingType = parkingMode === 'add' || parkingMode === 'change';
  const canSave          = allFieldsFilled && Object.keys(errors).length === 0
                           && (!needsParkingType || parkingType);

  const hasParking = existingParking !== null;
  const parkingModes = hasParking
    ? [
        { value: 'keep',   label: 'Conserver' },
        { value: 'change', label: 'Modifier' },
        { value: 'remove', label: 'Supprimer' },
      ]
    : [
        { value: 'keep', label: 'Conserver' },
        { value: 'add',  label: 'Ajouter' },
      ];

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

      if (parsed.requestId) {
        const { items } = await fetchTablePage('sc_req_item', {
          sysparm_query: `request=${parsed.requestId}^sys_id!=${parsed.sysId}^state!=4^u_parking_space!=none`,
          sysparm_limit: '1',
          sysparm_fields: 'sys_id,u_parking_space',
        });
        if (items.length > 0) {
          const item = items[0];
          setExistingParking({ sysId: item.sys_id, type: item.u_parking_space });
          setParkingType(item.u_parking_space);
        }
      }

      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [guard]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (conflictError && conflictRef.current) conflictRef.current.focus();
  }, [conflictError]);

  useEffect(() => {
    if (parkingError && parkingErrRef.current) parkingErrRef.current.focus();
  }, [parkingError]);

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return;
    setSaving(true);
    setConflictError(null);
    setParkingError(null);

    try {
      const scheduleChanged =
        date !== booking.date ||
        arrival !== booking.arrivalTime ||
        depart !== booking.departureTime;

      if (scheduleChanged) {
        const { total } = await fetchTablePage('sc_req_item', {
          sysparm_query: `u_space_id=${booking.spaceId}^u_booking_date=${date}^u_arrival_time<${depart}^u_departure_time>${arrival}^sys_id!=${booking.sysId}^state!=4`,
          sysparm_limit: '1',
          sysparm_fields: 'sys_id',
        });
        if (total > 0) {
          setConflictError("Cet espace n'est plus disponible sur ce créneau. Veuillez choisir un autre horaire.");
          setSaving(false);
          return;
        }
      }

      if (needsParkingType) {
        const { total: bookedParking } = await fetchTablePage('sc_req_item', {
          sysparm_query: `u_parking_space=${parkingType}^u_booking_date=${date}^u_arrival_time<${depart}^u_departure_time>${arrival}^sys_id!=${booking.sysId}^state!=4`,
          sysparm_limit: '1',
          sysparm_fields: 'sys_id',
        });
        if (bookedParking >= PARKING_CAPACITY[parkingType]) {
          const label = PARKING_TYPE_LABELS[parkingType] || parkingType;
          setParkingError(`Aucune place ${label} n'est disponible sur ce créneau.`);
          setSaving(false);
          return;
        }
      }

      let newParkingValue;
      if (parkingMode === 'add' || parkingMode === 'change') newParkingValue = parkingType;
      if (parkingMode === 'remove') newParkingValue = 'none';

      const updateBody = {
        short_description: JSON.stringify({
          spaceId: booking.spaceId,
          type: booking.type,
          floor: booking.floor,
          date,
          start: arrival,
          end: depart,
        }),
        u_booking_date: date,
        u_arrival_time: arrival,
        u_departure_time: depart,
      };
      if (newParkingValue !== undefined) {
        updateBody.u_parking_space = newParkingValue;
      }
      await updateRecord('sc_req_item', booking.sysId, updateBody);

      if (parkingMode === 'remove' && existingParking) {
        await updateRecord('sc_req_item', existingParking.sysId, { state: '4' });
      } else if (parkingMode === 'add' || (parkingMode === 'change' && existingParking)) {
        if (parkingMode === 'change') {
          await updateRecord('sc_req_item', existingParking.sysId, { state: '4' });
        }
        const fullType = parkingType === 'electric' ? 'parking-electrique' : 'parking-thermique';
        await createRecord('sc_req_item', {
          request: booking.requestId,
          state: '1',
          short_description: JSON.stringify({
            type: fullType,
            date,
            start: arrival,
            end: depart,
          }),
          u_booking_date: date,
          u_arrival_time: arrival,
          u_departure_time: depart,
          u_parking_space: parkingType,
        });
      }

      toast.success('Réservation mise à jour !');
      navigateTo('reservations');
    } catch {
      toast.error('Une erreur est survenue. Veuillez réessayer.');
      setSaving(false);
    }
  }, [canSave, saving, date, arrival, depart, parkingMode, parkingType, needsParkingType, booking, existingParking, toast]);

  if (!guard.valid)         return null;
  if (status === 'loading') return <SkeletonEditForm />;
  if (status === 'error')   return <ErrorState onRetry={load} />;

  const typeLabel  = TYPE_LABELS[booking.type]   || booking.type;
  const floorLabel = FLOOR_LABELS[booking.floor] || booking.floor;

  return (
    <div className="wsb-edit">
      <nav className="wsb-edit__breadcrumb" aria-label="Fil d'Ariane">
        <a href={buildPageUrl('reservations')} className="wsb-edit__breadcrumb-link">
          ← Mes réservations
        </a>
      </nav>
      <div className="wsb-edit__header">
        <span className="wsb-edit__badge">ÉDITION</span>
        <h1 className="wsb-edit__title" tabIndex={-1}>Modifier ma réservation</h1>
        {booking.number && (
          <p className="wsb-edit__subtitle">Réservation #{booking.number}</p>
        )}
      </div>

      <div className="wsb-edit__card">
        {conflictError && (
          <div
            id="conflict-schedule"
            ref={conflictRef}
            className="wsb-edit__conflict"
            role="alert"
            tabIndex={-1}
          >
            {conflictError}
          </div>
        )}

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
                onChange={e => { setDate(e.target.value); setConflictError(null); }}
                {...(conflictError
                  ? { 'aria-invalid': 'true', 'aria-errormessage': 'conflict-schedule' }
                  : buildAriaError('date', errors.date))}
              />
              <FormError fieldName="date" error={errors.date} />
            </div>
            <div className="wsb-edit__field">
              <label htmlFor="wsb-edit-arrival" className="wsb-edit__label">
                Heure d&apos;arrivée
              </label>
              <input
                type="time"
                id="wsb-edit-arrival"
                className="wsb-edit__input"
                value={arrival}
                onChange={e => { setArrival(e.target.value); setConflictError(null); }}
                {...(conflictError
                  ? { 'aria-invalid': 'true', 'aria-errormessage': 'conflict-schedule' }
                  : {})}
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
                onChange={e => { setDepart(e.target.value); setConflictError(null); }}
                {...(conflictError
                  ? { 'aria-invalid': 'true', 'aria-errormessage': 'conflict-schedule' }
                  : buildAriaError('depart', errors.depart))}
              />
              <FormError fieldName="depart" error={errors.depart} />
            </div>
          </div>
        </fieldset>

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
            La place réservée ne peut pas être modifiée. Pour changer d&apos;espace,
            annulez cette réservation et effectuez une nouvelle recherche.
          </p>
        </div>

        <fieldset className="wsb-edit__fieldset">
          <legend className="wsb-edit__legend">Place de stationnement</legend>

          {hasParking ? (
            <p className="wsb-edit__parking-current">
              Stationnement actuel : {PARKING_TYPE_LABELS[existingParking.type] || existingParking.type}
              {existingParking.type === 'electric' ? ' ⚡' : ' 🚗'}
            </p>
          ) : (
            <p className="wsb-edit__parking-current wsb-edit__parking-current--none">
              Aucun stationnement associé à cette réservation.
            </p>
          )}

          <div className="wsb-edit__radios" role="radiogroup" aria-label="Gestion du parking">
            {parkingModes.map(({ value, label }) => (
              <RadioOption
                key={value}
                name="wsb-parking-mode"
                value={value}
                checked={parkingMode === value}
                onChange={() => { setParkingMode(value); setParkingError(null); }}
                label={label}
              />
            ))}
          </div>

          {needsParkingType && (
            <div className="wsb-edit__parking-type">
              <span className="wsb-edit__parking-sublabel">Type de place</span>
              <div className="wsb-edit__radios" role="radiogroup" aria-label="Type de stationnement">
                {PARKING_TYPE_OPTIONS.map(({ value, label }) => (
                  <RadioOption
                    key={value}
                    name="wsb-parking-type"
                    value={value}
                    checked={parkingType === value}
                    onChange={() => { setParkingType(value); setParkingError(null); }}
                    label={label}
                    error={parkingError}
                  />
                ))}
              </div>
            </div>
          )}

          {parkingMode === 'remove' && (
            <p className="wsb-edit__parking-hint" aria-live="polite">
              La place de stationnement sera supprimée de cette réservation.
            </p>
          )}

          {parkingError && (
            <p
              id="conflict-parking"
              ref={parkingErrRef}
              className="wsb-edit__conflict"
              role="alert"
              tabIndex={-1}
            >
              {parkingError}
            </p>
          )}
        </fieldset>

        <div className="wsb-edit__actions">
          <WsbButton variant="primary" disabled={!canSave} loading={saving} onClick={handleSave}>
            {saving ? 'Enregistrement en cours…' : 'Enregistrer les modifications'}
          </WsbButton>
          <WsbButton variant="secondary" onClick={() => navigateTo('reservations')}>
            Annuler
          </WsbButton>
        </div>
      </div>
    </div>
  );
}
