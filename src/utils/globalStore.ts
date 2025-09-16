import { useSyncExternalStore } from 'react';

// global vars store
let state: any = {
  mapStyle: 2,
};

const listeners = new Set<() => void>();

export function setGlobalState(partial: any) {
  state = { ...state, ...partial };
  listeners.forEach(listener => listener());
}
export function getGlobalState() {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGlobalStore<T = typeof state>(selector: (s: typeof state) => T): [T, typeof setGlobalState] {
  const snapshot = useSyncExternalStore(subscribe, () => selector(state));
  return [snapshot, setGlobalState];
}
