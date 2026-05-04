import { useState } from 'react';
import { WsbSelect } from '../ui/WsbSelect.jsx';
import {
  getNextBusinessDay,
  formatDateISO,
  isWeekend,
  getTomorrowISO,
} from '../../lib/dateUtils.js';
import './WsbSearchPage.css';

const BUILDING_OPTIONS = [
  { value: 'A', label: 'Bâtiment A' },
  { value: 'B', label: 'Bâtiment B' },
];

const FLOOR_OPTIONS = [
  { value: '2', label: 'Niv. 2' },
  { value: '3', label: 'Niv. 3' },
  { value: '4', label: 'Niv. 4' },
  { value: '5', label: 'Niv. 5' },
];

const SPACE_TYPE_OPTIONS = [
  { value: 'openspace', label: 'Openspace classique' },
  { value: 'openspace-spe', label: 'Openspace spécialisé (RH, Compta…)' },
  { value: 'phonebox', label: 'Phone Box' },
  { value: 'meeting', label: 'Meeting Room' },
];

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1" y="2.5" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.3" />
    <path d="M4.5 1v3M9.5 1v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const SpaceIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="8" y="1.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="1.5" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="8" y="8" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

const LocationIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M7 1C4.5 1 2.5 3 2.5 5.5C2.5 8.5 7 13 7 13s4.5-4.5 4.5-7.5C11.5 3 9.5 1 7 1z" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="7" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

export function WsbSearchPage() {
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [date, setDate] = useState(() => formatDateISO(getNextBusinessDay()));
  const [spaceType, setSpaceType] = useState('');

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val || isWeekend(val)) return;
    setDate(val);
  };

  return (
    <div className="wsb-search-page">
      <div className="wsb-search-page__header">
        <span className="wsb-search-page__badge">RÉSERVATION</span>
        <h1 className="wsb-search-page__title">Rechercher un espace de travail</h1>
        <p className="wsb-search-page__subtitle">
          Sélectionnez vos critères pour trouver un espace de travail ou une
          place de parking disponible.
        </p>
      </div>

      <form
        className="wsb-search-page__card"
        aria-label="Recherche d'espace"
        onSubmit={(e) => e.preventDefault()}
      >
        <fieldset className="wsb-search-page__section">
          <legend className="wsb-search-page__section-title">
            <CalendarIcon /> DATE
          </legend>
          <div className="wsb-search-page__field">
            <label className="wsb-search-page__field-label" htmlFor="search-date">
              Date <span className="wsb-search-page__required" aria-hidden="true">*</span>
            </label>
            <input
              type="date"
              id="search-date"
              className="wsb-search-page__date-input"
              value={date}
              min={getTomorrowISO()}
              onChange={handleDateChange}
              required
              aria-required="true"
            />
          </div>
        </fieldset>

        <fieldset className="wsb-search-page__section">
          <legend className="wsb-search-page__section-title">
            <SpaceIcon /> TYPE D'ESPACE
          </legend>
          <WsbSelect
            id="search-space-type"
            label="Type d'espace"
            placeholder="Sélectionner un type"
            options={SPACE_TYPE_OPTIONS}
            value={spaceType}
            onChange={setSpaceType}
            required
          />
        </fieldset>

        <fieldset className="wsb-search-page__section">
          <legend className="wsb-search-page__section-title">
            <LocationIcon /> LOCALISATION
          </legend>
          <div className="wsb-search-page__row">
            <WsbSelect
              id="search-building"
              label="Bâtiment"
              placeholder="Sélectionner un bâtiment"
              options={BUILDING_OPTIONS}
              value={building}
              onChange={setBuilding}
              required
            />
            <WsbSelect
              id="search-floor"
              label="Étage"
              placeholder="Sélectionner un étage"
              options={FLOOR_OPTIONS}
              value={floor}
              onChange={setFloor}
              required
            />
          </div>
        </fieldset>
      </form>
    </div>
  );
}
