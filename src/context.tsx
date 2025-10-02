import { createContext, JSX, useContext, useState } from 'react';
import { c_mapStyle } from './utils/cookies';
import { LoginUserInfo } from './utils/userUtils';

export const AppContext = createContext<any | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppContext.Provider');
  return ctx;
};

// tsx以外调用全局变量用
let latestContext: any | null = null;
export const setContextRef = (ctx: any) => {
  latestContext = ctx;
};
export const getContextRef = () => latestContext;

export const AppContextProvider = ({ children }: { children: JSX.Element }) => {
  // globals
  const [currentMapStyle, setCurrentMapStyle] = useState<number>(Number(c_mapStyle()) || 0);
  const [currentBackgroundTileMap, setCurrentBackgroundTileMap] = useState('default');
  const [loginUserInfo, setLoginUserInfo] = useState<LoginUserInfo>({
    id: -1,
    name: '',
    email: '',
    avatar: '',
    createTime: '',
    hitokoto: '',
    token: '',
    password: '',
  });
  const [isContinuousEditOn, setIsContinuousEditOn] = useState(false);
  const [currentContinuousEditValue, setCurrentContinuousEditValue] = useState(0);

  return (
    <AppContext.Provider
      value={{
        currentMapStyle,
        setCurrentMapStyle,
        currentBackgroundTileMap,
        setCurrentBackgroundTileMap,
        loginUserInfo,
        setLoginUserInfo,
        isContinuousEditOn,
        setIsContinuousEditOn,
        currentContinuousEditValue,
        setCurrentContinuousEditValue,
      }}
    >
      <>
        {setContextRef({
          currentMapStyle,
          setCurrentMapStyle,
          currentBackgroundTileMap,
          setCurrentBackgroundTileMap,
          loginUserInfo,
          setLoginUserInfo,
          isContinuousEditOn,
          setIsContinuousEditOn,
          currentContinuousEditValue,
          setCurrentContinuousEditValue,
        })}
        {children}
      </>
    </AppContext.Provider>
  );
};
