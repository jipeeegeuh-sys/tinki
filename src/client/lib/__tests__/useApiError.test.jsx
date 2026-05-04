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
      value: { href: 'http://instance.service-now.com/x_wsb_flex_search.do' },
      writable: true,
    });
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => 'http://instance.service-now.com/x_wsb_flex_search.do',
    });
    renderHook();
  });

  test('401 → toast info + redirect /login.do?redirectTo=...', () => {
    act(() => {
      capturedHandleError(new ApiError(401, 'Unauthorized'));
    });
    expect(screen.getByText(/Votre session a expiré/)).toBeInTheDocument();
    const redirectUrl = hrefSetter.mock.calls[0][0];
    expect(redirectUrl).toMatch(/^\/login\.do\?redirectTo=/);
    expect(redirectUrl).toContain(encodeURIComponent('http://instance.service-now.com/x_wsb_flex_search.do'));
  });

  test('403 → toast error accès refusé (exact AC message)', () => {
    act(() => {
      capturedHandleError(new ApiError(403, 'Forbidden'));
    });
    expect(screen.getByText('Vous n\'êtes pas autorisé à effectuer cette action.')).toBeInTheDocument();
  });

  test('timeout → toast error timeout', () => {
    act(() => {
      capturedHandleError(new ApiError('timeout', 'AbortController'));
    });
    expect(screen.getByText(/ne répond pas/i)).toBeInTheDocument();
  });

  test('500 → toast error serveur (exact AC message)', () => {
    act(() => {
      capturedHandleError(new ApiError(500, 'Internal'));
    });
    expect(screen.getByText('Une erreur est survenue. Veuillez réessayer.')).toBeInTheDocument();
  });

  test('503 → même message que 500', () => {
    act(() => {
      capturedHandleError(new ApiError(503, 'Service Unavailable'));
    });
    expect(screen.getByText('Une erreur est survenue. Veuillez réessayer.')).toBeInTheDocument();
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
    expect(screen.getByText('Une erreur est survenue. Veuillez réessayer.')).toBeInTheDocument();
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
