import { jest } from '@jest/globals';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LiveRegionProvider, useLiveRegion } from '../WsbLiveRegion';

let captured;

function TestHarness() {
  const ctx = useLiveRegion();
  captured = ctx;
  return null;
}

function renderWithProvider() {
  return render(
    <LiveRegionProvider>
      <TestHarness />
    </LiveRegionProvider>,
  );
}

describe('LiveRegionProvider — rendu', () => {
  test('rend les deux régions ARIA (polite + assertive)', () => {
    renderWithProvider();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('la zone polite porte aria-live="polite"', () => {
    renderWithProvider();
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  test('la zone assertive porte aria-live="assertive"', () => {
    renderWithProvider();
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });

  test('les deux zones portent aria-atomic="true"', () => {
    renderWithProvider();
    expect(screen.getByRole('status')).toHaveAttribute('aria-atomic', 'true');
    expect(screen.getByRole('alert')).toHaveAttribute('aria-atomic', 'true');
  });

  test('les deux zones sont visuellement masquées (sr-only)', () => {
    renderWithProvider();
    expect(screen.getByRole('status')).toHaveClass('wsb-sr-only');
    expect(screen.getByRole('alert')).toHaveClass('wsb-sr-only');
  });
});

describe('LiveRegionProvider — annonces', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('announcePolite met à jour la zone polite', () => {
    renderWithProvider();

    act(() => {
      captured.announcePolite('6 espaces disponibles chargés.');
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByRole('status')).toHaveTextContent('6 espaces disponibles chargés.');
  });

  test('announceAssertive met à jour la zone assertive', () => {
    renderWithProvider();

    act(() => {
      captured.announceAssertive('Session expirée.');
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Session expirée.');
  });

  test('les annonces successives remplacent les précédentes', () => {
    renderWithProvider();

    act(() => {
      captured.announcePolite('Premier message');
      jest.advanceTimersByTime(100);
    });

    act(() => {
      captured.announcePolite('Deuxième message');
      jest.advanceTimersByTime(100);
    });

    expect(screen.getByRole('status')).toHaveTextContent('Deuxième message');
  });
});

describe('useLiveRegion — hors contexte', () => {
  test('lance une erreur si utilisé sans LiveRegionProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestHarness />);
    }).toThrow("useLiveRegion doit être utilisé à l'intérieur de <LiveRegionProvider>");

    spy.mockRestore();
  });
});
