const DEFAULT_TIMEOUT = 10_000;
const BASE_URL = '/api/now/table';

function getToken() {
  return typeof window !== 'undefined' && window.g_ck ? window.g_ck : '';
}

export class ApiError extends Error {
  constructor(status, statusText, body = null) {
    super(status === 'timeout' ? 'Request Timeout' : `HTTP ${status} — ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export async function fetchJson(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    params,
    timeout = DEFAULT_TIMEOUT,
  } = options;

  let url = endpoint.startsWith('http') || endpoint.startsWith('/')
    ? endpoint
    : `${BASE_URL}/${endpoint}`;

  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-UserToken': getToken(),
  };

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      let parsed = null;
      try { parsed = await res.json(); } catch { /* ignore */ }
      throw new ApiError(res.status, res.statusText, parsed);
    }

    const json = await res.json();
    return json.result !== undefined ? json.result : json;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('timeout', 'AbortController');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function getSpaces(params) {
  return fetchJson('x_wsb_flex_space', { params });
}

export function getRequests(params) {
  return fetchJson('sc_request', { params });
}

export function getRequestItems(params) {
  return fetchJson('sc_req_item', { params });
}

export function getRecord(table, sysId) {
  return fetchJson(`${table}/${sysId}`);
}

export function updateRecord(table, sysId, body) {
  return fetchJson(`${table}/${sysId}`, { method: 'PATCH', body });
}

export function createRecord(table, body) {
  return fetchJson(table, { method: 'POST', body });
}

export function getAvailableSpaces(params) {
  return fetchJson('/api/x_wsb/v1/spaces/available', { params });
}
