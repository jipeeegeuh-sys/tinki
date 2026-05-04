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

  test('affiche le message "Page introuvable."', () => {
    render(<Wsb404Page />);
    expect(screen.getByText('Page introuvable.')).toBeInTheDocument();
  });

  test('affiche le CTA "Retour à l\'accueil"', () => {
    render(<Wsb404Page />);
    expect(screen.getByRole('button', { name: /Retour à l'accueil/ })).toBeInTheDocument();
  });

  test('le CTA redirige vers la page search', () => {
    render(<Wsb404Page />);
    fireEvent.click(screen.getByRole('button', { name: /Retour à l'accueil/ }));
    expect(hrefSetter).toHaveBeenCalledWith('x_wsb_flexoffice_search.do');
  });

  test('porte role="alert" pour l\'accessibilité', () => {
    render(<Wsb404Page />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
