import './WsbParkingFieldset.css';

const PARKING_OPTIONS = [
  { value: 'thermique', label: 'Thermique' },
  { value: 'electric', label: 'Électrique ⚡' },
];

export function WsbParkingFieldset({
  needsCar = false,
  onNeedsCarChange,
  parkingType = '',
  onParkingTypeChange,
}) {
  const toggleId = 'parking-toggle';
  const groupName = 'parking-type';

  const wrapperCls = [
    'wsb-parking__radios-wrapper',
    needsCar ? 'wsb-parking__radios-wrapper--open' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="wsb-parking">
      <div className="wsb-parking__toggle-row">
        <label htmlFor={toggleId} className="wsb-parking__toggle-label">
          Venez-vous en voiture&nbsp;?
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

      <div className={wrapperCls} aria-hidden={!needsCar}>
        <fieldset className="wsb-parking__radios" disabled={!needsCar}>
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
                tabIndex={needsCar ? 0 : -1}
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
        {parkingType === 'electric' && (
          <p className="wsb-parking__info" role="status">
            8 places électriques disponibles dans le parc
          </p>
        )}
      </div>
    </div>
  );
}
