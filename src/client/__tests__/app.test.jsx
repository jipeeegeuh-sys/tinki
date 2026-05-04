import { jest } from '@jest/globals';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App, { resolveCurrentPage } from '../app.jsx';

function mockLocation(search = '', href = 'http://localhost/x_wsb_flex_main.do') {
  Object.defineProperty(window, 'location', {
    value: { search, href, pathname: '/x_wsb_flex_main.do' },
    writable: true,
    configurable: true,
  });
}

describe('resolveCurrentPage', () => {
  afterEach(() => mockLocation());

  test('retourne "search" sans paramètre route', () => {
    mockLocation('');
    expect(resolveCurrentPage()).toBe('search');
  });

  test('retourne "reservations" pour ?route=mes-reservations', () => {
    mockLocation('?route=mes-reservations');
    expect(resolveCurrentPage()).toBe('reservations');
  });

  test('retourne "history" pour ?route=historique', () => {
    mockLocation('?route=historique');
    expect(resolveCurrentPage()).toBe('history');
  });

  test('retourne "results" pour ?route=resultats', () => {
    mockLocation('?route=resultats');
    expect(resolveCurrentPage()).toBe('results');
  });

  test('retourne "edit" pour ?route=edition', () => {
    mockLocation('?route=edition');
    expect(resolveCurrentPage()).toBe('edit');
  });

  test('retourne null pour une route inconnue', () => {
    mockLocation('?route=xyz-inconnu');
    expect(resolveCurrentPage()).toBeNull();
  });
});

describe('App — splash loader', () => {
  beforeEach(() => {
    // fetch ne se résout jamais → splash reste visible
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));
    mockLocation('');
  });

  afterEach(() => jest.clearAllMocks());

  test('affiche le splash pendant le check de session', () => {
    render(<App />);
    expect(screen.getByLabelText("Chargement de l'application")).toBeInTheDocument();
  });

  test('le splash a aria-busy="true"', () => {
    render(<App />);
    expect(screen.getByLabelText("Chargement de l'application")).toHaveAttribute('aria-busy', 'true');
  });
});

describe('App — session active (200)', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });
    mockLocation('');
  });

  afterEach(() => jest.clearAllMocks());

  test('affiche le formulaire de recherche par défaut', async () => {
    await act(async () => { render(<App />); });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Rechercher un espace de travail/ })).toBeInTheDocument();
    });
  });

  test('affiche la page Mes réservations pour ?route=mes-reservations', async () => {
    mockLocation('?route=mes-reservations');
    await act(async () => { render(<App />); });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Mes réservations/ })).toBeInTheDocument();
    });
  });

  test('affiche la page 404 pour une route inconnue', async () => {
    mockLocation('?route=xyz-inconnu');
    await act(async () => { render(<App />); });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Page introuvable/ })).toBeInTheDocument();
    });
  });

  test('le header est présent après auth ok', async () => {
    await act(async () => { render(<App />); });
    await waitFor(() => {
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });
  });
});

describe('App — session expirée (401)', () => {
  let hrefSetter;

  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn().mockResolvedValue({ status: 401 });

    hrefSetter = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { search: '', pathname: '/x_wsb_flex_main.do' },
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => 'http://localhost/x_wsb_flex_main.do',
      configurable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  test('affiche le banner de session expirée', async () => {
    await act(async () => { render(<App />); });
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText(/Votre session a expiré/)).toBeInTheDocument();
  });

  test('redirige vers /login.do après 3 secondes', async () => {
    await act(async () => { render(<App />); });
    await waitFor(() => {
      expect(screen.getByText(/Votre session a expiré/)).toBeInTheDocument();
    });
    expect(hrefSetter).not.toHaveBeenCalled();

    act(() => { jest.advanceTimersByTime(3000); });

    expect(hrefSetter).toHaveBeenCalledWith(
      expect.stringContaining('/login.do?redirect=')
    );
  });

  test("n'effectue pas la redirection avant 3 secondes", async () => {
    await act(async () => { render(<App />); });
    await waitFor(() => {
      expect(screen.getByText(/Votre session a expiré/)).toBeInTheDocument();
    });

    act(() => { jest.advanceTimersByTime(2999); });
    expect(hrefSetter).not.toHaveBeenCalled();
  });
});
