import { useCallback } from 'react';
import { useToast } from './useToast.js';
import { ApiError } from '../services/ApiService.js';

const MESSAGES = {
  401: 'Votre session a expiré. Reconnexion en cours…',
  403: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  timeout: 'Le serveur ne répond pas. Veuillez réessayer.',
};

const SERVER_ERROR_MSG = 'Une erreur est survenue. Veuillez réessayer.';

function redirectToLogin() {
  const currentUrl = encodeURIComponent(window.location.href);
  window.location.href = `/login.do?redirectTo=${currentUrl}`;
}

export function useApiError() {
  const { toast } = useToast();

  const handleError = useCallback(
    (err) => {
      if (!(err instanceof ApiError)) {
        toast.error('Une erreur inattendue est survenue.');
        return;
      }

      const { status } = err;

      if (status === 401) {
        toast.info(MESSAGES[401]);
        redirectToLogin();
        return;
      }

      if (status === 403) {
        toast.error(MESSAGES[403]);
        return;
      }

      if (status === 'timeout') {
        toast.error(MESSAGES.timeout);
        return;
      }

      if (status === 500 || status === 503) {
        toast.error(SERVER_ERROR_MSG);
        return;
      }

      if (status >= 400 && status < 500) {
        toast.error(err.body?.error?.message || `Erreur ${status}`);
        return;
      }

      if (status >= 500) {
        toast.error(SERVER_ERROR_MSG);
        return;
      }

      toast.error(SERVER_ERROR_MSG);
    },
    [toast],
  );

  return { handleError };
}
