/**
 * Facebook-related type definitions
 */

export interface FacebookJournalEntry {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mood: string;
  privacy: 'public';
  source: 'facebook';
  sourceId: string;
  sourceUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    facebookPost: any;
    importDate: Date;
    likes: number;
    comments: number;
    type: string;
  };
}

export interface FacebookImportSettings {
  enabled: boolean;
  autoImport: boolean;
  importInterval: number; // in hours
  lastImportDate?: Date;
  importLimit: number;
  includePhotos: boolean;
  includeVideos: boolean;
  includeLinks: boolean;
  includeStatusUpdates: boolean;
}

export interface FacebookAuthState {
  isAuthenticated: boolean;
  accessToken?: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    picture?: string;
  };
  lastAuthDate?: Date;
}
