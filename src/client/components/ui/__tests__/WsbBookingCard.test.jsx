import { jest } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbBookingCard, buildReserveUrl } from '../WsbBookingCard.jsx';

// ── buildReserveUrl ───────────────────────────────────────────────────────
describe('buildReserveUrl', () => {
  it('builds URL with only sysId', () => {
    expect(buildReserveUrl('abc123', '')).toBe('/x_acf_wsb_confirm.do?space_id=abc123');
  });

  it('appends searchParams when provided', () => {
    expect(buildReserveUrl('abc123', 'date=2026-05-04&floor=3')).toBe(
      '/x_acf_wsb_confirm.do?space_id=abc123&date=2026-05-04&floor=3'
    );
  });

  it('encodes special characters in sysId', () => {
    const url = buildReserveUrl('id with spaces', '');
    expect(url).toContain('id%20with%20spaces');
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

  it('appelle onReserve avec la bonne URL au clic', () => {
    const onReserve = jest.fn();
    render(<WsbBookingCard {...baseProps} sysId="sys001" searchParams="date=2026-05-04" onReserve={onReserve} />);
    fireEvent.click(screen.getByRole('button', { name: /Réserver/ }));
    expect(onReserve).toHaveBeenCalledTimes(1);
    expect(onReserve).toHaveBeenCalledWith(
      '/x_acf_wsb_confirm.do?space_id=sys001&date=2026-05-04'
    );
  });

  it('appelle onReserve sans searchParams', () => {
    const onReserve = jest.fn();
    render(<WsbBookingCard {...baseProps} sysId="sys001" onReserve={onReserve} />);
    fireEvent.click(screen.getByRole('button', { name: /Réserver/ }));
    expect(onReserve).toHaveBeenCalledWith('/x_acf_wsb_confirm.do?space_id=sys001');
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
