import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from '../../../lib/useToast.js';
import { WsbToastContainer } from '../WsbToastContainer.jsx';

// ── Helpers ──────────────────────────────────────────────────────────────
function ToastButton({ type, message }) {
  const { toast } = useToast();
  return <button onClick={() => toast[type](message)}>show-{type}</button>;
}

function MultiToastButton({ messages, type = 'error' }) {
  const { toast } = useToast();
  return (
    <button onClick={() => messages.forEach((msg) => toast[type](msg))}>
      show-multi
    </button>
  );
}

function Wrapper({ children }) {
  return (
    <ToastProvider>
      <WsbToastContainer />
      {children}
    </ToastProvider>
  );
}

// ── Tests — rendu ────────────────────────────────────────────────────────
describe('WsbToast — rendu', () => {
  test('affiche le message et le type-label du toast succès', () => {
    render(<Wrapper><ToastButton type="success" message="Réservation confirmée." /></Wrapper>);
    fireEvent.click(screen.getByText('show-success'));
    expect(screen.getByText('Réservation confirmée.')).toBeInTheDocument();
    expect(screen.getByText('Succès')).toBeInTheDocument();
  });

  test('affiche les 4 variantes sans erreur', () => {
    const types = ['success', 'error', 'warning', 'info'];
    render(
      <Wrapper>
        {types.map((t) => <ToastButton key={t} type={t} message={`msg-${t}`} />)}
      </Wrapper>
    );
    types.forEach((t) => fireEvent.click(screen.getByText(`show-${t}`)));
    types.forEach((t) => expect(screen.getByText(`msg-${t}`)).toBeInTheDocument());
  });

  test('container porte aria-live="assertive"', () => {
    render(<Wrapper><div /></Wrapper>);
    expect(document.querySelector('.wsb-toast-container')).toHaveAttribute('aria-live', 'assertive');
  });
});

// ── Tests — auto-dismiss ─────────────────────────────────────────────────
describe('WsbToast — auto-dismiss', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('toast succès disparaît après 4s + 300ms fade-out', () => {
    render(<Wrapper><ToastButton type="success" message="OK" /></Wrapper>);
    fireEvent.click(screen.getByText('show-success'));
    expect(screen.getByText('OK')).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(4000 + 300 + 50));
    expect(screen.queryByText('OK')).not.toBeInTheDocument();
  });

  test('toast warning reste 6s', () => {
    render(<Wrapper><ToastButton type="warning" message="Conflit." /></Wrapper>);
    fireEvent.click(screen.getByText('show-warning'));

    act(() => jest.advanceTimersByTime(5999));
    expect(screen.getByText('Conflit.')).toBeInTheDocument();

    act(() => jest.advanceTimersByTime(301 + 300 + 50));
    expect(screen.queryByText('Conflit.')).not.toBeInTheDocument();
  });

  test('toast erreur NE disparaît PAS automatiquement', () => {
    render(<Wrapper><ToastButton type="error" message="Erreur 500." /></Wrapper>);
    fireEvent.click(screen.getByText('show-error'));

    act(() => jest.advanceTimersByTime(30000));
    expect(screen.getByText('Erreur 500.')).toBeInTheDocument();
  });
});

// ── Tests — bouton fermer ────────────────────────────────────────────────
describe('WsbToast — fermeture manuelle', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  test('bouton Fermer supprime le toast après fade-out', () => {
    render(<Wrapper><ToastButton type="error" message="Erreur." /></Wrapper>);
    fireEvent.click(screen.getByText('show-error'));

    fireEvent.click(screen.getByRole('button', { name: 'Fermer la notification' }));
    act(() => jest.advanceTimersByTime(300 + 50));

    expect(screen.queryByText('Erreur.')).not.toBeInTheDocument();
  });

  test('bouton fermer est un <button> natif (accessible clavier)', () => {
    render(<Wrapper><ToastButton type="error" message="Erreur." /></Wrapper>);
    fireEvent.click(screen.getByText('show-error'));

    const btn = screen.getByRole('button', { name: 'Fermer la notification' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn).not.toHaveAttribute('disabled');
  });
});

// ── Tests — empilement / MAX ─────────────────────────────────────────────
describe('WsbToast — max 3 toasts', () => {
  test('le 4ème toast évince le plus ancien', () => {
    const msgs = ['Err1', 'Err2', 'Err3', 'Err4'];
    render(<Wrapper><MultiToastButton messages={msgs} type="error" /></Wrapper>);
    fireEvent.click(screen.getByText('show-multi'));

    expect(screen.queryByText('Err1')).not.toBeInTheDocument();
    expect(screen.getByText('Err2')).toBeInTheDocument();
    expect(screen.getByText('Err3')).toBeInTheDocument();
    expect(screen.getByText('Err4')).toBeInTheDocument();
  });

  test('jamais plus de 3 toasts simultanés', () => {
    const msgs = ['A', 'B', 'C', 'D', 'E'];
    render(<Wrapper><MultiToastButton messages={msgs} type="error" /></Wrapper>);
    fireEvent.click(screen.getByText('show-multi'));

    expect(document.querySelectorAll('.wsb-toast')).toHaveLength(3);
  });
});
