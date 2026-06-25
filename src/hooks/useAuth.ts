import { useState, useEffect, useCallback } from 'react';
import { getMeApi, loginApi, registerApi } from '../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  settings: {
    currency: string;
    language: string;
    month_start_day: number;
    notifications_enabled: boolean;
    dark_mode: boolean;
  };
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }
    const { data, error } = await getMeApi();
    if (error || !data) {
      localStorage.removeItem('authToken');
      setUser(null);
    } else {
      setUser({ ...data.user, id: data.user.id || data.user._id });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await loginApi(email, password);
    if (error || !data) return { success: false, error: error || 'Login failed' };
    localStorage.setItem('authToken', data.token);
    setUser({ ...data.user, id: data.user.id || data.user._id });
    return { success: true };
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await registerApi(name, email, password);
    if (error || !data) return { success: false, error: error || 'Registration failed' };
    localStorage.setItem('authToken', data.token);
    setUser({ ...data.user, id: data.user.id || data.user._id });
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    window.location.reload();
  };

  const updateUserInState = (updated: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...updated } : prev);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isGuest: false,
    login,
    register,
    logout,
    updateUserInState,
    refetch: loadUser,
  };
};