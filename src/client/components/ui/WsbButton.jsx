import { useId } from 'react';
import './WsbButton.css';

function Spinner() {
  return (
    <svg
      className="wsb-btn__spinner"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
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
}

/**
 * WsbButton — composant bouton partagé de la Design System FlexDesk.
 *
 * @param {'primary'|'secondary'|'ghost'|'destructive'|'link-primary'|'link-danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} disabled  — aria-disabled ; le bouton reste focusable pour le tooltip
 * @param {boolean} loading   — affiche le spinner, bloque les clics
 * @param {React.ReactNode} icon — icône rendue avant le texte (non affichée pendant loading)
 * @param {string} tooltip    — texte du tooltip affiché quand disabled=true
 * @param {boolean} fullWidth
 */
export function WsbButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon = null,
  tooltip = '',
  onClick,
  type = 'button',
  fullWidth = false,
  children,
  className = '',
  ...rest
}) {
  const tooltipId = useId();
  const isBlocked = disabled || loading;

  const handleClick = (evt) => {
    if (isBlocked) {
      evt.preventDefault();
      return;
    }
    onClick?.(evt);
  };

  const btnCls = [
    'wsb-btn',
    `wsb-btn--${variant}`,
    `wsb-btn--${size}`,
    fullWidth && 'wsb-btn--full',
    loading && 'wsb-btn--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperCls = [
    'wsb-btn-wrapper',
    fullWidth && 'wsb-btn-wrapper--full',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={wrapperCls}>
      <button
        type={type}
        className={btnCls}
        aria-disabled={isBlocked ? 'true' : 'false'}
        aria-busy={loading ? true : undefined}
        aria-describedby={disabled && tooltip ? tooltipId : undefined}
        onClick={handleClick}
        {...rest}
      >
        {loading ? (
          <>
            <Spinner />
            <span className="wsb-sr-only">{children}</span>
          </>
        ) : (
          <>
            {icon && (
              <span className="wsb-btn__icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <span>{children}</span>
          </>
        )}
      </button>

      {disabled && tooltip && (
        <span id={tooltipId} role="tooltip" className="wsb-btn__tooltip">
          {tooltip}
        </span>
      )}
    </span>
  );
}
