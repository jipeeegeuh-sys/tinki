import { ToastProvider } from './lib/useToast.js';
import { WsbToastContainer } from './components/ui/WsbToastContainer.jsx';
import { WsbSkipLink } from './components/ui/WsbSkipLink.jsx';
import { LiveRegionProvider } from './components/ui/WsbLiveRegion.jsx';

export default function App() {
  return (
    <ToastProvider>
      <LiveRegionProvider>
        <WsbSkipLink />
        <WsbToastContainer />
        <main id="main-content" className="wsb-main" tabIndex={-1}>
          <div className="wsb-app">
            <p style={{ color: 'var(--wsb-color-text-secondary)', padding: '2rem' }}>
              FlexDesk — Chargement…
            </p>
          </div>
        </main>
      </LiveRegionProvider>
    </ToastProvider>
  );
}
