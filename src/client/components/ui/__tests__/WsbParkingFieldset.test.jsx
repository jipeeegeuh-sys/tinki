import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbParkingFieldset } from '../WsbParkingFieldset';

function renderFieldset(overrides = {}) {
  const defaults = {
    needsCar: false,
    onNeedsCarChange: jest.fn(),
    parkingType: '',
    onParkingTypeChange: jest.fn(),
  };
  const props = { ...defaults, ...overrides };
  render(<WsbParkingFieldset {...props} />);
  return props;
}

describe('WsbParkingFieldset', () => {
  test('renders toggle switch with label', () => {
    renderFieldset();
    expect(screen.getByText(/Venez-vous en voiture/)).toBeInTheDocument();
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('radio section is hidden via aria-hidden when toggle off', () => {
    renderFieldset({ needsCar: false });
    const wrapper = screen.getByText('Type de parking souhaité')
      .closest('fieldset')
      .parentElement;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(wrapper).not.toHaveClass('wsb-parking__radios-wrapper--open');
  });

  test('radio section is visible when toggle on', () => {
    renderFieldset({ needsCar: true });
    const wrapper = screen.getByText('Type de parking souhaité')
      .closest('fieldset')
      .parentElement;
    expect(wrapper).toHaveAttribute('aria-hidden', 'false');
    expect(wrapper).toHaveClass('wsb-parking__radios-wrapper--open');
  });

  test('renders fieldset with legend and labeled radios when needsCar', () => {
    renderFieldset({ needsCar: true });
    expect(screen.getByText('Type de parking souhaité')).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(screen.getByLabelText('Thermique')).toBeInTheDocument();
    expect(screen.getByLabelText('Électrique ⚡')).toBeInTheDocument();
  });

  test('radios are inside a fieldset element', () => {
    renderFieldset({ needsCar: true });
    const legend = screen.getByText('Type de parking souhaité');
    expect(legend.tagName).toBe('LEGEND');
    expect(legend.closest('fieldset')).toBeInTheDocument();
  });

  test('no radio is pre-selected by default', () => {
    renderFieldset({ needsCar: true });
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).not.toBeChecked());
  });

  test('calls onNeedsCarChange when toggle clicked', () => {
    const { onNeedsCarChange } = renderFieldset({ needsCar: false });
    fireEvent.click(screen.getByRole('switch'));
    expect(onNeedsCarChange).toHaveBeenCalledWith(true);
  });

  test('calls onParkingTypeChange with "electric" when radio selected', () => {
    const { onParkingTypeChange } = renderFieldset({ needsCar: true });
    fireEvent.click(screen.getByLabelText('Électrique ⚡'));
    expect(onParkingTypeChange).toHaveBeenCalledWith('electric');
  });

  test('calls onParkingTypeChange with "thermique" when radio selected', () => {
    const { onParkingTypeChange } = renderFieldset({ needsCar: true });
    fireEvent.click(screen.getByLabelText('Thermique'));
    expect(onParkingTypeChange).toHaveBeenCalledWith('thermique');
  });

  test('shows info message when electric is selected', () => {
    renderFieldset({ needsCar: true, parkingType: 'electric' });
    expect(
      screen.getByText('8 places électriques disponibles dans le parc')
    ).toBeInTheDocument();
  });

  test('hides info message when thermique is selected', () => {
    renderFieldset({ needsCar: true, parkingType: 'thermique' });
    expect(
      screen.queryByText('8 places électriques disponibles dans le parc')
    ).not.toBeInTheDocument();
  });

  test('hides info message when no type is selected', () => {
    renderFieldset({ needsCar: true, parkingType: '' });
    expect(
      screen.queryByText('8 places électriques disponibles dans le parc')
    ).not.toBeInTheDocument();
  });

  test('each radio has a for/id association', () => {
    renderFieldset({ needsCar: true, parkingType: 'thermique' });
    const radio = screen.getByLabelText('Thermique');
    expect(radio).toBeChecked();
    expect(radio.id).toBeTruthy();
  });

  test('radios have tabIndex -1 when toggle is off', () => {
    renderFieldset({ needsCar: false });
    const radios = screen.getAllByRole('radio', { hidden: true });
    radios.forEach((r) => expect(r).toHaveAttribute('tabindex', '-1'));
  });

  test('radios have tabIndex 0 when toggle is on', () => {
    renderFieldset({ needsCar: true });
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).toHaveAttribute('tabindex', '0'));
  });
});
