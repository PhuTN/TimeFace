import React, { createContext, useCallback, useState, useContext } from "react";

type ReloadContextProps = {
  reloadKey: number;
  reloadApp: () => void;
};

const AppReloadContext = createContext<ReloadContextProps>({
  reloadKey: 0,
  reloadApp: () => {},
});

export const AppReloadProvider = ({ children }: { children: React.ReactNode }) => {
  const [reloadKey, setReloadKey] = useState(0);

  const reloadApp = useCallback(() => {
    setReloadKey(k => k + 1);
  }, []);

  return (
    <AppReloadContext.Provider value={{ reloadKey, reloadApp }}>
      {children}
    </AppReloadContext.Provider>
  );
};

export const useAppReload = () => useContext(AppReloadContext);
