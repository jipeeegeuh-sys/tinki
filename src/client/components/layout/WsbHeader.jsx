import { WsbAvatarMenu } from './WsbAvatarMenu.jsx';
import { buildPageUrl } from '../../services/NavigationService.js';
import './WsbHeader.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5.2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M1.5 6h13" stroke="currentColor" strokeWidth="1.4" />
    <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M8 4.5V8l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M6 6.2a2 2 0 0 1 3.9.6c0 1.2-1.9 1.2-1.9 2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="8" cy="11.5" r="0.7" fill="currentColor" />
  </svg>
);

const NAV_ITEMS = [
  { key: 'search', label: 'Rechercher une place', icon: SearchIcon, page: 'search' },
  { key: 'reservations', label: 'Mes réservations', icon: CalendarIcon, page: 'reservations' },
  { key: 'history', label: 'Historique', icon: ClockIcon, page: 'history' },
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
            {NAV_ITEMS.map(({ key, label, icon: Icon, page }) => {
              const active = activePage === key;
              return (
                <li key={key}>
                  <a
                    href={buildPageUrl(page)}
                    className={`wsb-sidebar__link${active ? ' wsb-sidebar__link--active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {Icon && <span className="wsb-sidebar__link-icon"><Icon /></span>}
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="wsb-sidebar__section-label">RESSOURCES</div>
          <ul className="wsb-sidebar__nav" role="list">
            <li>
              <a href="/$knowledge.do" className="wsb-sidebar__link">
                <span className="wsb-sidebar__link-icon"><HelpIcon /></span>
                Aide
              </a>
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
