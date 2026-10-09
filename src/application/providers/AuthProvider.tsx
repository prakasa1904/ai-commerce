import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { authApi, tokenStorage } from '../../infrastructure/api/authApi';
import { queryClient } from './DataProvider';

export interface AuthContextValue {
  token: string | null;
  user: { id: number; username: string; email: string; role: 'seller' | 'buyer'; isAdmin: boolean } | null;
  isAdmin: boolean;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(tokenStorage.get());
  const [user, setUser] = useState<AuthContextValue['user']>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsReady(false);
    const stored = tokenStorage.get();
    if (!stored) {
      if (!cancelled) {
        setUser(null);
        setIsReady(true);
      }
      return;
    }
    authApi
      .me(stored)
      .then(({ user: me }) => {
        if (cancelled) return;
        setToken(stored);
        setUser(me);
        setIsReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        tokenStorage.remove();
        setToken(null);
        setUser(null);
        setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const session = await authApi.login(email, password);
    tokenStorage.set(session.token);
    setToken(session.token);
    setUser(session.user);
    queryClient.invalidateQueries();
  };

  const logout = () => {
    tokenStorage.remove();
    setToken(null);
    setUser(null);
    queryClient.clear();
  };

  const value: AuthContextValue = {
    token,
    user,
    isAdmin: Boolean(user?.isAdmin),
    isReady,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}