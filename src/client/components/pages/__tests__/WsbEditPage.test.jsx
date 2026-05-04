import { jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../../services/NavigationService.js', () => ({
  guardEditPage: jest.fn(() => ({
    valid: true,
    params: { sys_id: 'abc123' },
  })),
  navigateTo: jest.fn(),
  buildPageUrl: jest.fn((page) => `x_wsb_flexoffice_${page}.do`),
}));

const mockToast = { success: jest.fn(), error: jest.fn(), warning: jest.fn(), info: jest.fn() };
jest.mock('../../../lib/useToast.js', () => ({
  useToast: () => ({ toast: mockToast }),
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
  updateRecord: jest.fn(() => Promise.resolve({})),
  fetchTablePage: jest.fn(() => Promise.resolve({ items: [], total: 0 })),
}));

const { getRecord, updateRecord, fetchTablePage } = require('../../../services/ApiService.js');
const { navigateTo } = require('../../../services/NavigationService.js');

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

describe('WsbEditPage — US-5.04 save submission', () => {
  beforeEach(() => {
    getRecord.mockResolvedValue({ ...mockDefaultRecord });
    updateRecord.mockClear();
    updateRecord.mockResolvedValue({});
    fetchTablePage.mockClear();
    fetchTablePage.mockResolvedValue({ items: [], total: 0 });
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    navigateTo.mockClear();
  });

  test('save button enters loading state on click', async () => {
    let resolveUpdate;
    updateRecord.mockImplementation(
      () => new Promise((r) => { resolveUpdate = r; }),
    );

    render(<WsbEditPage />);
    await screen.findByRole('button', {
      name: 'Enregistrer les modifications',
    });

    const saveBtn = screen.getByRole('button', {
      name: 'Enregistrer les modifications',
    });
    fireEvent.click(saveBtn);

    const loadingBtn = await screen.findByRole('button', {
      name: 'Enregistrement en cours…',
    });
    expect(loadingBtn).toHaveAttribute('aria-busy', 'true');
    expect(loadingBtn).toHaveAttribute('aria-disabled', 'true');

    resolveUpdate({});
  });

  test('successful save with schedule change checks availability then PATCHes', async () => {
    render(<WsbEditPage />);
    await screen.findByRole('button', { name: 'Enregistrer les modifications' });

    const dateInput = screen.getByLabelText('Date');
    fireEvent.change(dateInput, { target: { value: '2026-05-13' } });

    const saveBtn = screen.getByRole('button', {
      name: 'Enregistrer les modifications',
    });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(fetchTablePage).toHaveBeenCalledWith(
        'sc_req_item',
        expect.objectContaining({ sysparm_limit: '1' }),
      );
    });

    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith(
        'sc_req_item',
        'abc123',
        expect.objectContaining({
          u_booking_date: '2026-05-13',
          u_arrival_time: '08:30',
          u_departure_time: '18:00',
          u_parking_space: 'none',
        }),
      );
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      'Votre réservation a bien été modifiée.',
    );
    expect(navigateTo).toHaveBeenCalledWith('reservations');
  });

  test('availability conflict shows inline error and blocks save', async () => {
    fetchTablePage.mockResolvedValue({ items: [{ sys_id: 'conflict' }], total: 1 });

    render(<WsbEditPage />);
    await screen.findByRole('button', { name: 'Enregistrer les modifications' });

    const dateInput = screen.getByLabelText('Date');
    fireEvent.change(dateInput, { target: { value: '2026-05-13' } });

    const saveBtn = screen.getByRole('button', {
      name: 'Enregistrer les modifications',
    });
    fireEvent.click(saveBtn);

    expect(
      await screen.findByText(/n'est plus disponible sur ce créneau/),
    ).toBeInTheDocument();

    expect(updateRecord).not.toHaveBeenCalled();
    expect(navigateTo).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  test('parking-only change skips schedule check but runs parking check', async () => {
    render(<WsbEditPage />);
    await screen.findByRole('button', { name: 'Enregistrer les modifications' });

    const thermiqueRadio = screen.getByRole('radio', { name: 'Thermique' });
    fireEvent.click(thermiqueRadio);

    const saveBtn = screen.getByRole('button', {
      name: 'Enregistrer les modifications',
    });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalledWith(
        'sc_req_item',
        'abc123',
        expect.objectContaining({ u_parking_space: 'thermique' }),
      );
    });

    expect(fetchTablePage).toHaveBeenCalledTimes(1);
    expect(fetchTablePage).toHaveBeenCalledWith(
      'sc_req_item',
      expect.objectContaining({
        sysparm_query: expect.stringContaining('u_parking_space=thermique'),
      }),
    );
    expect(mockToast.success).toHaveBeenCalled();
    expect(navigateTo).toHaveBeenCalledWith('reservations');
  });

  test('API error during save shows error toast', async () => {
    updateRecord.mockRejectedValue(new Error('Network error'));

    render(<WsbEditPage />);
    const saveBtn = await screen.findByRole('button', {
      name: 'Enregistrer les modifications',
    });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        'Une erreur est survenue. Veuillez réessayer.',
      );
    });

    expect(navigateTo).not.toHaveBeenCalled();
  });

  test('PATCH body includes updated short_description JSON', async () => {
    render(<WsbEditPage />);
    await screen.findByRole('button', { name: 'Enregistrer les modifications' });

    const dateInput = screen.getByLabelText('Date');
    const arrivalInput = screen.getByLabelText("Heure d'arrivée");
    fireEvent.change(dateInput, { target: { value: '2026-05-14' } });
    fireEvent.change(arrivalInput, { target: { value: '09:00' } });

    const saveBtn = screen.getByRole('button', {
      name: 'Enregistrer les modifications',
    });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateRecord).toHaveBeenCalled();
    });

    const body = updateRecord.mock.calls[0][2];
    const desc = JSON.parse(body.short_description);
    expect(desc).toEqual(
      expect.objectContaining({
        spaceId: 'A-102',
        type: 'bureau',
        floor: '3',
        date: '2026-05-14',
        start: '09:00',
        end: '18:00',
      }),
    );
  });
});

