import { jest } from '@jest/globals';
import {
  buildPageUrl,
  parseQueryString,
  getCurrentParams,
  navigateTo,
  guardResultsPage,
  guardEditPage,
  isKnownRoute,
  getSearchUrl,
  resolveRoute,
  ROUTE_MAP,
  RESULTS_REQUIRED_PARAMS,
} from '../NavigationService.js';

describe('ROUTE_MAP — constantes', () => {
  test('contient les 5 pages attendues', () => {
    expect(Object.keys(ROUTE_MAP)).toEqual(
      ['search', 'results', 'reservations', 'history', 'edit']
    );
  });

  test('search mappe vers une chaîne vide (route par défaut)', () => {
    expect(ROUTE_MAP.search).toBe('');
  });

  test('les routes non-search sont des slugs non vides', () => {
    const { search: _s, ...rest } = ROUTE_MAP;
    Object.values(rest).forEach((v) => {
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(0);
    });
  });
});

describe('buildPageUrl', () => {
  test('retourne le SPA endpoint sans qs pour search', () => {
    expect(buildPageUrl('search')).toBe('x_wsb_flex_main.do');
  });

  test('ajoute ?route=mes-reservations pour reservations', () => {
    expect(buildPageUrl('reservations')).toBe(
      'x_wsb_flex_main.do?route=mes-reservations'
    );
  });

  test('ajoute ?route=historique pour history', () => {
    expect(buildPageUrl('history')).toBe(
      'x_wsb_flex_main.do?route=historique'
    );
  });

  test('ajoute ?route=edition pour edit', () => {
    expect(buildPageUrl('edit')).toBe(
      'x_wsb_flex_main.do?route=edition'
    );
  });

  test('ajoute les params supplémentaires après route', () => {
    const url = buildPageUrl('results', { type: 'openspace', date: '2026-05-10' });
    expect(url).toBe(
      'x_wsb_flex_main.do?route=resultats&type=openspace&date=2026-05-10'
    );
  });

  test('ignore les params null ou vides', () => {
    const url = buildPageUrl('results', { type: 'bureau', floor: null, zone: '' });
    expect(url).toBe('x_wsb_flex_main.do?route=resultats&type=bureau');
  });

  test('génère l\'URL edit avec sys_id', () => {
    const url = buildPageUrl('edit', { sys_id: 'abc123' });
    expect(url).toBe('x_wsb_flex_main.do?route=edition&sys_id=abc123');
  });

  test('lance une erreur pour une page inconnue', () => {
    expect(() => buildPageUrl('unknown')).toThrow('Page inconnue');
  });
});

describe('parseQueryString', () => {
  test('parse une query string avec ?', () => {
    expect(parseQueryString('?type=bureau&date=2026-05-01')).toEqual({
      type: 'bureau',
      date: '2026-05-01',
    });
  });

  test('parse une query string sans ?', () => {
    expect(parseQueryString('type=bureau')).toEqual({ type: 'bureau' });
  });

  test('retourne un objet vide pour une chaîne vide', () => {
    expect(parseQueryString('')).toEqual({});
  });

  test('retourne un objet vide pour "?"', () => {
    expect(parseQueryString('?')).toEqual({});
  });
});

describe('getCurrentParams', () => {
  const original = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: original, writable: true });
  });

  test('retourne les params de window.location.search', () => {
    Object.defineProperty(window, 'location', {
      value: { ...original, search: '?route=mes-reservations&building=A' },
      writable: true,
    });
    expect(getCurrentParams()).toEqual({ route: 'mes-reservations', building: 'A' });
  });

  test('retourne {} quand pas de query string', () => {
    Object.defineProperty(window, 'location', {
      value: { ...original, search: '' },
      writable: true,
    });
    expect(getCurrentParams()).toEqual({});
  });
});

describe('resolveRoute', () => {
  test('retourne "search" pour une valeur vide', () => {
    expect(resolveRoute('')).toBe('search');
    expect(resolveRoute(undefined)).toBe('search');
    expect(resolveRoute(null)).toBe('search');
  });

  test('retourne "reservations" pour "mes-reservations"', () => {
    expect(resolveRoute('mes-reservations')).toBe('reservations');
  });

  test('retourne "results" pour "resultats"', () => {
    expect(resolveRoute('resultats')).toBe('results');
  });

  test('retourne "history" pour "historique"', () => {
    expect(resolveRoute('historique')).toBe('history');
  });

  test('retourne "edit" pour "edition"', () => {
    expect(resolveRoute('edition')).toBe('edit');
  });

  test('retourne null pour une route inconnue', () => {
    expect(resolveRoute('xyz-inconnu')).toBeNull();
    expect(resolveRoute('foo')).toBeNull();
  });
});

