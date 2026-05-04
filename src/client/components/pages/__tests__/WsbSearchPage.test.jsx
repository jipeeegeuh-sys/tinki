import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbSearchPage } from '../WsbSearchPage';

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
