import { jest } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useApiError } from '../useApiError.js';
import { ApiError } from '../../services/ApiService.js';
import { ToastProvider } from '../useToast.js';
import { WsbToastContainer } from '../../components/ui/WsbToastContainer.jsx';

let capturedHandleError;

function TestHarness() {
  const { handleError } = useApiError();
  capturedHandleError = handleError;
  return null;
}

function renderHook() {
  return render(
    <ToastProvider>
      <WsbToastContainer />
      <TestHarness />
    </ToastProvider>,
  );
}

describe('useApiError — gestion des codes HTTP', () => {
  let hrefSetter;

  beforeEach(() => {
    hrefSetter = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => '',
    });
    renderHook();
  });

  test('401 → toast warning + redirect /login.do', () => {
    act(() => {
      capturedHandleError(new ApiError(401, 'Unauthorized'));
    });
    expect(screen.getByText(/session expirée/i)).toBeInTheDocument();
    expect(hrefSetter).toHaveBeenCalledWith('/login.do');
  });

  test('403 → toast error accès refusé', () => {
    act(() => {
      capturedHandleError(new ApiError(403, 'Forbidden'));
    });
    expect(screen.getByText(/accès refusé/i)).toBeInTheDocument();
  });

  test('408 → toast error timeout', () => {
    act(() => {
      capturedHandleError(new ApiError(408, 'Timeout'));
    });
    expect(screen.getByText(/ne répond pas/i)).toBeInTheDocument();
  });

  test('500 → toast error serveur', () => {
    act(() => {
      capturedHandleError(new ApiError(500, 'Internal'));
    });
    expect(screen.getByText(/erreur serveur/i)).toBeInTheDocument();
  });

  test('404 avec body.error.message → affiche le message du body', () => {
    act(() => {
      capturedHandleError(new ApiError(404, 'Not Found', { error: { message: 'Enregistrement introuvable' } }));
    });
    expect(screen.getByText('Enregistrement introuvable')).toBeInTheDocument();
  });

  test('404 sans body → affiche Erreur 404', () => {
    act(() => {
      capturedHandleError(new ApiError(404, 'Not Found'));
    });
    expect(screen.getByText('Erreur 404')).toBeInTheDocument();
  });

  test('502 (5xx non mappé) → message serveur générique', () => {
    act(() => {
      capturedHandleError(new ApiError(502, 'Bad Gateway'));
    });
    expect(screen.getByText(/erreur serveur/i)).toBeInTheDocument();
  });
});

describe('useApiError — erreur non-ApiError', () => {
  beforeEach(() => {
    renderHook();
  });

  test('affiche un message générique pour TypeError', () => {
    act(() => {
      capturedHandleError(new TypeError('Failed to fetch'));
    });
    expect(screen.getByText(/erreur inattendue/i)).toBeInTheDocument();
  });
});
