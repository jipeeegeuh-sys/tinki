import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbBookingTableRow } from '../WsbBookingTableRow';

const ROW_PROPS = {
  spaceId: 'A-102',
  type: 'openspace-classique',
  floor: '1er étage',
  date: '2026-04-30',
  timeSlot: '08:30 — 18:00',
  status: 'en-cours',
};

function renderRow(props = {}) {
  return render(
    <table>
      <tbody>
        <WsbBookingTableRow {...ROW_PROPS} {...props} />
      </tbody>
    </table>
  );
}

describe('WsbBookingTableRow — affichage de base', () => {
  test('affiche le numéro de place', () => {
    renderRow();
    expect(screen.getByText('A-102')).toBeInTheDocument();
  });

  test('affiche le badge de type avec le bon label', () => {
    renderRow();
    expect(screen.getByText('Open Space')).toBeInTheDocument();
  });

  test('affiche l\'étage', () => {
    renderRow();
    expect(screen.getByText('1er étage')).toBeInTheDocument();
  });

  test('affiche la date formatée en français', () => {
    renderRow();
    expect(screen.getByText(/30 avr. 2026/i)).toBeInTheDocument();
  });

  test('affiche le créneau horaire', () => {
    renderRow();
    expect(screen.getByText('08:30 — 18:00')).toBeInTheDocument();
  });

  test('affiche le badge de statut', () => {
    renderRow();
    expect(screen.getByText('Réservation en cours')).toBeInTheDocument();
  });
});

describe('WsbBookingTableRow — badges de type', () => {
  test.each([
    ['openspace-classique', 'Open Space'],
    ['phonebox', 'Phonebox'],
    ['parking-electrique', 'Parking EV'],
    ['bureau', 'Bureau'],
  ])('type "%s" affiche le label "%s"', (type, label) => {
    renderRow({ type });
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  test('parking-electrique affiche l\'icône éclair', () => {
    const { container } = renderRow({ type: 'parking-electrique' });
    expect(container.querySelector('.wsb-table-row__electric-icon')).toBeInTheDocument();
  });
});

describe('WsbBookingTableRow — badges de statut', () => {
  test.each([
    ['en-cours', 'Réservation en cours'],
    ['a-venir', 'À venir'],
    ['en-attente', 'En attente'],
    ['terminee', 'Terminée'],
    ['annulee', 'Annulée'],
  ])('statut "%s" affiche le label "%s"', (status, label) => {
    renderRow({ status });
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

describe('WsbBookingTableRow — actions', () => {
  test('affiche Éditer et Annuler pour statut en-cours', () => {
    renderRow({ status: 'en-cours' });
    expect(screen.getByText('Éditer')).toBeInTheDocument();
    expect(screen.getByText('Annuler')).toBeInTheDocument();
  });

  test('affiche les actions pour statut a-venir', () => {
    renderRow({ status: 'a-venir' });
    expect(screen.getByText('Éditer')).toBeInTheDocument();
  });

  test('masque les actions pour statut terminee', () => {
    renderRow({ status: 'terminee' });
    expect(screen.queryByText('Éditer')).not.toBeInTheDocument();
    expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
  });

  test('masque les actions pour statut annulee', () => {
    renderRow({ status: 'annulee' });
    expect(screen.queryByText('Éditer')).not.toBeInTheDocument();
  });

  test('onEdit reçoit les données de la ligne au clic', () => {
    const onEdit = jest.fn();
    renderRow({ onEdit });
    fireEvent.click(screen.getByText('Éditer'));
    expect(onEdit).toHaveBeenCalledWith({
      spaceId: 'A-102',
      type: 'openspace-classique',
      date: '2026-04-30',
    });
  });

  test('onCancel reçoit les données de la ligne au clic', () => {
    const onCancel = jest.fn();
    renderRow({ onCancel });
    fireEvent.click(screen.getByText('Annuler'));
    expect(onCancel).toHaveBeenCalledWith({
      spaceId: 'A-102',
      type: 'openspace-classique',
      date: '2026-04-30',
    });
  });
});

describe('WsbBookingTableRow — aria-labels uniques', () => {
  test('le bouton Éditer porte un aria-label au format DD/MM/YYYY', () => {
    renderRow();
    const btn = screen.getByRole('button', { name: /Éditer réservation/ });
    expect(btn).toHaveAttribute(
      'aria-label',
      'Éditer réservation Open Space A-102 du 30/04/2026'
    );
  });

  test('le bouton Annuler porte un aria-label au format DD/MM/YYYY', () => {
    renderRow();
    const btn = screen.getByRole('button', { name: /Annuler réservation/ });
    expect(btn).toHaveAttribute(
      'aria-label',
      'Annuler réservation Open Space A-102 du 30/04/2026'
    );
  });
});

describe('WsbBookingTableRow — mode readonly', () => {
  test('aucun bouton d\'action quand readonly=true', () => {
    renderRow({ readonly: true, status: 'en-cours' });
    expect(screen.queryByText('Éditer')).not.toBeInTheDocument();
    expect(screen.queryByText('Annuler')).not.toBeInTheDocument();
  });

  test('la cellule Actions n\'est pas rendue quand readonly=true', () => {
    const { container } = renderRow({ readonly: true, status: 'en-cours' });
    const cells = container.querySelectorAll('td');
    const cellsWithoutDuration = 6;
    expect(cells).toHaveLength(cellsWithoutDuration);
  });
});

describe('WsbBookingTableRow — colonne durée', () => {
  test('affiche la durée quand la prop est fournie', () => {
    renderRow({ duration: '9h30' });
    expect(screen.getByText('9h30')).toBeInTheDocument();
  });

  test('n\'affiche pas la cellule durée si non fournie', () => {
    const { container } = renderRow();
    expect(container.querySelector('.wsb-table-row__duration')).not.toBeInTheDocument();
  });
});
