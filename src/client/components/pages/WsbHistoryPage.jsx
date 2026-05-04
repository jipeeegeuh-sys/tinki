import { useState, useEffect, useCallback, Fragment } from 'react';
import { fetchTablePage } from '../../services/ApiService.js';
import './WsbHistoryPage.css';

const PAGE_SIZE = 20;

const TYPE_CFG = {
  'openspace-classique':  { label: 'Open Space',    bg: 'rgba(0,200,83,0.15)',   text: '#00C853', border: 'rgba(0,200,83,0.3)' },
  'openspace-specialise': { label: 'Openspace spé.', bg: 'rgba(0,200,83,0.15)',  text: '#00C853', border: 'rgba(0,200,83,0.3)' },
  'bureau':               { label: 'Bureau',         bg: 'rgba(161,0,255,0.15)', text: '#c266ff', border: 'rgba(161,0,255,0.3)' },
  'phonebox':             { label: 'Phonebox',        bg: 'rgba(0,145,234,0.15)', text: '#0091EA', border: 'rgba(0,145,234,0.3)' },
  'meetingroom':          { label: 'Meeting Room',    bg: 'rgba(255,152,0,0.15)', text: '#FF9800', border: 'rgba(255,152,0,0.3)' },
  'parking-electrique':   { label: 'Parking Él.',    bg: 'rgba(0,200,83,0.15)',  text: '#00C853', border: 'rgba(0,200,83,0.3)', electric: true },
  'parking-thermique':    { label: 'Parking',         bg: 'rgba(84,110,122,0.15)', text: '#90A4AE', border: 'rgba(84,110,122,0.3)' },
};
const DEFAULT_TYPE = { label: 'Espace', bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.7)', border: 'rgba(255,255,255,0.15)' };

const STATE_MAP = { 3: 'terminee', 4: 'terminee', 6: 'annulee' };
const MONTH_ABBR = ['JANV', 'FÉVR', 'MARS', 'AVRI', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV', 'DÉC'];

function getMonthLabel(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(dtStr) {
  if (!dtStr || dtStr.length < 16) return '--:--';
  return dtStr.slice(11, 16);
}

function calcDuration(start, end) {
  if (!start || !end || start === '--:--' || end === '--:--') return '—';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return '—';
  return `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, '0')}`;
}

function parseItem(raw) {
  let extra = {};
  try { extra = JSON.parse(raw.short_description); } catch { /* text fallback */ }
  const state = parseInt(raw.state, 10);
  const start = extra.start || formatTime(raw.opened_at);
  const end   = extra.end   || formatTime(raw.closed_at);
  return {
    sysId:     raw.sys_id,
    spaceId:   extra.spaceId || raw.number || '—',
    type:      extra.type || 'bureau',
    floor:     extra.floor || '—',
    date:      extra.date  || raw.opened_at?.slice(0, 10) || '—',
    start,
    end,
    duration:  calcDuration(start, end),
    state,
    closedAt:  state === 6 ? raw.closed_at?.slice(0, 10) || null : null,
  };
}

function groupByMonth(items) {
  const groups = [];
  let cur = null;
  for (const item of items) {
    const label = getMonthLabel(item.date);
    if (!cur || cur.label !== label) { cur = { label, rows: [] }; groups.push(cur); }
    cur.rows.push(item);
  }
  return groups;
}

const LightningIcon = () => (
  <svg width="10" height="13" viewBox="0 0 11 14" fill="none" aria-hidden="true">
    <path d="M6.5 1L1 8h4L3.5 13 10 6H6L6.5 1z" fill="#FFA500" stroke="#FFA500" strokeWidth="0.4" strokeLinejoin="round" />
  </svg>
);

function SkeletonRow() {
  return (
    <tr className="wsb-history__skeleton-row" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <td key={i}><span className="wsb-skeleton wsb-skeleton--line" style={{ width: `${50 + (i * 13) % 40}%` }} /></td>
      ))}
    </tr>
  );
}

function HistoryRow({ item }) {
  const cfg = TYPE_CFG[item.type] ?? DEFAULT_TYPE;
  const cls = STATE_MAP[item.state] ?? 'terminee';
  return (
    <tr className="wsb-history__row">
      <td><span className="wsb-history__space-id">{item.spaceId}</span></td>
      <td>
        <span className="wsb-history__type-badge" style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
          {cfg.electric && <LightningIcon />}{cfg.label}
        </span>
      </td>
      <td className="wsb-history__cell--muted">{item.floor}</td>
      <td className="wsb-history__cell--muted">{formatDate(item.date)}</td>
      <td className="wsb-history__cell--mono">{item.start} → {item.end}</td>
      <td className="wsb-history__cell--muted">{item.duration}</td>
      <td>
        <span className={`wsb-history__status wsb-history__status--${cls}`}>
          <span className="wsb-history__status-dot" />
          {cls === 'annulee' ? 'Annulée' : 'Terminée'}
        </span>
      </td>
      <td className="wsb-history__cell--muted wsb-history__cell--cancelled">
        {item.closedAt ? formatDate(item.closedAt) : <span className="wsb-history__dash">—</span>}
      </td>
    </tr>
  );
}

