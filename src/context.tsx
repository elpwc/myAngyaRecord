import { createContext, JSX, useContext, useState } from 'react';
import { c_mapStyle } from './utils/cookies';

export type AppContextType = {
  currentMapStyle: number;
  setCurrentMapStyle: (val: number) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppContext.Provider');
  return ctx;
};

export const AppContextProvider = ({children}: {children: JSX.Element}) => {
  // globals
  const [currentMapStyle, setCurrentMapStyle] = useState<number>(Number(c_mapStyle()) || 0);

  return <AppContext.Provider value={{ currentMapStyle, setCurrentMapStyle }}>{children}</AppContext.Provider>
}