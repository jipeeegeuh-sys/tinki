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

jest.mock('../../../services/ApiService.js', () => ({
  getRecord: jest.fn(() =>
    Promise.resolve({
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
    }),
  ),
}));

import { WsbEditPage } from '../WsbEditPage';

describe('WsbEditPage — US-5.02 date & time validation', () => {
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
