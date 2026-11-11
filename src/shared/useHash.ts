import { useSyncExternalStore } from 'react';

const subscribe = (on: () => void) => {
  window.addEventListener('hashchange', on);
  return () => window.removeEventListener('hashchange', on);
};

/** The location hash without the `#`, kept current. */
export function useHash(): string {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash.replace('#', ''),
    () => '',
  );
}
