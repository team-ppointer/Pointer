'use client';
import { createContext, useState, ReactNode } from 'react';

export interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  name: string;
  setName: (name: string) => void;
}

const tokenStore = {
  accessToken: null as string | null,
  setAccessToken: (_: string | null) => {},
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [name, setNameState] = useState<string>('');

  tokenStore.accessToken = accessToken;
  tokenStore.setAccessToken = setAccessTokenState;

  const contextValue = {
    accessToken,
    setAccessToken: setAccessTokenState,
    name,
    setName: setNameState,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const getAccessToken = () => tokenStore.accessToken;
export const setAccessToken = (token: string | null) => tokenStore.setAccessToken(token);
