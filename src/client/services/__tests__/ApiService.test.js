import { jest } from '@jest/globals';
import { fetchJson, ApiError, getSpaces, getRequests, getRequestItems, getRecord, updateRecord, createRecord } from '../ApiService.js';

const TOKEN = 'fake-g_ck-token';

beforeAll(() => {
  window.g_ck = TOKEN;
});

afterAll(() => {
  delete window.g_ck;
});

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

function mockFetch(status, body, ok = status >= 200 && status < 300) {
  global.fetch.mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
  });
}

describe('fetchJson — headers & auth', () => {
  test('envoie X-UserToken, Accept et Content-Type', async () => {
    mockFetch(200, { result: [] });
    await fetchJson('x_wsb_flex_space');

    const [, opts] = global.fetch.mock.calls[0];
    expect(opts.headers['X-UserToken']).toBe(TOKEN);
    expect(opts.headers['Accept']).toBe('application/json');
    expect(opts.headers['Content-Type']).toBe('application/json');
  });

  test('utilise GET par défaut', async () => {
    mockFetch(200, { result: [] });
    await fetchJson('x_wsb_flex_space');
    expect(global.fetch.mock.calls[0][1].method).toBe('GET');
  });

  test('construit l\'URL avec BASE_URL pour un endpoint relatif', async () => {
    mockFetch(200, { result: [] });
    await fetchJson('x_wsb_flex_space');
    expect(global.fetch.mock.calls[0][0]).toBe('/api/now/table/x_wsb_flex_space');
  });

  test('conserve une URL absolue telle quelle', async () => {
    mockFetch(200, { result: [] });
    await fetchJson('https://custom.api/endpoint');
    expect(global.fetch.mock.calls[0][0]).toBe('https://custom.api/endpoint');
  });
});

describe('fetchJson — query params', () => {
  test('ajoute les params en query string', async () => {
    mockFetch(200, { result: [] });
    await fetchJson('x_wsb_flex_space', { params: { sysparm_limit: '10', type: 'bureau' } });
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain('sysparm_limit=10');
    expect(url).toContain('type=bureau');
  });
});

describe('fetchJson — body', () => {
  test('envoie le body JSON pour POST', async () => {
    mockFetch(201, { result: { sys_id: 'abc' } });
    await fetchJson('sc_request', { method: 'POST', body: { name: 'test' } });
    const opts = global.fetch.mock.calls[0][1];
    expect(opts.body).toBe(JSON.stringify({ name: 'test' }));
  });

  test('n\'envoie pas de body pour GET', async () => {
    mockFetch(200, { result: [] });
    await fetchJson('x_wsb_flex_space');
    expect(global.fetch.mock.calls[0][1].body).toBeUndefined();
  });
});

describe('fetchJson — response parsing', () => {
  test('retourne result quand présent', async () => {
    mockFetch(200, { result: [{ sys_id: '1' }] });
    const data = await fetchJson('x_wsb_flex_space');
    expect(data).toEqual([{ sys_id: '1' }]);
  });

  test('retourne le json complet si pas de clé result', async () => {
    mockFetch(200, { stats: { count: 42 } });
    const data = await fetchJson('x_wsb_flex_space');
    expect(data).toEqual({ stats: { count: 42 } });
  });
});

describe('fetchJson — error handling', () => {
  test('lance ApiError sur 401', async () => {
    mockFetch(401, { error: { message: 'Unauthorized' } }, false);
    await expect(fetchJson('x_wsb_flex_space')).rejects.toThrow(ApiError);
    try {
      await fetchJson('x_wsb_flex_space');
    } catch (e) {
      expect(e.status).toBe(401);
    }
  });

  test('lance ApiError sur 403', async () => {
    mockFetch(403, { error: { message: 'Forbidden' } }, false);
    await expect(fetchJson('x_wsb_flex_space')).rejects.toThrow(ApiError);
  });

  test('lance ApiError sur 500', async () => {
    mockFetch(500, { error: { message: 'Internal' } }, false);
    await expect(fetchJson('x_wsb_flex_space')).rejects.toThrow(ApiError);
  });

  test('ApiError contient le body parsé', async () => {
    const errBody = { error: { message: 'Not Found' } };
    mockFetch(404, errBody, false);
    try {
      await fetchJson('x_wsb_flex_space');
    } catch (e) {
      expect(e.body).toEqual(errBody);
    }
  });

  test('ApiError gère un body non-JSON', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: () => Promise.reject(new Error('not json')),
    });
    try {
      await fetchJson('x_wsb_flex_space');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect(e.status).toBe(502);
      expect(e.body).toBeNull();
    }
  });
});

describe('fetchJson — timeout (AbortController)', () => {
  test('lance ApiError avec status "timeout" sur abort', async () => {
    global.fetch.mockImplementation(() => {
      const abortErr = new DOMException('The operation was aborted.', 'AbortError');
      return Promise.reject(abortErr);
    });

    await expect(fetchJson('x_wsb_flex_space', { timeout: 1 })).rejects.toThrow(ApiError);

    try {
      await fetchJson('x_wsb_flex_space', { timeout: 1 });
    } catch (e) {
      expect(e.status).toBe('timeout');
    }
  });

  test('passe le signal AbortController au fetch', async () => {
    mockFetch(200, { result: [] });
    await fetchJson('x_wsb_flex_space');
    const opts = global.fetch.mock.calls[0][1];
    expect(opts.signal).toBeInstanceOf(AbortSignal);
  });
});

describe('fetchJson — re-throws non-ApiError', () => {
  test('propage une erreur réseau brute', async () => {
    global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchJson('x_wsb_flex_space')).rejects.toThrow(TypeError);
  });
});

describe('helper shortcuts', () => {
  beforeEach(() => {
    mockFetch(200, { result: [] });
  });

  test('getSpaces appelle x_wsb_flex_space', async () => {
    await getSpaces({ type: 'bureau' });
    expect(global.fetch.mock.calls[0][0]).toContain('x_wsb_flex_space');
  });

  test('getRequests appelle sc_request', async () => {
    await getRequests();
    expect(global.fetch.mock.calls[0][0]).toContain('sc_request');
  });

  test('getRequestItems appelle sc_req_item', async () => {
    await getRequestItems();
    expect(global.fetch.mock.calls[0][0]).toContain('sc_req_item');
  });

  test('getRecord appelle table/sysId', async () => {
    await getRecord('sc_request', 'abc123');
    expect(global.fetch.mock.calls[0][0]).toContain('sc_request/abc123');
  });

  test('updateRecord utilise PATCH', async () => {
    await updateRecord('sc_request', 'abc123', { state: 'closed' });
    expect(global.fetch.mock.calls[0][1].method).toBe('PATCH');
  });

  test('createRecord utilise POST', async () => {
    await createRecord('sc_request', { name: 'new' });
    expect(global.fetch.mock.calls[0][1].method).toBe('POST');
  });
});
