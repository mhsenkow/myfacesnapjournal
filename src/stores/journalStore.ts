/**
 * Journal Store - Zustand store for managing journal entries
 * 
 * This store handles:
 * - Creating, reading, updating, and deleting journal entries
 * - Local storage persistence
 * - Search and filtering
 * - Tags management
 */

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { JournalEntry, EntrySource } from '../types/journal';

// Re-export types for backward compatibility
export type { JournalEntry };
export { EntrySource };

// Check if we're running in Tauri (desktop) or browser
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__;

interface JournalState {
  entries: JournalEntry[];
  selectedEntry: JournalEntry | null;
  searchQuery: string;
  selectedTags: string[];
  selectedMood: string;
  selectedPrivacy: string;
  selectedSource: string;
  layoutMode: 'card' | 'grid' | 'list' | 'mortar';
  sortBy: 'date' | 'title' | 'mood' | 'privacy';
  sortOrder: 'asc' | 'desc';
  isInitialized: boolean;
}

interface JournalActions {
  // Entry CRUD
  createEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  deleteEntries: (ids: string[]) => Promise<void>;
  selectEntry: (entry: JournalEntry | null) => void;
  loadEntries: () => Promise<void>;
  
  // Social media mirroring
  createEntryFromSocialPost: (post: any, platform: 'mastodon' | 'bluesky') => Promise<void>;
  
  // Search and filtering
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSelectedMood: (mood: string) => void;
  setSelectedPrivacy: (privacy: string) => void;
  setSelectedSource: (source: string) => void;
  setLayoutMode: (mode: 'card' | 'grid' | 'list' | 'mortar') => void;
  setSortBy: (sortBy: 'date' | 'title' | 'mood' | 'privacy') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Computed values
  filteredEntries: () => JournalEntry[];
  allTags: () => string[];
  allMoods: () => string[];
  allSources: () => string[];
  
  // Utilities
  clearFilters: () => void;
  exportEntries: () => string;
  importEntries: (json: string) => void;
  clearAllEntries: () => void;
}

