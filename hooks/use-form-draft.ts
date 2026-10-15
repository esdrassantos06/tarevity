import { useCallback, useEffect, useRef, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import {
  browserStorage,
  draftKey,
  loadDraft,
  removeDraft,
  saveDraft,
} from '@/lib/drafts';

interface UseFormDraftOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  /** Identifies the form, e.g. `new` or `edit:<taskId>`. */
  scope: string;
  /** Drafts are stored per user; nothing is saved while this is undefined. */
  userId: string | undefined;
  /** Set to false until the form holds its initial values (e.g. server data on edit). */
  ready?: boolean;
  /** Idle time in ms after the last change before the draft is written. */
  delay?: number;
  storage?: Storage;
}

/**
 * Autosaves a react-hook-form's values to localStorage once the user stops typing,
 * and restores them the next time the same user opens the same form.
 */
export function useFormDraft<T extends FieldValues>({
  form,
  scope,
  userId,
  ready = true,
  delay = 800,
  storage = browserStorage(),
}: UseFormDraftOptions<T>) {
  const key = userId ? draftKey(userId, scope) : null;
  const [restored, setRestored] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const baseline = useRef<T | null>(null);
  const appliedKey = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSave = useRef<(() => void) | null>(null);
  const paused = useRef(false);

  const cancelPending = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    pendingSave.current = null;
  }, []);

  const flushPending = useCallback(() => {
    const save = pendingSave.current;
    cancelPending();
    save?.();
  }, [cancelPending]);

  useEffect(() => {
    if (!key || !ready || appliedKey.current === key) return;
    appliedKey.current = key;
    baseline.current = form.getValues();
    const draft = loadDraft<Partial<T>>(key, storage);
    if (draft) {
      form.reset({ ...baseline.current, ...draft } as T, {
        keepDefaultValues: true,
      });
      // Restoring reads localStorage, an external system that is only available after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRestored(true);
    }
  }, [key, ready, form, storage]);

  useEffect(() => {
    if (!key || !ready) return;
    const subscription = form.watch((values) => {
      if (paused.current) return;
      cancelPending();
      const save = () => {
        const stored = saveDraft(
          key,
          values as Record<string, unknown>,
          (baseline.current ?? {}) as Record<string, unknown>,
          storage,
        );
        setSavedAt(stored ? new Date() : null);
      };
      pendingSave.current = save;
      timer.current = setTimeout(() => {
        pendingSave.current = null;
        save();
      }, delay);
    });
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushPending();
    };
    window.addEventListener('pagehide', flushPending);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      flushPending();
      window.removeEventListener('pagehide', flushPending);
      document.removeEventListener('visibilitychange', onHide);
      subscription.unsubscribe();
    };
  }, [key, ready, form, delay, storage, cancelPending, flushPending]);

  /** Drops the draft and any pending save, e.g. after a successful submit. */
  const clear = useCallback(() => {
    cancelPending();
    paused.current = true;
    if (key) removeDraft(key, storage);
    setRestored(false);
    setSavedAt(null);
  }, [key, storage, cancelPending]);

  /** Drops the draft and puts the form back to its initial values. */
  const discard = useCallback(() => {
    cancelPending();
    if (key) removeDraft(key, storage);
    paused.current = true;
    if (baseline.current) form.reset(baseline.current);
    paused.current = false;
    setRestored(false);
    setSavedAt(null);
  }, [key, storage, form, cancelPending]);

  return { restored, savedAt, clear, discard };
}
