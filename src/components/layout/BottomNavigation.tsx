import React from 'react';
import { Home, List, PieChart, Settings } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'transactions', label: 'Transactions', icon: List },
  { id: 'reports', label: 'Reports', icon: PieChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bottom-nav">
      <div className="bottom-nav-grid">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`bottom-nav-item ${activeTab === tab.id ? 'active' : ''}`}
            >
              <Icon />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;