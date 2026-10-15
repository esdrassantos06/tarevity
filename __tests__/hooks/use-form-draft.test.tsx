import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { useFormDraft } from '@/hooks/use-form-draft';
import { draftKey } from '@/lib/drafts';

type Values = { title: string; priority: string };
const defaults: Values = { title: '', priority: 'MEDIUM' };

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

function setup(storage: Storage, userId: string | null = 'u1') {
  return renderHook(() => {
    const form = useForm<Values>({ defaultValues: defaults });
    const draft = useFormDraft({
      form,
      scope: 'new',
      userId: userId ?? undefined,
      delay: 500,
      storage,
    });
    return { form, draft };
  });
}

describe('useFormDraft', () => {
  let storage: Storage;

  beforeEach(() => {
    vi.useFakeTimers();
    storage = memoryStorage();
  });

  afterEach(() => vi.useRealTimers());

  it('saves only after the user stops typing for the delay', () => {
    const { result } = setup(storage);
    const key = draftKey('u1', 'new');

    act(() => result.current.form.setValue('title', 'Pag'));
    act(() => vi.advanceTimersByTime(300));
    act(() => result.current.form.setValue('title', 'Pagar renda'));
    act(() => vi.advanceTimersByTime(300));
    expect(storage.getItem(key)).toBeNull();

    act(() => vi.advanceTimersByTime(250));
    expect(JSON.parse(storage.getItem(key)!)).toMatchObject({
      title: 'Pagar renda',
    });
    expect(result.current.draft.savedAt).toBeInstanceOf(Date);
  });

  it('restores a saved draft on mount and flags it', () => {
    storage.setItem(
      draftKey('u1', 'new'),
      JSON.stringify({ title: 'Rascunho antigo', priority: 'HIGH' }),
    );
    const { result } = setup(storage);
    expect(result.current.form.getValues()).toEqual({
      title: 'Rascunho antigo',
      priority: 'HIGH',
    });
    expect(result.current.draft.restored).toBe(true);
  });

  it('discard resets the form and removes the draft', () => {
    const key = draftKey('u1', 'new');
    storage.setItem(key, JSON.stringify({ title: 'x', priority: 'LOW' }));
    const { result } = setup(storage);

    act(() => result.current.draft.discard());
    act(() => vi.advanceTimersByTime(1000));

    expect(result.current.form.getValues()).toEqual(defaults);
    expect(storage.getItem(key)).toBeNull();
    expect(result.current.draft.restored).toBe(false);
  });

  it('clear cancels a pending save so a submitted form leaves no draft', () => {
    const { result } = setup(storage);
    act(() => result.current.form.setValue('title', 'Enviado'));
    act(() => result.current.draft.clear());
    act(() => vi.advanceTimersByTime(1000));
    expect(storage.getItem(draftKey('u1', 'new'))).toBeNull();
  });

  it('flushes a pending save when the form unmounts', () => {
    const { result, unmount } = setup(storage);
    act(() => result.current.form.setValue('title', 'Quase perdido'));
    unmount();
    expect(JSON.parse(storage.getItem(draftKey('u1', 'new'))!)).toMatchObject({
      title: 'Quase perdido',
    });
  });

  it('flushes a pending save when the page is hidden', () => {
    const { result } = setup(storage);
    act(() => result.current.form.setValue('title', 'Fechou o separador'));
    act(() => {
      window.dispatchEvent(new Event('pagehide'));
    });
    expect(JSON.parse(storage.getItem(draftKey('u1', 'new'))!)).toMatchObject({
      title: 'Fechou o separador',
    });
  });

  it('does nothing until the user is known', () => {
    const { result } = setup(storage, null);
    act(() => result.current.form.setValue('title', 'Anon'));
    act(() => vi.advanceTimersByTime(1000));
    expect(storage.length).toBe(0);
  });
});
