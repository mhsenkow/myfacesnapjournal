import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotificationStore } from '../../stores/notificationStore';
import { Bell, Sun, Moon, Zap } from 'lucide-react';

const FloatingControls: React.FC = () => {
  const { theme, toggleMode } = useTheme();
  const { unreadCount, togglePanel, isPanelOpen } = useNotificationStore();

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
    <div className={`
      fixed top-6 z-[100] flex flex-col gap-2 sm:gap-3 transition-transform duration-300 ease-out
      ${isPanelOpen ? 'right-[22rem]' : 'right-6'}
    `}>
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
        onClick={() => {
          console.log('🚨 BUTTON CLICKED - Current state:', isPanelOpen ? 'OPEN' : 'CLOSED');
          console.log('🚨 About to call togglePanel()');
          
          // Add a demo notification if none exist
          const { notifyGeneral, notifications } = useNotificationStore.getState();
          if (notifications.length === 0) {
            console.log('🚨 Adding demo notification');
            notifyGeneral('info', 'Welcome!', 'This is your notification panel. Try importing Mastodon posts to get started.');
          }
          
          togglePanel();
          console.log('🚨 togglePanel() called');
        }}
        className="p-2 sm:p-3 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 relative"
        title={`${unreadCount} unread notifications`}
      >
        <Bell className={`w-5 h-5 glass-text-primary transition-colors ${unreadCount > 0 ? 'text-primary-600' : ''}`} />
        
        {/* Notification badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
        
        {/* Pulse animation for unread notifications */}
        {unreadCount > 0 && (
          <div className="absolute inset-0 w-10 h-10 bg-red-500 rounded-full opacity-10 animate-pulse" />
        )}
      </button>

    </div>
  );
};

export default FloatingControls;
