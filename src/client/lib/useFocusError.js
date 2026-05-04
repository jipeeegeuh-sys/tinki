import { useCallback } from 'react';

export function useFocusError() {
  const focusFirstError = useCallback((errors, fieldRefs) => {
    for (const field of Object.keys(errors)) {
      const ref = fieldRefs[field];
      if (ref?.current) {
        ref.current.focus();
        return field;
      }
    }
    return null;
  }, []);

  return { focusFirstError };
}

export function buildAriaError(fieldName, error) {
  if (!error) return {};
  const errId = `err-${fieldName}`;
  return {
    'aria-invalid': 'true',
    'aria-errormessage': errId,
  };
}

export function FormError({ fieldName, error }) {
  if (!error) return null;
  return (
    <span
      id={`err-${fieldName}`}
      className="wsb-form-error"
      role="alert"
    >
      {error}
    </span>
  );
}
