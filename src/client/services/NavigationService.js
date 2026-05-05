const SPA_ENDPOINT = 'x_wsb_flex_main.do';

const ROUTE_MAP = {
  search:       '',
  results:      'resultats',
  confirm:      'confirmation',
  reservations: 'mes-reservations',
  history:      'historique',
  edit:         'edition',
};

const RESULTS_REQUIRED_PARAMS = ['building', 'floor', 'date', 'type'];
const CONFIRM_REQUIRED_PARAMS = ['space_id', 'building', 'floor', 'date', 'type'];

export function buildPageUrl(page, params = {}) {
  const route = ROUTE_MAP[page];
  if (route === undefined) throw new Error(`Page inconnue : "${page}"`);

  const qs = new URLSearchParams();
  if (route) qs.set('route', route);

  for (const [key, val] of Object.entries(params)) {
    if (key === 'route') continue;
    if (val != null && val !== '') qs.set(key, val);
  }

  const qsStr = qs.toString();
  return qsStr ? `${SPA_ENDPOINT}?${qsStr}` : SPA_ENDPOINT;
}

export function parseQueryString(search) {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  if (!raw) return {};
  const params = {};
  for (const [key, value] of new URLSearchParams(raw)) {
    params[key] = value;
  }
  return params;
}

export function getCurrentParams() {
  if (typeof window === 'undefined') return {};
  return parseQueryString(window.location.search);
}

export function resolveRoute(routeParam) {
  const val = (routeParam || '').trim();
  if (!val) return 'search';
  for (const [key, mapVal] of Object.entries(ROUTE_MAP)) {
    if (mapVal === val) return key;
  }
  return null;
}

export function navigateTo(page, params = {}) {
  window.location.href = buildPageUrl(page, params);
}

export function guardResultsPage() {
  const params = getCurrentParams();
  const missing = RESULTS_REQUIRED_PARAMS.filter((k) => !params[k]);
  if (missing.length > 0) {
    navigateTo('search');
    return { valid: false, missing, params: {} };
  }
  return { valid: true, missing: [], params };
}

export function guardConfirmPage() {
  const params = getCurrentParams();
  const missing = CONFIRM_REQUIRED_PARAMS.filter((k) => !params[k]);
  if (missing.length > 0) {
    navigateTo('search');
    return { valid: false, missing, params: {} };
  }
  return { valid: true, missing: [], params };
}

export function guardEditPage() {
  const params = getCurrentParams();
  if (!params.sys_id) {
    navigateTo('reservations');
    return { valid: false, params: {} };
  }
  return { valid: true, params };
}

export function isKnownRoute(routeParam) {
  if (!routeParam) return true;
  return Object.values(ROUTE_MAP).includes(routeParam);
}

export function getSearchUrl() {
  return buildPageUrl('search');
}

export { ROUTE_MAP, RESULTS_REQUIRED_PARAMS };
