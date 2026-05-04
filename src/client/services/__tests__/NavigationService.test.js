import { jest } from '@jest/globals';
import {
  buildPageUrl,
  parseQueryString,
  getCurrentParams,
  navigateTo,
  guardResultsPage,
  guardEditPage,
  isKnownPage,
  getSearchUrl,
  PAGES,
  RESULTS_REQUIRED_PARAMS,
} from '../NavigationService.js';

describe('PAGES — constantes', () => {
  test('contient les 5 pages attendues', () => {
    expect(Object.keys(PAGES)).toEqual(['search', 'results', 'reservations', 'history', 'edit']);
  });

  test('chaque page est préfixée x_wsb_flex_', () => {
    Object.values(PAGES).forEach((v) => {
      expect(v).toMatch(/^x_wsb_flex_/);
    });
  });
});

describe('buildPageUrl', () => {
  test('retourne page.do sans params', () => {
    expect(buildPageUrl('search')).toBe('x_wsb_flex_search.do');
  });

  test('ajoute les query params', () => {
    const url = buildPageUrl('results', { type: 'bureau', date: '2026-05-01' });
    expect(url).toBe('x_wsb_flex_results.do?type=bureau&date=2026-05-01');
  });

  test('ignore les params null ou vides', () => {
    const url = buildPageUrl('results', { type: 'bureau', floor: null, zone: '' });
    expect(url).toBe('x_wsb_flex_results.do?type=bureau');
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
      value: { ...original, search: '?type=bureau&date=2026-05-01' },
      writable: true,
    });
    expect(getCurrentParams()).toEqual({ type: 'bureau', date: '2026-05-01' });
  });

  test('retourne {} quand pas de query string', () => {
    Object.defineProperty(window, 'location', {
      value: { ...original, search: '' },
      writable: true,
    });
    expect(getCurrentParams()).toEqual({});
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

  test('redirige vers la bonne URL', () => {
    navigateTo('search');
    expect(hrefSetter).toHaveBeenCalledWith('x_wsb_flex_search.do');
  });

  test('redirige avec des params', () => {
    navigateTo('results', { type: 'bureau', date: '2026-05-01' });
    expect(hrefSetter).toHaveBeenCalledWith('x_wsb_flex_results.do?type=bureau&date=2026-05-01');
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
    expect(hrefSetter).toHaveBeenCalledWith('x_wsb_flex_search.do');
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
    window.location.search = '?building=A&floor=3&date=2026-05-01&type=openspace-classique';
    const result = guardResultsPage();
    expect(result.valid).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.params).toEqual({ building: 'A', floor: '3', date: '2026-05-01', type: 'openspace-classique' });
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
    expect(hrefSetter).toHaveBeenCalledWith('x_wsb_flex_reservations.do');
  });

  test('retourne valid=true si sys_id présent', () => {
    window.location.search = '?sys_id=abc123';
    const result = guardEditPage();
    expect(result.valid).toBe(true);
    expect(result.params).toEqual({ sys_id: 'abc123' });
    expect(hrefSetter).not.toHaveBeenCalled();
  });
});

describe('isKnownPage', () => {
  test('reconnaît les pages du scope avec .do', () => {
    expect(isKnownPage('x_wsb_flex_search.do')).toBe(true);
    expect(isKnownPage('x_wsb_flex_results.do')).toBe(true);
    expect(isKnownPage('x_wsb_flex_reservations.do')).toBe(true);
    expect(isKnownPage('x_wsb_flex_history.do')).toBe(true);
    expect(isKnownPage('x_wsb_flex_edit.do')).toBe(true);
  });

  test('reconnaît les pages du scope sans .do', () => {
    expect(isKnownPage('x_wsb_flex_search')).toBe(true);
  });

  test('rejette une page inconnue', () => {
    expect(isKnownPage('x_wsb_flex_unknown.do')).toBe(false);
    expect(isKnownPage('other_page.do')).toBe(false);
  });
});

describe('getSearchUrl', () => {
  test('retourne l\'URL de la page search', () => {
    expect(getSearchUrl()).toBe('x_wsb_flex_search.do');
  });
});
