import { useState, useEffect, useCallback } from 'react';
import { getRecord, createRecord } from '../../services/ApiService.js';
import {
  guardConfirmPage,
  navigateTo,
  buildPageUrl,
} from '../../services/NavigationService.js';
import { useToast } from '../../lib/useToast.js';
import { WsbButton } from '../ui/WsbButton.jsx';
import './WsbConfirmPage.css';

const TYPE_LABELS = {
  'bureau':               'Bureau',
  'openspace-classique':  'Open Space classique',
  'openspace-specialise': 'Openspace spécialisé',
  'openspace':            'Open Space',
  'openspace-spe':        'Openspace spécialisé',
  'phonebox':             'Phone Box',
  'meetingroom':          'Meeting Room',
};

const FLOOR_LABELS = {
  '2': 'Niveau 2',
  '3': 'Niveau 3',
  '4': 'Niveau 4',
  '5': 'Niveau 5',
};

const PARKING_LABELS = {
  thermique: 'Place thermique 🚗',
  electric:  'Place électrique ⚡',
};

const DEFAULT_START = '09:00';
const DEFAULT_END   = '17:00';

function formatDateDisplay(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function SkeletonBlock({ width = '100%', height = 18 }) {
  return (
    <div
      className="wsb-skeleton wsb-confirm__skeleton-block"
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

function SkeletonConfirmPage() {
  return (
    <div className="wsb-confirm" aria-busy="true" aria-label="Chargement de la confirmation">
      <div className="wsb-confirm__header">
        <SkeletonBlock width={120} height={14} />
        <SkeletonBlock width="60%" height={32} />
        <SkeletonBlock width="40%" height={16} />
      </div>
      <div className="wsb-confirm__card">
        <SkeletonBlock width={140} height={14} />
        <div className="wsb-confirm__details-grid">
          <SkeletonBlock height={60} />
          <SkeletonBlock height={60} />
          <SkeletonBlock height={60} />
        </div>
        <SkeletonBlock width={140} height={14} />
        <SkeletonBlock width="50%" height={20} />
        <SkeletonBlock width="50%" height={20} />
        <div className="wsb-confirm__actions">
          <SkeletonBlock width={220} height={40} />
          <SkeletonBlock width={100} height={40} />
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
    <div className="wsb-confirm">
      <div className="wsb-confirm__error" role="alert">
        <div className="wsb-confirm__error-icon"><WarningIcon /></div>
        <h1 className="wsb-confirm__error-title">Impossible de charger les détails</h1>
        <p className="wsb-confirm__error-desc">
          Une erreur est survenue. Veuillez réessayer.
        </p>
        <div className="wsb-confirm__error-actions">
          <WsbButton variant="primary" onClick={onRetry}>Réessayer</WsbButton>
          <a href={buildPageUrl('search')} className="wsb-confirm__error-link">
            ← Nouvelle recherche
          </a>
        </div>
      </div>
    </div>
  );
}

function RecapItem({ label, value }) {
  return (
    <div className="wsb-confirm__recap-item">
      <span className="wsb-confirm__recap-label">{label}</span>
      <span className="wsb-confirm__recap-value">{value}</span>
    </div>
  );
}

async function submitReservation(space, params) {
  const { date, car, parking } = params;
  const spaceName = space?.name || params.space_id;
  const spaceType = space?.type || params.type;
  const spaceFloor = space?.floor || params.floor;
  const typeLabel = TYPE_LABELS[spaceType] || spaceType;
  const needsParking = car === 'true' && parking;

  const request = await createRecord('sc_request', {
    short_description: `Réservation FlexDesk — ${typeLabel} ${spaceName} — ${formatDateDisplay(date)}`,
  });

  const bookingMeta = {
    spaceId: spaceName,
    type: spaceType,
    floor: spaceFloor,
    date,
    start: DEFAULT_START,
    end: DEFAULT_END,
  };

  await createRecord('sc_req_item', {
    request: request.sys_id,
    state: '1',
    short_description: JSON.stringify(bookingMeta),
    u_booking_date: date,
    u_arrival_time: DEFAULT_START,
    u_departure_time: DEFAULT_END,
    u_space_id: spaceName,
    u_parking_space: needsParking ? parking : 'none',
  });

  if (needsParking) {
    const parkingType = parking === 'electric'
      ? 'parking-electrique'
      : 'parking-thermique';

    await createRecord('sc_req_item', {
      request: request.sys_id,
      state: '1',
      short_description: JSON.stringify({
        type: parkingType,
        date,
        start: DEFAULT_START,
        end: DEFAULT_END,
      }),
      u_booking_date: date,
      u_arrival_time: DEFAULT_START,
      u_departure_time: DEFAULT_END,
      u_parking_space: parking,
    });
  }
}

export function WsbConfirmPage() {
  const [guard] = useState(guardConfirmPage);
  const [space, setSpace] = useState(null);
  const [status, setStatus] = useState('loading');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const { space_id, sys_id, building, floor, date, type, car, parking } = guard.params;
  const needsParking = car === 'true' && Boolean(parking);

  const loadSpace = useCallback(async () => {
    if (!guard.valid) return;
    setStatus('loading');
    try {
      const lookupId = sys_id || space_id;
      const result = await getRecord('x_wsb_flex_space', lookupId);
      setSpace(result);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [guard, sys_id, space_id]);

  useEffect(() => { loadSpace(); }, [loadSpace]);

  const handleConfirm = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await submitReservation(space, guard.params);
      toast.success('Réservation confirmée !');
      navigateTo('reservations');
    } catch {
      toast.error('Une erreur est survenue lors de la réservation. Veuillez réessayer.');
      setSubmitting(false);
    }
  }, [submitting, space, guard.params, toast]);

  const handleCancel = () => {
    const { space_id: _, route: __, ...criteria } = guard.params;
    navigateTo('results', criteria);
  };

  if (!guard.valid)         return null;
  if (status === 'loading') return <SkeletonConfirmPage />;
  if (status === 'error')   return <ErrorState onRetry={loadSpace} />;

  const spaceName  = space?.name || space_id;
  const typeLabel  = TYPE_LABELS[space?.type || type] || type;
  const floorLabel = space?.floor_label || FLOOR_LABELS[space?.floor || floor] || `Étage ${floor}`;

  return (
    <div className="wsb-confirm">
      <div className="wsb-confirm__header">
        <span className="wsb-confirm__badge">CONFIRMATION</span>
        <h1 className="wsb-confirm__title" tabIndex={-1}>
          Confirmer votre réservation
        </h1>
        <p className="wsb-confirm__subtitle">
          Vérifiez les détails ci-dessous avant de confirmer.
        </p>
      </div>

      <div className="wsb-confirm__card">
        <section className="wsb-confirm__section">
          <h2 className="wsb-confirm__section-title">📍 ESPACE DE TRAVAIL</h2>
          <div className="wsb-confirm__details-grid">
            <RecapItem label="N° de place" value={spaceName} />
            <RecapItem label="Étage" value={floorLabel} />
            <RecapItem label="Type" value={typeLabel} />
          </div>
        </section>

        <section className="wsb-confirm__section">
          <h2 className="wsb-confirm__section-title">🏢 LOCALISATION</h2>
          <p className="wsb-confirm__detail-text">Bâtiment {building}</p>
        </section>

        <section className="wsb-confirm__section">
          <h2 className="wsb-confirm__section-title">📅 DATE &amp; CRÉNEAU</h2>
          <p className="wsb-confirm__detail-text wsb-confirm__detail-text--date">
            {formatDateDisplay(date)}
          </p>
          <p className="wsb-confirm__detail-text wsb-confirm__detail-text--time">
            {DEFAULT_START} — {DEFAULT_END} (Journée complète)
          </p>
        </section>

        {needsParking && (
          <section className="wsb-confirm__section">
            <h2 className="wsb-confirm__section-title">🚗 STATIONNEMENT</h2>
            <p className="wsb-confirm__parking-badge">
              {PARKING_LABELS[parking] || parking}
            </p>
          </section>
        )}

        <div className="wsb-confirm__actions">
          <WsbButton
            variant="primary"
            size="md"
            loading={submitting}
            onClick={handleConfirm}
          >
            Confirmer ma réservation
          </WsbButton>
          <WsbButton
            variant="secondary"
            size="md"
            disabled={submitting}
            onClick={handleCancel}
          >
            Annuler
          </WsbButton>
        </div>
      </div>
    </div>
  );
}
