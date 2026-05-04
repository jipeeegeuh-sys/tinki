import './WsbReservationsPage.css';

export function WsbReservationsPage() {
  return (
    <div className="wsb-reservations-page">
      <div className="wsb-reservations-page__header">
        <span className="wsb-reservations-page__badge">MES RÉSERVATIONS</span>
        <h1 className="wsb-reservations-page__title" tabIndex={-1}>
          Mes réservations
        </h1>
        <p className="wsb-reservations-page__subtitle">
          Consultez, modifiez ou annulez vos réservations en cours.
        </p>
      </div>
      <div className="wsb-reservations-page__content">
        <p className="wsb-reservations-page__placeholder">
          Chargement de vos réservations…
        </p>
      </div>
    </div>
  );
}
