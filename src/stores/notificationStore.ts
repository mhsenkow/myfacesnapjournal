/**
 * Notification Store - Centralized Notification Management
 * 
 * Manages all app notifications including:
 * - Mastodon social interactions
 * - Journal entry operations
 * - AI responses
 * - System status updates
 * - Import/export operations
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Notification, NotificationSettings, NotificationType } from '../types/notification';

interface NotificationStore {
  // State
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  isPanelOpen: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => Notification;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // Panel management
  togglePanel: () => void;
  closePanel: () => void;
  openPanel: () => void;
  
  // Settings
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Notification creators
  notifyMastodonConnected: (instance: string, username: string) => void;
  notifyMastodonDisconnected: () => void;
  notifyPostAction: (type: 'liked' | 'bookmarked', postId: string, content: string) => void;
  notifyJournalImport: (count: number, source: 'mastodon' | 'facebook') => void;
  notifyAIResponse: (type: 'echo' | 'companion', prompt: string) => void;
  notifySync: (type: 'success' | 'error', details?: string) => void;
  notifyGeneral: (type: NotificationType, title: string, message: string, persistent?: boolean) => void;
}

const defaultSettings: NotificationSettings = {
  enablePushNotifications: false,
  enableInAppNotifications: true,
  enableMastodonNotifications: true,
  enableJournalNotifications: true,
  enableAINotifications: true,
  soundEnabled: false,
  showDuration: 5000 // 5 seconds
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      settings: defaultSettings,
      isPanelOpen: false,

      // Add notification
      addNotification: (notificationData) => {
        const id = crypto.randomUUID();
        const notification: Notification = {
          id,
          timestamp: new Date(),
          read: false,
          ...notificationData
        };

        set((state) => {
          const notifications = [notification, ...state.notifications];
          const unreadCount = notifications.filter(n => !n.read).length;
          
          // Limit to 50 notifications to prevent memory bloat
          const limitedNotifications = notifications.slice(0, 50);
          
          return {
            notifications: limitedNotifications,
            unreadCount
          };
        });

        return notification;
      },

      markAsRead: (notificationId) => {
        set((state) => {
          const notifications = state.notifications.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          );
          const unreadCount = notifications.filter(n => !n.read).length;
          
          return { notifications, unreadCount };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        }));
      },

      removeNotification: (notificationId) => {
        set((state) => {
          const notifications = state.notifications.filter(n => n.id !== notificationId);
          const unreadCount = notifications.filter(n => !n.read).length;
          
          return { notifications, unreadCount };
        });
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      // Panel management
      togglePanel: () => {
        set((state) => {
          const newState = !state.isPanelOpen;
          console.log('Store: togglePanel called - changing from', state.isPanelOpen, 'to', newState);
          return { isPanelOpen: newState };
        });
      },

      closePanel: () => {
        set({ isPanelOpen: false });
      },

      openPanel: () => {
        set({ isPanelOpen: true });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      // Specific notification methods
      notifyMastodonConnected: (instance, username) => {
        get().addNotification({
          type: 'mastodon_connected',
          title: 'Mastodon Connected',
          message: `Successfully connected to ${username}@${new URL(instance).hostname}`,
          persistent: false,
          data: { instance, username }
        });
      },

      notifyMastodonDisconnected: () => {
        get().addNotification({
          type: 'mastodon_disconnected',
          title: 'Mastodon Disconnected',
          message: 'Your Mastodon connection has been disconnected',
          persistent: false
        });
      },

      notifyPostAction: (actionType, postId, content) => {
        const action = actionType === 'liked' ? 'liked' : 'bookmarked';
        const actionIcon = actionType === 'liked' ? '❤️' : '🔖';
        
        get().addNotification({
          type: `post_${actionType}` as NotificationType,
          title: `Post ${action}`,
          message: `${actionIcon} ${content.slice(0, 100)}${content.length > 100 ? '...' : ''}`,
          persistent: false,
          data: { postId, actionType, content }
        });
      },

      notifyJournalImport: (count, source) => {
        const sourceName = source === 'mastodon' ? 'Mastodon' : 'Facebook';
        
        get().addNotification({
          type: 'journal_entry_imported',
          title: 'Posts Imported',
          message: `Successfully imported ${count} posts from ${sourceName}`,
          persistent: false,
          data: { count, source }
        });
      },

      notifyAIResponse: (type, prompt) => {
        const aiType = type === 'echo' ? 'Echo Analysis' : 'AI Companion';
        
        get().addNotification({
          type: 'ai_response_ready',
          title: `${aiType} Ready`,
          message: `Your AI response for "${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}" is ready`,
          persistent: false,
          data: { aiType, prompt }
        });
      },

      notifySync: (type, details) => {
        const isSuccess = type === 'success';
        
        get().addNotification({
          type: isSuccess ? 'sync_complete' : 'sync_failed',
          title: isSuccess ? 'Sync Complete' : 'Sync Failed',
          message: details || (isSuccess ? 'Data sync completed successfully' : 'Data sync encountered an error'),
          persistent: false,
          data: { type, details }
        });
      },

      notifyGeneral: (type, title, message, persistent = false) => {
        get().addNotification({
          type,
          title,
          message,
          persistent,
          data: {}
        });
      }
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications.filter(n => n.persistent), // Only persist persistent notifications
        settings: state.settings
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert timestamp strings back to Date objects
          state.notifications = state.notifications.map(n => ({
            ...n,
            timestamp: new Date(n.timestamp)
          }));
        }
      }
    }
  )
);

export default useNotificationStore;
