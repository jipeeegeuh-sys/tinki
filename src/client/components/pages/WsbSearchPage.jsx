import { useState, useRef, useCallback } from 'react';
import { WsbSelect } from '../ui/WsbSelect.jsx';
import { WsbButton } from '../ui/WsbButton.jsx';
import { WsbParkingFieldset } from '../ui/WsbParkingFieldset.jsx';
import { FormError, buildAriaError } from '../../lib/useFocusError.js';
import { navigateTo, getCurrentParams } from '../../services/NavigationService.js';
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
  { value: 'openspace-classique', label: 'Openspace classique' },
  { value: 'openspace-specialise', label: 'Openspace spécialisé (RH, Compta…)' },
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

const FIELD_ORDER = ['building', 'floor', 'date', 'type'];

function validate({ building, floor, date, spaceType }) {
  const errors = {};
  if (!building) errors.building = 'Le bâtiment est requis.';
  if (!floor) errors.floor = 'L\'étage est requis.';
  if (!date) errors.date = 'La date est requise.';
  if (!spaceType) errors.type = 'Le type d\'espace est requis.';
  return errors;
}

export function WsbSearchPage() {
  const [urlParams] = useState(getCurrentParams);
  const [building, setBuilding] = useState(urlParams.building || '');
  const [floor, setFloor] = useState(urlParams.floor || '');
  const [date, setDate] = useState(() => urlParams.date || formatDateISO(getNextBusinessDay()));
  const [spaceType, setSpaceType] = useState(urlParams.type || '');
  const [needsCar, setNeedsCar] = useState(Boolean(urlParams.parking));
  const [parkingType, setParkingType] = useState(urlParams.parking || '');
  const [errors, setErrors] = useState({});

  const isFormComplete = Boolean(building && floor && date && spaceType);

  const fieldRefs = {
    building: useRef(null),
    floor: useRef(null),
    date: useRef(null),
    type: useRef(null),
  };

  const focusFirstError = useCallback((errs) => {
    for (const field of FIELD_ORDER) {
      if (errs[field]) {
        const ref = fieldRefs[field];
        if (ref?.current) {
          ref.current.focus();
          return;
        }
      }
    }
  }, []);

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val || isWeekend(val)) return;
    setDate(val);
    if (errors.date) {
      setErrors((prev) => ({ ...prev, date: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate({ building, floor, date, spaceType });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      focusFirstError(errs);
      return;
    }

    setErrors({});
    const params = {
      building,
      floor,
      date,
      type: spaceType,
    };
    if (needsCar && parkingType) {
      params.parking = parkingType;
    }
    navigateTo('results', params);
  };

  const clearFieldError = (field) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const dateAriaProps = buildAriaError('date', errors.date);
  const dateInputCls = [
    'wsb-search-page__date-input',
    date ? 'wsb-search-page__date-input--filled' : '',
  ].filter(Boolean).join(' ');

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
        onSubmit={handleSubmit}
        noValidate
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
              ref={fieldRefs.date}
              type="date"
              id="search-date"
              className={dateInputCls}
              value={date}
              min={getTomorrowISO()}
              onChange={handleDateChange}
              required
              aria-required="true"
              {...dateAriaProps}
            />
            <FormError fieldName="date" error={errors.date} />
          </div>
        </fieldset>

        <fieldset className="wsb-search-page__section">
          <legend className="wsb-search-page__section-title">
            <SpaceIcon /> TYPE D&apos;ESPACE
          </legend>
          <WsbSelect
            ref={fieldRefs.type}
            id="search-space-type"
            label="Type d'espace"
            placeholder="Sélectionner un type"
            options={SPACE_TYPE_OPTIONS}
            value={spaceType}
            onChange={(val) => { setSpaceType(val); clearFieldError('type'); }}
            required
            error={errors.type}
          />
        </fieldset>

        <fieldset className="wsb-search-page__section">
          <legend className="wsb-search-page__section-title">
            <LocationIcon /> LOCALISATION
          </legend>
          <div className="wsb-search-page__row">
            <WsbSelect
              ref={fieldRefs.building}
              id="search-building"
              label="Bâtiment"
              placeholder="Sélectionner un bâtiment"
              options={BUILDING_OPTIONS}
              value={building}
              onChange={(val) => { setBuilding(val); clearFieldError('building'); }}
              required
              error={errors.building}
            />
            <WsbSelect
              ref={fieldRefs.floor}
              id="search-floor"
              label="Étage"
              placeholder="Sélectionner un étage"
              options={FLOOR_OPTIONS}
              value={floor}
              onChange={(val) => { setFloor(val); clearFieldError('floor'); }}
              required
              error={errors.floor}
            />
          </div>
        </fieldset>

        <fieldset className="wsb-search-page__section">
          <legend className="wsb-search-page__section-title">
            🚗 PARKING
          </legend>
          <WsbParkingFieldset
            needsCar={needsCar}
            onNeedsCarChange={setNeedsCar}
            parkingType={parkingType}
            onParkingTypeChange={setParkingType}
          />
        </fieldset>

        <div className="wsb-search-page__actions">
          <WsbButton
            type="submit"
            variant="primary"
            size="md"
            disabled={!isFormComplete}
            tooltip={!isFormComplete ? 'Complétez tous les champs' : ''}
          >
            Lancer la recherche
          </WsbButton>
        </div>
      </form>
    </div>
  );
}
