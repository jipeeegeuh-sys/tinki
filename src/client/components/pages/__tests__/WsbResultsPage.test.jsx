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
});

describe('WsbResultsPage — critères de recherche', () => {
  test('affiche les critères de recherche dans la barre', () => {
    render(<WsbResultsPage />);
    expect(screen.getByText(/Bâtiment A/)).toBeInTheDocument();
    expect(screen.getByText(/Niv\. 3/)).toBeInTheDocument();
  });

  test('le lien "Nouvelle recherche" pointe vers la page search', () => {
    render(<WsbResultsPage />);
    const link = screen.getByText(/Nouvelle recherche/);
    expect(link.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('x_wsb_flexoffice_search.do')
    );
  });

  test('le lien "Modifier" pointe vers la page search', () => {
    render(<WsbResultsPage />);
    const link = screen.getByText('Modifier');
    expect(link.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('x_wsb_flexoffice_search.do')
    );
  });
});

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

  test('affiche l\'état erreur pour une erreur HTTP 500', async () => {
    getAvailableSpaces.mockRejectedValue(new ApiError(500, 'Internal Server Error'));
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
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

describe('WsbResultsPage — zéro résultat', () => {
  test('affiche l\'état vide quand l\'API retourne un tableau vide', async () => {
    getAvailableSpaces.mockResolvedValue([]);
    render(<WsbResultsPage />);

    await waitFor(() => {
      expect(screen.getByText('Aucun espace disponible')).toBeInTheDocument();
    });
  });
});
