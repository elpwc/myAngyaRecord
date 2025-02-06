import { userInfoStorage } from '../globalStorages';
import { c_autoLogin, c_token, c_userName } from './cookies';

export const isLogin = () => {
  return userInfoStorage.value.name !== undefined && userInfoStorage.value.name !== null && userInfoStorage.value.name !== '';
};

export const logout = () => {
  userInfoStorage.set({ token: undefined, name: undefined });
  c_userName('');
  c_token('');
  c_autoLogin(false);
};
