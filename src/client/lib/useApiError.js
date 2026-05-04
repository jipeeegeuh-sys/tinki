import { useCallback } from 'react';
import { useToast } from './useToast.js';
import { ApiError } from '../services/ApiService.js';

const MESSAGES = {
  401: 'Session expirée — reconnexion en cours…',
  403: 'Accès refusé — droits insuffisants.',
  408: 'Le serveur ne répond pas (timeout). Réessayez.',
  500: 'Erreur serveur — veuillez réessayer ultérieurement.',
};

function redirectToLogin() {
  window.location.href = '/login.do';
}

export function useApiError() {
  const { toast } = useToast();

  const handleError = useCallback(
    (err) => {
      if (!(err instanceof ApiError)) {
        toast.error('Une erreur inattendue est survenue.');
        return;
      }

      const status = err.status;

      if (status === 401) {
        toast.warning(MESSAGES[401]);
        redirectToLogin();
        return;
      }

      if (MESSAGES[status]) {
        toast.error(MESSAGES[status]);
        return;
      }

      if (status >= 400 && status < 500) {
        toast.error(err.body?.error?.message || `Erreur ${status}`);
        return;
      }

      toast.error(MESSAGES[500]);
    },
    [toast],
  );

  return { handleError };
}
