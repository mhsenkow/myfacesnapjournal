/**
 * Mastodon Store - Centralized State Management for Social Integration
 * 
 * This Zustand store serves as the single source of truth for all Mastodon-related
 * state and operations. It manages authentication, feed data, display preferences,
 * and user interactions in a reactive, persistent manner.
 * 
 * 🏪 **State Management:**
 * - Authentication state (tokens, user info, connection status)
 * - Feed data (posts, loading states, error handling)
 * - Display preferences (theme, layout modes, filters)
 * - User interactions (favorites, imports, settings)
 * 
 * 🔄 **Data Flow:**
 * - Reactive updates across all components
 * - Persistent storage with automatic sync
 * - Optimistic updates for better UX
 * - Error state management and recovery
 * 
 * 🎨 **Display Modes:**
 * - Refined: Elegant cards with enhanced typography
 * - Cards: Responsive grid with compact information
 * - Instagram: Square images with engagement overlays
 * - DataViz: Compact pills with visual pattern encoding
 * - Dense: Ultra-compact layout for power users
 * 
 * 🔧 **Key Operations:**
 * - OAuth authentication flow
 * - Timeline fetching with smart pagination
 * - Post filtering and sorting
 * - Import to journal entries
 * - Theme and preference management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MastodonAuth, MastodonPost, MastodonUser, MastodonImportSettings } from '../types/mastodon';
import { mastodonService } from '../services/mastodonService';

interface MastodonStore {
  // Authentication state
  auth: MastodonAuth;
  
  // Import settings
  importSettings: MastodonImportSettings;
  
  // UI state
  isImporting: boolean;
  importProgress: number;
  lastImportError: string | undefined;
  
  // Posts data
  posts: MastodonPost[];
  isLoadingPosts: boolean;
  
  // Feed controls state
  feedType: 'public' | 'local';
  sortBy: 'newest' | 'oldest' | 'popular';
  filterBy: 'all' | 'with_media' | 'with_hashtags';
  searchQuery: string;
  instanceUrl: string;
  postLimit: number;
  displayMode: 'cards' | 'instagram' | 'dataviz' | 'dense' | 'refined';
  
  // Actions
  login: (authData: { instance: string; accessToken: string; user: MastodonUser }) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => void;
  updateImportSettings: (settings: Partial<MastodonImportSettings>) => void;
  importPosts: (limit?: number) => Promise<MastodonPost[]>;
  fetchPosts: (limit?: number) => Promise<void>;
  fetchPublicTimeline: () => Promise<void>;
  clearImportedPosts: () => void;
  setLastImportError: (error: string | undefined) => void;
  setImporting: (isImporting: boolean) => void;
  setImportProgress: (progress: number) => void;
  
  // Feed control actions
  setFeedType: (type: 'public' | 'local') => void;
  setSortBy: (sort: 'newest' | 'oldest' | 'popular') => void;
  setFilterBy: (filter: 'all' | 'with_media' | 'with_hashtags') => void;
  setSearchQuery: (query: string) => void;
  setInstanceUrl: (url: string) => void;
  setPostLimit: (limit: number) => void;
  setDisplayMode: (mode: 'cards' | 'instagram' | 'dataviz' | 'dense' | 'refined') => void;
}

const defaultAuth: MastodonAuth = {
  isAuthenticated: false,
  instance: '',
  accessToken: undefined,
  user: undefined,
  lastAuthDate: undefined
};

const defaultImportSettings: MastodonImportSettings = {
  importLimit: 20,
  importInterval: 24,
  includeReplies: true,
  includeReblogs: false,
  includeMedia: true,
  lastImportDate: undefined
};

export const useMastodonStore = create<MastodonStore>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: defaultAuth,
      importSettings: defaultImportSettings,
      isImporting: false,
      importProgress: 0,
      lastImportError: undefined,
      posts: [],
      isLoadingPosts: false,
      
      // Feed controls initial state
      feedType: 'public',
      sortBy: 'newest',
      filterBy: 'all',
      searchQuery: '',
      instanceUrl: 'https://mastodon.social',
      postLimit: 500,
      displayMode: 'refined',

      // Actions
      login: async (authData) => {
        try {
          const { instance, accessToken, user } = authData;
          
          set({
            auth: {
              isAuthenticated: true,
              instance,
              accessToken,
              user,
              lastAuthDate: new Date()
            },
            lastImportError: undefined
          });

          // Fetch initial posts
          await get().fetchPosts(10);
          
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },

      logout: () => {
        set({
          auth: defaultAuth,
          posts: [],
          lastImportError: undefined
        });
      },

      checkAuthStatus: () => {
        const { auth } = get();
        if (auth.isAuthenticated && auth.accessToken && auth.instance) {
          // Could add token validation here
          console.log('Mastodon authentication is valid');
        }
      },

      updateImportSettings: (settings) => {
        set((state) => ({
          importSettings: { ...state.importSettings, ...settings }
        }));
      },

      importPosts: async (limit?: number) => {
        const { auth, importSettings } = get();
        
        if (!auth.isAuthenticated || !auth.accessToken || !auth.user) {
          throw new Error('Not authenticated with Mastodon');
        }

        set({ isImporting: true, importProgress: 0, lastImportError: undefined });

        try {
          const postsToImport = limit || importSettings.importLimit;
          const posts = await mastodonService.getUserPosts(
            auth.instance,
            auth.accessToken,
            auth.user.id,
            postsToImport
          );

          // Filter posts based on settings
          let filteredPosts = posts;
          
          if (!importSettings.includeReplies) {
            filteredPosts = filteredPosts.filter(post => !post.in_reply_to_id);
          }
          
          if (!importSettings.includeReblogs) {
            filteredPosts = filteredPosts.filter(post => !post.reblog);
          }

          set({ 
            importProgress: 100,
            posts: filteredPosts
          });

          // Update last import date
          set((state) => ({
            importSettings: {
              ...state.importSettings,
              lastImportDate: new Date()
            }
          }));

          return filteredPosts;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Import failed';
          set({ 
            lastImportError: errorMessage,
            importProgress: 0
          });
          throw error;
        } finally {
          set({ isImporting: false });
        }
      },

      fetchPosts: async (limit = 20) => {
        const { auth } = get();
        
        if (!auth.isAuthenticated || !auth.accessToken || !auth.user) {
          return;
        }

        set({ isLoadingPosts: true });

        try {
          const posts = await mastodonService.getUserPosts(
            auth.instance,
            auth.accessToken,
            auth.user.id,
            limit
          );

          set({ posts });
        } catch (error) {
          console.error('Failed to fetch posts:', error);
          set({ lastImportError: 'Failed to fetch posts' });
        } finally {
          set({ isLoadingPosts: false });
        }
      },

      fetchPublicTimeline: async () => {
        const { auth, feedType, instanceUrl, postLimit } = get();
        
        if (!auth.isAuthenticated || !auth.accessToken) {
          return;
        }

        set({ isLoadingPosts: true, lastImportError: undefined });

        try {
          const posts = postLimit > 40 
            ? await mastodonService.getPublicTimelinePaginated(
                instanceUrl,
                auth.accessToken,
                feedType,
                postLimit
              )
            : await mastodonService.getPublicTimeline(
                instanceUrl,
                auth.accessToken,
                feedType,
                postLimit
              );

          // Apply filtering and sorting
          const { sortBy, filterBy, searchQuery } = get();
          let filteredPosts = posts;
          
          // Apply filters
          if (filterBy === 'with_media') {
            filteredPosts = posts.filter(post => post.media_attachments && post.media_attachments.length > 0);
          } else if (filterBy === 'with_hashtags') {
            filteredPosts = posts.filter(post => post.tags && post.tags.length > 0);
          }
          
          // Apply search
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filteredPosts = filteredPosts.filter(post => 
              post.content.toLowerCase().includes(query) ||
              post.account.display_name.toLowerCase().includes(query) ||
              post.account.username.toLowerCase().includes(query) ||
              (post.tags && post.tags.some(tag => tag.name.toLowerCase().includes(query)))
            );
          }
          
          // Apply sorting
          filteredPosts.sort((a, b) => {
            switch (sortBy) {
              case 'oldest':
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
              case 'popular':
                return (b.favourites_count + b.reblogs_count) - (a.favourites_count + a.reblogs_count);
              case 'newest':
              default:
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
          });

          set({ posts: filteredPosts });
        } catch (error) {
          console.error('Failed to fetch public timeline:', error);
          set({ lastImportError: 'Failed to fetch posts' });
        } finally {
          set({ isLoadingPosts: false });
        }
      },

      clearImportedPosts: () => {
        set({ posts: [] });
      },

      setLastImportError: (error) => {
        set({ lastImportError: error });
      },

      setImporting: (isImporting) => {
        set({ isImporting });
      },

      setImportProgress: (progress) => {
        set({ importProgress: Math.max(0, Math.min(100, progress)) });
      },

      // Feed control actions
      setFeedType: (type) => {
        set({ feedType: type });
        // Automatically fetch new posts when feed type changes
        get().fetchPublicTimeline();
      },

      setSortBy: (sort) => {
        set({ sortBy: sort });
        // Re-sort existing posts
        const { posts } = get();
        const sortedPosts = [...posts].sort((a, b) => {
          switch (sort) {
            case 'oldest':
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case 'popular':
              return (b.favourites_count + b.reblogs_count) - (a.favourites_count + a.reblogs_count);
            case 'newest':
            default:
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
        });
        set({ posts: sortedPosts });
      },

      setFilterBy: (filter) => {
        set({ filterBy: filter });
        // Re-fetch posts with new filter
        get().fetchPublicTimeline();
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        // Debounce search - fetch after a short delay
        setTimeout(() => {
          if (get().searchQuery === query) {
            get().fetchPublicTimeline();
          }
        }, 500);
      },

      setInstanceUrl: (url) => {
        set({ instanceUrl: url });
        // Fetch posts from new instance
        get().fetchPublicTimeline();
      },

      setPostLimit: (limit) => {
        const validLimit = Math.max(1, Math.min(10000, limit)); // Clamp between 1 and 10,000
        set({ postLimit: validLimit });
        // Fetch posts with new limit
        get().fetchPublicTimeline();
      },

      setDisplayMode: (mode) => {
        set({ displayMode: mode });
      }
    }),
    {
      name: 'mastodon-store',
      partialize: (state) => ({
        auth: state.auth,
        importSettings: state.importSettings
      })
    }
  )
);

export default useMastodonStore;
