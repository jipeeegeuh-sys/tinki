import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../../services/NavigationService.js', () => ({
  guardEditPage: jest.fn(() => ({
    valid: true,
    params: { sys_id: 'abc123' },
  })),
  navigateTo: jest.fn(),
}));

const mockDefaultRecord = {
  sys_id: 'abc123',
  number: 'RITM0010042',
  short_description: JSON.stringify({
    spaceId: 'A-102',
    type: 'bureau',
    floor: '3',
    date: '2026-05-12',
    start: '08:30',
    end: '18:00',
  }),
  u_parking_space: 'none',
};

jest.mock('../../../services/ApiService.js', () => ({
  getRecord: jest.fn(() => Promise.resolve({ ...mockDefaultRecord })),
}));

const { getRecord } = require('../../../services/ApiService.js');

import { WsbEditPage } from '../WsbEditPage';

describe('WsbEditPage — US-5.02 date & time validation', () => {
  beforeEach(() => {
    getRecord.mockResolvedValue({ ...mockDefaultRecord });
  });

  test('date input has min attribute blocking past dates', async () => {
    render(<WsbEditPage />);
    const dateInput = await screen.findByLabelText('Date');
    expect(dateInput).toHaveAttribute('min');
    const min = dateInput.getAttribute('min');
    expect(min).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('no error shown when date is a valid weekday', async () => {
    render(<WsbEditPage />);
    const dateInput = await screen.findByLabelText('Date');
    fireEvent.change(dateInput, { target: { value: '2026-05-13' } });
    expect(screen.queryByText(/jours ouvrés/)).not.toBeInTheDocument();
  });

  test('shows error when date is a weekend (Saturday)', async () => {
    render(<WsbEditPage />);
    const dateInput = await screen.findByLabelText('Date');
    fireEvent.change(dateInput, { target: { value: '2026-05-16' } });
    expect(
      await screen.findByText(/jours ouvrés/),
    ).toBeInTheDocument();
    expect(dateInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows error when date is a weekend (Sunday)', async () => {
    render(<WsbEditPage />);
    const dateInput = await screen.findByLabelText('Date');
    fireEvent.change(dateInput, { target: { value: '2026-05-17' } });
    expect(
      await screen.findByText(/jours ouvrés/),
    ).toBeInTheDocument();
  });

  test('no error when departure is after arrival', async () => {
    render(<WsbEditPage />);
    const arrivalInput = await screen.findByLabelText("Heure d'arrivée");
    const departInput = screen.getByLabelText('Heure de départ');
    fireEvent.change(arrivalInput, { target: { value: '09:00' } });
    fireEvent.change(departInput, { target: { value: '18:00' } });
    expect(
      screen.queryByText(/postérieure/),
    ).not.toBeInTheDocument();
    expect(departInput).not.toHaveAttribute('aria-invalid');
  });

  test('shows error when departure is before arrival', async () => {
    render(<WsbEditPage />);
    const arrivalInput = await screen.findByLabelText("Heure d'arrivée");
    const departInput = screen.getByLabelText('Heure de départ');
    fireEvent.change(arrivalInput, { target: { value: '14:00' } });
    fireEvent.change(departInput, { target: { value: '09:00' } });
    expect(
      await screen.findByText(
        "L'heure de départ doit être postérieure à l'heure d'arrivée.",
      ),
    ).toBeInTheDocument();
    expect(departInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('shows error when departure equals arrival', async () => {
    render(<WsbEditPage />);
    const arrivalInput = await screen.findByLabelText("Heure d'arrivée");
    const departInput = screen.getByLabelText('Heure de départ');
    fireEvent.change(arrivalInput, { target: { value: '10:00' } });
    fireEvent.change(departInput, { target: { value: '10:00' } });
    expect(
      await screen.findByText(/postérieure/),
    ).toBeInTheDocument();
  });

  test('save button is active when all fields are valid', async () => {
    render(<WsbEditPage />);
    const saveBtn = await screen.findByRole('button', {
      name: 'Enregistrer les modifications',
    });
    const dateInput = screen.getByLabelText('Date');
    const arrivalInput = screen.getByLabelText("Heure d'arrivée");
    const departInput = screen.getByLabelText('Heure de départ');
    fireEvent.change(dateInput, { target: { value: '2026-05-13' } });
    fireEvent.change(arrivalInput, { target: { value: '08:30' } });
    fireEvent.change(departInput, { target: { value: '18:00' } });
    expect(saveBtn).not.toBeDisabled();
  });

  test('save button is disabled when departure < arrival', async () => {
    render(<WsbEditPage />);
    const saveBtn = await screen.findByRole('button', {
      name: 'Enregistrer les modifications',
    });
    const arrivalInput = screen.getByLabelText("Heure d'arrivée");
    const departInput = screen.getByLabelText('Heure de départ');
    fireEvent.change(arrivalInput, { target: { value: '14:00' } });
    fireEvent.change(departInput, { target: { value: '09:00' } });
    expect(saveBtn).toHaveAttribute('aria-disabled', 'true');
  });

  test('save button is disabled when date is weekend', async () => {
    render(<WsbEditPage />);
    const saveBtn = await screen.findByRole('button', {
      name: 'Enregistrer les modifications',
    });
    const dateInput = screen.getByLabelText('Date');
    fireEvent.change(dateInput, { target: { value: '2026-05-16' } });
    expect(saveBtn).toHaveAttribute('aria-disabled', 'true');
  });

  test('save button is disabled when a time field is empty', async () => {
    render(<WsbEditPage />);
    const saveBtn = await screen.findByRole('button', {
      name: 'Enregistrer les modifications',
    });
    const departInput = screen.getByLabelText('Heure de départ');
    fireEvent.change(departInput, { target: { value: '' } });
    expect(saveBtn).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('WsbEditPage — US-5.03 parking modes', () => {
  afterEach(() => {
    getRecord.mockReset();
  });

  function mockWithParking(parkingValue) {
    getRecord.mockResolvedValueOnce({
      ...mockDefaultRecord,
      u_parking_space: parkingValue,
    });
  }

  test('Mode 1 — pre-selects Thermique when reservation has thermique', async () => {
    mockWithParking('thermique');
    render(<WsbEditPage />);
    const radio = await screen.findByRole('radio', { name: 'Thermique' });
    expect(radio).toBeChecked();
  });

  test('Mode 1 — pre-selects Électrique when reservation has electrique', async () => {
    mockWithParking('electrique');
    render(<WsbEditPage />);
    const radio = await screen.findByRole('radio', { name: /Électrique/ });
    expect(radio).toBeChecked();
  });

  test('Mode 2 — switching from thermique to électrique selects the new option', async () => {
    mockWithParking('thermique');
    render(<WsbEditPage />);
    const thermiqueRadio = await screen.findByRole('radio', { name: 'Thermique' });
    expect(thermiqueRadio).toBeChecked();

    const electriqueRadio = screen.getByRole('radio', { name: /Électrique/ });
    fireEvent.click(electriqueRadio);
    expect(electriqueRadio).toBeChecked();
    expect(thermiqueRadio).not.toBeChecked();
  });

  test('Mode 2 — shows hint text when électrique is selected', async () => {
    mockWithParking('electrique');
    render(<WsbEditPage />);
    expect(
      await screen.findByText('8 places électriques dans le parc.'),
    ).toBeInTheDocument();
  });

  test('Mode 3 — selecting Aucun parking shows removal message', async () => {
    mockWithParking('thermique');
    render(<WsbEditPage />);
    const aucunRadio = await screen.findByRole('radio', { name: 'Aucun parking' });
    fireEvent.click(aucunRadio);
    expect(aucunRadio).toBeChecked();
    expect(
      screen.getByText(/ne comprendra aucune place de stationnement/),
    ).toBeInTheDocument();
  });

  test('Mode 4 — pre-selects Aucun parking when no parking existed', async () => {
    mockWithParking('none');
    render(<WsbEditPage />);
    const aucunRadio = await screen.findByRole('radio', { name: 'Aucun parking' });
    expect(aucunRadio).toBeChecked();
  });

  test('Mode 4 — null u_parking_space defaults to Aucun parking', async () => {
    getRecord.mockResolvedValueOnce({
      ...mockDefaultRecord,
      u_parking_space: null,
    });
    render(<WsbEditPage />);
    const aucunRadio = await screen.findByRole('radio', { name: 'Aucun parking' });
    expect(aucunRadio).toBeChecked();
  });

  test('Mode 4 — adding parking from none selects the chosen type', async () => {
    mockWithParking('none');
    render(<WsbEditPage />);
    const aucunRadio = await screen.findByRole('radio', { name: 'Aucun parking' });
    expect(aucunRadio).toBeChecked();

    const thermiqueRadio = screen.getByRole('radio', { name: 'Thermique' });
    fireEvent.click(thermiqueRadio);
    expect(thermiqueRadio).toBeChecked();
    expect(aucunRadio).not.toBeChecked();
    expect(
      screen.queryByText(/ne comprendra aucune place/),
    ).not.toBeInTheDocument();
  });

  test('no hint shown when Thermique is selected', async () => {
    mockWithParking('thermique');
    render(<WsbEditPage />);
    await screen.findByRole('radio', { name: 'Thermique' });
    expect(screen.queryByText(/8 places électriques/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ne comprendra aucune/)).not.toBeInTheDocument();
  });
});
