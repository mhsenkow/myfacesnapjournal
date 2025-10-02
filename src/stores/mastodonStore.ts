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
  allPosts: MastodonPost[];
  isLoadingPosts: boolean;
  
  // Feed controls state
  feedType: 'public' | 'local';
  sortBy: 'newest' | 'oldest' | 'popular';
  filterBy: 'all' | 'with_media' | 'with_hashtags';
  searchQuery: string;
  instanceUrl: string;
  postLimit: number;
  displayLimit: number;
  algorithm: 'latest' | 'trending' | 'diverse' | 'balanced' | 'random';
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
  setDisplayLimit: (limit: number) => void;
  setAlgorithm: (algorithm: 'latest' | 'trending' | 'diverse' | 'balanced' | 'random') => void;
  setDisplayMode: (mode: 'cards' | 'instagram' | 'dataviz' | 'dense' | 'refined') => void;
  applyAlgorithm: () => void;
  initialize: () => void;
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
      allPosts: [],
      isLoadingPosts: false,
      
      // Feed controls initial state
      feedType: 'public',
      sortBy: 'newest',
      filterBy: 'all',
      searchQuery: '',
      instanceUrl: 'https://mastodon.social',
      postLimit: 500,
      displayLimit: 50,
      algorithm: 'latest',
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
          const allPosts = postLimit > 40 
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

          // Store all posts and apply algorithm
          set({ allPosts });
          get().applyAlgorithm();
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

      setDisplayLimit: (limit) => {
        const validLimit = Math.max(1, Math.min(1000, limit)); // Clamp between 1 and 1,000
        set({ displayLimit: validLimit });
        // Apply algorithm with new display limit
        get().applyAlgorithm();
      },

      setAlgorithm: (algorithm) => {
        set({ algorithm });
        // Apply new algorithm
        get().applyAlgorithm();
      },

      applyAlgorithm: () => {
        const { allPosts, displayLimit, algorithm, sortBy, filterBy, searchQuery } = get();
        
        if (allPosts.length === 0) {
          set({ posts: [] });
          return;
        }

        // Apply filtering and sorting first
        let filteredPosts = [...allPosts];
        
        // Apply filters
        if (filterBy === 'with_media') {
          filteredPosts = filteredPosts.filter(post => post.media_attachments && post.media_attachments.length > 0);
        } else if (filterBy === 'with_hashtags') {
          filteredPosts = filteredPosts.filter(post => post.tags && post.tags.length > 0);
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

        // Apply algorithm to select posts
        let selectedPosts: MastodonPost[] = [];
        
        switch (algorithm) {
          case 'latest':
            // Take the most recent posts
            selectedPosts = filteredPosts.slice(0, displayLimit);
            break;
            
          case 'trending':
            // Sort by engagement and take top posts
            const trendingPosts = [...filteredPosts].sort((a, b) => {
              const aEngagement = a.favourites_count + a.reblogs_count + a.replies_count;
              const bEngagement = b.favourites_count + b.reblogs_count + b.replies_count;
              return bEngagement - aEngagement;
            });
            selectedPosts = trendingPosts.slice(0, displayLimit);
            break;
            
          case 'diverse':
            // Mix of recent and popular posts
            const recentPosts = filteredPosts.slice(0, Math.ceil(displayLimit / 2));
            const popularPosts = [...filteredPosts].sort((a, b) => {
              const aEngagement = a.favourites_count + a.reblogs_count;
              const bEngagement = b.favourites_count + b.reblogs_count;
              return bEngagement - aEngagement;
            }).slice(0, Math.floor(displayLimit / 2));
            
            // Remove duplicates and combine
            const combinedPosts = [...recentPosts];
            popularPosts.forEach(post => {
              if (!combinedPosts.find(p => p.id === post.id)) {
                combinedPosts.push(post);
              }
            });
            selectedPosts = combinedPosts.slice(0, displayLimit);
            break;
            
          case 'balanced':
            // Distribute across different engagement levels
            const sortedByEngagement = [...filteredPosts].sort((a, b) => {
              const aEngagement = a.favourites_count + a.reblogs_count;
              const bEngagement = b.favourites_count + b.reblogs_count;
              return bEngagement - aEngagement;
            });
            
            const highEngagement = sortedByEngagement.slice(0, Math.ceil(displayLimit / 3));
            const mediumEngagement = sortedByEngagement.slice(
              Math.ceil(sortedByEngagement.length / 3), 
              Math.ceil(sortedByEngagement.length / 3) + Math.ceil(displayLimit / 3)
            );
            const lowEngagement = sortedByEngagement.slice(-Math.ceil(displayLimit / 3));
            
            selectedPosts = [...highEngagement, ...mediumEngagement, ...lowEngagement].slice(0, displayLimit);
            break;
            
          case 'random':
            // Random selection
            const shuffled = [...filteredPosts].sort(() => 0.5 - Math.random());
            selectedPosts = shuffled.slice(0, displayLimit);
            break;
        }
        
        set({ posts: selectedPosts });
      },

      setDisplayMode: (mode) => {
        set({ displayMode: mode });
      },

      // Initialize algorithm when store is created
      initialize: () => {
        const { allPosts } = get();
        if (allPosts.length > 0) {
          get().applyAlgorithm();
        }
      }
    }),
    {
      name: 'mastodon-store',
      partialize: (state) => ({
        auth: state.auth,
        importSettings: state.importSettings,
        algorithm: state.algorithm,
        displayLimit: state.displayLimit,
        postLimit: state.postLimit,
        displayMode: state.displayMode,
        feedType: state.feedType,
        sortBy: state.sortBy,
        filterBy: state.filterBy,
        instanceUrl: state.instanceUrl
      })
    }
  )
);

export default useMastodonStore;
