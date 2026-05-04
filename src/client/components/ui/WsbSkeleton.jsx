import './WsbSkeleton.css';

export function WsbSkeletonCard() {
  return (
    <div className="wsb-skeleton-card" aria-hidden="true">
      <div className="wsb-skeleton-card__header">
        <div className="wsb-skeleton wsb-skeleton--title" />
        <div className="wsb-skeleton wsb-skeleton--badge" />
      </div>
      <div className="wsb-skeleton-card__body">
        <div className="wsb-skeleton wsb-skeleton--line wsb-skeleton--line-sm" />
        <div className="wsb-skeleton wsb-skeleton--line wsb-skeleton--line-md" />
        <div className="wsb-skeleton wsb-skeleton--line wsb-skeleton--line-sm" />
      </div>
      <div className="wsb-skeleton-card__footer">
        <div className="wsb-skeleton wsb-skeleton--btn" />
      </div>
    </div>
  );
}

export function WsbGridSkeleton({ count = 6 }) {
  return (
    <div
      className="wsb-grid-skeleton"
      aria-live="polite"
      aria-busy="true"
      aria-label="Chargement des espaces disponibles"
    >
      {Array.from({ length: count }, (_, i) => (
        <WsbSkeletonCard key={i} />
      ))}
    </div>
  );
}

const SIZES = { sm: 24, md: 32, lg: 48 };

export function WsbSpinner({ size = 'md', label = 'Chargement…', className = '' }) {
  const px = SIZES[size] ?? 32;
  return (
    <span
      className={`wsb-spinner wsb-spinner--${size}${className ? ` ${className}` : ''}`}
      role="status"
      aria-label={label}
    >
      <svg width={px} height={px} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" />
        <path
          d="M16 3 A13 13 0 0 1 29 16"
          stroke="var(--wsb-color-primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

const ZeroResultsIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
    <circle cx="22" cy="22" r="14" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.35" />
    <path d="M32 32L44 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.35" />
    <path d="M17 17L27 27M27 17L17 27" stroke="var(--wsb-color-danger)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ServerErrorIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
    <path
      d="M26 5L48 45H4L26 5Z"
      stroke="var(--wsb-color-warning)"
      strokeWidth="2.5"
      strokeLinejoin="round"
      strokeOpacity="0.5"
    />
    <path d="M26 21V32" stroke="var(--wsb-color-warning)" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="26" cy="38" r="2" fill="var(--wsb-color-warning)" />
  </svg>
);

const EmptyReservationsIcon = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
    <rect x="6" y="11" width="40" height="35" rx="5" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.35" />
    <path d="M6 22H46" stroke="currentColor" strokeWidth="2" strokeOpacity="0.35" />
    <path d="M17 5V17M35 5V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.35" />
    <path d="M20 36H32M26 30V42" stroke="var(--wsb-color-primary)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CONFIGS = {
  'zero-results': {
    Icon: ZeroResultsIcon,
    title: 'Aucun espace disponible',
    description: 'Aucun espace ne correspond à vos critères. Modifiez vos filtres pour élargir la recherche.',
    ctaLabel: 'Modifier ma recherche',
    ctaHref: '/x_acf_wsb_search.do?building=A&floor=3&date=2026-04-30&type=openspace-classique',
  },
  'server-error': {
    Icon: ServerErrorIcon,
    title: 'Erreur de chargement',
    description: 'Impossible de charger les données. Vérifiez votre connexion et réessayez.',
    ctaLabel: 'Réessayer',
    ctaHref: null,
  },
  'empty-reservations': {
    Icon: EmptyReservationsIcon,
    title: 'Aucune réservation',
    description: "Vous n'avez pas encore de réservation. Réservez un espace de travail dès maintenant.",
    ctaLabel: 'Réserver un espace',
    ctaHref: '/x_acf_wsb_search.do',
  },
};

export function WsbEmptyState({ variant, onRetry }) {
  const config = CONFIGS[variant];
  if (!config) return null;
  const { Icon, title, description, ctaLabel, ctaHref } = config;
  const isServerError = variant === 'server-error';

  return (
    <div className={`wsb-empty-state wsb-empty-state--${variant}`} role="status">
      <div className="wsb-empty-state__icon">
        <Icon />
      </div>
      <h3 className="wsb-empty-state__title">{title}</h3>
      <p className="wsb-empty-state__description">{description}</p>
      <div className="wsb-empty-state__actions">
        {isServerError ? (
          <button type="button" className="wsb-empty-state__cta" onClick={onRetry}>
            {ctaLabel}
          </button>
        ) : (
          <a href={ctaHref} className="wsb-empty-state__cta">
            {ctaLabel}
          </a>
        )}
      </div>
    </div>
  );
}
