import { describe, it, expect, beforeEach } from 'vitest';
import { clearUserDrafts, draftKey, loadDraft, saveDraft } from '@/lib/drafts';

const defaults = { title: '', description: '', priority: 'MEDIUM' };

/** In-memory Storage so tests do not depend on the environment's localStorage. */
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    key: (i: number) => [...map.keys()][i] ?? null,
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
  };
}

let store: Storage;

describe('draftKey', () => {
  it('scopes drafts by user and form', () => {
    expect(draftKey('u1', 'new')).toBe('tarevity:draft:u1:new');
    expect(draftKey('u1', 'edit:t9')).toBe('tarevity:draft:u1:edit:t9');
  });
});

describe('saveDraft / loadDraft', () => {
  beforeEach(() => {
    store = memoryStorage();
  });

  it('round-trips the form values', () => {
    const key = draftKey('u1', 'new');
    saveDraft(key, { ...defaults, title: 'Pagar renda' }, defaults, store);
    expect(loadDraft(key, store)).toEqual({
      ...defaults,
      title: 'Pagar renda',
    });
  });

  it('removes the draft when values are back to the defaults', () => {
    const key = draftKey('u1', 'new');
    saveDraft(key, { ...defaults, title: 'x' }, defaults, store);
    saveDraft(key, { ...defaults }, defaults, store);
    expect(store.getItem(key)).toBeNull();
    expect(loadDraft(key, store)).toBeNull();
  });

  it('ignores whitespace-only edits', () => {
    const key = draftKey('u1', 'new');
    saveDraft(key, { ...defaults, title: '   ' }, defaults, store);
    expect(loadDraft(key, store)).toBeNull();
  });

  it('returns null for corrupt or missing entries', () => {
    store.setItem('tarevity:draft:u1:new', '{not json');
    expect(loadDraft('tarevity:draft:u1:new', store)).toBeNull();
    expect(loadDraft('tarevity:draft:u1:missing', store)).toBeNull();
  });

  it('does not leak drafts between users', () => {
    saveDraft(
      draftKey('u1', 'new'),
      { ...defaults, title: 'a' },
      defaults,
      store,
    );
    expect(loadDraft(draftKey('u2', 'new'), store)).toBeNull();
  });

  it('survives a storage that throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
      removeItem: () => {
        throw new Error('denied');
      },
      key: () => null,
      length: 0,
      clear: () => {},
    } as Storage;
    expect(() =>
      saveDraft('k', { ...defaults, title: 'a' }, defaults, broken),
    ).not.toThrow();
    expect(loadDraft('k', broken)).toBeNull();
  });
});

describe('clearUserDrafts', () => {
  beforeEach(() => {
    store = memoryStorage();
  });

  it('removes every draft of one user and keeps the others', () => {
    saveDraft(
      draftKey('u1', 'new'),
      { ...defaults, title: 'a' },
      defaults,
      store,
    );
    saveDraft(
      draftKey('u1', 'edit:t1'),
      { ...defaults, title: 'b' },
      defaults,
      store,
    );
    saveDraft(
      draftKey('u2', 'new'),
      { ...defaults, title: 'c' },
      defaults,
      store,
    );
    store.setItem('theme', 'dark');

    clearUserDrafts('u1', store);

    expect(loadDraft(draftKey('u1', 'new'), store)).toBeNull();
    expect(loadDraft(draftKey('u1', 'edit:t1'), store)).toBeNull();
    expect(loadDraft(draftKey('u2', 'new'), store)).not.toBeNull();
    expect(store.getItem('theme')).toBe('dark');
  });
});
