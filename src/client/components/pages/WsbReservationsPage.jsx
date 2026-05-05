import { useState, useEffect, useCallback } from 'react';
import { getRequestItems } from '../../services/ApiService.js';
import { buildPageUrl } from '../../services/NavigationService.js';
import { useApiError } from '../../lib/useApiError.js';
import { WsbSkeletonTable, WsbEmptyState } from '../ui/WsbSkeleton.jsx';
import { WsbButton } from '../ui/WsbButton.jsx';
import './WsbReservationsPage.css';

export function WsbReservationsPage() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const { handleError } = useApiError();

  const fetchItems = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await getRequestItems({
        sysparm_display_value: true,
        sysparm_query: 'active=true^ORDERBYDESCopened_at',
        sysparm_fields: 'sys_id,number,short_description,state,opened_at,u_space_name,u_floor',
      });
      setItems(Array.isArray(result) ? result : []);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      handleError(err, fetchItems);
    }
  }, [handleError]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

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
        {status === 'loading' && <WsbSkeletonTable rows={5} />}

        {status === 'error' && (
          <div className="wsb-reservations-page__error" role="alert">
            <h2 className="wsb-reservations-page__error-title">Erreur de chargement</h2>
            <p className="wsb-reservations-page__error-desc">
              Une erreur est survenue lors du chargement de vos réservations.
            </p>
            <WsbButton variant="primary" onClick={fetchItems}>Réessayer</WsbButton>
          </div>
        )}

        {status === 'success' && items.length === 0 && (
          <WsbEmptyState variant="empty-reservations" />
        )}

        {status === 'success' && items.length > 0 && (
          <table className="wsb-reservations-page__table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Espace</th>
                <th>Étage</th>
                <th>Statut</th>
                <th><span className="wsb-sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const stateLabel = typeof item.state === 'object'
                  ? item.state.display_value
                  : item.state;
                return (
                  <tr key={item.sys_id}>
                    <td>{item.number}</td>
                    <td>{item.u_space_name || item.short_description}</td>
                    <td>{item.u_floor || '—'}</td>
                    <td>{stateLabel}</td>
                    <td>
                      <a
                        href={buildPageUrl('edit', { sys_id: item.sys_id })}
                        className="wsb-reservations-page__edit-link"
                        aria-label={`Éditer la réservation ${item.number}`}
                      >
                        Éditer
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
