import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Wsb404Page } from '../Wsb404Page.jsx';

describe('Wsb404Page', () => {
  let hrefSetter;

  beforeEach(() => {
    hrefSetter = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => '',
    });
  });

  test('affiche le message "Page introuvable"', () => {
    render(<Wsb404Page />);
    expect(screen.getByText('Page introuvable')).toBeInTheDocument();
  });

  test('affiche le CTA "Retour au formulaire de recherche"', () => {
    render(<Wsb404Page />);
    expect(
      screen.getByRole('button', { name: /Retour au formulaire de recherche/ })
    ).toBeInTheDocument();
  });

  test('le CTA redirige vers le SPA endpoint (search)', () => {
    render(<Wsb404Page />);
    fireEvent.click(
      screen.getByRole('button', { name: /Retour au formulaire de recherche/ })
    );
    expect(hrefSetter).toHaveBeenCalledWith('x_wsb_flex_main.do');
  });

  test('porte role="alert" pour l\'accessibilité', () => {
    render(<Wsb404Page />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('le titre h1 est focalisable avec tabIndex={-1}', () => {
    render(<Wsb404Page />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveAttribute('tabindex', '-1');
  });
});
