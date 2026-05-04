import { useState, useEffect, useCallback } from 'react';
import { WsbGridSkeleton, WsbEmptyState } from '../ui/WsbSkeleton.jsx';
import { WsbBookingCard } from '../ui/WsbBookingCard.jsx';
import {
  guardResultsPage,
  buildPageUrl,
} from '../../services/NavigationService.js';
import { getAvailableSpaces } from '../../services/ApiService.js';
import './WsbResultsPage.css';

const TYPE_LABELS = {
  'bureau': 'Bureau',
  'openspace-classique': 'Open Space',
  'openspace-specialise': 'Openspace spé.',
  'phonebox': 'Phonebox',
  'meetingroom': 'Meeting Room',
  'parking-electrique': 'Parking Él.',
  'parking-thermique': 'Parking',
};

const FLOOR_LABELS = {
  '2': 'Niveau 2',
  '3': 'Niveau 3',
  '4': 'Niveau 4',
  '5': 'Niveau 5',
};

function formatDateDisplay(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function countByType(spaces) {
  const counts = {};
  for (const s of spaces) {
    const label = TYPE_LABELS[s.type] || s.type;
    counts[label] = (counts[label] || 0) + 1;
  }
  return Object.entries(counts);
}

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d="M10.5 1.5L12.5 3.5L4.5 11.5L1 13L2.5 9.5L10.5 1.5Z"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export function WsbResultsPage() {
  const [guard] = useState(guardResultsPage);
  const [spaces, setSpaces] = useState([]);
  const [status, setStatus] = useState('loading');

  const fetchSpaces = useCallback(async () => {
    if (!guard.valid) return;
    setStatus('loading');
    try {
      const result = await getAvailableSpaces(guard.params);
      setSpaces(Array.isArray(result) ? result : []);
      setStatus('success');
    } catch (err) {
      if (err.status === 'timeout') {
        console.error('[WSB] Timeout API disponibilité');
      }
      setStatus('error');
    }
  }, [guard]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  if (!guard.valid) return null;

  const { building, floor, date, type } = guard.params;
  const searchParams = new URLSearchParams(guard.params).toString();
  const searchUrl = buildPageUrl('search', guard.params);
  const availableCount = spaces.filter((s) => s.status === 'available').length;
  const typeCounts = countByType(spaces);

  return (
    <div className="wsb-results-page">
      <div className="wsb-results-page__header">
        <div className="wsb-results-page__header-row">
          <div>
            <span className="wsb-results-page__badge">RÉSULTATS</span>
            <h1 className="wsb-results-page__title">
              {status === 'success'
                ? `${availableCount} place${availableCount !== 1 ? 's' : ''} disponible${availableCount !== 1 ? 's' : ''}`
                : 'Recherche en cours…'}
            </h1>
          </div>
          <a href={searchUrl} className="wsb-results-page__new-search">
            <SearchIcon /> Nouvelle recherche
          </a>
        </div>

        {status === 'success' && typeCounts.length > 0 && (
          <div className="wsb-results-page__type-pills" aria-label="Répartition par type">
            {typeCounts.map(([label, count]) => (
              <span key={label} className="wsb-results-page__type-pill">
                <span className="wsb-results-page__type-dot" />
                {label} <strong>{count}</strong>
              </span>
            ))}
          </div>
        )}

        <div className="wsb-results-page__criteria-bar">
          <div className="wsb-results-page__criteria-pills">
            <span className="wsb-results-page__criteria-label">Critères</span>
            <span className="wsb-results-page__criteria-pill">
              {formatDateDisplay(date)}
            </span>
            <span className="wsb-results-page__criteria-pill">
              Bâtiment {building}
            </span>
            <span className="wsb-results-page__criteria-pill">
              {FLOOR_LABELS[floor] || `Étage ${floor}`}
            </span>
            <span className="wsb-results-page__criteria-pill">
              {TYPE_LABELS[type] || type}
            </span>
          </div>
          <a href={searchUrl} className="wsb-results-page__modify-btn">
            <EditIcon /> Modifier la recherche
          </a>
        </div>
      </div>

      <section className="wsb-results-page__content" aria-live="polite">
        {status === 'loading' && <WsbGridSkeleton count={6} />}

        {status === 'error' && (
          <WsbEmptyState variant="server-error" onRetry={fetchSpaces} searchUrl={searchUrl} />
        )}

        {status === 'success' && spaces.length === 0 && (
          <WsbEmptyState variant="zero-results" searchUrl={searchUrl} />
        )}

        {status === 'success' && spaces.length > 0 && (
          <div id="wsb-results-grid" className="wsb-results-page__grid" role="list">
            {spaces.map((space) => (
              <div key={space.sys_id} role="listitem">
                <WsbBookingCard
                  spaceId={space.name}
                  sysId={space.sys_id}
                  floor={space.floor_label || space.floor}
                  type={space.type}
                  status={space.status}
                  searchParams={searchParams}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
