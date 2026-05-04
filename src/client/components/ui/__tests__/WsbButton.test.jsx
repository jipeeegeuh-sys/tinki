import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbButton } from '../WsbButton';

describe('WsbButton — variant primary', () => {
  test('rend un bouton avec le texte enfant', () => {
    render(<WsbButton>Lancer la recherche</WsbButton>);
    expect(screen.getByRole('button', { name: 'Lancer la recherche' })).toBeInTheDocument();
  });

  test('applique la classe wsb-btn--primary par défaut', () => {
    render(<WsbButton>Action</WsbButton>);
    expect(screen.getByRole('button')).toHaveClass('wsb-btn--primary');
  });

  test('déclenche onClick au clic', () => {
    const onClick = jest.fn();
    render(<WsbButton onClick={onClick}>Action</WsbButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('cible tactile ≥ 44px via classe wsb-btn--md', () => {
    render(<WsbButton>Action</WsbButton>);
    expect(screen.getByRole('button')).toHaveClass('wsb-btn--md');
  });
});

describe('WsbButton — état disabled', () => {
  test('porte aria-disabled="true" quand disabled=true', () => {
    render(<WsbButton disabled>Action</WsbButton>);
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  test('ne déclenche pas onClick quand disabled', () => {
    const onClick = jest.fn();
    render(<WsbButton disabled onClick={onClick}>Action</WsbButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('affiche le tooltip et le lie via aria-describedby', () => {
    render(
      <WsbButton disabled tooltip="Complétez tous les champs">
        Lancer la recherche
      </WsbButton>
    );
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-describedby');
    const tooltipEl = document.getElementById(btn.getAttribute('aria-describedby'));
    expect(tooltipEl).toHaveTextContent('Complétez tous les champs');
    expect(tooltipEl).toHaveAttribute('role', 'tooltip');
  });

  test('pas de tooltip si disabled sans prop tooltip', () => {
    render(<WsbButton disabled>Action</WsbButton>);
    expect(screen.getByRole('button')).not.toHaveAttribute('aria-describedby');
  });
});

describe('WsbButton — état loading', () => {
  test('affiche le spinner SVG', () => {
    const { container } = render(<WsbButton loading>Envoi…</WsbButton>);
    expect(container.querySelector('.wsb-btn__spinner')).toBeInTheDocument();
  });

  test('porte aria-busy="true" et aria-disabled="true"', () => {
    render(<WsbButton loading>Envoi…</WsbButton>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });

  test('ne déclenche pas onClick quand loading', () => {
    const onClick = jest.fn();
    render(<WsbButton loading onClick={onClick}>Envoi…</WsbButton>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  test('le texte reste accessible aux AT pendant le loading (sr-only)', () => {
    render(<WsbButton loading>Enregistrer</WsbButton>);
    expect(screen.getByText('Enregistrer')).toHaveClass('wsb-sr-only');
  });
});

describe('WsbButton — variantes', () => {
  test.each(['primary', 'secondary', 'ghost', 'destructive', 'link-primary', 'link-danger'])(
    'applique la classe wsb-btn--%s',
    (variant) => {
      render(<WsbButton variant={variant}>Action</WsbButton>);
      expect(screen.getByRole('button')).toHaveClass(`wsb-btn--${variant}`);
    }
  );
});

describe('WsbButton — fullWidth', () => {
  test('applique wsb-btn--full et wsb-btn-wrapper--full', () => {
    const { container } = render(<WsbButton fullWidth>Action</WsbButton>);
    expect(screen.getByRole('button')).toHaveClass('wsb-btn--full');
    expect(container.firstChild).toHaveClass('wsb-btn-wrapper--full');
  });
});
