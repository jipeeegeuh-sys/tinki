import { useState, useMemo, useCallback } from 'react';
import './WsbDataTable.css';

const SortIcon = ({ direction }) => (
  <svg
    className={`wsb-data-table__sort-icon${direction === 'desc' ? ' wsb-data-table__sort-icon--desc' : ''}`}
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
  >
    <path d="M6 2.5l3.5 4.5H2.5L6 2.5z" fill="currentColor" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M8.5 3.5L5 7l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M5.5 3.5L9 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function buildPageNumbers(current, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set([1, total, current]);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);
  return [...pages].sort((a, b) => a - b);
}

export function WsbDataTable({
  columns,
  rows,
  pageSize = 10,
  emptyMessage = 'Aucune réservation à afficher.',
  caption,
  renderRow,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  }, [sortKey]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find(c => c.key === sortKey);
    if (!col?.sortable) return rows;

    return [...rows].sort((a, b) => {
      const valA = a[sortKey] ?? '';
      const valB = b[sortKey] ?? '';
      let cmp = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        cmp = valA - valB;
      } else {
        cmp = String(valA).localeCompare(String(valB), 'fr');
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });
  }, [rows, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * pageSize;
  const pageRows = sortedRows.slice(startIdx, startIdx + pageSize);
  const pageNumbers = buildPageNumbers(safeCurrentPage, totalPages);

  const colCount = columns.length;

  return (
    <div>
      <table className="wsb-data-table" role="grid">
        {caption && <caption className="wsb-sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map(col => {
              const isSorted = sortKey === col.key;
              const thClass = [
                col.sortable && 'wsb-data-table__th--sortable',
                isSorted && 'wsb-data-table__th--sorted',
              ].filter(Boolean).join(' ');

              return (
                <th
                  key={col.key}
                  className={thClass || undefined}
                  aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  scope="col"
                >
                  <span className="wsb-data-table__th-content">
                    {col.label}
                    {col.sortable && <SortIcon direction={isSorted ? sortDir : 'asc'} />}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 ? (
            <tr>
              <td className="wsb-data-table__empty" colSpan={colCount}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            pageRows.map((row, idx) => renderRow(row, startIdx + idx))
          )}
        </tbody>
      </table>

      {sortedRows.length > 0 && (
        <div className="wsb-data-table-footer">
          <span className="wsb-data-table-footer__info">
            Affichage {startIdx + 1}-{Math.min(startIdx + pageSize, sortedRows.length)} sur {sortedRows.length} réservations
          </span>

          {totalPages > 1 && (
            <nav className="wsb-data-table-pagination" aria-label="Pagination du tableau">
              <button
                type="button"
                className="wsb-data-table-pagination__btn"
                disabled={safeCurrentPage <= 1}
                aria-label="Page précédente"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft />
              </button>

              {pageNumbers.map((num, idx) => {
                const prevNum = pageNumbers[idx - 1];
                const showEllipsis = prevNum && num - prevNum > 1;
                return (
                  <span key={num} style={{ display: 'contents' }}>
                    {showEllipsis && (
                      <span className="wsb-data-table-pagination__btn" aria-hidden="true" style={{ cursor: 'default', opacity: 0.4 }}>…</span>
                    )}
                    <button
                      type="button"
                      className={`wsb-data-table-pagination__btn${num === safeCurrentPage ? ' wsb-data-table-pagination__btn--active' : ''}`}
                      aria-label={`Page ${num}`}
                      aria-current={num === safeCurrentPage ? 'page' : undefined}
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </button>
                  </span>
                );
              })}

              <button
                type="button"
                className="wsb-data-table-pagination__btn"
                disabled={safeCurrentPage >= totalPages}
                aria-label="Page suivante"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
