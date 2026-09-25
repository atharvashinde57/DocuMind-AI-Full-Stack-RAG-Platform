import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, fullName?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('documind_token'));

  useEffect(() => {
    if (token) {
      authApi.me().then((u) => {
        if (u) setUser(u);
      });
    }
  }, [token]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await authApi.login(username, password);
      if (res.token) {
        localStorage.setItem('documind_token', res.token);
        setToken(res.token);
        setUser({ username: res.username, email: res.email });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (username: string, email: string, password: string, fullName?: string): Promise<boolean> => {
    try {
      const res = await authApi.register(username, email, password, fullName);
      if (res.token) {
        localStorage.setItem('documind_token', res.token);
        setToken(res.token);
        setUser({ username: res.username, email: res.email, fullName });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('documind_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
