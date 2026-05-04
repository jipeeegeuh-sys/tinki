import { useState, useEffect, useRef } from 'react';
import { ToastProvider } from './lib/useToast.js';
import { WsbToastContainer } from './components/ui/WsbToastContainer.jsx';
import { WsbSkipLink } from './components/ui/WsbSkipLink.jsx';
import { LiveRegionProvider } from './components/ui/WsbLiveRegion.jsx';
import { WsbHeader } from './components/layout/WsbHeader.jsx';
import { WsbSearchPage } from './components/pages/WsbSearchPage.jsx';
import { WsbResultsPage } from './components/pages/WsbResultsPage.jsx';
import { WsbHistoryPage } from './components/pages/WsbHistoryPage.jsx';
import { WsbEditPage } from './components/pages/WsbEditPage.jsx';
import { WsbReservationsPage } from './components/pages/WsbReservationsPage.jsx';
import { Wsb404Page } from './components/pages/Wsb404Page.jsx';
import {
  resolveRoute,
  parseQueryString,
  buildPageUrl,
} from './services/NavigationService.js';

const SESSION_CHECK_URL =
  '/api/now/table/sys_user?sysparm_limit=1&sysparm_fields=sys_id';

const PAGE_CONFIG = {
  search: {
    breadcrumb: [
      { label: 'Accueil', href: buildPageUrl('search') },
      { label: 'Rechercher une place' },
    ],
  },
  results: {
    breadcrumb: [
      { label: 'Accueil', href: buildPageUrl('search') },
      { label: 'Résultats de recherche' },
    ],
  },
  reservations: {
    breadcrumb: [
      { label: 'Accueil', href: buildPageUrl('search') },
      { label: 'Mes réservations' },
    ],
  },
  history: {
    breadcrumb: [
      { label: 'Accueil', href: buildPageUrl('search') },
      { label: 'Historique' },
    ],
  },
  edit: {
    breadcrumb: [
      { label: 'Accueil', href: buildPageUrl('search') },
      { label: 'Mes réservations', href: buildPageUrl('reservations') },
      { label: 'Éditer' },
    ],
  },
};

export function resolveCurrentPage() {
  if (typeof window === 'undefined') return 'search';
  const params = parseQueryString(window.location.search);
  return resolveRoute(params.route);
}

function PageContent({ page }) {
  switch (page) {
    case 'search':       return <WsbSearchPage />;
    case 'results':      return <WsbResultsPage />;
    case 'reservations': return <WsbReservationsPage />;
    case 'history':      return <WsbHistoryPage />;
    case 'edit':         return <WsbEditPage />;
    default:             return null;
  }
}

function SplashLoader() {
  return (
    <div className="wsb-splash" aria-busy="true" aria-label="Chargement de l'application">
      <div className="wsb-splash__spinner" aria-hidden="true" />
    </div>
  );
}

function SessionExpiredBanner() {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="wsb-session-banner"
    >
      <span className="wsb-session-banner__icon" aria-hidden="true">⚠</span>
      Votre session a expiré. Redirection en cours…
    </div>
  );
}

export default function App() {
  const [authStatus, setAuthStatus] = useState('loading');
  const [currentPage, setCurrentPage] = useState(() => resolveCurrentPage());
  const mainRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const headers = { Accept: 'application/json' };
        if (typeof window !== 'undefined' && window.g_ck) {
          headers['X-UserToken'] = window.g_ck;
        }

        const res = await fetch(SESSION_CHECK_URL, { headers });
        if (cancelled) return;

        if (res.status === 401) {
          setAuthStatus('expired');
          const redirect = encodeURIComponent(window.location.href);
          setTimeout(() => {
            window.location.href = `/login.do?redirect=${redirect}`;
          }, 3000);
        } else {
          setAuthStatus('ok');
        }
      } catch {
        if (!cancelled) setAuthStatus('ok');
      }
    }

    checkSession();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (authStatus !== 'ok') return;
    const timer = setTimeout(() => {
      const heading = mainRef.current?.querySelector('h1[tabindex="-1"]');
      if (heading) {
        heading.focus();
      } else {
        mainRef.current?.focus();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPage, authStatus]);

  useEffect(() => {
    const handlePop = () => setCurrentPage(resolveCurrentPage());
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  if (authStatus === 'loading') return <SplashLoader />;
  if (authStatus === 'expired') return <SessionExpiredBanner />;

  const config = currentPage ? PAGE_CONFIG[currentPage] : null;

  return (
    <ToastProvider>
      <LiveRegionProvider>
        <WsbSkipLink />
        <WsbToastContainer />
        <WsbHeader
          activePage={currentPage || 'search'}
          breadcrumb={config?.breadcrumb || []}
          user={{ initials: 'JD', fullName: 'Jean Dupont', role: 'Collaborateur' }}
        />
        <main
          ref={mainRef}
          id="main-content"
          className="wsb-main wsb-layout-content"
          tabIndex={-1}
        >
          {currentPage ? <PageContent page={currentPage} /> : <Wsb404Page />}
        </main>
      </LiveRegionProvider>
    </ToastProvider>
  );
}
