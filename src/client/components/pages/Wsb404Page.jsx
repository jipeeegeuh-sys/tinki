import { WsbButton } from '../ui/WsbButton.jsx';
import { getSearchUrl } from '../../services/NavigationService.js';
import './Wsb404Page.css';

export function Wsb404Page() {
  const handleReturn = () => {
    window.location.href = getSearchUrl();
  };

  return (
    <div className="wsb-404" role="alert">
      <div className="wsb-404__icon" aria-hidden="true">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M24 24L40 40M40 24L24 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <h1 className="wsb-404__title" tabIndex={-1}>Page introuvable</h1>
      <p className="wsb-404__desc">
        L'adresse demandée ne correspond à aucune page de l'application FlexDesk.
      </p>
      <WsbButton variant="primary" size="md" onClick={handleReturn}>
        Retour au formulaire de recherche
      </WsbButton>
    </div>
  );
}
