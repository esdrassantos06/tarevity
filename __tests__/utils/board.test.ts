import { describe, it, expect } from 'vitest';
import { daysUntil, formNumber, groupByStatus } from '@/utils/board';

describe('groupByStatus', () => {
  it('returns one bucket per status in board order, even when empty', () => {
    const result = groupByStatus([]);
    expect(Object.keys(result)).toEqual(['ACTIVE', 'REVIEW', 'COMPLETED']);
    expect(result.ACTIVE).toEqual([]);
  });

  it('places each task in the bucket of its status and keeps input order', () => {
    const tasks = [
      { id: 'a', status: 'REVIEW' as const },
      { id: 'b', status: 'ACTIVE' as const },
      { id: 'c', status: 'REVIEW' as const },
      { id: 'd', status: 'COMPLETED' as const },
    ];
    const result = groupByStatus(tasks);
    expect(result.ACTIVE.map((t) => t.id)).toEqual(['b']);
    expect(result.REVIEW.map((t) => t.id)).toEqual(['a', 'c']);
    expect(result.COMPLETED.map((t) => t.id)).toEqual(['d']);
  });
});

describe('daysUntil', () => {
  const now = new Date('2026-10-15T18:30:00');

  it('returns null without a due date', () => {
    expect(daysUntil(null, now)).toBeNull();
  });

  it('counts calendar days, ignoring the time of day', () => {
    expect(daysUntil(new Date('2026-10-15T08:00:00'), now)).toBe(0);
    expect(daysUntil(new Date('2026-10-16T00:30:00'), now)).toBe(1);
    expect(daysUntil(new Date('2026-10-18T23:00:00'), now)).toBe(3);
  });

  it('is negative when overdue', () => {
    expect(daysUntil(new Date('2026-10-13T23:59:00'), now)).toBe(-2);
  });

  it('accepts ISO strings', () => {
    expect(daysUntil('2026-10-20T12:00:00', now)).toBe(5);
  });
});

describe('formNumber', () => {
  it('uses the last six characters of the id, uppercased', () => {
    expect(formNumber('cmabc123xyz9k')).toBe('3XYZ9K');
  });

  it('pads short ids', () => {
    expect(formNumber('t1')).toBe('0000T1');
  });
});
