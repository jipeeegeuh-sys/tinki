import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  WsbSkeletonCard,
  WsbGridSkeleton,
  WsbSkeletonTable,
  WsbSpinner,
  WsbEmptyState,
} from '../WsbSkeleton.jsx';

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

  it('has aria-label "Chargement des espaces disponibles"', () => {
    const { container } = render(<WsbGridSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-label', 'Chargement des espaces disponibles');
  });
});

describe('WsbSkeletonTable', () => {
  it('renders 5 skeleton rows by default', () => {
    const { container } = render(<WsbSkeletonTable />);
    expect(container.querySelectorAll('.wsb-skeleton-row')).toHaveLength(5);
  });

  it('renders a custom number of rows', () => {
    const { container } = render(<WsbSkeletonTable rows={3} />);
    expect(container.querySelectorAll('.wsb-skeleton-row')).toHaveLength(3);
  });

  it('has aria-live="polite"', () => {
    const { container } = render(<WsbSkeletonTable />);
    expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
  });

  it('has aria-busy="true"', () => {
    const { container } = render(<WsbSkeletonTable />);
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
  });

  it('has aria-label "Chargement de vos réservations"', () => {
    const { container } = render(<WsbSkeletonTable />);
    expect(container.firstChild).toHaveAttribute('aria-label', 'Chargement de vos réservations');
  });

  it('skeleton rows have aria-hidden="true"', () => {
    const { container } = render(<WsbSkeletonTable />);
    container.querySelectorAll('.wsb-skeleton-row').forEach((row) => {
      expect(row).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

describe('WsbSpinner', () => {
  it('renders with role="status"', () => {
    render(<WsbSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has default aria-label "Chargement…"', () => {
    render(<WsbSpinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Chargement\u2026');
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
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('WsbEmptyState — zero-results', () => {
  const searchUrl = 'x_wsb_flexoffice_search.do?building=A&floor=3&date=2026-04-30&type=bureau';

  it('has role="status"', () => {
    render(<WsbEmptyState variant="zero-results" searchUrl={searchUrl} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the title', () => {
    render(<WsbEmptyState variant="zero-results" searchUrl={searchUrl} />);
    expect(screen.getByText('Aucun espace disponible')).toBeInTheDocument();
  });

  it('renders the AC-compliant description', () => {
    render(<WsbEmptyState variant="zero-results" searchUrl={searchUrl} />);
    expect(
      screen.getByText('Aucun espace disponible pour ces critères. Essayez un autre créneau ou un autre étage.'),
    ).toBeInTheDocument();
  });

  it('renders CTA "Modifier ma recherche" as a link with the searchUrl', () => {
    render(<WsbEmptyState variant="zero-results" searchUrl={searchUrl} />);
    const link = screen.getByRole('link', { name: 'Modifier ma recherche' });
    expect(link).toHaveAttribute('href', searchUrl);
  });
});

describe('WsbEmptyState — server-error', () => {
  const searchUrl = 'x_wsb_flexoffice_search.do?building=A&floor=3&date=2026-04-30&type=bureau';

  it('renders the title', () => {
    render(<WsbEmptyState variant="server-error" onRetry={() => {}} searchUrl={searchUrl} />);
    expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
  });

  it('renders the AC-compliant error description', () => {
    render(<WsbEmptyState variant="server-error" onRetry={() => {}} searchUrl={searchUrl} />);
    expect(
      screen.getByText('Une erreur est survenue lors du chargement des résultats. Veuillez réessayer.'),
    ).toBeInTheDocument();
  });

  it('renders the "Réessayer" CTA as a button', () => {
    render(<WsbEmptyState variant="server-error" onRetry={() => {}} searchUrl={searchUrl} />);
    const btn = screen.getByRole('button', { name: 'Réessayer' });
    expect(btn.tagName).toBe('BUTTON');
  });

  it('calls onRetry when the CTA is clicked', () => {
    const onRetry = jest.fn();
    render(<WsbEmptyState variant="server-error" onRetry={onRetry} searchUrl={searchUrl} />);
    fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders the "Retour à la recherche" secondary link', () => {
    render(<WsbEmptyState variant="server-error" onRetry={() => {}} searchUrl={searchUrl} />);
    expect(screen.getByRole('link', { name: 'Retour à la recherche' })).toHaveAttribute('href', searchUrl);
  });

  it('applies the server-error variant class', () => {
    const { container } = render(
      <WsbEmptyState variant="server-error" onRetry={() => {}} searchUrl={searchUrl} />,
    );
    expect(container.querySelector('.wsb-empty-state--server-error')).toBeInTheDocument();
  });

  it('does not render secondary link when searchUrl is absent', () => {
    render(<WsbEmptyState variant="server-error" onRetry={() => {}} />);
    expect(screen.queryByRole('link', { name: 'Retour à la recherche' })).not.toBeInTheDocument();
  });
});

describe('WsbEmptyState — empty-reservations', () => {
  beforeEach(() => render(<WsbEmptyState variant="empty-reservations" />));

  it('renders the title', () => {
    expect(screen.getByText('Aucune réservation')).toBeInTheDocument();
  });

  it('renders CTA as a link to search page', () => {
    expect(screen.getByRole('link', { name: 'Réserver un espace' })).toBeInTheDocument();
  });
});

describe('WsbEmptyState — unknown variant', () => {
  it('renders nothing for an unknown variant', () => {
    const { container } = render(<WsbEmptyState variant="unknown" />);
    expect(container.firstChild).toBeNull();
  });
});
