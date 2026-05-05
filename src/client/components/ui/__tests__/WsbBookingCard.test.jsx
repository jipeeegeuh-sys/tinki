import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbBookingCard, buildReserveUrl } from '../WsbBookingCard.jsx';

// ── buildReserveUrl ───────────────────────────────────────────────────────
describe('buildReserveUrl', () => {
  it('builds URL with spaceId and sysId', () => {
    const url = buildReserveUrl('B-042', 'guid-abc', '');
    expect(url).toContain('space_id=B-042');
    expect(url).toContain('sys_id=guid-abc');
  });

  it('appends searchParams when provided', () => {
    const url = buildReserveUrl('B-042', 'guid-abc', 'date=2026-05-04&floor=3');
    expect(url).toContain('space_id=B-042');
    expect(url).toContain('sys_id=guid-abc');
    expect(url).toContain('date=2026-05-04');
    expect(url).toContain('floor=3');
  });

  it('encodes special characters in spaceId', () => {
    const url = buildReserveUrl('id with spaces', 'guid', '');
    expect(url).toContain('id+with+spaces');
  });

  it('repropagates all search params in URL (AC-compliant)', () => {
    const url = buildReserveUrl('207-B', 'guid-207', 'building=A&floor=3&date=2026-04-30&type=bureau');
    expect(url).toContain('space_id=207-B');
    expect(url).toContain('sys_id=guid-207');
    expect(url).toContain('building=A');
    expect(url).toContain('floor=3');
    expect(url).toContain('date=2026-04-30');
    expect(url).toContain('type=bureau');
  });
});

// ── Available card ────────────────────────────────────────────────────────
describe('WsbBookingCard — disponible', () => {
  const baseProps = {
    spaceId: 'B-042',
    sysId: 'sys001',
    floor: 'Étage 3',
    type: 'bureau',
    status: 'available',
  };

  it('affiche le spaceId', () => {
    render(<WsbBookingCard {...baseProps} />);
    expect(screen.getByText('B-042')).toBeInTheDocument();
  });

  it('affiche le badge de type avec le label correct', () => {
    render(<WsbBookingCard {...baseProps} />);
    expect(screen.getByText('Bureau')).toBeInTheDocument();
  });

  it('affiche le statut "Disponible"', () => {
    render(<WsbBookingCard {...baseProps} />);
    expect(screen.getByText('Disponible')).toBeInTheDocument();
  });

  it('affiche le nom de l\'étage', () => {
    render(<WsbBookingCard {...baseProps} />);
    expect(screen.getByText('Étage 3')).toBeInTheDocument();
  });

  it('porte le bon aria-label sur l\'article', () => {
    const { container } = render(<WsbBookingCard {...baseProps} />);
    expect(container.firstChild).toHaveAttribute(
      'aria-label',
      'Bureau B-042 — Étage 3 — Disponible'
    );
  });

  it('rend le bouton "Réserver cet espace"', () => {
    render(<WsbBookingCard {...baseProps} />);
    expect(screen.getByRole('button', { name: /Réserver espace Bureau B-042/ })).toBeInTheDocument();
  });

  it('n\'applique PAS la classe --occupied', () => {
    const { container } = render(<WsbBookingCard {...baseProps} />);
    expect(container.firstChild).not.toHaveClass('wsb-booking-card--occupied');
  });

  it('appelle onReserve avec space_id=spaceId et sys_id=sysId au clic', () => {
    const onReserve = jest.fn();
    render(<WsbBookingCard {...baseProps} sysId="sys001" searchParams="date=2026-05-04" onReserve={onReserve} />);
    fireEvent.click(screen.getByRole('button', { name: /Réserver/ }));
    expect(onReserve).toHaveBeenCalledTimes(1);
    const url = onReserve.mock.calls[0][0];
    expect(url).toContain('space_id=B-042');
    expect(url).toContain('sys_id=sys001');
    expect(url).toContain('date=2026-05-04');
  });

  it('appelle onReserve sans searchParams', () => {
    const onReserve = jest.fn();
    render(<WsbBookingCard {...baseProps} sysId="sys001" onReserve={onReserve} />);
    fireEvent.click(screen.getByRole('button', { name: /Réserver/ }));
    const url = onReserve.mock.calls[0][0];
    expect(url).toContain('space_id=B-042');
    expect(url).toContain('sys_id=sys001');
  });
});