export const useJournalStore = create<JournalState & JournalActions>()(
  (set, get) => ({
      // State
      entries: [],
      selectedEntry: null,
      searchQuery: '',
      selectedTags: [],
      selectedMood: '',
      selectedPrivacy: '',
      selectedSource: '',
      layoutMode: 'card',
      sortBy: 'date',
      sortOrder: 'desc',
      isInitialized: false,

      // Actions
      createEntry: async (entryData) => {
        if (isTauri) {
          try {
            const newEntry = await invoke<JournalEntry>('create_journal_entry', {
              title: entryData.title,
              content: entryData.content,
              tags: entryData.tags,
              mood: entryData.mood,
              privacy: entryData.privacy,
              source: entryData.source,
              sourceId: entryData.sourceId,
              sourceUrl: entryData.sourceUrl,
              metadata: entryData.metadata,
            });
            
            set((state) => ({
              entries: [newEntry, ...state.entries],
              selectedEntry: newEntry,
            }));
          } catch (error) {
            console.error('Failed to create entry:', error);
            throw error;
          }
        } else {
          // Browser fallback - use localStorage
          const newEntry: JournalEntry = {
            ...entryData,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set((state) => {
            const newState = {
              entries: [newEntry, ...state.entries],
              selectedEntry: newEntry,
            };
            
            // Persist to localStorage
            try {
              localStorage.setItem('journal-entries', JSON.stringify(newState.entries));
            } catch (error) {
              console.error('Failed to save entries to localStorage:', error);
            }
            
            return newState;
          });
        }
      },

      createEntryFromSocialPost: async (post, platform) => {
        // Check if this post already exists in the journal
        const existingEntry = get().entries.find(entry => 
          entry.source === platform && entry.tags.includes(`post-${post.id}`)
        );
        
        if (existingEntry) {
          return;
        }

        // Check if this post is authored by the authenticated user
        let isMyPost = false;
        
        if (platform === 'mastodon') {
          // Get the authenticated user from Mastodon store
          const mastodonStore = await import('./mastodonStore');
          const mastodonAuth = mastodonStore.useMastodonStore.getState().auth;
          
          if (mastodonAuth.user && post.account.id === mastodonAuth.user.id) {
            isMyPost = true;
          }
        } else if (platform === 'bluesky') {
          // Get the authenticated user from Bluesky store
          const blueskyStore = await import('./blueskyStore');
          const blueskyAuth = blueskyStore.useBlueskyStore.getState().auth;
          
          if (blueskyAuth.session && post.author.did === blueskyAuth.session.did) {
            isMyPost = true;
          }
        }
        
        if (!isMyPost) {
          return;
        }

        // Extract content and metadata based on platform
        let title: string, content: string, tags: string[], mood: string, privacy: string;
        
        if (platform === 'mastodon') {
          title = `My Mastodon Post`;
          content = post.content || '';
          tags = [
            'mastodon',
            'my-posts',
            `post-${post.id}`,
            ...(post.tags?.map((tag: any) => tag.name) || [])
          ];
          mood = 'neutral';
          privacy = post.visibility === 'public' ? 'public' : 'private';
        } else if (platform === 'bluesky') {
          title = `My Bluesky Post`;
          content = post.record.text || '';
          tags = [
            'bluesky',
            'my-posts',
            `post-${post.id}`
          ];
          mood = 'neutral';
          privacy = 'public';
        } else {
          throw new Error(`Unsupported platform: ${platform}`);
        }

        // Create the journal entry
        await get().createEntry({
          title,
          content,
          tags,
          mood: mood as 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'grateful' | undefined,
          privacy: privacy as 'public' | 'private' | 'secret',
          source: platform as EntrySource,
          metadata: {
            originalDate: platform === 'mastodon' ? post.created_at : post.record?.createdAt || post.indexedAt,
            originalPostId: post.id,
            platform: platform
          }
        });
      },

      updateEntry: async (id, updates) => {
        if (isTauri) {
          try {
            await invoke('update_journal_entry', {
              id,
              title: updates.title || '',
              content: updates.content || '',
              tags: updates.tags || [],
              mood: updates.mood || null,
              privacy: updates.privacy || 'private',
              source: updates.source || null,
              sourceId: updates.sourceId || null,
              sourceUrl: updates.sourceUrl || null,
              metadata: updates.metadata || null,
            });
            
            set((state) => {
              const newState = {
                entries: state.entries.map((entry) =>
                  entry.id === id
                    ? { ...entry, ...updates, updatedAt: new Date() }
                    : entry
                ),
                selectedEntry: state.selectedEntry?.id === id
                  ? { ...state.selectedEntry, ...updates, updatedAt: new Date() }
                  : state.selectedEntry,
              };
              
              return newState;
            });
          } catch (error) {
            console.error('Failed to update entry:', error);
            throw error;
          }
        } else {
          // Browser fallback - use localStorage
          set((state) => {
            const newState = {
              entries: state.entries.map((entry) =>
                entry.id === id
                  ? { ...entry, ...updates, updatedAt: new Date() }
                  : entry
              ),
              selectedEntry: state.selectedEntry?.id === id
                ? { ...state.selectedEntry, ...updates, updatedAt: new Date() }
                : state.selectedEntry,
            };
            
            // Persist to localStorage
            try {
              localStorage.setItem('journal-entries', JSON.stringify(newState.entries));
            } catch (error) {
              console.error('Failed to save entries to localStorage:', error);
            }
            
            return newState;
          });
        }
      },

      deleteEntry: async (id) => {
        if (isTauri) {
          try {
            await invoke('delete_journal_entry', { id });
            
            set((state) => ({
              entries: state.entries.filter((entry) => entry.id !== id),
              selectedEntry: state.selectedEntry?.id === id ? null : state.selectedEntry,
            }));
          } catch (error) {
            console.error('Failed to delete entry:', error);
            throw error;
          }
        } else {
          // Browser fallback - use localStorage
          set((state) => {
            const newState = {
              entries: state.entries.filter((entry) => entry.id !== id),
              selectedEntry: state.selectedEntry?.id === id ? null : state.selectedEntry,
            };
            
            // Persist to localStorage
            try {
              localStorage.setItem('journal-entries', JSON.stringify(newState.entries));
            } catch (error) {
              console.error('Failed to save entries to localStorage:', error);
            }
            
            return newState;
          });
        }
      },

      deleteEntries: async (ids) => {
        if (isTauri) {
          try {
            await invoke('delete_journal_entries', { ids });
            
            set((state) => ({
              entries: state.entries.filter((entry) => !ids.includes(entry.id)),
              selectedEntry: state.selectedEntry && ids.includes(state.selectedEntry.id) ? null : state.selectedEntry,
            }));
          } catch (error) {
            console.error('Failed to delete entries:', error);
            throw error;
          }
        } else {
          // Browser fallback - use localStorage
          set((state) => {
            const newState = {
              entries: state.entries.filter((entry) => !ids.includes(entry.id)),
              selectedEntry: state.selectedEntry && ids.includes(state.selectedEntry.id) ? null : state.selectedEntry,
            };
            
            // Persist to localStorage
            try {
              localStorage.setItem('journal-entries', JSON.stringify(newState.entries));
            } catch (error) {
              console.error('Failed to save entries to localStorage:', error);
            }
            
            return newState;
          });
        }
      },

      selectEntry: (entry) => {
        set({ selectedEntry: entry });
      },

      loadEntries: async () => {
        const { isInitialized } = get();
        if (isInitialized) return; // Prevent multiple loads
        
        if (isTauri) {
          try {
            const entries = await invoke<JournalEntry[]>('list_journal_entries', {
              limit: null,
              offset: null,
            });
            
            set({ entries, isInitialized: true });
          } catch (error) {
            console.error('Failed to load entries from database:', error);
            set({ isInitialized: true });
          }
        } else {
          // Browser fallback - use localStorage
          try {
            const stored = localStorage.getItem('journal-entries');
            if (stored) {
              const entries = JSON.parse(stored).map((entry: any) => ({
                ...entry,
                createdAt: new Date(entry.createdAt),
                updatedAt: new Date(entry.updatedAt),
              }));
              set({ entries, isInitialized: true });
            } else {
              set({ isInitialized: true });
            }
          } catch (error) {
            console.error('Failed to load entries from localStorage:', error);
            set({ isInitialized: true });
          }
        }
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setSelectedTags: (tags) => {
        set({ selectedTags: tags });
      },

      setSelectedMood: (mood) => {
        set({ selectedMood: mood });
      },

      setSelectedPrivacy: (privacy) => {
        set({ selectedPrivacy: privacy });
      },

      setSelectedSource: (source) => {
        set({ selectedSource: source });
      },

      setLayoutMode: (mode) => {
        set({ layoutMode: mode });
      },

      setSortBy: (sortBy) => {
        set({ sortBy });
      },

      setSortOrder: (order) => {
        set({ sortOrder: order });
      },

      // Computed values
      filteredEntries: () => {
        const { entries, searchQuery, selectedTags, selectedMood, selectedPrivacy, selectedSource, sortBy, sortOrder } = get();
        
        return entries.filter((entry) => {
          // Search query
          if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = 
              entry.title.toLowerCase().includes(searchLower) ||
              entry.content.toLowerCase().includes(searchLower) ||
              entry.tags.some(tag => tag.toLowerCase().includes(searchLower));
            
            if (!matchesSearch) return false;
          }

          // Tags filter
          if (selectedTags.length > 0) {
            const matchesTags = selectedTags.every(tag => entry.tags.includes(tag));
            if (!matchesTags) return false;
          }

          // Mood filter
          if (selectedMood && entry.mood !== selectedMood) {
            return false;
          }

          // Privacy filter
          if (selectedPrivacy && entry.privacy !== selectedPrivacy) {
            return false;
          }

          // Source filter
          if (selectedSource && entry.source !== selectedSource) {
            return false;
          }

          return true;
        }).sort((a, b) => {
          let comparison = 0;
          
          switch (sortBy) {
            case 'date':
              comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
              break;
            case 'title':
              comparison = a.title.localeCompare(b.title);
              break;
            case 'mood':
              comparison = (a.mood || '').localeCompare(b.mood || '');
              break;
            case 'privacy':
              comparison = a.privacy.localeCompare(b.privacy);
              break;
            default:
              comparison = 0;
          }
          
          return sortOrder === 'asc' ? comparison : -comparison;
        });
      },

      allTags: () => {
        const { entries } = get();
        const tagSet = new Set<string>();
        entries.forEach(entry => entry.tags.forEach(tag => tagSet.add(tag)));
        return Array.from(tagSet).sort();
      },

      allMoods: () => {
        const { entries } = get();
        const moodSet = new Set<string>();
        entries.forEach(entry => entry.mood && moodSet.add(entry.mood));
        return Array.from(moodSet).sort();
      },

      allSources: () => {
        const { entries } = get();
        const sourceSet = new Set<string>();
        entries.forEach(entry => entry.source && sourceSet.add(entry.source));
        return Array.from(sourceSet).sort();
      },

      clearFilters: () => {
        set({
          searchQuery: '',
          selectedTags: [],
          selectedMood: '',
          selectedPrivacy: '',
          selectedSource: '',
        });
      },

      exportEntries: () => {
        const { entries } = get();
        return JSON.stringify(entries, null, 2);
      },

      importEntries: (json) => {
        try {
          const entries = JSON.parse(json) as JournalEntry[];
          set({ entries });
        } catch (error) {
          console.error('Failed to import entries:', error);
        }
      },

      clearAllEntries: () => {
        set({ entries: [], selectedEntry: null });
        try {
          localStorage.removeItem('journal-entries');
        } catch (error) {
          console.error('Failed to clear entries from localStorage:', error);
        }
      },
    })
  );
