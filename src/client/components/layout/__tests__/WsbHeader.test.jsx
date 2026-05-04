import { jest } from '@jest/globals';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbHeader } from '../WsbHeader';

const defaultProps = {
  activePage: 'search',
  breadcrumb: [
    { label: 'Accueil', href: '/search.do' },
    { label: 'Rechercher une place' },
  ],
  user: { initials: 'JD', fullName: 'Jean Dupont', role: 'Collaborateur' },
};

function renderHeader(props = {}) {
  return render(<WsbHeader {...defaultProps} {...props} />);
}

describe('WsbHeader — top bar', () => {
  test('rend le banner avec role="banner"', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  test('affiche le logo FlexDesk dans le top bar', () => {
    renderHeader();
    expect(screen.getByLabelText('Accueil FlexDesk')).toBeInTheDocument();
  });

  test('affiche le fil d\'Ariane', () => {
    renderHeader();
    const breadcrumb = screen.getByLabelText("Fil d'Ariane");
    expect(breadcrumb).toBeInTheDocument();
    expect(within(breadcrumb).getByText('Accueil')).toBeInTheDocument();
    expect(within(breadcrumb).getByText('Rechercher une place')).toBeInTheDocument();
  });

  test('la page courante porte aria-current="page"', () => {
    renderHeader();
    const breadcrumb = screen.getByLabelText("Fil d'Ariane");
    expect(within(breadcrumb).getByText('Rechercher une place')).toHaveAttribute('aria-current', 'page');
  });

  test('le bouton recherche rapide est présent', () => {
    renderHeader();
    expect(screen.getByLabelText('Recherche rapide')).toBeInTheDocument();
  });

  test('n\'affiche pas le breadcrumb si vide', () => {
    renderHeader({ breadcrumb: [] });
    expect(screen.queryByLabelText("Fil d'Ariane")).not.toBeInTheDocument();
  });
});

describe('WsbHeader — sidebar navigation', () => {
  test('rend la nav principale', () => {
    renderHeader();
    expect(screen.getByLabelText('Navigation principale')).toBeInTheDocument();
  });

  test('affiche les trois liens de navigation', () => {
    renderHeader();
    const sidebar = screen.getByLabelText('Navigation principale');
    expect(within(sidebar).getByText('Rechercher une place')).toBeInTheDocument();
    expect(within(sidebar).getByText('Mes réservations')).toBeInTheDocument();
    expect(within(sidebar).getByText('Historique')).toBeInTheDocument();
  });

  test('le lien actif porte aria-current="page"', () => {
    renderHeader({ activePage: 'reservations' });
    const links = screen.getAllByText('Mes réservations');
    const sidebarLink = links.find(el => el.classList.contains('wsb-sidebar__link--active'));
    expect(sidebarLink).toBeTruthy();
    expect(sidebarLink).toHaveAttribute('aria-current', 'page');
  });

  test('les liens inactifs ne portent pas aria-current', () => {
    renderHeader({ activePage: 'search' });
    const historyLink = screen.getByText('Historique');
    expect(historyLink).not.toHaveAttribute('aria-current');
  });

  test('affiche le lien Aide dans les raccourcis', () => {
    renderHeader();
    expect(screen.getByText('Aide')).toBeInTheDocument();
  });
});

describe('WsbHeader — sidebar user block', () => {
  test('affiche les initiales utilisateur dans la sidebar', () => {
    renderHeader();
    const avatars = screen.getAllByText('JD');
    expect(avatars.length).toBeGreaterThanOrEqual(1);
  });

  test('affiche le nom complet dans la sidebar', () => {
    renderHeader();
    const names = screen.getAllByText('Jean Dupont');
    expect(names.length).toBeGreaterThanOrEqual(1);
  });

  test('affiche le rôle dans la sidebar', () => {
    renderHeader();
    const roles = screen.getAllByText('Collaborateur');
    expect(roles.length).toBeGreaterThanOrEqual(1);
  });
});

describe('WsbHeader — section labels', () => {
  test('affiche NAVIGATION et RACCOURCIS', () => {
    renderHeader();
    expect(screen.getByText('NAVIGATION')).toBeInTheDocument();
    expect(screen.getByText('RACCOURCIS')).toBeInTheDocument();
  });
});

describe('WsbHeader — avatar menu intégré', () => {
  test('affiche le bouton avatar dans le top bar', () => {
    renderHeader();
    expect(screen.getByLabelText(/Menu utilisateur/)).toBeInTheDocument();
  });
});
