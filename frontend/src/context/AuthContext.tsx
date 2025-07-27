'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import apiClient from '../services/api';


interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        await fetchUserProfile(storedToken);
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const fetchUserProfile = async (currentToken: string) => {
    try {
            const response = await apiClient.get('/auth/profile', {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      handleLogout(); // Log out if profile fetch fails
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    handleLogout(); // Clear any existing session first
    setLoading(true);
    try {
            const response = await apiClient.post('/auth/login', { email, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      await fetchUserProfile(access_token);
    } catch (error) {
      console.error('Login failed', error);
      setLoading(false);
      throw error; // Re-throw error to be handled by the login form
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login: handleLogin, logout: handleLogout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
