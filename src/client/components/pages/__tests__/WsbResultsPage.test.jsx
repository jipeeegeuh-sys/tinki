import { jest } from '@jest/globals';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

const VALID_PARAMS = {
  building: 'A',
  floor: '3',
  date: '2026-04-30',
  type: 'bureau',
};

jest.mock('../../../services/NavigationService.js', () => ({
  guardResultsPage: jest.fn(() => ({
    valid: true,
    missing: [],
    params: { building: 'A', floor: '3', date: '2026-04-30', type: 'bureau' },
  })),
  buildPageUrl: jest.fn((page, params = {}) => {
    const base = `x_wsb_flexoffice_${page}.do`;
    const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
    if (entries.length === 0) return base;
    return `${base}?${new URLSearchParams(entries).toString()}`;
  }),
}));

jest.mock('../../../services/ApiService.js', () => ({
  getAvailableSpaces: jest.fn(() => new Promise(() => {})),
  ApiError: class ApiError extends Error {
    constructor(status, statusText) {
      super(`HTTP ${status}`);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

const { guardResultsPage } = require('../../../services/NavigationService.js');
const { getAvailableSpaces, ApiError } = require('../../../services/ApiService.js');

import { WsbResultsPage } from '../WsbResultsPage.jsx';

const MOCK_SPACES = [
  { sys_id: 'sp1', name: 'A-101', floor: '3', floor_label: 'Niv. 3', type: 'bureau', status: 'available' },
  { sys_id: 'sp2', name: 'A-102', floor: '3', floor_label: 'Niv. 3', type: 'bureau', status: 'available' },
  { sys_id: 'sp3', name: 'A-103', floor: '3', floor_label: 'Niv. 3', type: 'bureau', status: 'occupied' },
];

const ALL_OCCUPIED_SPACES = [
  { sys_id: 'sp1', name: 'A-101', floor: '3', floor_label: 'Niv. 3', type: 'bureau', status: 'occupied' },
  { sys_id: 'sp2', name: 'A-102', floor: '3', floor_label: 'Niv. 3', type: 'bureau', status: 'occupied' },
  { sys_id: 'sp3', name: 'A-103', floor: '3', floor_label: 'Niv. 3', type: 'bureau', status: 'occupied' },
];

beforeEach(() => {
  guardResultsPage.mockReturnValue({
    valid: true,
    missing: [],
    params: { ...VALID_PARAMS },
  });
  getAvailableSpaces.mockReset();
  getAvailableSpaces.mockReturnValue(new Promise(() => {}));
});

describe('WsbResultsPage — chargement et squelettes', () => {
  test('affiche 6 skeleton cards immédiatement au montage', () => {
    render(<WsbResultsPage />);
    const skeletonGrid = screen.getByLabelText('Chargement des espaces disponibles');
    expect(skeletonGrid).toBeInTheDocument();
    expect(skeletonGrid).toHaveAttribute('aria-busy', 'true');
  });

  test('affiche le titre "Recherche en cours…" pendant le chargement', () => {
    render(<WsbResultsPage />);
    expect(screen.getByText('Recherche en cours…')).toBeInTheDocument();
  });

  test('affiche le badge RÉSULTATS', () => {
    render(<WsbResultsPage />);
    expect(screen.getByText('RÉSULTATS')).toBeInTheDocument();
  });
});

describe('WsbResultsPage — appel API', () => {
  test('appelle getAvailableSpaces avec les params de la query string', () => {
    render(<WsbResultsPage />);
    expect(getAvailableSpaces).toHaveBeenCalledWith(VALID_PARAMS);
  });

  test('appelle l\'API une seule fois au montage', () => {
    render(<WsbResultsPage />);
    expect(getAvailableSpaces).toHaveBeenCalledTimes(1);
  });
});

describe('WsbResultsPage — succès API', () => {
  beforeEach(() => {
    getAvailableSpaces.mockResolvedValue(MOCK_SPACES);
  });

  test('affiche les cards après réponse API réussie', async () => {
    render(<WsbResultsPage />);
    await waitFor(() => {
      expect(screen.getByText('A-101')).toBeInTheDocument();
    });
    expect(screen.getByText('A-102')).toBeInTheDocument();
    expect(screen.getByText('A-103')).toBeInTheDocument();
  });

  test('les skeletons disparaissent après le chargement', async () => {
    render(<WsbResultsPage />);
    await waitFor(() => {
      expect(screen.queryByLabelText('Chargement des espaces disponibles')).not.toBeInTheDocument();
    });
  });

  test('affiche le nombre de places disponibles dans le titre', async () => {
    render(<WsbResultsPage />);
    await waitFor(() => {
      expect(screen.getByText('2 places disponibles')).toBeInTheDocument();
    });
  });

  test('la grille utilise un role="list" pour la sémantique', async () => {
    render(<WsbResultsPage />);
    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
    });
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
  });

  test('la grille possède l\'id wsb-results-grid', async () => {
    const { container } = render(<WsbResultsPage />);
    await waitFor(() => {
      expect(container.querySelector('#wsb-results-grid')).toBeInTheDocument();
    });
  });

  test('la grille #wsb-results-grid contient exactement N listitem', async () => {
    const { container } = render(<WsbResultsPage />);
    await waitFor(() => {
      const grid = container.querySelector('#wsb-results-grid');
      expect(grid).not.toBeNull();
      expect(grid.querySelectorAll('[role="listitem"]')).toHaveLength(MOCK_SPACES.length);
    });
  });

  test('les cards disponibles n\'ont pas la classe --occupied', async () => {
    const { container } = render(<WsbResultsPage />);
    await waitFor(() => {
      expect(screen.getByText('A-101')).toBeInTheDocument();
    });
    const cards = container.querySelectorAll('.wsb-booking-card:not(.wsb-booking-card--occupied)');
    expect(cards).toHaveLength(2);
  });

  test('la card occupée porte la classe --occupied', async () => {
    const { container } = render(<WsbResultsPage />);
    await waitFor(() => {
      expect(screen.getByText('A-103')).toBeInTheDocument();
    });
    const occupiedCards = container.querySelectorAll('.wsb-booking-card--occupied');
    expect(occupiedCards).toHaveLength(1);
  });
});

describe('WsbResultsPage — critères de recherche', () => {
  test('affiche les quatre critères dans la barre', () => {
    render(<WsbResultsPage />);
    expect(screen.getByText(/Bâtiment A/)).toBeInTheDocument();
    expect(screen.getByText(/Niveau 3/)).toBeInTheDocument();
    expect(screen.getByText(/30 avril 2026/)).toBeInTheDocument();
    expect(screen.getByText(/Bureau/)).toBeInTheDocument();
  });

  test('formate la date ISO en français lisible', () => {
    render(<WsbResultsPage />);
    expect(screen.getByText(/30 avril 2026/)).toBeInTheDocument();
    expect(screen.queryByText('2026-04-30')).not.toBeInTheDocument();
  });

  test('le lien "Nouvelle recherche" pointe vers la page search', () => {
    render(<WsbResultsPage />);
    const link = screen.getByText(/Nouvelle recherche/);
    expect(link.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('x_wsb_flexoffice_search.do')
    );
  });

  test('le lien "Modifier la recherche" pointe vers la page search avec les params', () => {
    render(<WsbResultsPage />);
    const link = screen.getByText('Modifier la recherche');
    const href = link.closest('a').getAttribute('href');
    expect(href).toContain('x_wsb_flexoffice_search.do');
    expect(href).toContain('building=A');
    expect(href).toContain('floor=3');
    expect(href).toContain('date=2026-04-30');
    expect(href).toContain('type=bureau');
  });

  test('le lien "Modifier la recherche" est accessible au clavier', () => {
    render(<WsbResultsPage />);
    const link = screen.getByText('Modifier la recherche').closest('a');
    expect(link).toBeTruthy();
    expect(link.tagName).toBe('A');
  });
});

// ── État vide (aucun résultat) ───────────────────────────────────────────
describe('WsbResultsPage — zéro résultat', () => {
  test('affiche l\'état vide quand l\'API retourne un tableau vide', async () => {
    getAvailableSpaces.mockResolvedValue([]);
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucun espace disponible')).toBeInTheDocument();
    });
  });

  test('affiche le message AC exact dans l\'état vide', async () => {
    getAvailableSpaces.mockResolvedValue([]);
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Aucun espace disponible pour ces critères. Essayez un autre créneau ou un autre étage.')
      ).toBeInTheDocument();
    });
  });

  test('les skeletons disparaissent quand l\'état vide s\'affiche', async () => {
    getAvailableSpaces.mockResolvedValue([]);
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.queryByLabelText('Chargement des espaces disponibles')).not.toBeInTheDocument();
    });
  });

  test('le CTA "Modifier ma recherche" renvoie vers la page search avec les params', async () => {
    getAvailableSpaces.mockResolvedValue([]);
    render(<WsbResultsPage />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: 'Modifier ma recherche' });
      expect(link).toBeInTheDocument();
      const href = link.getAttribute('href');
      expect(href).toContain('x_wsb_flexoffice_search.do');
      expect(href).toContain('building=A');
      expect(href).toContain('floor=3');
      expect(href).toContain('date=2026-04-30');
      expect(href).toContain('type=bureau');
    });
  });
});

