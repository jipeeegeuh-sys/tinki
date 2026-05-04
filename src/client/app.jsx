import { ToastProvider } from './lib/useToast.js';
import { WsbToastContainer } from './components/ui/WsbToastContainer.jsx';
import { WsbSkipLink } from './components/ui/WsbSkipLink.jsx';
import { LiveRegionProvider } from './components/ui/WsbLiveRegion.jsx';
import { WsbHeader } from './components/layout/WsbHeader.jsx';
import { WsbSearchPage } from './components/pages/WsbSearchPage.jsx';

export default function App() {
  return (
    <ToastProvider>
      <LiveRegionProvider>
        <WsbSkipLink />
        <WsbToastContainer />
        <WsbHeader
          activePage="search"
          breadcrumb={[
            { label: 'Accueil', href: 'x_wsb_flex_search.do' },
            { label: 'Rechercher une place' },
          ]}
          user={{ initials: 'JD', fullName: 'Jean Dupont', role: 'Collaborateur' }}
        />
        <main id="main-content" className="wsb-main wsb-layout-content" tabIndex={-1}>
          <WsbSearchPage />
        </main>
      </LiveRegionProvider>
    </ToastProvider>
  );
}