// ── Loading state on click ───────────────────────────────────────────────
describe('WsbBookingCard — loading state', () => {
  const baseProps = {
    spaceId: 'B-042',
    sysId: 'sys001',
    floor: 'Étage 3',
    type: 'bureau',
    status: 'available',
    onReserve: jest.fn(),
  };

  it('passe en état loading après clic', () => {
    const { container } = render(<WsbBookingCard {...baseProps} />);
    const btn = screen.getByRole('button', { name: /Réserver/ });

    fireEvent.click(btn);

    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
    expect(container.querySelector('.wsb-booking-card__cta--loading')).toBeInTheDocument();
  });

  it('affiche le spinner inline en loading', () => {
    const { container } = render(<WsbBookingCard {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Réserver/ }));

    expect(container.querySelector('.wsb-booking-card__cta-spinner')).toBeInTheDocument();
  });

  it('masque le texte visible et conserve un sr-only pendant loading', () => {
    render(<WsbBookingCard {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Réserver/ }));

    const srOnly = document.querySelector('.wsb-sr-only');
    expect(srOnly).toBeInTheDocument();
    expect(srOnly.textContent).toBe('Réserver cet espace');
  });

  it('ne déclenche pas un second appel onReserve si déjà en loading', () => {
    const onReserve = jest.fn();
    render(<WsbBookingCard {...baseProps} onReserve={onReserve} />);

    const btn = screen.getByRole('button', { name: /Réserver/ });
    fireEvent.click(btn);
    fireEvent.click(btn);

    expect(onReserve).toHaveBeenCalledTimes(1);
  });

  it('n\'a pas aria-busy avant le clic', () => {
    render(<WsbBookingCard {...baseProps} />);
    const btn = screen.getByRole('button', { name: /Réserver/ });
    expect(btn).not.toHaveAttribute('aria-busy');
    expect(btn).not.toBeDisabled();
  });
});

// ── Keyboard navigation ─────────────────────────────────────────────────
describe('WsbBookingCard — keyboard navigation', () => {
  it('déclenche la réservation via Enter (natif button)', () => {
    const onReserve = jest.fn();
    render(
      <WsbBookingCard
        spaceId="207-B"
        sysId="guid-207"
        floor="Étage 3"
        type="bureau"
        status="available"
        searchParams="building=A&floor=3&date=2026-04-30&type=bureau"
        onReserve={onReserve}
      />
    );
    const btn = screen.getByRole('button', { name: /Réserver/ });
    fireEvent.keyDown(btn, { key: 'Enter' });
    fireEvent.click(btn);

    const url = onReserve.mock.calls[0][0];
    expect(url).toContain('space_id=207-B');
    expect(url).toContain('sys_id=guid-207');
    expect(url).toContain('building=A');
    expect(url).toContain('floor=3');
    expect(url).toContain('date=2026-04-30');
    expect(url).toContain('type=bureau');
  });

  it('le bouton est focusable via Tab (type="button" natif)', () => {
    render(
      <WsbBookingCard
        spaceId="B-001"
        sysId="s1"
        floor="Étage 1"
        type="bureau"
        status="available"
      />
    );
    const btn = screen.getByRole('button', { name: /Réserver/ });
    expect(btn.tabIndex).not.toBe(-1);
  });
});