describe('WsbEditPage — US-5.05 conflict display & recovery', () => {
  beforeEach(() => {
    getRecord.mockResolvedValue({ ...mockDefaultRecord });
    updateRecord.mockClear();
    updateRecord.mockResolvedValue({});
    fetchTablePage.mockClear();
    fetchTablePage.mockResolvedValue({ items: [], total: 0 });
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    navigateTo.mockClear();
  });

  // ── Schedule conflict ──────────────────────────────────────────────────

  async function triggerScheduleConflict() {
    fetchTablePage.mockResolvedValue({ items: [{ sys_id: 'x' }], total: 1 });
    render(<WsbEditPage />);
    await screen.findByRole('button', { name: 'Enregistrer les modifications' });
    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-05-13' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Enregistrer les modifications' }),
    );
    await screen.findByText(/n'est plus disponible/);
  }

  test('schedule conflict — all three fields get aria-invalid', async () => {
    await triggerScheduleConflict();

    expect(screen.getByLabelText('Date')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText("Heure d'arrivée")).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Heure de départ')).toHaveAttribute('aria-invalid', 'true');
  });

  test('schedule conflict — fields point to the conflict message id', async () => {
    await triggerScheduleConflict();

    for (const label of ['Date', "Heure d'arrivée", 'Heure de départ']) {
      expect(screen.getByLabelText(label)).toHaveAttribute(
        'aria-errormessage',
        'conflict-schedule',
      );
    }
  });

  test('schedule conflict — save button remains active', async () => {
    await triggerScheduleConflict();

    const saveBtn = screen.getByRole('button', {
      name: 'Enregistrer les modifications',
    });
    expect(saveBtn).toHaveAttribute('aria-disabled', 'false');
  });

  test('schedule conflict — changing date clears the error', async () => {
    await triggerScheduleConflict();

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-05-14' },
    });

    expect(screen.queryByText(/n'est plus disponible/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Date')).not.toHaveAttribute('aria-invalid');
  });

  test('schedule conflict — changing arrival clears the error', async () => {
    await triggerScheduleConflict();

    fireEvent.change(screen.getByLabelText("Heure d'arrivée"), {
      target: { value: '09:30' },
    });

    expect(screen.queryByText(/n'est plus disponible/)).not.toBeInTheDocument();
  });

  test('schedule conflict — changing departure clears the error', async () => {
    await triggerScheduleConflict();

    fireEvent.change(screen.getByLabelText('Heure de départ'), {
      target: { value: '17:30' },
    });

    expect(screen.queryByText(/n'est plus disponible/)).not.toBeInTheDocument();
  });

  test('schedule conflict — form values are preserved', async () => {
    await triggerScheduleConflict();

    expect(screen.getByLabelText('Date')).toHaveValue('2026-05-13');
    expect(screen.getByLabelText("Heure d'arrivée")).toHaveValue('08:30');
    expect(screen.getByLabelText('Heure de départ')).toHaveValue('18:00');
  });

  // ── Parking conflict ───────────────────────────────────────────────────

  test('parking conflict — shows error under parking section', async () => {
    fetchTablePage.mockResolvedValue({ items: [], total: 8 });

    render(<WsbEditPage />);
    await screen.findByRole('button', { name: 'Enregistrer les modifications' });

    fireEvent.click(screen.getByRole('radio', { name: /Électrique/ }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Enregistrer les modifications' }),
    );

    expect(
      await screen.findByText(/Aucune place de stationnement Électrique/),
    ).toBeInTheDocument();

    expect(updateRecord).not.toHaveBeenCalled();
  });

  test('parking conflict — selected radio gets aria-invalid', async () => {
    fetchTablePage.mockResolvedValue({ items: [], total: 8 });

    render(<WsbEditPage />);
    await screen.findByRole('button', { name: 'Enregistrer les modifications' });

    fireEvent.click(screen.getByRole('radio', { name: /Électrique/ }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Enregistrer les modifications' }),
    );

    await screen.findByText(/Aucune place de stationnement/);

    const elecRadio = screen.getByRole('radio', { name: /Électrique/ });
    expect(elecRadio).toHaveAttribute('aria-invalid', 'true');
    expect(elecRadio).toHaveAttribute('aria-errormessage', 'conflict-parking');
  });

  test('parking conflict — schedule fields NOT affected', async () => {
    fetchTablePage.mockResolvedValue({ items: [], total: 8 });

    render(<WsbEditPage />);
    await screen.findByRole('button', { name: 'Enregistrer les modifications' });

    fireEvent.click(screen.getByRole('radio', { name: /Électrique/ }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Enregistrer les modifications' }),
    );

    await screen.findByText(/Aucune place de stationnement/);

    expect(screen.getByLabelText('Date')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText("Heure d'arrivée")).not.toHaveAttribute('aria-invalid');
  });

  test('parking conflict — changing parking clears the error', async () => {
    fetchTablePage.mockResolvedValue({ items: [], total: 8 });

    render(<WsbEditPage />);
    await screen.findByRole('button', { name: 'Enregistrer les modifications' });

    fireEvent.click(screen.getByRole('radio', { name: /Électrique/ }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Enregistrer les modifications' }),
    );

    await screen.findByText(/Aucune place de stationnement/);

    fireEvent.click(screen.getByRole('radio', { name: 'Thermique' }));

    expect(
      screen.queryByText(/Aucune place de stationnement/),
    ).not.toBeInTheDocument();
  });
});

describe('WsbEditPage — US-5.06 cancel & breadcrumb navigation', () => {
  beforeEach(() => {
    getRecord.mockResolvedValue({ ...mockDefaultRecord });
    updateRecord.mockClear();
    updateRecord.mockResolvedValue({});
    fetchTablePage.mockClear();
    fetchTablePage.mockResolvedValue({ items: [], total: 0 });
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    mockToast.warning.mockClear();
    mockToast.info.mockClear();
    navigateTo.mockClear();
  });

  test('cancel button navigates to reservations', async () => {
    render(<WsbEditPage />);
    const cancelBtn = await screen.findByRole('button', { name: 'Annuler' });
    fireEvent.click(cancelBtn);
    expect(navigateTo).toHaveBeenCalledWith('reservations');
  });

  test('cancel button does not trigger PATCH', async () => {
    render(<WsbEditPage />);
    const cancelBtn = await screen.findByRole('button', { name: 'Annuler' });
    fireEvent.click(cancelBtn);
    expect(updateRecord).not.toHaveBeenCalled();
  });

  test('cancel button does not show any toast', async () => {
    render(<WsbEditPage />);
    const cancelBtn = await screen.findByRole('button', { name: 'Annuler' });
    fireEvent.click(cancelBtn);
    expect(mockToast.success).not.toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
    expect(mockToast.warning).not.toHaveBeenCalled();
    expect(mockToast.info).not.toHaveBeenCalled();
  });

  test('cancel after modifying fields does not trigger PATCH', async () => {
    render(<WsbEditPage />);
    await screen.findByRole('button', { name: 'Annuler' });

    fireEvent.change(screen.getByLabelText('Date'), {
      target: { value: '2026-05-20' },
    });
    fireEvent.change(screen.getByLabelText("Heure d'arrivée"), {
      target: { value: '10:00' },
    });
    fireEvent.click(screen.getByRole('radio', { name: 'Thermique' }));

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(updateRecord).not.toHaveBeenCalled();
    expect(fetchTablePage).not.toHaveBeenCalled();
    expect(navigateTo).toHaveBeenCalledWith('reservations');
  });

  test('breadcrumb link is present and points to reservations page', async () => {
    render(<WsbEditPage />);
    const breadcrumb = await screen.findByRole('link', {
      name: '← Mes réservations',
    });
    expect(breadcrumb).toBeInTheDocument();
    expect(breadcrumb).toHaveAttribute(
      'href',
      'x_wsb_flexoffice_reservations.do',
    );
  });

  test('breadcrumb is inside a nav with aria-label', async () => {
    render(<WsbEditPage />);
    await screen.findByRole('button', { name: 'Annuler' });
    const breadcrumb = screen.getByRole('link', {
      name: '← Mes réservations',
    });
    const nav = breadcrumb.closest('nav');
    expect(nav).not.toBeNull();
    expect(nav).toHaveAttribute('aria-label');
  });

  test('breadcrumb is present in skeleton loading state', () => {
    render(<WsbEditPage />);
    const breadcrumb = screen.getByRole('link', {
      name: '← Mes réservations',
    });
    expect(breadcrumb).toBeInTheDocument();
  });
});