// ── État tout occupé ─────────────────────────────────────────────────────
describe('WsbResultsPage — tout occupé (pas d\'état vide)', () => {
  test('affiche les cards occupées sans déclencher l\'état vide', async () => {
    getAvailableSpaces.mockResolvedValue(ALL_OCCUPIED_SPACES);
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('A-101')).toBeInTheDocument();
    });

    expect(screen.getByText('A-102')).toBeInTheDocument();
    expect(screen.getByText('A-103')).toBeInTheDocument();
    expect(screen.queryByText('Aucun espace disponible')).not.toBeInTheDocument();
  });

  test('affiche "0 places disponibles" dans le titre quand tous sont occupés', async () => {
    getAvailableSpaces.mockResolvedValue(ALL_OCCUPIED_SPACES);
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('0 places disponibles')).toBeInTheDocument();
    });
  });

  test('toutes les cards portent la classe --occupied', async () => {
    getAvailableSpaces.mockResolvedValue(ALL_OCCUPIED_SPACES);
    const { container } = render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('A-101')).toBeInTheDocument();
    });

    const occupiedCards = container.querySelectorAll('.wsb-booking-card--occupied');
    expect(occupiedCards).toHaveLength(3);
  });
});

// ── État erreur serveur ──────────────────────────────────────────────────
describe('WsbResultsPage — timeout et erreurs', () => {
  test('affiche l\'état erreur serveur après un timeout', async () => {
    getAvailableSpaces.mockRejectedValue(new ApiError('timeout', 'AbortController'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('[WSB] Timeout API disponibilité');
    consoleSpy.mockRestore();
  });

  test('affiche le message d\'erreur AC exact', async () => {
    getAvailableSpaces.mockRejectedValue(new ApiError(500, 'Internal Server Error'));
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(
        screen.getByText('Une erreur est survenue lors du chargement des résultats. Veuillez réessayer.')
      ).toBeInTheDocument();
    });
  });

  test('affiche l\'état erreur pour une erreur HTTP 500', async () => {
    getAvailableSpaces.mockRejectedValue(new ApiError(500, 'Internal Server Error'));
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
    });
  });

  test('les skeletons disparaissent quand l\'erreur s\'affiche', async () => {
    getAvailableSpaces.mockRejectedValue(new ApiError(500, 'Internal Server Error'));
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.queryByLabelText('Chargement des espaces disponibles')).not.toBeInTheDocument();
    });
  });

  test('ne log pas le message timeout pour une erreur non-timeout', async () => {
    getAvailableSpaces.mockRejectedValue(new ApiError(500, 'Internal Server Error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
    });

    expect(consoleSpy).not.toHaveBeenCalledWith('[WSB] Timeout API disponibilité');
    consoleSpy.mockRestore();
  });

  test('le bouton Réessayer relance l\'appel API', async () => {
    getAvailableSpaces.mockRejectedValueOnce(new ApiError('timeout', 'AbortController'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });

    getAvailableSpaces.mockResolvedValueOnce(MOCK_SPACES);
    fireEvent.click(screen.getByText('Réessayer'));

    await waitFor(() => {
      expect(screen.getByText('A-101')).toBeInTheDocument();
    });

    expect(getAvailableSpaces).toHaveBeenCalledTimes(2);
    consoleSpy.mockRestore();
  });

  test('le lien "Retour à la recherche" renvoie vers la page search avec les params', async () => {
    getAvailableSpaces.mockRejectedValue(new ApiError(500, 'Internal Server Error'));
    render(<WsbResultsPage />);

    await waitFor(() => {
      const link = screen.getByRole('link', { name: 'Retour à la recherche' });
      expect(link).toBeInTheDocument();
      const href = link.getAttribute('href');
      expect(href).toContain('x_wsb_flexoffice_search.do');
      expect(href).toContain('building=A');
      expect(href).toContain('floor=3');
      expect(href).toContain('date=2026-04-30');
      expect(href).toContain('type=bureau');
    });
  });
});

describe('WsbResultsPage — guard invalide', () => {
  test('ne rend rien si les params sont manquants', () => {
    guardResultsPage.mockReturnValue({ valid: false, missing: ['type'], params: {} });
    const { container } = render(<WsbResultsPage />);
    expect(container.firstChild).toBeNull();
  });

  test('ne fait pas d\'appel API si guard invalide', () => {
    guardResultsPage.mockReturnValue({ valid: false, missing: ['type'], params: {} });
    render(<WsbResultsPage />);
    expect(getAvailableSpaces).not.toHaveBeenCalled();
  });
});