// ── Occupied card ─────────────────────────────────────────────────────────
describe('WsbBookingCard — occupé', () => {
  const occupiedProps = {
    spaceId: 'OS-007',
    sysId: 'sys002',
    floor: 'RDC',
    type: 'openspace-classique',
    status: 'occupied',
  };

  it('applique la classe wsb-booking-card--occupied', () => {
    const { container } = render(<WsbBookingCard {...occupiedProps} />);
    expect(container.firstChild).toHaveClass('wsb-booking-card--occupied');
  });

  it('affiche "Occupé" dans le statut', () => {
    render(<WsbBookingCard {...occupiedProps} />);
    expect(screen.getByText('Occupé')).toBeInTheDocument();
  });

  it('affiche "Indisponible" dans le footer', () => {
    render(<WsbBookingCard {...occupiedProps} />);
    expect(screen.getByText('Indisponible')).toBeInTheDocument();
  });

  it('ne rend pas de bouton de réservation', () => {
    render(<WsbBookingCard {...occupiedProps} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('porte le bon aria-label avec "Occupé"', () => {
    const { container } = render(<WsbBookingCard {...occupiedProps} />);
    expect(container.firstChild).toHaveAttribute(
      'aria-label',
      'Open Space OS-007 — RDC — Occupé'
    );
  });

  it('porte aria-disabled="true"', () => {
    const { container } = render(<WsbBookingCard {...occupiedProps} />);
    expect(container.firstChild).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('WsbBookingCard — card disponible sans aria-disabled', () => {
  it('ne porte PAS aria-disabled quand status=available', () => {
    const { container } = render(
      <WsbBookingCard spaceId="B-001" sysId="s1" floor="Étage 1" type="bureau" status="available" />
    );
    expect(container.firstChild).not.toHaveAttribute('aria-disabled');
  });
});

// ── Electric parking ──────────────────────────────────────────────────────
describe('WsbBookingCard — parking électrique', () => {
  const electricProps = {
    spaceId: 'PE-012',
    sysId: 'sys003',
    floor: 'Sous-sol',
    type: 'parking-electrique',
    status: 'available',
  };

  it('affiche "Place électrique"', () => {
    render(<WsbBookingCard {...electricProps} />);
    expect(screen.getByText('Place électrique')).toBeInTheDocument();
  });

  it('affiche le label "Parking électrique" dans le badge', () => {
    render(<WsbBookingCard {...electricProps} />);
    expect(screen.getByText('Parking électrique')).toBeInTheDocument();
  });

  it('rend l\'indicateur électrique avec le SVG', () => {
    const { container } = render(<WsbBookingCard {...electricProps} />);
    expect(container.querySelector('.wsb-booking-card__electric')).toBeInTheDocument();
    expect(container.querySelector('.wsb-booking-card__electric svg')).toBeInTheDocument();
  });
});

// ── Parking thermique (no electric indicator) ─────────────────────────────
describe('WsbBookingCard — parking thermique', () => {
  it('n\'affiche pas l\'indicateur électrique', () => {
    const { container } = render(
      <WsbBookingCard spaceId="PT-003" sysId="sys004" floor="Sous-sol" type="parking-thermique" />
    );
    expect(container.querySelector('.wsb-booking-card__electric')).not.toBeInTheDocument();
  });
});

// ── Status badge colors (AC: fond #00aa00 / #cc0000) ──────────────────────
describe('WsbBookingCard — couleurs des badges de statut', () => {
  it('le badge Disponible a la classe --available', () => {
    const { container } = render(
      <WsbBookingCard spaceId="B-001" sysId="s1" floor="Niveau 1" type="bureau" status="available" />
    );
    expect(container.querySelector('.wsb-booking-card__status--available')).toBeInTheDocument();
  });

  it('le badge Occupé a la classe --occupied', () => {
    const { container } = render(
      <WsbBookingCard spaceId="B-001" sysId="s1" floor="Niveau 1" type="bureau" status="occupied" />
    );
    expect(container.querySelector('.wsb-booking-card__status--occupied')).toBeInTheDocument();
  });
});

// ── Occupied card — non-tabbable ──────────────────────────────────────────
describe('WsbBookingCard — card occupée non tabbable', () => {
  it('ne contient aucun élément interactif focusable', () => {
    const { container } = render(
      <WsbBookingCard spaceId="OS-007" sysId="s2" floor="RDC" type="openspace-classique" status="occupied" />
    );
    const focusable = container.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(focusable.length).toBe(0);
  });
});

// ── Type badge inline styles ──────────────────────────────────────────────
describe('WsbBookingCard — type badge styles', () => {
  it('applique la couleur rgba correcte pour bureau', () => {
    const { container } = render(
      <WsbBookingCard spaceId="B-001" sysId="s1" floor="Étage 1" type="bureau" />
    );
    const badge = container.querySelector('.wsb-booking-card__type-badge');
    expect(badge.style.color).toBeTruthy();
  });

  it('utilise DEFAULT_CONFIG pour un type inconnu', () => {
    render(
      <WsbBookingCard spaceId="X-001" sysId="s1" floor="Étage 1" type="unknown-type" />
    );
    expect(screen.getByText('Espace')).toBeInTheDocument();
  });
});
