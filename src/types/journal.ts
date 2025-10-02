/**
 * Journal Types
 * 
 * Type definitions for journal entries and related data structures
 */

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood?: 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'grateful';
  privacy: 'public' | 'private' | 'secret';
  source?: EntrySource;
  sourceId?: string;
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

export enum EntrySource {
  LOCAL = 'local',
  FACEBOOK = 'facebook',
  MASTODON = 'mastodon',
  INSTAGRAM = 'instagram',
  TWITTER = 'twitter'
}

export interface JournalSearchFilters {
  query?: string;
  tags?: string[];
  mood?: string;
  privacy?: string;
  source?: EntrySource;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface JournalStats {
  totalEntries: number;
  entriesByMonth: Record<string, number>;
  entriesByMood: Record<string, number>;
  entriesBySource: Record<EntrySource, number>;
  totalTags: number;
  mostUsedTags: Array<{ tag: string; count: number }>;
}

export interface JournalExportOptions {
  format: 'json' | 'markdown' | 'pdf';
  dateRange?: {
    from: Date;
    to: Date;
  };
  includeMetadata?: boolean;
  includeSource?: boolean;
}
