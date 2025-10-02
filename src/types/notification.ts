/**
 * Notification Types
 * 
 * Defines the data structures for the notification system
 */

export type NotificationType = 
  | 'success' 
  | 'info' 
  | 'warning' 
  | 'error'
  | 'mastodon_connected'
  | 'mastodon_disconnected'
  | 'post_liked'
  | 'post_bookmarked'
  | 'journal_entry_imported'
  | 'ai_response_ready'
  | 'sync_complete'
  | 'sync_failed';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean; // Whether notification survives across sessions
  actions?: NotificationAction[];
  data?: Record<string, any>; // Additional metadata
}

export interface NotificationAction {
  id: string;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
}

export interface NotificationSettings {
  enablePushNotifications: boolean;
  enableInAppNotifications: boolean;
  enableMastodonNotifications: boolean;
  enableJournalNotifications: boolean;
  enableAINotifications: boolean;
  soundEnabled: boolean;
  showDuration: number; // milliseconds
}
