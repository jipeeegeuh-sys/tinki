import { jest } from '@jest/globals';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WsbDataTable } from '../WsbDataTable';

const COLUMNS = [
  { key: 'space', label: 'Espace' },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'status', label: 'Statut' },
];

function makeRows(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i}`,
    space: `A-${100 + i}`,
    date: `2026-05-${String(count - i).padStart(2, '0')}`,
    status: 'en-cours',
  }));
}

const simpleRenderRow = (row) => (
  <tr key={row.id} data-testid={`row-${row.id}`}>
    <td>{row.space}</td>
    <td>{row.date}</td>
    <td>{row.status}</td>
  </tr>
);

describe('WsbDataTable — affichage de base', () => {
  test('rend les en-têtes de colonnes', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={[]} renderRow={simpleRenderRow} />
    );
    expect(screen.getByText('Espace')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
  });

  test('affiche le message vide quand il n\'y a pas de lignes', () => {
    render(
      <WsbDataTable
        columns={COLUMNS}
        rows={[]}
        renderRow={simpleRenderRow}
        emptyMessage="Aucune donnée."
      />
    );
    expect(screen.getByText('Aucune donnée.')).toBeInTheDocument();
  });

  test('rend les lignes fournies par renderRow', () => {
    const rows = makeRows(3);
    render(
      <WsbDataTable columns={COLUMNS} rows={rows} renderRow={simpleRenderRow} />
    );
    expect(screen.getByText('A-100')).toBeInTheDocument();
    expect(screen.getByText('A-101')).toBeInTheDocument();
    expect(screen.getByText('A-102')).toBeInTheDocument();
  });

  test('affiche le caption sr-only quand fourni', () => {
    render(
      <WsbDataTable
        columns={COLUMNS}
        rows={[]}
        renderRow={simpleRenderRow}
        caption="Mes réservations"
      />
    );
    expect(screen.getByText('Mes réservations')).toBeInTheDocument();
  });
});

describe('WsbDataTable — tri par colonne', () => {
  test('la colonne Date est cliquable (sortable)', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(3)} renderRow={simpleRenderRow} />
    );
    const dateHeader = screen.getByText('Date').closest('th');
    expect(dateHeader).toHaveClass('wsb-data-table__th--sortable');
  });

  test('la colonne Espace n\'est pas cliquable (non-sortable)', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(3)} renderRow={simpleRenderRow} />
    );
    const spaceHeader = screen.getByText('Espace').closest('th');
    expect(spaceHeader).not.toHaveClass('wsb-data-table__th--sortable');
  });

  test('clic sur Date met aria-sort="ascending"', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(3)} renderRow={simpleRenderRow} />
    );
    const dateHeader = screen.getByText('Date').closest('th');
    fireEvent.click(dateHeader);
    expect(dateHeader).toHaveAttribute('aria-sort', 'ascending');
  });

  test('double-clic sur Date passe en aria-sort="descending"', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(3)} renderRow={simpleRenderRow} />
    );
    const dateHeader = screen.getByText('Date').closest('th');
    fireEvent.click(dateHeader);
    fireEvent.click(dateHeader);
    expect(dateHeader).toHaveAttribute('aria-sort', 'descending');
  });

  test('les colonnes non triées n\'ont pas d\'aria-sort', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(3)} renderRow={simpleRenderRow} />
    );
    const spaceHeader = screen.getByText('Espace').closest('th');
    expect(spaceHeader).not.toHaveAttribute('aria-sort');
  });
});

describe('WsbDataTable — pagination', () => {
  test('affiche 10 lignes max par défaut', () => {
    const rows = makeRows(15);
    const { container } = render(
      <WsbDataTable columns={COLUMNS} rows={rows} renderRow={simpleRenderRow} />
    );
    const tableRows = container.querySelectorAll('tbody tr');
    expect(tableRows).toHaveLength(10);
  });

  test('affiche le texte d\'information de pagination', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(15)} renderRow={simpleRenderRow} />
    );
    expect(screen.getByText(/Affichage 1-10 sur 15/)).toBeInTheDocument();
  });

  test('la nav de pagination est présente quand > 1 page', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(15)} renderRow={simpleRenderRow} />
    );
    expect(screen.getByLabelText('Pagination du tableau')).toBeInTheDocument();
  });

  test('pas de nav de pagination pour ≤ 10 items', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(8)} renderRow={simpleRenderRow} />
    );
    expect(screen.queryByLabelText('Pagination du tableau')).not.toBeInTheDocument();
  });

  test('clic sur page suivante affiche la page 2', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(15)} renderRow={simpleRenderRow} />
    );
    fireEvent.click(screen.getByLabelText('Page suivante'));
    expect(screen.getByText(/Affichage 11-15 sur 15/)).toBeInTheDocument();
  });

  test('bouton page précédente est disabled sur la page 1', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(15)} renderRow={simpleRenderRow} />
    );
    expect(screen.getByLabelText('Page précédente')).toBeDisabled();
  });

  test('le numéro de page actif porte aria-current="page"', () => {
    render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(15)} renderRow={simpleRenderRow} />
    );
    expect(screen.getByLabelText('Page 1')).toHaveAttribute('aria-current', 'page');
  });

  test('respecte le pageSize personnalisé', () => {
    const { container } = render(
      <WsbDataTable columns={COLUMNS} rows={makeRows(15)} pageSize={5} renderRow={simpleRenderRow} />
    );
    const tableRows = container.querySelectorAll('tbody tr');
    expect(tableRows).toHaveLength(5);
  });
});
