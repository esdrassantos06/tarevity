const PREFIX = 'tarevity:draft:';

type DraftValues = Record<string, unknown>;

/** Window localStorage, or undefined on the server or when access is blocked. */
export function browserStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function normalized(values: DraftValues): string {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(values).map(([k, v]) => [
        k,
        typeof v === 'string' ? v.trim() : (v ?? ''),
      ]),
    ),
  );
}

/** Storage key for one user's draft of one form, so accounts never share drafts. */
export function draftKey(userId: string, scope: string): string {
  return `${PREFIX}${userId}:${scope}`;
}

/** Stores the values, or removes the draft when they match the defaults. Returns true when a draft was stored. */
export function saveDraft(
  key: string,
  values: DraftValues,
  defaults: DraftValues,
  storage: Storage | undefined = browserStorage(),
): boolean {
  if (!storage) return false;
  try {
    if (normalized({ ...defaults, ...values }) === normalized(defaults)) {
      storage.removeItem(key);
      return false;
    }
    storage.setItem(key, JSON.stringify(values));
    return true;
  } catch {
    // Storage can be full or blocked (private mode); drafts are best-effort.
    return false;
  }
}

/** Reads a saved draft, or null when missing, corrupt or unreadable. */
export function loadDraft<T extends DraftValues = DraftValues>(
  key: string,
  storage: Storage | undefined = browserStorage(),
): T | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as T) : null;
  } catch {
    return null;
  }
}

/** Removes one saved draft. */
export function removeDraft(
  key: string,
  storage: Storage | undefined = browserStorage(),
): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Best-effort, see saveDraft.
  }
}

/** Removes every draft belonging to a user, e.g. on sign-out. */
export function clearUserDrafts(
  userId: string,
  storage: Storage | undefined = browserStorage(),
): void {
  if (!storage) return;
  try {
    const prefix = `${PREFIX}${userId}:`;
    const keys: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(prefix)) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  } catch {
    // Best-effort, see saveDraft.
  }
}
