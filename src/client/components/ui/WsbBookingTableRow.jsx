import './WsbBookingTableRow.css';

const TYPE_CONFIG = {
  'bureau':               { label: 'Bureau',               bg: 'rgba(161,0,255,0.15)', text: '#c266ff', border: 'rgba(161,0,255,0.3)' },
  'openspace-classique':  { label: 'Open Space',           bg: 'rgba(0,200,83,0.15)',  text: '#00C853', border: 'rgba(0,200,83,0.3)' },
  'openspace-specialise': { label: 'Openspace spécialisé', bg: 'rgba(0,200,83,0.15)',  text: '#00C853', border: 'rgba(0,200,83,0.3)' },
  'phonebox':             { label: 'Phonebox',             bg: 'rgba(0,145,234,0.15)', text: '#0091EA', border: 'rgba(0,145,234,0.3)' },
  'parking-electrique':   { label: 'Parking EV',           bg: 'rgba(0,200,83,0.15)',  text: '#00C853', border: 'rgba(0,200,83,0.3)', electric: true },
  'parking-thermique':    { label: 'Parking',              bg: 'rgba(84,110,122,0.15)',text: '#90A4AE', border: 'rgba(84,110,122,0.3)' },
};

const DEFAULT_TYPE = { label: 'Espace', bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.7)', border: 'rgba(255,255,255,0.15)' };

const STATUS_CONFIG = {
  'en-cours':   { label: 'Réservation en cours', cls: 'en-cours' },
  'a-venir':    { label: 'À venir',              cls: 'a-venir' },
  'en-attente': { label: 'En attente',           cls: 'en-attente' },
  'terminee':   { label: 'Terminée',             cls: 'terminee' },
  'annulee':    { label: 'Annulée',              cls: 'annulee' },
};

const ACTIONABLE_STATUSES = new Set(['en-cours', 'a-venir', 'en-attente']);

const EditIcon = () => (
  <svg className="wsb-table-row__action-icon" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M10.5 1.5l2 2L4.5 11.5H2.5v-2l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
);

const CancelIcon = () => (
  <svg className="wsb-table-row__action-icon" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const LightningIcon = () => (
  <svg className="wsb-table-row__electric-icon" width="10" height="13" viewBox="0 0 11 14" fill="none" aria-hidden="true">
    <path d="M6.5 1L1 8h4L3.5 13 10 6H6L6.5 1z" fill="#FFA500" stroke="#FFA500" strokeWidth="0.4" strokeLinejoin="round" />
  </svg>
);

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function WsbBookingTableRow({
  spaceId,
  type,
  floor,
  date,
  timeSlot,
  duration,
  status,
  readonly = false,
  onEdit,
  onCancel,
}) {
  const cfg = TYPE_CONFIG[type] ?? DEFAULT_TYPE;
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['en-cours'];
  const showActions = !readonly && ACTIONABLE_STATUSES.has(status);
  const displayDate = formatDate(date);
  const ariaDesc = `${cfg.label} ${spaceId} du ${displayDate}`;

  return (
    <tr className="wsb-table-row">
      <td>
        <span className="wsb-table-row__space-id">{spaceId}</span>
      </td>
      <td>
        <span
          className="wsb-table-row__type-badge"
          style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
        >
          {cfg.electric && <LightningIcon />}
          {cfg.label}
        </span>
      </td>
      <td className="wsb-table-row__floor">{floor}</td>
      <td className="wsb-table-row__date">{displayDate}</td>
      <td className="wsb-table-row__time">{timeSlot}</td>
      {duration !== undefined && (
        <td className="wsb-table-row__duration">{duration}</td>
      )}
      <td>
        <span className={`wsb-table-row__status wsb-table-row__status--${statusCfg.cls}`}>
          <span className="wsb-table-row__status-dot" />
          {statusCfg.label}
        </span>
      </td>
      <td>
        {showActions ? (
          <span className="wsb-table-row__actions">
            <button
              type="button"
              className="wsb-table-row__action wsb-table-row__action--edit"
              aria-label={`Éditer réservation ${ariaDesc}`}
              onClick={() => onEdit?.({ spaceId, type, date })}
            >
              <EditIcon />
              Éditer
            </button>
            <button
              type="button"
              className="wsb-table-row__action wsb-table-row__action--cancel"
              aria-label={`Annuler réservation ${ariaDesc}`}
              onClick={() => onCancel?.({ spaceId, type, date })}
            >
              <CancelIcon />
              Annuler
            </button>
          </span>
        ) : null}
      </td>
    </tr>
  );
}
