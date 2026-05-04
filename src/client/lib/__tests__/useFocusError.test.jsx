import { jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useFocusError, buildAriaError, FormError } from '../useFocusError';

describe('buildAriaError', () => {
  test('retourne un objet vide si pas d\'erreur', () => {
    expect(buildAriaError('email', null)).toEqual({});
    expect(buildAriaError('email', '')).toEqual({});
    expect(buildAriaError('email', undefined)).toEqual({});
  });

  test('retourne aria-invalid et aria-errormessage si erreur', () => {
    const attrs = buildAriaError('email', 'Champ requis');
    expect(attrs).toEqual({
      'aria-invalid': 'true',
      'aria-errormessage': 'err-email',
    });
  });

  test('utilise le nom du champ pour l\'id d\'erreur', () => {
    const attrs = buildAriaError('date', 'Date invalide');
    expect(attrs['aria-errormessage']).toBe('err-date');
  });
});

describe('FormError', () => {
  test('ne rend rien si pas d\'erreur', () => {
    const { container } = render(<FormError fieldName="email" error={null} />);
    expect(container.innerHTML).toBe('');
  });

  test('ne rend rien si erreur vide', () => {
    const { container } = render(<FormError fieldName="email" error="" />);
    expect(container.innerHTML).toBe('');
  });

  test('rend le message d\'erreur', () => {
    render(<FormError fieldName="email" error="Champ requis" />);
    expect(screen.getByText('Champ requis')).toBeInTheDocument();
  });

  test('porte l\'id err-{fieldName}', () => {
    render(<FormError fieldName="date" error="Date invalide" />);
    expect(screen.getByText('Date invalide')).toHaveAttribute('id', 'err-date');
  });

  test('porte role="alert"', () => {
    render(<FormError fieldName="email" error="Requis" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('porte la classe wsb-form-error', () => {
    render(<FormError fieldName="email" error="Requis" />);
    expect(screen.getByText('Requis')).toHaveClass('wsb-form-error');
  });
});

describe('useFocusError', () => {
  let capturedHook;

  function TestHarness() {
    capturedHook = useFocusError();
    return null;
  }

  test('focusFirstError met le focus sur le premier champ en erreur', () => {
    render(<TestHarness />);

    const input1 = document.createElement('input');
    const input2 = document.createElement('input');
    document.body.appendChild(input1);
    document.body.appendChild(input2);

    const errors = { email: 'Requis', date: 'Invalide' };
    const fieldRefs = {
      email: { current: input1 },
      date: { current: input2 },
    };

    const focusedField = capturedHook.focusFirstError(errors, fieldRefs);
    expect(focusedField).toBe('email');
    expect(document.activeElement).toBe(input1);

    document.body.removeChild(input1);
    document.body.removeChild(input2);
  });

  test('retourne null si aucune ref trouvée', () => {
    render(<TestHarness />);

    const errors = { email: 'Requis' };
    const fieldRefs = { email: { current: null } };

    const focusedField = capturedHook.focusFirstError(errors, fieldRefs);
    expect(focusedField).toBeNull();
  });

  test('retourne null si pas d\'erreur', () => {
    render(<TestHarness />);

    const errors = {};
    const fieldRefs = {};

    const focusedField = capturedHook.focusFirstError(errors, fieldRefs);
    expect(focusedField).toBeNull();
  });
});
