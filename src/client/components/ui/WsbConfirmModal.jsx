import { useEffect, useRef, useCallback, useId } from 'react';
import { WsbButton } from './WsbButton.jsx';
import './WsbConfirmModal.css';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const WarningIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
    <path d="M11 3L20 18H2L11 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M11 9.5V13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="11" cy="15.5" r="0.8" fill="currentColor" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export function WsbConfirmModal({
  open,
  title = 'Confirmer l\'annulation',
  description = 'Cette action est irréversible. La réservation sera annulée et la place sera libérée.',
  detail = '',
  confirmLabel = 'Confirmer l\'annulation',
  cancelLabel = 'Retour',
  loading = false,
  onConfirm,
  onClose,
  triggerRef,
}) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  const restoreFocus = useCallback(() => {
    if (triggerRef?.current) {
      triggerRef.current.focus();
    }
  }, [triggerRef]);

  const handleClose = useCallback(() => {
    if (loading) return;
    onClose();
  }, [loading, onClose]);

  useEffect(() => {
    if (!open) return;
    const timer = requestAnimationFrame(() => {
      const btn = cancelRef.current?.querySelector('button');
      btn?.focus();
    });
    return () => cancelAnimationFrame(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (evt) => {
      if (evt.key === 'Escape') {
        handleClose();
        return;
      }
      if (evt.key === 'Tab') {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = [...dialog.querySelectorAll(FOCUSABLE)];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (evt.shiftKey) {
          if (document.activeElement === first) {
            evt.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            evt.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) {
      restoreFocus();
    }
  }, [open, restoreFocus]);

  if (!open) return null;

  const handleOverlayClick = (evt) => {
    if (evt.target === evt.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className="wsb-modal-overlay" onClick={handleOverlayClick}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="wsb-modal"
      >
        <div className="wsb-modal__header">
          <div className="wsb-modal__icon-wrapper">
            <WarningIcon />
          </div>
          <button
            type="button"
            className="wsb-modal__close"
            aria-label="Fermer la modal"
            onClick={handleClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="wsb-modal__body">
          <h2 id={titleId} className="wsb-modal__title">{title}</h2>
          <p id={descId} className="wsb-modal__desc">{description}</p>
          {detail && <span className="wsb-modal__detail">{detail}</span>}
        </div>

        <div className="wsb-modal__footer">
          <span ref={cancelRef}>
            <WsbButton
              variant="secondary"
              size="md"
              onClick={handleClose}
            >
              {cancelLabel}
            </WsbButton>
          </span>
          <WsbButton
            variant="destructive"
            size="md"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </WsbButton>
        </div>
      </div>
    </div>
  );
}
