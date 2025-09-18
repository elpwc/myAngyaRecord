/* eslint-disable no-else-return */
import cookie from 'react-cookies';

export const c_token = (userid: number, token?: string): string => {
  if (token !== null && token !== undefined) {
    cookie.save('token_' + userid, token ?? '', { path: '/' });
    return token ?? '';
  } else {
    return cookie.load('token_' + userid) ?? '';
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

export const c_userNickName = (userid: number, userName?: string): string => {
  if (userName !== null && userName !== undefined) {
    cookie.save('userNickName_' + userid, userName ?? '', { path: '/' });
    return userName ?? '';
  } else {
    return cookie.load('userNickName_' + userid) ?? '';
  }
};

export const c_userName = (userid: number, userName?: string): string => {
  if (userName !== null && userName !== undefined) {
    cookie.save('userName_' + userid, userName ?? '', { path: '/' });
    return userName ?? '';
  } else {
    return cookie.load('userName_' + userid) ?? '';
  }
};

export const c_pw = (userid: number, pw?: string): string => {
  if (pw !== null && pw !== undefined) {
    cookie.save('p_' + userid, pw ?? '', { path: '/' });
    return pw ?? '';
  } else {
    return cookie.load('p_' + userid) ?? '';
  }
};

// export const c_uid = (value?: string): string => {
//   if (value !== null && value !== undefined) {
//     cookie.save('uid_' + value, value ?? '', { path: '/' });
//     return value ?? '';
//   } else {
//     return cookie.load('uid_' + value) ?? '';
//   }
// };

export const c_lat = (value?: string): string => {
  if (value !== null && value !== undefined) {
    cookie.save('lat', value ?? '', { path: '/' });
    return value ?? '';
  } else {
    return cookie.load('lat') ?? '';
  }
};

export const c_lng = (value?: string): string => {
  if (value !== null && value !== undefined) {
    cookie.save('lng', value ?? '', { path: '/' });
    return value ?? '';
  } else {
    return cookie.load('lng') ?? '';
  }
};

export const c_zoom = (value?: string): string => {
  if (value !== null && value !== undefined) {
    cookie.save('zoom', value ?? '', { path: '/' });
    return value ?? '';
  } else {
    return cookie.load('zoom') ?? '';
  }
};

export const c_showfilter = (value?: string): string => {
  if (value !== null && value !== undefined) {
    cookie.save('showfilter', value ?? '', { path: '/' });
    return value ?? '';
  } else {
    return cookie.load('showfilter') ?? '';
  }
};
