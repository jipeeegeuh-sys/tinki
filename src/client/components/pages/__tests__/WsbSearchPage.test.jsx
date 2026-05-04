import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbSearchPage } from '../WsbSearchPage';

jest.mock('../../../services/NavigationService.js', () => ({
  navigateTo: jest.fn(),
  getCurrentParams: jest.fn(() => ({})),
}));

const { navigateTo, getCurrentParams } = require('../../../services/NavigationService.js');

beforeEach(() => {
  navigateTo.mockClear();
  getCurrentParams.mockReturnValue({});
});

describe('WsbSearchPage — structure', () => {
  test('affiche le titre "Rechercher un espace de travail"', () => {
    render(<WsbSearchPage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Rechercher un espace de travail',
    );
  });

  test('affiche le badge RÉSERVATION', () => {
    render(<WsbSearchPage />);
    expect(screen.getByText('RÉSERVATION')).toBeInTheDocument();
  });

  test('affiche le formulaire accessible', () => {
    render(<WsbSearchPage />);
    expect(screen.getByRole('form', { name: /Recherche d'espace/ })).toBeInTheDocument();
  });

  test('affiche 3 comboboxes et 1 champ date', () => {
    render(<WsbSearchPage />);
    expect(screen.getAllByRole('combobox')).toHaveLength(3);
    expect(screen.getByLabelText(/^Date/)).toHaveAttribute('type', 'date');
  });

  test('affiche les labels des 4 champs', () => {
    render(<WsbSearchPage />);
    expect(screen.getByText(/^Bâtiment/)).toBeInTheDocument();
    expect(screen.getByText(/^Étage/)).toBeInTheDocument();
    expect(screen.getByText(/^Date/)).toBeInTheDocument();
    expect(screen.getByText(/^Type d'espace/)).toBeInTheDocument();
  });

  test('affiche les titres de section', () => {
    render(<WsbSearchPage />);
    expect(screen.getByText(/LOCALISATION/)).toBeInTheDocument();
    expect(screen.getByText(/TYPE D'ESPACE/)).toBeInTheDocument();
    expect(screen.getByText(/PARKING/)).toBeInTheDocument();
  });

  test('affiche le bouton Lancer la recherche', () => {
    render(<WsbSearchPage />);
    expect(screen.getByRole('button', { name: 'Lancer la recherche' })).toBeInTheDocument();
  });
});

describe('WsbSearchPage — champ Date', () => {
  test('le champ Date est pré-rempli au format YYYY-MM-DD', () => {
    render(<WsbSearchPage />);
    const dateInput = screen.getByLabelText(/^Date/);
    expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('le champ Date a un attribut min', () => {
    render(<WsbSearchPage />);
    const dateInput = screen.getByLabelText(/^Date/);
    expect(dateInput).toHaveAttribute('min');
    expect(dateInput.getAttribute('min')).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('la date pré-remplie n\'est pas un weekend', () => {
    render(<WsbSearchPage />);
    const dateInput = screen.getByLabelText(/^Date/);
    const [y, m, d] = dateInput.value.split('-').map(Number);
    const day = new Date(y, m - 1, d).getDay();
    expect(day).not.toBe(0);
    expect(day).not.toBe(6);
  });

  test('rejette une date weekend', () => {
    render(<WsbSearchPage />);
    const dateInput = screen.getByLabelText(/^Date/);
    const before = dateInput.value;
    fireEvent.change(dateInput, { target: { value: '2026-05-09' } });
    expect(dateInput.value).toBe(before);
  });

  test('accepte une date en semaine', () => {
    render(<WsbSearchPage />);
    const dateInput = screen.getByLabelText(/^Date/);
    fireEvent.change(dateInput, { target: { value: '2026-05-11' } });
    expect(dateInput.value).toBe('2026-05-11');
  });
});

describe('WsbSearchPage — dropdown Bâtiment', () => {
  test('affiche les options Bâtiment A et Bâtiment B', () => {
    render(<WsbSearchPage />);
    fireEvent.click(document.getElementById('search-building'));
    expect(screen.getByText('Bâtiment A')).toBeInTheDocument();
    expect(screen.getByText('Bâtiment B')).toBeInTheDocument();
  });

  test('sélectionne Bâtiment A', () => {
    render(<WsbSearchPage />);
    const trigger = document.getElementById('search-building');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Bâtiment A'));
    expect(trigger).toHaveTextContent('Bâtiment A');
  });
});

describe('WsbSearchPage — dropdown Étage', () => {
  test('affiche les 4 niveaux dans l\'ordre', () => {
    render(<WsbSearchPage />);
    fireEvent.click(document.getElementById('search-floor'));
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveTextContent('Niv. 2');
    expect(options[1]).toHaveTextContent('Niv. 3');
    expect(options[2]).toHaveTextContent('Niv. 4');
    expect(options[3]).toHaveTextContent('Niv. 5');
  });

  test('sélectionne Niv. 3', () => {
    render(<WsbSearchPage />);
    const trigger = document.getElementById('search-floor');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Niv. 3'));
    expect(trigger).toHaveTextContent('Niv. 3');
  });
});

describe('WsbSearchPage — dropdown Type d\'espace', () => {
  test('affiche les 4 types dans l\'ordre', () => {
    render(<WsbSearchPage />);
    fireEvent.click(document.getElementById('search-space-type'));
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveTextContent('Openspace classique');
    expect(options[1]).toHaveTextContent('Openspace spécialisé (RH, Compta…)');
    expect(options[2]).toHaveTextContent('Phone Box');
    expect(options[3]).toHaveTextContent('Meeting Room');
  });

  test('sélectionne Phone Box', () => {
    render(<WsbSearchPage />);
    const trigger = document.getElementById('search-space-type');
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Phone Box'));
    expect(trigger).toHaveTextContent('Phone Box');
  });
});

describe('WsbSearchPage — validation et focus erreur', () => {
  test('affiche les erreurs et met aria-invalid sur submit vide', () => {
    render(<WsbSearchPage />);
    // Clear date (set empty)
    const dateInput = screen.getByLabelText(/^Date/);

    // Submit sans remplir bâtiment, étage, type
    fireEvent.submit(screen.getByRole('form', { name: /Recherche d'espace/ }));

    // Errors should appear for building, floor, type
    expect(screen.getByText('Le bâtiment est requis.')).toBeInTheDocument();
    expect(screen.getByText('L\'étage est requis.')).toBeInTheDocument();
    expect(screen.getByText('Le type d\'espace est requis.')).toBeInTheDocument();

    // aria-invalid on selects
    expect(document.getElementById('search-building')).toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById('search-floor')).toHaveAttribute('aria-invalid', 'true');
    expect(document.getElementById('search-space-type')).toHaveAttribute('aria-invalid', 'true');
  });

  test('aria-errormessage points to error id', () => {
    render(<WsbSearchPage />);
    fireEvent.submit(screen.getByRole('form', { name: /Recherche d'espace/ }));

    const buildingTrigger = document.getElementById('search-building');
    expect(buildingTrigger).toHaveAttribute('aria-errormessage', 'err-search-building');
    expect(document.getElementById('err-search-building')).toHaveTextContent('Le bâtiment est requis.');
  });

  test('focus is moved to first error field on submit', () => {
    render(<WsbSearchPage />);
    fireEvent.submit(screen.getByRole('form', { name: /Recherche d'espace/ }));

    // First error in FIELD_ORDER is building
    expect(document.activeElement).toBe(document.getElementById('search-building'));
  });

  test('clears error on field change', () => {
    render(<WsbSearchPage />);
    fireEvent.submit(screen.getByRole('form', { name: /Recherche d'espace/ }));
    expect(screen.getByText('Le bâtiment est requis.')).toBeInTheDocument();

    // Select a building
    fireEvent.click(document.getElementById('search-building'));
    fireEvent.click(screen.getByText('Bâtiment A'));
    expect(screen.queryByText('Le bâtiment est requis.')).not.toBeInTheDocument();
  });
});

describe('WsbSearchPage — parking fieldset', () => {
  test('affiche le toggle parking', () => {
    render(<WsbSearchPage />);
    expect(screen.getByText('Venez-vous en voiture ?')).toBeInTheDocument();
  });

  test('affiche les radios parking après toggle', () => {
    render(<WsbSearchPage />);
    fireEvent.click(screen.getByRole('switch'));
    expect(screen.getByText('Type de parking souhaité')).toBeInTheDocument();
    expect(screen.getByLabelText('Place thermique')).toBeInTheDocument();
    expect(screen.getByLabelText('Place électrique')).toBeInTheDocument();
  });
});

describe('WsbSearchPage — soumission réussie', () => {
  test('navigue vers results avec les params', () => {
    render(<WsbSearchPage />);

    // Fill all fields
    fireEvent.click(document.getElementById('search-building'));
    fireEvent.click(screen.getByText('Bâtiment A'));

    fireEvent.click(document.getElementById('search-floor'));
    fireEvent.click(screen.getByText('Niv. 3'));

    fireEvent.click(document.getElementById('search-space-type'));
    fireEvent.click(screen.getByText('Openspace classique'));

    fireEvent.submit(screen.getByRole('form', { name: /Recherche d'espace/ }));

    expect(navigateTo).toHaveBeenCalledWith('results', expect.objectContaining({
      building: 'A',
      floor: '3',
      type: 'openspace-classique',
    }));
  });
});

describe('WsbSearchPage — pré-remplissage depuis query params', () => {
  test('pré-remplit les 4 champs depuis les query params URL', () => {
    getCurrentParams.mockReturnValueOnce({
      building: 'A',
      floor: '3',
      date: '2026-05-11',
      type: 'openspace-classique',
    });
    render(<WsbSearchPage />);
    expect(document.getElementById('search-building')).toHaveTextContent('Bâtiment A');
    expect(document.getElementById('search-floor')).toHaveTextContent('Niv. 3');
    expect(screen.getByLabelText(/^Date/)).toHaveValue('2026-05-11');
    expect(document.getElementById('search-space-type')).toHaveTextContent('Openspace classique');
  });

  test('pré-remplit le parking depuis le query param parking=electrique', () => {
    getCurrentParams.mockReturnValueOnce({
      building: 'A',
      floor: '3',
      date: '2026-05-11',
      type: 'openspace-classique',
      parking: 'electrique',
    });
    render(<WsbSearchPage />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByLabelText('Place électrique')).toBeChecked();
  });

  test('utilise les valeurs par défaut si aucun query param', () => {
    getCurrentParams.mockReturnValueOnce({});
    render(<WsbSearchPage />);
    expect(document.getElementById('search-building')).toHaveTextContent('Sélectionner un bâtiment');
    expect(document.getElementById('search-floor')).toHaveTextContent('Sélectionner un étage');
    expect(document.getElementById('search-space-type')).toHaveTextContent('Sélectionner un type');
  });

  test('soumet avec les params pré-remplis sans les modifier', () => {
    getCurrentParams.mockReturnValueOnce({
      building: 'B',
      floor: '4',
      date: '2026-05-12',
      type: 'phonebox',
    });
    render(<WsbSearchPage />);
    fireEvent.submit(screen.getByRole('form', { name: /Recherche d'espace/ }));

    expect(navigateTo).toHaveBeenCalledWith('results', expect.objectContaining({
      building: 'B',
      floor: '4',
      date: '2026-05-12',
      type: 'phonebox',
    }));
  });
});
