import './WsbParkingFieldset.css';

const PARKING_OPTIONS = [
  { value: 'thermique', label: 'Place thermique' },
  { value: 'electrique', label: 'Place électrique' },
];

export function WsbParkingFieldset({
  needsCar = false,
  onNeedsCarChange,
  parkingType = '',
  onParkingTypeChange,
}) {
  const toggleId = 'parking-toggle';
  const groupName = 'parking-type';

  return (
    <div className="wsb-parking">
      <div className="wsb-parking__toggle-row">
        <label htmlFor={toggleId} className="wsb-parking__toggle-label">
          Venez-vous en voiture ?
        </label>
        <button
          type="button"
          id={toggleId}
          role="switch"
          aria-checked={needsCar}
          className={`wsb-parking__switch${needsCar ? ' wsb-parking__switch--on' : ''}`}
          onClick={() => onNeedsCarChange(!needsCar)}
        >
          <span className="wsb-parking__switch-thumb" />
          <span className="wsb-sr-only">
            {needsCar ? 'Oui, je viens en voiture' : 'Non'}
          </span>
        </button>
      </div>

      {needsCar && (
        <fieldset className="wsb-parking__radios">
          <legend className="wsb-parking__legend">
            Type de parking souhaité
          </legend>
          {PARKING_OPTIONS.map((opt) => (
            <div key={opt.value} className="wsb-parking__radio-row">
              <input
                type="radio"
                id={`${groupName}-${opt.value}`}
                name={groupName}
                value={opt.value}
                checked={parkingType === opt.value}
                onChange={() => onParkingTypeChange(opt.value)}
                className="wsb-parking__radio"
              />
              <label
                htmlFor={`${groupName}-${opt.value}`}
                className="wsb-parking__radio-label"
              >
                {opt.label}
              </label>
            </div>
          ))}
        </fieldset>
      )}
    </div>
  );
}
