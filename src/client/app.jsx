import { ToastProvider } from './lib/useToast.js';
import { WsbToastContainer } from './components/ui/WsbToastContainer.jsx';
import { WsbSkipLink } from './components/ui/WsbSkipLink.jsx';
import { LiveRegionProvider } from './components/ui/WsbLiveRegion.jsx';
import { WsbHeader } from './components/layout/WsbHeader.jsx';
import { WsbSearchPage } from './components/pages/WsbSearchPage.jsx';
import { Wsb404Page } from './components/pages/Wsb404Page.jsx';
import { PAGES } from './services/NavigationService.js';

const PAGE_CONFIG = {
  search: {
    breadcrumb: [
      { label: 'Accueil', href: 'x_wsb_flex_search.do' },
      { label: 'Rechercher une place' },
    ],
  },
  results: {
    breadcrumb: [
      { label: 'Accueil', href: 'x_wsb_flex_search.do' },
      { label: 'Résultats de recherche' },
    ],
  },
  reservations: {
    breadcrumb: [
      { label: 'Accueil', href: 'x_wsb_flex_search.do' },
      { label: 'Mes réservations' },
    ],
  },
  history: {
    breadcrumb: [
      { label: 'Accueil', href: 'x_wsb_flex_search.do' },
      { label: 'Historique' },
    ],
  },
  edit: {
    breadcrumb: [
      { label: 'Accueil', href: 'x_wsb_flex_search.do' },
      { label: 'Mes réservations', href: 'x_wsb_flex_reservations.do' },
      { label: 'Éditer' },
    ],
  },
};

export function resolveCurrentPage() {
  if (typeof window === 'undefined') return 'search';
  const path = window.location.pathname;
  for (const [key, name] of Object.entries(PAGES)) {
    if (path.includes(name)) return key;
  }
  if (path.includes('x_wsb_flex_')) return null;
  return 'search';
}

function PageContent({ page }) {
  switch (page) {
    case 'search': return <WsbSearchPage />;
    default: return null;
  }
}

export default function App() {
  const currentPage = resolveCurrentPage();
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
        <main id="main-content" className="wsb-main wsb-layout-content" tabIndex={-1}>
          {currentPage ? <PageContent page={currentPage} /> : <Wsb404Page />}
        </main>
      </LiveRegionProvider>
    </ToastProvider>
  );
}
