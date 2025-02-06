import Storage from './utils/storage';
import { UserInfo } from './utils/types';

export const userInfoStorage: Storage<UserInfo> = new Storage<UserInfo>(
  { name: undefined, token: undefined },
  {
    setName: (name: string) => {
      userInfoStorage.set({ name, token: userInfoStorage.value.token });
    },
    setToken: (token: string) => {
      userInfoStorage.set({ name: userInfoStorage.value.name, token });
    },
  }
);
