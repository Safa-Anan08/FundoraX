'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  role: 'Supporter' | 'Creator' | 'Admin';
  credits: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  register: (name: string, email: string, password: string, photo: string, role: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  googleLogin: (email: string, name?: string, photo?: string, googleId?: string, role?: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Restore Auth state from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      if (typeof window === 'undefined') return;

      const storedToken = localStorage.getItem('fundorax_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await api.get('/auth/me');
          if (res.data.success && res.data.user) {
            setUser(res.data.user);
          } else {
            localStorage.removeItem('fundorax_token');
            setToken(null);
          }
        } catch (err) {
          console.warn('[AuthContext] Token restore failed:', err);
          localStorage.removeItem('fundorax_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.warn('[AuthContext] refreshUser failed:', err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success && res.data.token) {
        localStorage.setItem('fundorax_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Login error occurred',
      };
    }
  };

  const register = async (name: string, email: string, password: string, photo: string, role: string) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, photo, role });
      if (res.data.success && res.data.token) {
        localStorage.setItem('fundorax_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration error occurred',
      };
    }
  };

  const googleLogin = async (email: string, name?: string, photo?: string, googleId?: string, role?: string) => {
    try {
      const res = await api.post('/auth/google-login', { email, name, photo, googleId, role });
      if (res.data.success && res.data.token) {
        localStorage.setItem('fundorax_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message || 'Google login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Google login error',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('fundorax_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        googleLogin,
        logout,
        refreshUser,
      }}
    >
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
