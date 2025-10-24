/**
 * Notification Panel Component
 * 
 * Sliding notification panel that pushes in from the right side,
 * repositioning the floating controls to the left.
 * Shows recent notifications with management actions.
 */

import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2,
  Heart,
  Bookmark,
  Mail,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Globe,
  RefreshCw,
  Brain,
  BookOpen,
  Clock
} from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore';
import { Notification } from '../../types/notification';

const NotificationPanel: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isPanelOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    closePanel
  } = useNotificationStore();

  console.log('🎯 NotificationPanel render - isPanelOpen:', isPanelOpen);

  // ESC key handler
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPanelOpen) {
        closePanel();
      }
    };

    if (isPanelOpen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isPanelOpen, closePanel]);

  // Notification type icons
  const getNotificationIcon = (notification: Notification) => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'mastodon_new_post':
        return <Globe className="w-5 h-5 text-purple-500" />;
      case 'mastodon_mention':
        return <Mail className="w-5 h-5 text-purple-500" />;
      case 'mastodon_reblog':
        return <BookOpen className="w-5 h-5 text-yellow-500" />;
      case 'mastodon_favourite':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'post_liked':
        return <Heart className="w-5 h-5 text-pink-500" />;
      case 'post_favourited':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'post_reblogged':
        return <BookOpen className="w-5 h-5 text-yellow-500" />;
      case 'post_bookmarked':
        return <Bookmark className="w-5 h-5 text-blue-500" />;
      case 'ai_response_ready':
        return <Brain className="w-5 h-5 text-purple-500" />;
      case 'sync_complete':
        return <RefreshCw className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: { [key: string]: Notification[] } = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifications.forEach(notification => {
      const notificationDate = new Date(notification.timestamp);
      let groupKey: string;

      if (notificationDate.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (notificationDate.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = notificationDate.toLocaleDateString();
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  };

  const notificationGroups = groupNotificationsByDate(notifications);

  return (
    <>
      {/* Backdrop for clicking outside */}
      <div 
        className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
        onClick={closePanel}
      />
      
      {/* Panel */}
      <div className={`
        fixed top-0 right-0 z-[9999] h-screen w-96 
        glass shadow-2xl
        transform transition-transform duration-300 ease-out
        ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
      `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200/50">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
        </div>
        <button
          onClick={closePanel}
          className="p-1 hover:bg-neutral-100 rounded-md transition-colors"
          title="Close notifications"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Actions */}
      {(notifications.length > 0 || unreadCount > 0) && (
        <div className="p-3 border-b border-neutral-200/30">
          <div className="flex items-center justify-between">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
            <button
              onClick={clearAllNotifications}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors"
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">
              You'll see updates about Mastodon activity and journal entries here
            </p>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(notificationGroups).map(([groupName, groupNotifications]) => (
              <div key={groupName} className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 pb-2 sticky top-0 bg-white/90 backdrop-blur-sm">
                  {groupName}
                </h4>
                <div className="space-y-1">
                  {groupNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
                        p-3 rounded-lg cursor-pointer transition-colors
                        hover:bg-neutral-50/50
                        ${!notification.read ? 'bg-blue-50/30' : ''}
                      `}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className={`
                              text-sm font-medium truncate
                              ${!notification.read ? 'text-gray-900' : 'text-gray-700'}
                            `}>
                              {notification.title}
                            </h5>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(notification.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove notification"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default NotificationPanel;