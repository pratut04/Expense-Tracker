import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://placeholder.supabase.co';
const supabaseAnonKey = 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signInWithEmail = async (email: string, password: string) => {
  // Mock authentication - accept any email/password
  if (email && password) {
    const mockUser = {
      id: 'mock-user-123',
      email: email,
      user_metadata: {
        name: email.split('@')[0],
      },
    };
    
    // Store mock session in localStorage
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    
    return { 
      data: { 
        user: mockUser,
        session: { user: mockUser, access_token: 'mock-token' }
      }, 
      error: null 
    };
  }
  
  return { data: null, error: { message: 'Email and password required' } };
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  // Mock sign up - accept any email/password
  if (email && password) {
    const mockUser = {
      id: 'mock-user-123',
      email: email,
      user_metadata: {
        name: name || email.split('@')[0],
      },
    };
    
    // Store mock session in localStorage
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    
    return { 
      data: { 
        user: mockUser,
        session: { user: mockUser, access_token: 'mock-token' }
      }, 
      error: null 
    };
  }
  
  return { data: null, error: { message: 'Email and password required' } };
};

export const signInWithGoogle = async () => {
  // Mock Google sign in
  const mockUser = {
    id: 'mock-user-123',
    email: 'user@gmail.com',
    user_metadata: {
      name: 'Demo User',
    },
  };
  
  localStorage.setItem('mockUser', JSON.stringify(mockUser));
  
  return { 
    data: { 
      user: mockUser,
      session: { user: mockUser, access_token: 'mock-token' }
    }, 
    error: null 
  };
};

export const signOut = async () => {
  // Clear mock session
  localStorage.removeItem('mockUser');
  localStorage.removeItem('mockTransactions');
  return { error: null };
};