describe('navigateTo', () => {
  let hrefSetter;

  beforeEach(() => {
    hrefSetter = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => '',
    });
  });

  test('redirige vers le SPA endpoint pour search', () => {
    navigateTo('search');
    expect(hrefSetter).toHaveBeenCalledWith('x_wsb_flex_main.do');
  });

  test('redirige avec route et params', () => {
    navigateTo('results', { type: 'bureau', date: '2026-05-01' });
    expect(hrefSetter).toHaveBeenCalledWith(
      'x_wsb_flex_main.do?route=resultats&type=bureau&date=2026-05-01'
    );
  });

  test('redirige vers mes-reservations', () => {
    navigateTo('reservations');
    expect(hrefSetter).toHaveBeenCalledWith(
      'x_wsb_flex_main.do?route=mes-reservations'
    );
  });
});

describe('guardResultsPage', () => {
  let hrefSetter;

  beforeEach(() => {
    hrefSetter = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { search: '', href: '' },
      writable: true,
    });
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => '',
    });
  });

  test('redirige vers search si type manquant', () => {
    window.location.search = '?building=A&floor=3&date=2026-05-01';
    const result = guardResultsPage();
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('type');
    expect(hrefSetter).toHaveBeenCalledWith('x_wsb_flex_main.do');
  });

  test('redirige vers search si date manquante', () => {
    window.location.search = '?building=A&floor=3&type=bureau';
    const result = guardResultsPage();
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('date');
  });

  test('redirige vers search si building manquant', () => {
    window.location.search = '?floor=3&date=2026-05-01&type=bureau';
    const result = guardResultsPage();
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('building');
  });

  test('redirige vers search si floor manquant', () => {
    window.location.search = '?building=A&date=2026-05-01&type=bureau';
    const result = guardResultsPage();
    expect(result.valid).toBe(false);
    expect(result.missing).toContain('floor');
  });

  test('redirige vers search si aucun param', () => {
    window.location.search = '';
    const result = guardResultsPage();
    expect(result.valid).toBe(false);
    expect(result.missing).toEqual(RESULTS_REQUIRED_PARAMS);
  });

  test('retourne valid=true si les 4 params requis sont présents', () => {
    window.location.search = '?route=resultats&building=A&floor=3&date=2026-05-01&type=openspace';
    const result = guardResultsPage();
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
    expect(hrefSetter).not.toHaveBeenCalled();
  });
});

describe('guardEditPage', () => {
  let hrefSetter;

  beforeEach(() => {
    hrefSetter = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { search: '', href: '' },
      writable: true,
    });
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => '',
    });
  });

  test('redirige vers reservations si sys_id manquant', () => {
    window.location.search = '';
    const result = guardEditPage();
    expect(result.valid).toBe(false);
    expect(hrefSetter).toHaveBeenCalledWith(
      'x_wsb_flex_main.do?route=mes-reservations'
    );
  });

  test('retourne valid=true si sys_id présent', () => {
    window.location.search = '?route=edition&sys_id=abc123';
    const result = guardEditPage();
    expect(result.valid).toBe(true);
    expect(result.params.sys_id).toBe('abc123');
    expect(hrefSetter).not.toHaveBeenCalled();
  });
});

describe('isKnownRoute', () => {
  test('reconnaît les slugs valides', () => {
    expect(isKnownRoute('mes-reservations')).toBe(true);
    expect(isKnownRoute('resultats')).toBe(true);
    expect(isKnownRoute('historique')).toBe(true);
    expect(isKnownRoute('edition')).toBe(true);
  });

  test('reconnaît la route search (chaîne vide ou absent)', () => {
    expect(isKnownRoute('')).toBe(true);
    expect(isKnownRoute(undefined)).toBe(true);
  });

  test('rejette les slugs inconnus', () => {
    expect(isKnownRoute('xyz-inconnu')).toBe(false);
    expect(isKnownRoute('other_page')).toBe(false);
  });
});

describe('getSearchUrl', () => {
  test('retourne le SPA endpoint sans route', () => {
    expect(getSearchUrl()).toBe('x_wsb_flex_main.do');
  });
});
