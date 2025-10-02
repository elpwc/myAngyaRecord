/**
 * NOT USED
 */

import { useSyncExternalStore } from 'react';
import { LoginUserInfo } from './userUtils';
import { c_mapStyle } from './cookies';

// global vars store
let state: any = {
  //mapStyle: Number(c_mapStyle()) || 0,
  //currentBackgroundTileMap: 'default',
  // loginUserInfo: {
  //   id: -1,
  //   name: '',
  //   email: '',
  //   avatar: '',
  //   createTime: '',
  //   hitokoto: '',
  //   token: '',
  //   password: '',
  // } as LoginUserInfo,
  //isContinuousEditOn: false,
  //currentContinuousEditValue: 0,
};

const listeners = new Set<() => void>();

export function setGlobalState(partial: any) {
  state = typeof partial === 'function' ? partial(state) : { ...state, ...partial };
  listeners.forEach(listener => listener());
}

export function getGlobalState() {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useGlobalStore<T = typeof state>(selector: (s: typeof state) => T): [T, (partial: any | ((s: typeof state) => any)) => void] {
  const snapshot = useSyncExternalStore(subscribe, () => selector(state));
  const set = (partial: any | ((s: typeof state) => any)) => setGlobalState(partial);
  return [snapshot, set];
}
