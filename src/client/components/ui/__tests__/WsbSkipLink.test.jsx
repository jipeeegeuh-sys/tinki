import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbSkipLink } from '../WsbSkipLink';

describe('WsbSkipLink — rendu', () => {
  test('rend un lien avec le texte par défaut', () => {
    render(<WsbSkipLink />);
    const link = screen.getByText('Aller au contenu principal');
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('A');
  });

  test('rend un lien avec un label personnalisé', () => {
    render(<WsbSkipLink label="Passer au formulaire" />);
    expect(screen.getByText('Passer au formulaire')).toBeInTheDocument();
  });

  test('href pointe vers #main-content par défaut', () => {
    render(<WsbSkipLink />);
    expect(screen.getByText('Aller au contenu principal')).toHaveAttribute('href', '#main-content');
  });

  test('href pointe vers un targetId personnalisé', () => {
    render(<WsbSkipLink targetId="form-section" />);
    expect(screen.getByText('Aller au contenu principal')).toHaveAttribute('href', '#form-section');
  });

  test('porte la classe wsb-skip-link', () => {
    render(<WsbSkipLink />);
    expect(screen.getByText('Aller au contenu principal')).toHaveClass('wsb-skip-link');
  });
});

describe('WsbSkipLink — comportement au clic', () => {
  test('focus est déplacé sur l\'élément cible au clic', () => {
    const target = document.createElement('main');
    target.id = 'main-content';
    target.tabIndex = -1;
    document.body.appendChild(target);

    render(<WsbSkipLink />);
    fireEvent.click(screen.getByText('Aller au contenu principal'));

    expect(document.activeElement).toBe(target);
    document.body.removeChild(target);
  });

  test('ne plante pas si l\'élément cible n\'existe pas', () => {
    render(<WsbSkipLink targetId="nonexistent" />);
    expect(() => {
      fireEvent.click(screen.getByText('Aller au contenu principal'));
    }).not.toThrow();
  });
});
