import { useCallback, useMemo, useSyncExternalStore } from 'react';

const URL_CHANGE_EVENT = 'urlchange';

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  window.addEventListener(URL_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(URL_CHANGE_EVENT, onChange);
  };
}

function getSnapshot() {
  return window.location.search;
}

export function useUrlSearchParams() {
  const search = useSyncExternalStore(subscribe, getSnapshot);
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const update = useCallback((changes: Record<string, string | null>) => {
    const next = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(changes)) {
      if (value === null) next.delete(key);
      if (value !== null) next.set(key, value);
    }
    const query = next.toString();
    if (query === window.location.search.slice(1)) return;
    window.history.pushState(null, '', `${window.location.pathname}${query && `?${query}`}`);
    window.dispatchEvent(new Event(URL_CHANGE_EVENT));
  }, []);

  return { params, update };
}
