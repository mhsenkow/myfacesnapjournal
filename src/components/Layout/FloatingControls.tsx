import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Bell, Sun, Moon, User, Settings } from 'lucide-react';

const FloatingControls: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-3 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 glass-text-primary" />
        ) : (
          <Moon className="w-5 h-5 glass-text-primary" />
        )}
      </button>

      {/* Notifications */}
      <button
        className="p-3 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5 glass-text-primary" />
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
      </button>

      {/* User Profile */}
      <button
        className="p-3 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        title="User Profile"
      >
        <User className="w-5 h-5 glass-text-primary" />
      </button>

      {/* Settings */}
      <button
        className="p-3 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        title="Settings"
      >
        <Settings className="w-5 h-5 glass-text-primary" />
      </button>
    </div>
  );
};

export default FloatingControls;
