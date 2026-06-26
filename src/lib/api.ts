// API client that connects to the Express/MongoDB backend
// VITE_API_URL is set in .env.production — Render URL in prod, localhost in dev
const _rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
// Normalize: ensure the base URL always ends with /api
const API_BASE = _rawBase.endsWith('/api') ? _rawBase : `${_rawBase}/api`;

const getToken = (): string | null => localStorage.getItem('authToken');

const headers = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<{ data: T | null; error: string | null }> => {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers(), ...(options.headers || {}) },
    });
    const json = await res.json();
    if (!res.ok) {
      return { data: null, error: json.message || 'Something went wrong' };
    }
    return { data: json as T, error: null };
  } catch {
    return { data: null, error: 'Cannot connect to server. Make sure the backend is running.' };
  }
};

// ────── AUTH ──────
export const loginApi = (email: string, password: string) =>
  request<{ token: string; user: any }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const registerApi = (name: string, email: string, password: string) =>
  request<{ token: string; user: any }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const getMeApi = () =>
  request<{ user: any }>('/auth/me');

export const getDemoAccountsApi = () =>
  request<{ accounts: Array<{ name: string; email: string; password: string; description: string; avatar: string; color: string }> }>('/auth/demo-accounts');

// ────── TRANSACTIONS ──────
export const getTransactionsApi = (params?: Record<string, string>) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<{ transactions: any[]; total: number }>(`/transactions${query}`);
};

export const createTransactionApi = (data: any) =>
  request<{ transaction: any }>('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateTransactionApi = (id: string, data: any) =>
  request<{ transaction: any }>(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteTransactionApi = (id: string) =>
  request<{ message: string }>(`/transactions/${id}`, { method: 'DELETE' });

// ────── SETTINGS ──────
export const getSettingsApi = () =>
  request<{ settings: any; name: string; email: string }>('/settings');

export const updateSettingsApi = (data: any) =>
  request<{ settings: any; name: string; email: string }>('/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const changePasswordApi = (currentPassword: string, newPassword: string) =>
  request<{ message: string }>('/settings/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
