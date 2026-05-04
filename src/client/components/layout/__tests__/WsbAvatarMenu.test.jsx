import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbAvatarMenu } from '../WsbAvatarMenu';

function renderMenu(props = {}) {
  const defaultProps = { initials: 'JD', fullName: 'Jean Dupont', role: 'Collaborateur', ...props };
  return render(<WsbAvatarMenu {...defaultProps} />);
}

describe('WsbAvatarMenu — rendu', () => {
  test('affiche le bouton avatar avec les initiales', () => {
    renderMenu();
    expect(screen.getByLabelText(/Menu utilisateur/)).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  test('le dropdown est fermé par défaut', () => {
    renderMenu();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('aria-expanded est false par défaut', () => {
    renderMenu();
    expect(screen.getByLabelText(/Menu utilisateur/)).toHaveAttribute('aria-expanded', 'false');
  });

  test('aria-haspopup est true', () => {
    renderMenu();
    expect(screen.getByLabelText(/Menu utilisateur/)).toHaveAttribute('aria-haspopup', 'true');
  });
});

describe('WsbAvatarMenu — ouverture/fermeture', () => {
  test('ouvre le dropdown au clic', () => {
    renderMenu();
    fireEvent.click(screen.getByLabelText(/Menu utilisateur/));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  test('aria-expanded passe à true quand ouvert', () => {
    renderMenu();
    const btn = screen.getByLabelText(/Menu utilisateur/);
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  test('affiche le nom complet et le rôle dans le dropdown', () => {
    renderMenu();
    fireEvent.click(screen.getByLabelText(/Menu utilisateur/));
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('Collaborateur')).toBeInTheDocument();
  });

  test('affiche les items du menu', () => {
    renderMenu();
    fireEvent.click(screen.getByLabelText(/Menu utilisateur/));
    expect(screen.getByText('Préférences utilisateur')).toBeInTheDocument();
    expect(screen.getByText('Impersonate user')).toBeInTheDocument();
    expect(screen.getByText('Se déconnecter')).toBeInTheDocument();
  });

  test('ferme le dropdown sur Escape', () => {
    renderMenu();
    fireEvent.click(screen.getByLabelText(/Menu utilisateur/));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('aria-expanded repasse à false après fermeture par Escape', () => {
    renderMenu();
    const btn = screen.getByLabelText(/Menu utilisateur/);
    fireEvent.click(btn);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('ferme le dropdown au clic extérieur', () => {
    renderMenu();
    fireEvent.click(screen.getByLabelText(/Menu utilisateur/));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  test('toggle le dropdown au double clic sur le bouton', () => {
    renderMenu();
    const btn = screen.getByLabelText(/Menu utilisateur/);
    fireEvent.click(btn);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});

describe('WsbAvatarMenu — Se déconnecter', () => {
  test('le lien Se déconnecter pointe vers /logout.do', () => {
    renderMenu();
    fireEvent.click(screen.getByLabelText(/Menu utilisateur/));
    const logoutLink = screen.getByText('Se déconnecter');
    expect(logoutLink).toHaveAttribute('href', '/logout.do');
  });

  test('le lien Se déconnecter porte la classe danger', () => {
    renderMenu();
    fireEvent.click(screen.getByLabelText(/Menu utilisateur/));
    const logoutLink = screen.getByText('Se déconnecter');
    expect(logoutLink).toHaveClass('wsb-avatar-menu__item--danger');
  });
});

describe('WsbAvatarMenu — items portent role="menuitem"', () => {
  test('chaque item est un menuitem', () => {
    renderMenu();
    fireEvent.click(screen.getByLabelText(/Menu utilisateur/));
    const items = screen.getAllByRole('menuitem');
    expect(items.length).toBe(3);
  });
});
