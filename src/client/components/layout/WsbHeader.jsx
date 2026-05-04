import { WsbAvatarMenu } from './WsbAvatarMenu.jsx';
import { buildPageUrl } from '../../services/NavigationService.js';
import './WsbHeader.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const NAV_ITEMS = [
  { key: 'search', label: 'Rechercher une place', icon: SearchIcon, page: 'search' },
  { key: 'reservations', label: 'Mes réservations', icon: null, page: 'reservations' },
  { key: 'history', label: 'Historique', icon: null, page: 'history' },
];

const FlexDeskLogo = () => (
  <div className="wsb-header__logo">
    <span className="wsb-header__logo-icon">F</span>
    <div className="wsb-header__logo-text">
      <span className="wsb-header__logo-title">FlexDesk</span>
      <span className="wsb-header__logo-sub">FLEX OFFICE &amp; PARKING</span>
    </div>
  </div>
);

export function WsbHeader({
  activePage = 'search',
  breadcrumb = [],
  user = {},
}) {
  const { initials = 'JD', fullName = 'Jean Dupont', role = 'Collaborateur' } = user;

  return (
    <>
      <header className="wsb-topbar" role="banner">
        <div className="wsb-topbar__left">
          <a href={buildPageUrl('search')} className="wsb-topbar__brand" aria-label="Accueil FlexDesk">
            <span className="wsb-topbar__brand-icon">F</span>
            <span className="wsb-topbar__brand-name">FlexDesk</span>
          </a>
          {breadcrumb.length > 0 && (
            <nav className="wsb-topbar__breadcrumb" aria-label="Fil d'Ariane">
              {breadcrumb.map((item, idx) => (
                <span key={idx}>
                  {idx > 0 && <span className="wsb-topbar__breadcrumb-sep" aria-hidden="true">/</span>}
                  {item.href ? (
                    <a href={item.href} className="wsb-topbar__breadcrumb-link">{item.label}</a>
                  ) : (
                    <span className="wsb-topbar__breadcrumb-current" aria-current="page">{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
        <div className="wsb-topbar__right">
          <button type="button" className="wsb-topbar__search-btn" aria-label="Recherche rapide">
            <SearchIcon />
            <span className="wsb-topbar__search-label">Recherche rapide</span>
          </button>
          <WsbAvatarMenu initials={initials} fullName={fullName} role={role} />
        </div>
      </header>

      <nav className="wsb-sidebar" aria-label="Navigation principale">
        <div className="wsb-sidebar__top">
          <FlexDeskLogo />
          <div className="wsb-sidebar__section-label">NAVIGATION</div>
          <ul className="wsb-sidebar__nav" role="list">
            {NAV_ITEMS.map(({ key, label, page }) => {
              const active = activePage === key;
              return (
                <li key={key}>
                  <a
                    href={buildPageUrl(page)}
                    className={`wsb-sidebar__link${active ? ' wsb-sidebar__link--active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="wsb-sidebar__section-label">RACCOURCIS</div>
          <ul className="wsb-sidebar__nav" role="list">
            <li>
              <a href="/kb" className="wsb-sidebar__link">Aide</a>
            </li>
          </ul>
        </div>

        <div className="wsb-sidebar__bottom">
          <div className="wsb-sidebar__user">
            <span className="wsb-sidebar__user-avatar">{initials}</span>
            <div>
              <div className="wsb-sidebar__user-name">{fullName}</div>
              <div className="wsb-sidebar__user-role">{role}</div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
