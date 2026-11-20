import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('socialy_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('socialy_token') || null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('socialy_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data);
      localStorage.setItem('socialy_user', JSON.stringify(data));
    } catch (err) {
      console.error('Session validation failed:', err);
      localStorage.removeItem('socialy_token');
      localStorage.removeItem('socialy_user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthExpired = () => {
      setToken(null);
      setUser(null);
      addToast('Your session has expired. Please sign in again.', 'info');
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [fetchCurrentUser, addToast]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('socialy_token', data.token);
      localStorage.setItem('socialy_user', JSON.stringify(data.user));
      addToast(`Welcome back, ${data.user.fullName}!`, 'success');
      return { success: true, user: data.user };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/api/auth/register', userData);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('socialy_token', data.token);
      localStorage.setItem('socialy_user', JSON.stringify(data.user));
      addToast(`Welcome to SOCIALY, ${data.user.fullName}!`, 'success');
      return { success: true, user: data.user };
    } catch (error) {
      let msg = error.response?.data?.message;
      if (!msg && error.response?.data?.errors) {
        msg = error.response.data.errors.map((e) => e.msg).join(', ');
      }
      msg = msg || 'Registration failed. Please check your inputs.';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('socialy_token');
    localStorage.removeItem('socialy_user');
    setToken(null);
    setUser(null);
    addToast('You have been logged out.', 'info');
  };

  const updateCurrentUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('socialy_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateCurrentUser,
        refreshUser: fetchCurrentUser,
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

