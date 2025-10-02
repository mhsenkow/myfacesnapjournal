import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Bell, Sun, Moon, Zap } from 'lucide-react';

const FloatingControls: React.FC = () => {
  const { theme, toggleMode } = useTheme();

  // Get appropriate icon and title for current theme mode
  const getThemeIcon = () => {
    switch (theme.mode) {
      case 'light':
        return <Moon className="w-5 h-5 glass-text-primary" />;
      case 'dark':
        return <Sun className="w-5 h-5 glass-text-primary" />;
      case 'brutalist':
        return <Zap className="w-5 h-5 glass-text-primary" />;
      default:
        return <Sun className="w-5 h-5 glass-text-primary" />;
    }
  };

  const getNextModeName = () => {
    switch (theme.mode) {
      case 'light': return 'dark';
      case 'dark': return 'brutalist';
      case 'brutalist': return 'light';
      default: return 'dark';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 sm:gap-3">
      {/* Theme Toggle */}
      <button
        onClick={toggleMode}
        className="p-2 sm:p-3 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        title={`Switch to ${getNextModeName()} mode`}
      >
        {getThemeIcon()}
      </button>

      {/* Notifications */}
      <button
        className="p-2 sm:p-3 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5 glass-text-primary" />
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
      </button>

    </div>
  );
};

export default FloatingControls;
