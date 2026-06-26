import React from 'react';
import { Home, List, PieChart, Settings, LogOut } from 'lucide-react';
import type { AuthUser } from '../../hooks/useAuth';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: AuthUser;
  onLogout: () => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'transactions', label: 'Transactions', icon: List },
  { id: 'reports', label: 'Reports', icon: PieChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, user, onLogout }) => {
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img
          src="/icon-192.png"
          alt="ExpenseTrack logo"
          style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, objectFit: 'cover' }}
        />
        <div className="sidebar-logo-text">
          <h1>ExpenseTrack</h1>
          <p>Smart Money Manager</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon size={20} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="name">{user.name || 'User'}</div>
            <div className="email">{user.email}</div>
          </div>
          <button
            onClick={onLogout}
            title="Sign Out"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'rgb(165 180 252)',
              padding: '4px',
              borderRadius: '6px',
              transition: 'color 150ms',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgb(165 180 252)')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
