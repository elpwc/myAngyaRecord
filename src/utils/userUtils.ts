import { c_autoLogin, c_pw, c_token, c_userName } from './cookies';
import { getGlobalState, setGlobalState } from './globalStore';
import request from './request';

export const isLogin = () => {
  return c_token(getGlobalState().loginUserInfo.id) !== '';
  //return userInfoStorage.value.token !== undefined;
};

export const valiLogin = () => {
  request('/user/me.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {},
  })
    .then(e => {
      console.log(e);
    })
    .catch(e => {
      console.log(e);
    });
};

export const logout = () => {
  c_userName(getGlobalState().loginUserInfo.id, '');
  //c_token('');
  c_pw(getGlobalState().loginUserInfo.id, '');
  c_autoLogin(false);

  setGlobalState({ loginUserInfo: { id: -1, name: '', email: '', avatar: '', createTime: '', hitokoto: '', token: '', password: '' } });
};

export const loginUser = async ({ email, password }: { email: string; password: string }) => {
  return request<any>('/user/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { email, password },
  });
};

export const loginCurrentUser = async () => {
  request<any>('/user/login.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { email: getGlobalState().loginUserInfo.email, password: getGlobalState().loginUserInfo.password },
  })
    .then(e => {
      const token = e.token;
      const email = e.email;
      const uid = e.uid;

      c_token(uid, token);
      c_userName(uid, email);

      setGlobalState({
        loginUserInfo: {
          id: uid,
          name: e.nickname,
          email: email,
          avatar: e.avatar,
          createTime: e.create_date,
          hitokoto: e.hitokoto,
          token: e.token,
          password: getGlobalState().loginUserInfo.password,
        },
      });
    })
    .catch(e => {
      console.log(e);
      alert('login failed');

      logout();
    });
};

export const createUser = async ({ email, name, password, token }: { email: string; name: string; password: string; token: string }) => {
  return request<any>('/user/user.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: { email, name, password, token },
  });
};

export const resetPassword = async ({ email, pw }: { email: string; pw: string }) => {
  return request<any>('/user/user.php', {
    method: 'PATCH',
    data: { email, pw },
  });
};

/**
 * 判断是否已登录，未登录则弹出提示，返回是否已登录
 * @param {string} [text] 显示的提示文本，默认为'登録後操作可'
 * @returns {boolean} 是否已经登录
 */
export const registerAlert = (text?: string) => {
  if (!isLogin()) {
    alert(text ?? '登録後操作可');
  }
  return isLogin();
};

export interface LoginUserInfo {
  id: number;
  name: string;
  email: string;
  avatar: string;
  createTime: string;
  hitokoto: string;
  token: string;
  password?: string;
}
