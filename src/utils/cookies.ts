/* eslint-disable no-else-return */
import cookie from 'react-cookies';

export const c_token = (token?: string): string => {
  if (token !== null && token !== undefined) {
    cookie.save('token', token ?? '', { path: '/' });
    return token ?? '';
  } else {
    return cookie.load('token') ?? '';
  }
};

export const c_autoLogin = (state?: boolean): boolean => {
  if (state !== null && state !== undefined) {
    if (state) {
      cookie.save('autoLogin', 1, { path: '/' });
    } else {
      cookie.save('autoLogin', 0, { path: '/' });
    }
    return state ?? false;
  } else {
    return Boolean(Number(cookie.load('autoLogin')) ?? 0);
  }
};

export const c_userName = (userName?: string): string => {
  if (userName !== null && userName !== undefined) {
    cookie.save('userName', userName ?? '', { path: '/' });
    return userName ?? '';
  } else {
    return cookie.load('userName') ?? '';
  }
};
