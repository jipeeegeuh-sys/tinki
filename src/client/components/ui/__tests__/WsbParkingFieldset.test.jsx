import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbParkingFieldset } from '../WsbParkingFieldset';

describe('WsbParkingFieldset', () => {
  test('renders toggle switch with label', () => {
    render(
      <WsbParkingFieldset
        needsCar={false}
        onNeedsCarChange={() => {}}
        parkingType=""
        onParkingTypeChange={() => {}}
      />
    );
    expect(screen.getByText('Venez-vous en voiture ?')).toBeInTheDocument();
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });

  test('does not render radios when needsCar is false', () => {
    render(
      <WsbParkingFieldset
        needsCar={false}
        onNeedsCarChange={() => {}}
        parkingType=""
        onParkingTypeChange={() => {}}
      />
    );
    expect(screen.queryByText('Type de parking souhaité')).not.toBeInTheDocument();
  });

  test('renders fieldset with legend and labeled radios when needsCar', () => {
    render(
      <WsbParkingFieldset
        needsCar={true}
        onNeedsCarChange={() => {}}
        parkingType=""
        onParkingTypeChange={() => {}}
      />
    );
    expect(screen.getByText('Type de parking souhaité')).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(screen.getByLabelText('Place thermique')).toBeInTheDocument();
    expect(screen.getByLabelText('Place électrique')).toBeInTheDocument();
  });

  test('radios are inside a fieldset element', () => {
    render(
      <WsbParkingFieldset
        needsCar={true}
        onNeedsCarChange={() => {}}
        parkingType=""
        onParkingTypeChange={() => {}}
      />
    );
    const legend = screen.getByText('Type de parking souhaité');
    expect(legend.tagName).toBe('LEGEND');
    expect(legend.closest('fieldset')).toBeInTheDocument();
  });

  test('calls onNeedsCarChange when toggle clicked', () => {
    const handler = jest.fn();
    render(
      <WsbParkingFieldset
        needsCar={false}
        onNeedsCarChange={handler}
        parkingType=""
        onParkingTypeChange={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('switch'));
    expect(handler).toHaveBeenCalledWith(true);
  });

  test('calls onParkingTypeChange when radio selected', () => {
    const handler = jest.fn();
    render(
      <WsbParkingFieldset
        needsCar={true}
        onNeedsCarChange={() => {}}
        parkingType=""
        onParkingTypeChange={handler}
      />
    );
    fireEvent.click(screen.getByLabelText('Place électrique'));
    expect(handler).toHaveBeenCalledWith('electrique');
  });

  test('each radio has a for/id association', () => {
    render(
      <WsbParkingFieldset
        needsCar={true}
        onNeedsCarChange={() => {}}
        parkingType="thermique"
        onParkingTypeChange={() => {}}
      />
    );
    const radio = screen.getByLabelText('Place thermique');
    expect(radio).toBeChecked();
    expect(radio.id).toBeTruthy();
  });
});
