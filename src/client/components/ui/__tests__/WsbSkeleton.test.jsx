import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { WsbSkeletonCard, WsbGridSkeleton, WsbSpinner, WsbEmptyState } from '../WsbSkeleton.jsx';

describe('WsbSkeletonCard', () => {
  it('renders with aria-hidden="true"', () => {
    const { container } = render(<WsbSkeletonCard />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('contains shimmer elements', () => {
    const { container } = render(<WsbSkeletonCard />);
    expect(container.querySelectorAll('.wsb-skeleton').length).toBeGreaterThan(0);
  });
});

describe('WsbGridSkeleton', () => {
  it('renders 6 skeleton cards by default', () => {
    const { container } = render(<WsbGridSkeleton />);
    expect(container.querySelectorAll('.wsb-skeleton-card')).toHaveLength(6);
  });

  it('renders a custom count of skeleton cards', () => {
    const { container } = render(<WsbGridSkeleton count={3} />);
    expect(container.querySelectorAll('.wsb-skeleton-card')).toHaveLength(3);
  });

  it('has aria-live="polite"', () => {
    const { container } = render(<WsbGridSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-busy="true"', () => {
    const { container } = render(<WsbGridSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
  });

  it('has accessible label for screen readers', () => {
    const { container } = render(<WsbGridSkeleton />);
    expect(container.firstChild).toHaveAttribute(
      'aria-label',
      'Chargement des espaces disponibles'
    );
  });
});

describe('WsbSpinner', () => {
  it('renders with role="status"', () => {
    render(<WsbSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has default aria-label "Chargement…"', () => {
    render(<WsbSpinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Chargement…');
  });

  it('accepts a custom aria-label', () => {
    render(<WsbSpinner label="Recherche en cours" />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Recherche en cours');
  });

  it.each(['sm', 'md', 'lg'])('applies size class for %s', (size) => {
    const { container } = render(<WsbSpinner size={size} />);
    expect(container.firstChild).toHaveClass(`wsb-spinner--${size}`);
  });

  it('renders an SVG with aria-hidden', () => {
    const { container } = render(<WsbSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('WsbEmptyState — zero-results', () => {
  beforeEach(() => render(<WsbEmptyState variant="zero-results" />));

  it('has role="status"', () => {
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the title', () => {
    expect(screen.getByText('Aucun espace disponible')).toBeInTheDocument();
  });

  it('renders the description', () => {
    expect(screen.getByText(/Aucun espace ne correspond/)).toBeInTheDocument();
  });

  it('renders CTA as a link with the correct href', () => {
    const link = screen.getByRole('link', { name: 'Modifier ma recherche' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('/x_acf_wsb_search.do'));
  });
});

describe('WsbEmptyState — server-error', () => {
  it('renders the title', () => {
    render(<WsbEmptyState variant="server-error" onRetry={() => {}} />);
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  it('renders CTA as a <button>, not a link', () => {
    render(<WsbEmptyState variant="server-error" onRetry={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Réessayer' });
    expect(btn).toBeInTheDocument();
    expect(btn.tagName).toBe('BUTTON');
  });

  it('calls onRetry when the CTA is clicked', () => {
    const onRetry = jest.fn();
    render(<WsbEmptyState variant="server-error" onRetry={onRetry} />);
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('WsbEmptyState — empty-reservations', () => {
  beforeEach(() => render(<WsbEmptyState variant="empty-reservations" />));

  it('renders the title', () => {
    expect(screen.getByText('Aucune réservation')).toBeInTheDocument();
  });

  it('renders CTA as a link to /x_acf_wsb_search.do', () => {
    const link = screen.getByRole('link', { name: 'Réserver un espace' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/x_acf_wsb_search.do');
  });
});

describe('WsbEmptyState — unknown variant', () => {
  it('renders nothing for an unknown variant', () => {
    const { container } = render(<WsbEmptyState variant="unknown" />);
    expect(container.firstChild).toBeNull();
  });
});
