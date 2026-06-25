import React from 'react';
import { LogOut, User } from 'lucide-react';
import { signOut } from '../../lib/supabase';
import Button from '../ui/Button';

interface HeaderProps {
  user: any;
  isGuest?: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, isGuest = false }) => {
  const handleSignOut = async () => {
    if (isGuest) {
      localStorage.removeItem('guestMode');
      localStorage.removeItem('mockTransactions');
      window.location.reload();
    } else {
      await signOut();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">ExpenseTracker</h1>
              <p className="text-sm text-gray-500">
                {isGuest ? 'Guest Mode' : (user?.user_metadata?.name || user?.email)}
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            icon={LogOut}
          >
            {isGuest ? 'Exit Guest' : 'Sign Out'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;