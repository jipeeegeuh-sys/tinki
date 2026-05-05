import { jest } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockHandleError = jest.fn();

jest.mock('../../../lib/useApiError.js', () => ({
  useApiError: jest.fn(() => ({ handleError: mockHandleError })),
}));

jest.mock('../../../services/NavigationService.js', () => ({
  buildPageUrl: jest.fn((page) => `x_wsb_flexoffice_${page}.do`),
}));

jest.mock('../../../services/ApiService.js', () => ({
  getRequestItems: jest.fn(() => new Promise(() => {})),
  ApiError: class ApiError extends Error {
    constructor(status, statusText) {
      super(`HTTP ${status}`);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

const { getRequestItems, ApiError } = require('../../../services/ApiService.js');

import { WsbReservationsPage } from '../WsbReservationsPage.jsx';

const MOCK_ITEMS = [
  {
    sys_id: 'r1',
    number: 'RITM0001',
    short_description: 'Bureau A-201',
    state: { value: 2, display_value: 'En cours' },
    opened_at: '2026-04-28T08:00:00',
    u_space_name: 'A-201',
    u_floor: 'Niveau 3',
  },
  {
    sys_id: 'r2',
    number: 'RITM0002',
    short_description: 'Phonebox B-102',
    state: { value: 1, display_value: 'En attente' },
    opened_at: '2026-04-29T09:00:00',
    u_space_name: 'B-102',
    u_floor: 'Niveau 2',
  },
];

beforeEach(() => {
  mockHandleError.mockClear();
  getRequestItems.mockReset();
  getRequestItems.mockReturnValue(new Promise(() => {}));
});

describe('WsbReservationsPage — chargement', () => {
  test('affiche le skeleton table de 5 lignes au montage', () => {
    render(<WsbReservationsPage />);
    expect(screen.getByLabelText('Chargement de vos réservations')).toBeInTheDocument();
    expect(screen.getByLabelText('Chargement de vos réservations')).toHaveAttribute('aria-busy', 'true');
  });

  test('affiche le titre de la page pendant le chargement', () => {
    render(<WsbReservationsPage />);
    expect(screen.getByText('Mes réservations')).toBeInTheDocument();
  });

  test('affiche le badge MES RÉSERVATIONS', () => {
    render(<WsbReservationsPage />);
    expect(screen.getByText('MES RÉSERVATIONS')).toBeInTheDocument();
  });

  test('appelle getRequestItems au montage', () => {
    render(<WsbReservationsPage />);
    expect(getRequestItems).toHaveBeenCalledTimes(1);
    expect(getRequestItems).toHaveBeenCalledWith(expect.objectContaining({
      sysparm_display_value: true,
    }));
  });
});

describe('WsbReservationsPage — succès API', () => {
  beforeEach(() => { getRequestItems.mockResolvedValue(MOCK_ITEMS); });

  test('affiche les réservations après réponse réussie', async () => {
    render(<WsbReservationsPage />);
    await waitFor(() => expect(screen.getByText('RITM0001')).toBeInTheDocument());
    expect(screen.getByText('RITM0002')).toBeInTheDocument();
  });

  test('le skeleton disparaît après le chargement', async () => {
    render(<WsbReservationsPage />);
    await waitFor(() => {
      expect(screen.queryByLabelText('Chargement de vos réservations')).not.toBeInTheDocument();
    });
  });

  test('affiche un lien Éditer pour chaque réservation', async () => {
    render(<WsbReservationsPage />);
    await waitFor(() => {
      const editLinks = screen.getAllByRole('link', { name: /Éditer la réservation/ });
      expect(editLinks).toHaveLength(2);
    });
  });

  test('affiche le tableau avec les en-têtes de colonnes', async () => {
    render(<WsbReservationsPage />);
    await waitFor(() => expect(screen.getByText('Référence')).toBeInTheDocument());
    expect(screen.getByText('Espace')).toBeInTheDocument();
    expect(screen.getByText('Étage')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
  });

  test('affiche les noms des espaces depuis u_space_name', async () => {
    render(<WsbReservationsPage />);
    await waitFor(() => expect(screen.getByText('A-201')).toBeInTheDocument());
    expect(screen.getByText('B-102')).toBeInTheDocument();
  });
});

describe('WsbReservationsPage — liste vide', () => {
  test('affiche l\'état vide quand l\'API retourne un tableau vide', async () => {
    getRequestItems.mockResolvedValue([]);
    render(<WsbReservationsPage />);
    await waitFor(() => expect(screen.getByText('Aucune réservation')).toBeInTheDocument());
  });

  test('le skeleton disparaît quand la liste est vide', async () => {
    getRequestItems.mockResolvedValue([]);
    render(<WsbReservationsPage />);
    await waitFor(() => {
      expect(screen.queryByLabelText('Chargement de vos réservations')).not.toBeInTheDocument();
    });
  });
});

describe('WsbReservationsPage — erreur API', () => {
  test('affiche l\'état erreur et appelle handleError sur 500', async () => {
    getRequestItems.mockRejectedValue(new ApiError(500, 'Internal Server Error'));
    render(<WsbReservationsPage />);
    await waitFor(() => expect(screen.getByText('Erreur de chargement')).toBeInTheDocument());
    expect(mockHandleError).toHaveBeenCalledWith(
      expect.objectContaining({ status: 500 }),
      expect.any(Function),
    );
  });

  test('le skeleton disparaît en cas d\'erreur', async () => {
    getRequestItems.mockRejectedValue(new ApiError(500, 'Internal Server Error'));
    render(<WsbReservationsPage />);
    await waitFor(() => {
      expect(screen.queryByLabelText('Chargement de vos réservations')).not.toBeInTheDocument();
    });
  });

  test('appelle handleError avec la fonction retry en cas de timeout', async () => {
    getRequestItems.mockRejectedValue(new ApiError('timeout', 'AbortController'));
    render(<WsbReservationsPage />);
    await waitFor(() => expect(mockHandleError).toHaveBeenCalled());
    const [, retryFn] = mockHandleError.mock.calls[0];
    expect(typeof retryFn).toBe('function');
  });

  test('le bouton Réessayer (page) relance l\'appel API', async () => {
    getRequestItems.mockRejectedValueOnce(new ApiError(500, 'Internal Server Error'));
    render(<WsbReservationsPage />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument());
    getRequestItems.mockResolvedValueOnce(MOCK_ITEMS);
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    await waitFor(() => expect(screen.getByText('RITM0001')).toBeInTheDocument());
    expect(getRequestItems).toHaveBeenCalledTimes(2);
  });
});
