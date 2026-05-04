export function getNextBusinessDay(from = new Date()) {
  const next = new Date(from);
  next.setDate(next.getDate() + 1);
  const day = next.getDay();
  if (day === 6) next.setDate(next.getDate() + 2);
  if (day === 0) next.setDate(next.getDate() + 1);
  return next;
}

export function isWeekend(dateString) {
  const [y, m, d] = dateString.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
}

export function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTomorrowISO() {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return formatDateISO(t);
}