export function WsbHistoryPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [status, setStatus] = useState('loading');

  const fetchItems = useCallback(async (pageOffset) => {
    setStatus('loading');
    try {
      const { items: raw, total: count } = await fetchTablePage('sc_req_item', {
        sysparm_query: 'opened_by=javascript:gs.getUserID()^stateIN3,4,6',
        sysparm_fields: 'sys_id,number,short_description,state,opened_at,closed_at,cat_item',
        sysparm_orderby: 'opened_at',
        sysparm_order: 'DESC',
        sysparm_limit: PAGE_SIZE,
        sysparm_offset: pageOffset,
      });
      setItems(raw.map(parseItem));
      setTotal(count);
      setStatus(raw.length === 0 ? 'empty' : 'success');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { fetchItems(offset); }, [fetchItems, offset]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + PAGE_SIZE, total);
  const groups = groupByMonth(items);

  return (
    <div className="wsb-history">
      <div className="wsb-history__header">
        <span className="wsb-history__badge">HISTORIQUE</span>
        <h1 className="wsb-history__title">Historique de mes réservations</h1>
        <p className="wsb-history__subtitle">Retrouvez l'ensemble de vos réservations passées et annulées.</p>
      </div>

      <div className="wsb-history__filters" role="search" aria-label="Filtrer l'historique">
        <span className="wsb-history__filter-label">Filtrer par :</span>
        <select className="wsb-history__filter-select" aria-label="Statut"><option>Statut</option><option>Terminée</option><option>Annulée</option></select>
        <select className="wsb-history__filter-select" aria-label="Type"><option>Type</option><option>Open Space</option><option>Phonebox</option><option>Parking Él.</option></select>
        <select className="wsb-history__filter-select" aria-label="Bâtiment"><option>Bâtiment</option><option>A</option><option>B</option></select>
        <select className="wsb-history__filter-select" aria-label="Année"><option>Année</option><option>2026</option><option>2025</option></select>
      </div>

      <section className="wsb-history__section" aria-live="polite" aria-busy={status === 'loading'}>
        <div className="wsb-history__section-header">
          <h2 className="wsb-history__section-title">Historique complet</h2>
          {status === 'success' && <span className="wsb-history__count-badge">{total}</span>}
        </div>

        <div className="wsb-history__table-wrap">
          <table className="wsb-history__table" aria-label="Historique des réservations">
            <thead>
              <tr>
                <th>N° PLACE</th><th>TYPE DE PLACE</th><th>ÉTAGE</th>
                <th>DATE</th><th>HORAIRES</th><th>DURÉE</th><th>STATUT</th><th>ANNULÉE LE</th>
              </tr>
            </thead>
            <tbody>
              {status === 'loading' && Array.from({ length: 6 }, (_, i) => <SkeletonRow key={i} />)}
              {status === 'success' && groups.map((g) => (
                <Fragment key={g.label}>
                  <tr className="wsb-history__month-row"><td colSpan={8}>{g.label}</td></tr>
                  {g.rows.map((item) => <HistoryRow key={item.sysId} item={item} />)}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {status === 'error' && (
          <p className="wsb-history__message wsb-history__message--error" role="alert">
            Une erreur est survenue.{' '}
            <button type="button" className="wsb-history__retry-btn" onClick={() => fetchItems(offset)}>Réessayer</button>
          </p>
        )}
        {status === 'empty' && (
          <p className="wsb-history__message" role="status">Aucune réservation dans votre historique.</p>
        )}

        {status === 'success' && (
          <div className="wsb-history__footer">
            <p className="wsb-history__counter">
              Affichage {from}–{to} sur {total} réservation{total !== 1 ? 's' : ''}
            </p>
            {totalPages > 1 && (
              <nav className="wsb-history__pagination" aria-label="Pagination de l'historique">
                <button
                  type="button"
                  className="wsb-history__page-btn"
                  onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                  disabled={currentPage === 1}
                  aria-label="Page précédente"
                  aria-disabled={currentPage === 1}
                >‹</button>
                <button
                  type="button"
                  className="wsb-history__page-btn"
                  onClick={() => setOffset((o) => o + PAGE_SIZE)}
                  disabled={currentPage === totalPages}
                  aria-label="Page suivante"
                  aria-disabled={currentPage === totalPages}
                >›</button>
              </nav>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
