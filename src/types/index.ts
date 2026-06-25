export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'other';
  date: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  is_default: boolean;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  currency: string;
  language: 'en' | 'hi';
  month_start_day: number;
  notifications_enabled: boolean;
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}