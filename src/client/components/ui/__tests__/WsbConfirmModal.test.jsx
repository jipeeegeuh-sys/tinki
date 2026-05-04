import { jest } from '@jest/globals';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbConfirmModal } from '../WsbConfirmModal';

function renderModal(props = {}) {
  const defaultProps = {
    open: true,
    onConfirm: jest.fn(),
    onClose: jest.fn(),
    ...props,
  };
  return { ...render(<WsbConfirmModal {...defaultProps} />), props: defaultProps };
}

describe('WsbConfirmModal — affichage', () => {
  test('ne rend rien quand open=false', () => {
    render(<WsbConfirmModal open={false} onConfirm={jest.fn()} onClose={jest.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('rend la modal quand open=true', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('affiche le titre par défaut', () => {
    renderModal();
    const title = screen.getByRole('heading', { name: "Confirmer l'annulation" });
    expect(title).toBeInTheDocument();
  });

  test('affiche un titre personnalisé', () => {
    renderModal({ title: 'Supprimer cet élément ?' });
    expect(screen.getByText('Supprimer cet élément ?')).toBeInTheDocument();
  });

  test('affiche la description', () => {
    renderModal();
    expect(screen.getByText(/irréversible/)).toBeInTheDocument();
  });

  test('affiche le détail quand fourni', () => {
    renderModal({ detail: 'Bureau 207-B — 30/04/2026' });
    expect(screen.getByText('Bureau 207-B — 30/04/2026')).toBeInTheDocument();
  });

  test('n\'affiche pas le détail quand vide', () => {
    const { container } = renderModal({ detail: '' });
    expect(container.querySelector('.wsb-modal__detail')).not.toBeInTheDocument();
  });

  test('affiche les boutons Retour et Confirmer', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Retour' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirmer l'annulation/ })).toBeInTheDocument();
  });
});

describe('WsbConfirmModal — ARIA', () => {
  test('porte role="dialog" et aria-modal="true"', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('aria-labelledby pointe vers le titre', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    const titleEl = document.getElementById(labelId);
    expect(titleEl).toHaveTextContent("Confirmer l'annulation");
  });

  test('aria-describedby pointe vers la description', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    const descId = dialog.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();
    const descEl = document.getElementById(descId);
    expect(descEl).toHaveTextContent(/irréversible/);
  });

  test('le bouton ✕ porte aria-label="Fermer la modal"', () => {
    renderModal();
    expect(screen.getByLabelText('Fermer la modal')).toBeInTheDocument();
  });
});

describe('WsbConfirmModal — fermeture sans annulation', () => {
  test('appelle onClose au clic sur Retour', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Retour' }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(props.onConfirm).not.toHaveBeenCalled();
  });

  test('appelle onClose au clic sur ✕', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByLabelText('Fermer la modal'));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  test('appelle onClose sur touche Escape', () => {
    const { props } = renderModal();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  test('appelle onClose au clic sur l\'overlay', () => {
    const { props, container } = renderModal();
    const overlay = container.querySelector('.wsb-modal-overlay');
    fireEvent.click(overlay);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  test('ne ferme PAS au clic à l\'intérieur du dialog', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByRole('dialog'));
    expect(props.onClose).not.toHaveBeenCalled();
  });
});

describe('WsbConfirmModal — confirmation', () => {
  test('appelle onConfirm au clic sur le bouton destructif', () => {
    const { props } = renderModal();
    fireEvent.click(screen.getByRole('button', { name: /Confirmer l'annulation/ }));
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });
});

describe('WsbConfirmModal — état loading', () => {
  test('ne ferme pas pendant le loading (Escape)', () => {
    const { props } = renderModal({ loading: true });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(props.onClose).not.toHaveBeenCalled();
  });

  test('ne ferme pas pendant le loading (clic overlay)', () => {
    const { props, container } = renderModal({ loading: true });
    fireEvent.click(container.querySelector('.wsb-modal-overlay'));
    expect(props.onClose).not.toHaveBeenCalled();
  });

  test('ne ferme pas pendant le loading (clic Retour)', () => {
    const { props } = renderModal({ loading: true });
    fireEvent.click(screen.getByRole('button', { name: 'Retour' }));
    expect(props.onClose).not.toHaveBeenCalled();
  });
});

describe('WsbConfirmModal — focus management', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('le focus va sur le bouton Retour à l\'ouverture', () => {
    renderModal();
    act(() => {
      jest.runAllTimers();
    });
    const retourBtn = screen.getByRole('button', { name: 'Retour' });
    expect(document.activeElement).toBe(retourBtn);
  });

  test('le focus retourne sur triggerRef à la fermeture', () => {
    const triggerEl = document.createElement('button');
    triggerEl.textContent = 'Annuler';
    document.body.appendChild(triggerEl);
    const triggerRef = { current: triggerEl };

    const { rerender } = render(
      <WsbConfirmModal open={true} onConfirm={jest.fn()} onClose={jest.fn()} triggerRef={triggerRef} />
    );

    rerender(
      <WsbConfirmModal open={false} onConfirm={jest.fn()} onClose={jest.fn()} triggerRef={triggerRef} />
    );

    expect(document.activeElement).toBe(triggerEl);
    document.body.removeChild(triggerEl);
  });
});

describe('WsbConfirmModal — focus trap (Tab)', () => {
  test('Tab depuis le dernier élément revient au premier', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    const focusable = [...dialog.querySelectorAll('button:not([disabled])')];
    const last = focusable[focusable.length - 1];
    last.focus();

    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(focusable[0]);
  });

  test('Shift+Tab depuis le premier élément va au dernier', () => {
    renderModal();
    const dialog = screen.getByRole('dialog');
    const focusable = [...dialog.querySelectorAll('button:not([disabled])')];
    const first = focusable[0];
    first.focus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(focusable[focusable.length - 1]);
  });
});

describe('WsbConfirmModal — labels personnalisés', () => {
  test('accepte un label de confirmation personnalisé', () => {
    renderModal({ confirmLabel: 'Oui, supprimer' });
    expect(screen.getByRole('button', { name: 'Oui, supprimer' })).toBeInTheDocument();
  });

  test('accepte un label d\'annulation personnalisé', () => {
    renderModal({ cancelLabel: 'Non, garder' });
    expect(screen.getByRole('button', { name: 'Non, garder' })).toBeInTheDocument();
  });
});
