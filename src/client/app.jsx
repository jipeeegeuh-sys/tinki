import { ToastProvider } from './lib/useToast.js';
import { WsbToastContainer } from './components/ui/WsbToastContainer.jsx';

export default function App() {
  return (
    <ToastProvider>
      <WsbToastContainer />
      <div className="wsb-app">
        <p style={{ color: 'var(--wsb-color-text-secondary)', padding: '2rem' }}>
          FlexDesk — Chargement…
        </p>
      </div>
    </ToastProvider>
  );
}
