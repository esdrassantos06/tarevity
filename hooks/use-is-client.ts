import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** False during SSR and hydration, true afterwards; use it to gate client-only values without hydration mismatches. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
