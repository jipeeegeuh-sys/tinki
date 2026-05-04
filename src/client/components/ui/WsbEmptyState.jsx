import './WsbEmptyState.css';

const IllustrationEmpty = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <rect x="16" y="8" width="48" height="56" rx="6" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
    <line x1="26" y1="24" x2="54" y2="24" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="34" x2="48" y2="34" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="44" x2="42" y2="44" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="40" cy="58" r="12" fill="rgba(161,0,255,0.12)" />
    <path d="M36 58h8M40 54v8" stroke="#a100ff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IllustrationFiltered = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <circle cx="36" cy="36" r="18" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
    <line x1="49" y1="49" x2="64" y2="64" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeLinecap="round" />
    <path d="M30 30l12 12M42 30L30 42" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IllustrationError = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <path d="M40 14L70 66H10L40 14z" stroke="rgba(229,57,53,0.4)" strokeWidth="2" fill="rgba(229,57,53,0.08)" strokeLinejoin="round" />
    <line x1="40" y1="32" x2="40" y2="48" stroke="#e53935" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="40" cy="56" r="2" fill="#e53935" />
  </svg>
);

const IllustrationForbidden = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true">
    <rect x="22" y="36" width="36" height="28" rx="4" stroke="rgba(255,152,0,0.4)" strokeWidth="2" fill="rgba(255,152,0,0.08)" />
    <path d="M30 36V28a10 10 0 0120 0v8" stroke="rgba(255,152,0,0.4)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="40" cy="50" r="3" fill="#ffa000" />
    <line x1="40" y1="53" x2="40" y2="58" stroke="#ffa000" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ILLUSTRATIONS = {
  'empty-history': IllustrationEmpty,
  'empty-filtered': IllustrationFiltered,
  error: IllustrationError,
  forbidden: IllustrationForbidden,
};

export function WsbEmptyState({ variant, message, actionLabel, onAction }) {
  const Illustration = ILLUSTRATIONS[variant] || IllustrationEmpty;
  const isAlert = variant === 'error' || variant === 'forbidden';

  return (
    <div className={`wsb-empty-state wsb-empty-state--${variant}`} role={isAlert ? 'alert' : 'status'}>
      <div className="wsb-empty-state__illustration">
        <Illustration />
      </div>
      <p className="wsb-empty-state__message">{message}</p>
      {actionLabel && onAction && (
        <button type="button" className="wsb-empty-state__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
