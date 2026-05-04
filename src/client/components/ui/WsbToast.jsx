import './WsbToast.css';

const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 9L7.5 11L12.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 6L12 12M12 6L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <path d="M9 2.5L15.8 14.5H2.2L9 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 7.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="12.5" r="0.75" fill="currentColor" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8.5V12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="5.5" r="0.75" fill="currentColor" />
    </svg>
  ),
};

const TYPE_LABELS = { success: 'Succès', error: 'Erreur', warning: 'Avertissement', info: 'Information' };

const CloseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function WsbToast({ id, type = 'info', message, exiting, onClose }) {
  const cls = `wsb-toast wsb-toast--${type}${exiting ? ' wsb-toast--exit' : ''}`;

  return (
    <div className={cls}>
      <span className="wsb-toast__icon">{ICONS[type]}</span>
      <div className="wsb-toast__body">
        <span className="wsb-toast__type-label">{TYPE_LABELS[type]}</span>
        <p className="wsb-toast__message">{message}</p>
      </div>
      <button
        type="button"
        className="wsb-toast__close"
        aria-label="Fermer la notification"
        onClick={() => onClose(id)}
      >
        <CloseIcon />
      </button>
    </div>
  );
}
