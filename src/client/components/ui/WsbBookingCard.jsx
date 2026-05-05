import { useState } from 'react';
import { buildPageUrl } from '../../services/NavigationService.js';
import './WsbBookingCard.css';

const TYPE_CONFIG = {
  'bureau':               { label: 'Bureau',               bg: 'rgba(161,0,255,0.15)', text: '#c266ff', border: 'rgba(161,0,255,0.3)' },
  'openspace-classique':  { label: 'Open Space',           bg: 'rgba(0,200,83,0.15)',  text: '#00C853', border: 'rgba(0,200,83,0.3)' },
  'openspace-specialise': { label: 'Openspace spécialisé', bg: 'rgba(0,200,83,0.15)',  text: '#00C853', border: 'rgba(0,200,83,0.3)' },
  'phonebox':             { label: 'Phonebox',             bg: 'rgba(0,145,234,0.15)', text: '#0091EA', border: 'rgba(0,145,234,0.3)' },
  'meetingroom':          { label: 'Meeting Room',         bg: 'rgba(255,152,0,0.15)', text: '#FF9800', border: 'rgba(255,152,0,0.3)' },
  'parking-electrique':   { label: 'Parking électrique',   bg: 'rgba(0,200,83,0.15)',  text: '#00C853', border: 'rgba(0,200,83,0.3)', electric: true },
  'parking-thermique':    { label: 'Parking',              bg: 'rgba(84,110,122,0.15)',text: '#90A4AE', border: 'rgba(84,110,122,0.3)' },
};

const DEFAULT_CONFIG = { label: 'Espace', bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.7)', border: 'rgba(255,255,255,0.15)' };

const LightningIcon = () => (
  <svg width="11" height="14" viewBox="0 0 11 14" fill="none" aria-hidden="true">
    <path d="M6.5 1L1 8h4L3.5 13 10 6H6L6.5 1z" fill="#FFA500" stroke="#FFA500" strokeWidth="0.4" strokeLinejoin="round" />
  </svg>
);

const CtaSpinner = () => (
  <svg
    className="wsb-booking-card__cta-spinner"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="28"
      strokeDashoffset="10"
    />
  </svg>
);

export function buildReserveUrl(spaceId, sysId, searchParams) {
  const parsed = new URLSearchParams(searchParams);
  parsed.delete('route');
  const params = Object.fromEntries(parsed);
  return buildPageUrl('confirm', { ...params, space_id: spaceId, sys_id: sysId });
}

export function WsbBookingCard({
  spaceId,
  sysId,
  floor,
  type,
  status = 'available',
  searchParams = '',
  onReserve,
}) {
  const cfg = TYPE_CONFIG[type] ?? DEFAULT_CONFIG;
  const isAvailable = status === 'available';
  const [loading, setLoading] = useState(false);

  const handleReserve = () => {
    if (loading) return;
    setLoading(true);

    const url = buildReserveUrl(spaceId, sysId, searchParams);
    if (onReserve) {
      onReserve(url);
    } else {
      window.location.href = url;
    }
  };

  return (
    <article
      className={`wsb-booking-card${isAvailable ? '' : ' wsb-booking-card--occupied'}`}
      aria-label={`${cfg.label} ${spaceId} — ${floor} — ${isAvailable ? 'Disponible' : 'Occupé'}`}
      {...(!isAvailable && { 'aria-disabled': 'true' })}
    >
      <div className="wsb-booking-card__header">
        <span
          className="wsb-booking-card__type-badge"
          style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
        >
          {cfg.label}
        </span>
        <span className={`wsb-booking-card__status wsb-booking-card__status--${status}`}>
          {isAvailable ? 'Disponible' : 'Occupé'}
        </span>
      </div>

      <div className="wsb-booking-card__identity">
        <p className="wsb-booking-card__space-id">{spaceId}</p>
        <p className="wsb-booking-card__space-sub">NUMÉRO DE LA PLACE</p>
      </div>

      <div className="wsb-booking-card__meta">
        <span className="wsb-booking-card__floor">{floor}</span>
      </div>

      {cfg.electric && (
        <div className="wsb-booking-card__electric">
          <LightningIcon />
          <span>Place électrique</span>
        </div>
      )}

      <div className="wsb-booking-card__footer">
        {isAvailable ? (
          <button
            type="button"
            className={`wsb-booking-card__cta${loading ? ' wsb-booking-card__cta--loading' : ''}`}
            aria-label={`Réserver espace ${cfg.label} ${spaceId}, ${floor}`}
            aria-busy={loading ? 'true' : undefined}
            disabled={loading}
            onClick={handleReserve}
          >
            {loading ? (
              <>
                <CtaSpinner />
                <span className="wsb-sr-only">Réserver cet espace</span>
              </>
            ) : (
              'Réserver cet espace'
            )}
          </button>
        ) : (
          <span className="wsb-booking-card__unavailable">Indisponible</span>
        )}
      </div>
    </article>
  );
}
