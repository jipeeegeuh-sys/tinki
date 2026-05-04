import {
  getNextBusinessDay,
  isWeekend,
  formatDateISO,
  getTomorrowISO,
} from '../dateUtils.js';

describe('formatDateISO', () => {
  test('formate une date en YYYY-MM-DD', () => {
    expect(formatDateISO(new Date(2026, 4, 5))).toBe('2026-05-05');
  });

  test('ajoute des zéros de padding', () => {
    expect(formatDateISO(new Date(2026, 0, 3))).toBe('2026-01-03');
  });
});

describe('isWeekend', () => {
  test('samedi est un weekend', () => {
    expect(isWeekend('2026-05-09')).toBe(true);
  });

  test('dimanche est un weekend', () => {
    expect(isWeekend('2026-05-10')).toBe(true);
  });

  test('lundi n\'est pas un weekend', () => {
    expect(isWeekend('2026-05-11')).toBe(false);
  });

  test('vendredi n\'est pas un weekend', () => {
    expect(isWeekend('2026-05-08')).toBe(false);
  });

  test('mercredi n\'est pas un weekend', () => {
    expect(isWeekend('2026-05-06')).toBe(false);
  });
});

describe('getNextBusinessDay', () => {
  test('mardi → mercredi (jour ouvré)', () => {
    const result = getNextBusinessDay(new Date(2026, 4, 5));
    expect(formatDateISO(result)).toBe('2026-05-06');
  });

  test('vendredi → lundi (saute le weekend)', () => {
    const result = getNextBusinessDay(new Date(2026, 4, 8));
    expect(formatDateISO(result)).toBe('2026-05-11');
  });

  test('samedi → lundi (J+1 = dimanche, saute au lundi)', () => {
    const result = getNextBusinessDay(new Date(2026, 4, 9));
    expect(formatDateISO(result)).toBe('2026-05-11');
  });

  test('dimanche → lundi', () => {
    const result = getNextBusinessDay(new Date(2026, 4, 10));
    expect(formatDateISO(result)).toBe('2026-05-11');
  });

  test('lundi → mardi', () => {
    const result = getNextBusinessDay(new Date(2026, 4, 4));
    expect(formatDateISO(result)).toBe('2026-05-05');
  });

  test('jeudi → vendredi', () => {
    const result = getNextBusinessDay(new Date(2026, 4, 7));
    expect(formatDateISO(result)).toBe('2026-05-08');
  });
});

describe('getTomorrowISO', () => {
  test('retourne une date au format YYYY-MM-DD', () => {
    expect(getTomorrowISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('retourne une date dans le futur', () => {
    const tomorrow = new Date(getTomorrowISO() + 'T12:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(tomorrow.getTime()).toBeGreaterThan(today.getTime());
  });
});
