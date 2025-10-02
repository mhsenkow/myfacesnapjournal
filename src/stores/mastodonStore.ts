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
  sortBy: 'newest' | 'oldest' | 'random';
  filterBy: 'all' | 'with_media' | 'with_hashtags';
  searchQuery: string;
  instanceUrl: string;
  postLimit: number;
  displayLimit: number;
  algorithm: 'latest' | 'trending' | 'viral' | 'diverse' | 'balanced' | 'fresh' | 'media_rich' | 'conversational' | 'random';
  displayMode: 'cards' | 'instagram' | 'dataviz' | 'dense' | 'refined';
  isLiveFeed: boolean;
  liveFeedBatchSize: number;
  liveFeedInterval: number;
  
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
  setAlgorithm: (algorithm: 'latest' | 'trending' | 'viral' | 'diverse' | 'balanced' | 'fresh' | 'media_rich' | 'conversational' | 'random') => void;
  setDisplayMode: (mode: 'cards' | 'instagram' | 'dataviz' | 'dense' | 'refined') => void;
  applyAlgorithm: () => void;
  initialize: () => void;
  setIsLiveFeed: (isLive: boolean) => void;
  setLiveFeedBatchSize: (size: number) => void;
  setLiveFeedInterval: (interval: number) => void;
  refreshLiveFeed: () => Promise<void>;
  
  // Background service integration
  toggleBackgroundLoading: (enable: boolean) => void;
  updateBackgroundRefreshInterval: (interval: number) => void;
  
  // Post interactions
  toggleLike: (postId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
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
      isLiveFeed: false,
      liveFeedBatchSize: 25,
      liveFeedInterval: 30000, // 30 seconds

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
          console.log(`Fetching ${postLimit} posts for ${feedType} timeline from ${instanceUrl}`);
          
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
                Math.min(40, postLimit)
              );

          console.log(`Successfully fetched ${allPosts.length} posts (requested: ${postLimit})`);
          
          // Store all posts and apply algorithm
          set({ allPosts });
          
          // Apply algorithm immediately to show available posts
          get().applyAlgorithm();
          
          // Show a brief message if we got fewer than requested
          const { displayLimit } = get();
          if (allPosts.length >= displayLimit) {
            console.log(`Ready to display! Have ${allPosts.length} posts cached, showing ${Math.min(displayLimit, allPosts.length)}`);
          } else {
            console.log(`Partial load: Only ${allPosts.length} posts available (requested: ${postLimit})`);
          }
        } catch (error) {
          console.error('Failed to fetch public timeline:', error);
          const errorMessage = error instanceof Error && error.message.includes('429') 
            ? 'Rate limited by Mastodon instance. Try again in a few minutes or reduce the post limit.'
            : 'Failed to fetch posts';
          set({ lastImportError: errorMessage });
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
            case 'random':
              return Math.random() - 0.5; // Random shuffle
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
            case 'random':
              return Math.random() - 0.5; // Random shuffle
            case 'newest':
            default:
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
        });

        // Apply algorithm to select posts
        let selectedPosts: MastodonPost[] = [];
        
        // Helper function to calculate time decay score
        const getTimeDecayScore = (post: MastodonPost) => {
          const now = new Date().getTime();
          const postTime = new Date(post.created_at).getTime();
          const hoursAgo = (now - postTime) / (1000 * 60 * 60);
          return Math.max(0, 1 - (hoursAgo / 24)); // Decay over 24 hours
        };
        
        // Helper function to calculate engagement score
        const getEngagementScore = (post: MastodonPost) => {
          return post.favourites_count + (post.reblogs_count * 2) + post.replies_count;
        };
        
        // Helper function to calculate viral score (engagement rate)
        const getViralScore = (post: MastodonPost) => {
          const engagement = getEngagementScore(post);
          const hoursAgo = (new Date().getTime() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
          return hoursAgo > 0 ? engagement / hoursAgo : engagement;
        };
        
        switch (algorithm) {
          case 'latest':
            // Chronological order (already sorted by API)
            selectedPosts = filteredPosts.slice(0, displayLimit);
            break;
            
          case 'trending':
            // High engagement posts with time decay
            selectedPosts = [...filteredPosts]
              .sort((a, b) => {
                const aScore = getEngagementScore(a) * getTimeDecayScore(a);
                const bScore = getEngagementScore(b) * getTimeDecayScore(b);
                return bScore - aScore;
              })
              .slice(0, displayLimit);
            break;
            
          case 'viral':
            // Posts with high engagement rate (engagement per hour)
            selectedPosts = [...filteredPosts]
              .sort((a, b) => {
                const aViral = getViralScore(a);
                const bViral = getViralScore(b);
                return bViral - aViral;
              })
              .slice(0, displayLimit);
            break;
            
          case 'diverse':
            // Mix of different types of content and users
            const uniqueUsers = new Set<string>();
            const mediaPosts: MastodonPost[] = [];
            const textPosts: MastodonPost[] = [];
            const taggedPosts: MastodonPost[] = [];
            
            filteredPosts.forEach(post => {
              if (post.media_attachments.length > 0) {
                mediaPosts.push(post);
              } else if (post.tags.length > 0) {
                taggedPosts.push(post);
              } else {
                textPosts.push(post);
              }
            });
            
            // Select diverse mix
            const postsPerType = Math.ceil(displayLimit / 3);
            const diversePosts: MastodonPost[] = [];
            
            // Add media posts
            diversePosts.push(...mediaPosts.slice(0, postsPerType));
            // Add tagged posts
            diversePosts.push(...taggedPosts.slice(0, postsPerType));
            // Add text posts
            diversePosts.push(...textPosts.slice(0, postsPerType));
            
            // Remove duplicates and ensure user diversity
            const finalDiverse: MastodonPost[] = [];
            for (const post of diversePosts) {
              if (finalDiverse.length >= displayLimit) break;
              if (!uniqueUsers.has(post.account.id) || finalDiverse.length < displayLimit * 0.7) {
                finalDiverse.push(post);
                uniqueUsers.add(post.account.id);
              }
            }
            
            selectedPosts = finalDiverse;
            break;
            
          case 'balanced':
            // Balanced mix of high, medium, and low engagement posts
            const engagementSorted = [...filteredPosts].sort((a, b) => {
              const aEngagement = getEngagementScore(a);
              const bEngagement = getEngagementScore(b);
              return bEngagement - aEngagement;
            });
            
            const total = engagementSorted.length;
            const highCount = Math.ceil(displayLimit * 0.4); // 40% high engagement
            const mediumCount = Math.ceil(displayLimit * 0.4); // 40% medium engagement  
            const lowCount = displayLimit - highCount - mediumCount; // 20% low engagement
            
            const highEngagement = engagementSorted.slice(0, Math.ceil(total * 0.2));
            const mediumEngagement = engagementSorted.slice(Math.ceil(total * 0.2), Math.ceil(total * 0.7));
            const lowEngagement = engagementSorted.slice(Math.ceil(total * 0.7));
            
            selectedPosts = [
              ...highEngagement.slice(0, highCount),
              ...mediumEngagement.slice(0, mediumCount),
              ...lowEngagement.slice(0, lowCount)
            ].slice(0, displayLimit);
            break;
            
          case 'fresh':
            // Recent posts with some engagement (not just time-based)
            selectedPosts = [...filteredPosts]
              .filter(post => {
                const hoursAgo = (new Date().getTime() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
                const hasEngagement = getEngagementScore(post) > 0;
                return hoursAgo < 6 && (hasEngagement || hoursAgo < 2); // Fresh with engagement OR very recent
              })
              .sort((a, b) => {
                const aTime = new Date(a.created_at).getTime();
                const bTime = new Date(b.created_at).getTime();
                return bTime - aTime; // Most recent first
              })
              .slice(0, displayLimit);
            break;
            
          case 'media_rich':
            // Posts with media attachments, prioritizing engagement
            selectedPosts = [...filteredPosts]
              .filter(post => post.media_attachments.length > 0)
              .sort((a, b) => {
                const aScore = getEngagementScore(a) * getTimeDecayScore(a);
                const bScore = getEngagementScore(b) * getTimeDecayScore(b);
                return bScore - aScore;
              })
              .slice(0, displayLimit);
            break;
            
          case 'conversational':
            // Posts that encourage discussion (replies, questions, polls)
            selectedPosts = [...filteredPosts]
              .filter(post => {
                const content = post.content.toLowerCase();
                const hasQuestion = content.includes('?');
                const hasPoll = post.poll !== undefined;
                const hasReplies = post.replies_count > 0;
                const isReply = post.in_reply_to_id !== null;
                
                return hasQuestion || hasPoll || hasReplies || isReply;
              })
              .sort((a, b) => {
                const aScore = getEngagementScore(a) * getTimeDecayScore(a);
                const bScore = getEngagementScore(b) * getTimeDecayScore(b);
                return bScore - aScore;
              })
              .slice(0, displayLimit);
            break;
            
          case 'random':
            // True random selection
            const shuffled = [...filteredPosts].sort(() => Math.random() - 0.5);
            selectedPosts = shuffled.slice(0, displayLimit);
            break;
        }
        
        set({ posts: selectedPosts });
      },

      setDisplayMode: (mode) => {
        set({ displayMode: mode });
      },

      setIsLiveFeed: (isLive) => {
        set({ isLiveFeed: isLive });
      },

      setLiveFeedBatchSize: (size) => {
        const validSize = Math.max(10, Math.min(50, size)); // Clamp between 10 and 50
        set({ liveFeedBatchSize: validSize });
      },

      setLiveFeedInterval: (interval) => {
        const validInterval = Math.max(10000, Math.min(300000, interval)); // Clamp between 10s and 5m
        set({ liveFeedInterval: validInterval });
      },

      refreshLiveFeed: async () => {
        const { auth, instanceUrl, feedType, liveFeedBatchSize, allPosts } = get();
        
        if (!auth.isAuthenticated || !auth.accessToken) {
          return;
        }

        try {
          // Fetch new posts
          const newPosts = await mastodonService.getPublicTimeline(
            instanceUrl,
            auth.accessToken,
            feedType,
            liveFeedBatchSize
          );

          // Remove old posts to maintain display limit, add new ones
          const currentPosts = [...allPosts];
          const postsToRemove = Math.min(newPosts.length, currentPosts.length);
          const updatedPosts = [
            ...newPosts,
            ...currentPosts.slice(0, Math.max(0, currentPosts.length - postsToRemove))
          ];

          set({ allPosts: updatedPosts });
          get().applyAlgorithm();
        } catch (error) {
          console.error('Failed to refresh live feed:', error);
        }
      },

      // Initialize algorithm when store is created
      initialize: () => {
        const { allPosts } = get();
        if (allPosts.length > 0) {
          get().applyAlgorithm();
        }
      },

      // Background service integration
      toggleBackgroundLoading: (enable: boolean) => {
        // This will be called by the background service
        console.log(`🔄 Background loading ${enable ? 'enabled' : 'disabled'}`);
      },

      updateBackgroundRefreshInterval: (interval: number) => {
        // This will be called by the background service
        console.log(`⏰ Background refresh interval updated to ${interval}ms`);
      },

      toggleLike: async (postId: string) => {
        console.log('🔄 toggleLike called for post:', postId);
        const { auth, posts, allPosts, mastodonService } = get();
        
        console.log('🔍 Auth state:', {
          isAuthenticated: auth.isAuthenticated,
          hasAccessToken: !!auth.accessToken,
          instance: auth.instance
        });
        
        if (!auth.isAuthenticated || !auth.accessToken) {
          console.error('❌ Not authenticated - user needs to log in to Mastodon first');
          alert('Please log in to Mastodon first to like posts!');
          return;
        }

        // Find the post in both arrays
        const post = posts.find(p => p.id === postId) || allPosts.find(p => p.id === postId);
        if (!post) {
          console.error('Post not found');
          return;
        }

        const isLiked = post.favourited || false;

        try {
          console.log('📡 Making API call to Mastodon:', {
            instance: auth.instance,
            postId,
            isLiked,
            action: isLiked ? 'unfavourite' : 'favourite'
          });
          
          // Call the API
          const updatedPost = await mastodonService.toggleLike(
            auth.instance,
            auth.accessToken,
            postId,
            isLiked
          );
          
          console.log('📥 API response:', updatedPost);

          // Update the post in both arrays
          const updatePostInArray = (postsArray: MastodonPost[]) => {
            return postsArray.map(p => 
              p.id === postId 
                ? { ...p, favourited: updatedPost.favourited, favourites_count: updatedPost.favourites_count }
                : p
            );
          };

          set({
            posts: updatePostInArray(posts),
            allPosts: updatePostInArray(allPosts)
          });

          console.log(`✅ Post ${isLiked ? 'unliked' : 'liked'} successfully`);
        } catch (error) {
          console.error('Failed to toggle like:', error);
          // Could add toast notification here
        }
      },

      toggleBookmark: async (postId: string) => {
        const { auth, posts, allPosts, mastodonService } = get();
        
        if (!auth.isAuthenticated || !auth.accessToken) {
          console.error('Not authenticated');
          return;
        }

        // Find the post in both arrays
        const post = posts.find(p => p.id === postId) || allPosts.find(p => p.id === postId);
        if (!post) {
          console.error('Post not found');
          return;
        }

        const isBookmarked = post.bookmarked || false;

        try {
          // Call the API
          const updatedPost = await mastodonService.toggleBookmark(
            auth.instance,
            auth.accessToken,
            postId,
            isBookmarked
          );

          // Update the post in both arrays
          const updatePostInArray = (postsArray: MastodonPost[]) => {
            return postsArray.map(p => 
              p.id === postId 
                ? { ...p, bookmarked: updatedPost.bookmarked }
                : p
            );
          };

          set({
            posts: updatePostInArray(posts),
            allPosts: updatePostInArray(allPosts)
          });

          console.log(`✅ Post ${isBookmarked ? 'unbookmarked' : 'bookmarked'} successfully`);
        } catch (error) {
          console.error('Failed to toggle bookmark:', error);
          // Could add toast notification here
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
        instanceUrl: state.instanceUrl,
        isLiveFeed: state.isLiveFeed,
        liveFeedBatchSize: state.liveFeedBatchSize,
        liveFeedInterval: state.liveFeedInterval
      })
    }
  )
);

export default useMastodonStore;
