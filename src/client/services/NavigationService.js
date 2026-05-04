const PAGES = {
  search:       'x_wsb_flexoffice_search',
  results:      'x_wsb_flexoffice_results',
  confirm:      'x_wsb_flexoffice_confirm',
  reservations: 'x_wsb_flexoffice_reservations',
  history:      'x_wsb_flexoffice_history',
  edit:         'x_wsb_flexoffice_edit',
};

const RESULTS_REQUIRED_PARAMS = ['building', 'floor', 'date', 'type'];

export function buildPageUrl(page, params = {}) {
  const pageName = PAGES[page];
  if (!pageName) throw new Error(`Page inconnue : "${page}"`);

  const base = `${pageName}.do`;
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  if (entries.length === 0) return base;

  const qs = new URLSearchParams(entries).toString();
  return `${base}?${qs}`;
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

export function navigateTo(page, params = {}) {
  const url = buildPageUrl(page, params);
  window.location.href = url;
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

export function guardEditPage() {
  const params = getCurrentParams();

  if (!params.sys_id) {
    navigateTo('reservations');
    return { valid: false, params: {} };
  }

  return { valid: true, params };
}

export function isKnownPage(endpoint) {
  const name = endpoint.replace(/\.do$/, '');
  return Object.values(PAGES).includes(name);
}

export function getSearchUrl() {
  return buildPageUrl('search');
}

export { PAGES, RESULTS_REQUIRED_PARAMS };
