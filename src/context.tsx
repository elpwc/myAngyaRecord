import { createContext, JSX, useContext, useState } from 'react';
import { c_mapStyle, c_privateRailwayLineStyle } from './utils/cookies';
import { LoginUserInfo } from './utils/userUtils';
import { RecordGroup } from './utils/types';
import { PrivateRailwayLineStyle } from './utils/mapInfo';

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

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  // globals
  const [currentMapStyle, setCurrentMapStyle] = useState<number>(c_mapStyle() ?? 1);
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
  const [currentRecordGroup, setCurrentRecordGroup] = useState<RecordGroup>();
  const [privateRailwayLineStyle, setPrivateRailwayLineStyle] = useState<PrivateRailwayLineStyle>(c_privateRailwayLineStyle() ?? PrivateRailwayLineStyle.RedLine);

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
        currentRecordGroup,
        setCurrentRecordGroup,
        privateRailwayLineStyle,
        setPrivateRailwayLineStyle,
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
          currentRecordGroup,
          setCurrentRecordGroup,
          privateRailwayLineStyle,
          setPrivateRailwayLineStyle,
        })}
        {children}
      </>
    </AppContext.Provider>
  );
};
