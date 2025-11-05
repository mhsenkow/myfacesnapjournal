/**
 * Twitter Store - Zustand store for managing Twitter/X integration
 * 
 * This store handles:
 * - Twitter authentication (Bearer Token)
 * - Fetching and caching Twitter posts
 * - Feed management and filtering
 * - Local storage persistence
 * 
 * Note: Twitter API v2 requires a Bearer Token. Get one from:
 * https://developer.twitter.com/en/portal/dashboard
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TwitterPost, TwitterUser, TwitterAuth, TwitterFeedSettings } from '../types/twitter';
import { twitterService } from '../services/twitterService';
import { logger } from '../utils/logger';

interface TwitterState {
  // Authentication
  auth: TwitterAuth;
  
  // Posts and feeds
  posts: TwitterPost[];
  allPosts: TwitterPost[];
  isLoading: boolean;
  error: string | null;
  
  // Feed settings
  feedSettings: TwitterFeedSettings;
  
  // Algorithm and display settings
  algorithm: 'latest' | 'trending' | 'viral' | 'diverse' | 'balanced' | 'fresh' | 'media_rich' | 'conversational' | 'following' | 'random';
  displayMode: 'cards' | 'instagram' | 'dataviz' | 'dense' | 'refined' | 'focused' | 'tiktok';
  displayLimit: number;
  
  // Pagination
  nextToken: string | null;
  hasMore: boolean;
}

interface TwitterActions {
  // Authentication
  login: (bearerToken: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<boolean>;
  
  // Profile management
  fetchUserProfile: () => Promise<void>;
  
  // Feed management
  fetchPosts: (limit?: number) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  
  // Settings
  setFeedType: (feedType: 'home' | 'user' | 'search') => void;
  setLimit: (limit: number) => void;
  
  // Algorithm and display settings
  setAlgorithm: (algorithm: 'latest' | 'trending' | 'viral' | 'diverse' | 'balanced' | 'fresh' | 'media_rich' | 'conversational' | 'following' | 'random') => void;
  setDisplayMode: (mode: 'cards' | 'instagram' | 'dataviz' | 'dense' | 'refined' | 'focused' | 'tiktok') => void;
  setDisplayLimit: (limit: number) => void;
  applyAlgorithm: () => void;
  
  // Post interactions
  toggleLike: (tweetId: string) => Promise<void>;
  toggleRetweet: (tweetId: string) => Promise<void>;
  toggleBookmark: (tweetId: string) => Promise<void>; // Local bookmark (Twitter API v2 doesn't have bookmarks endpoint)
  
  // Utilities
  clearError: () => void;
  clearPosts: () => void;
}

export const useTwitterStore = create<TwitterState & TwitterActions>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: {
        isAuthenticated: false,
        bearerToken: undefined,
        user: undefined
      },
      
      posts: [],
      allPosts: [],
      isLoading: false,
      error: null,
      
      feedSettings: {
        feedType: 'home',
        limit: 50
      },
      
      // Algorithm and display settings
      algorithm: 'latest',
      displayMode: 'cards',
      displayLimit: 50,
      
      nextToken: null,
      hasMore: true,

      // Actions
      login: async (bearerToken: string) => {
        set({ isLoading: true, error: null });
        
        try {
          twitterService.setBearerToken(bearerToken);
          
          // Verify token by fetching user profile
          const user = await twitterService.getMe();
          
          set({
            auth: {
              isAuthenticated: true,
              bearerToken,
              user,
              lastAuthDate: new Date()
            },
            isLoading: false
          });
          
          // Fetch initial posts
          await get().fetchPosts();
        } catch (error) {
          console.error('Twitter login error:', error);
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        twitterService.setBearerToken('');
        set({
          auth: {
            isAuthenticated: false,
            bearerToken: undefined,
            user: undefined
          },
          posts: [],
          allPosts: [],
          nextToken: null,
          hasMore: true,
          error: null
        });
      },

      restoreSession: async () => {
        const { auth } = get();
        if (!auth.isAuthenticated || !auth.bearerToken) {
          return false;
        }

        try {
          twitterService.setBearerToken(auth.bearerToken);
          const user = await twitterService.getMe();
          
          set({
            auth: {
              ...auth,
              user
            }
          });
          
          return true;
        } catch (error) {
          logger.error('Failed to restore Twitter session:', error);
          get().logout();
          return false;
        }
      },

      fetchUserProfile: async () => {
        const { auth } = get();
        if (!auth.isAuthenticated) {
          return;
        }

        try {
          const user = await twitterService.getMe();
          set({
            auth: {
              ...auth,
              user
            }
          });
        } catch (error) {
          logger.error('Failed to fetch Twitter user profile:', error);
        }
      },

      fetchPosts: async (limit = 50) => {
        const { auth, feedSettings } = get();
        if (!auth.isAuthenticated || !auth.bearerToken) {
          logger.debug('Twitter fetchPosts: Not authenticated');
          return;
        }

        set({ isLoading: true, error: null });

        try {
          let result;
          
          switch (feedSettings.feedType) {
            case 'home':
              result = await twitterService.getHomeTimeline(limit);
              break;
            case 'user':
              if (auth.user?.username) {
                result = await twitterService.getUserTweets(auth.user.username, limit);
              } else {
                throw new Error('User not authenticated');
              }
              break;
            case 'search':
              // Default search - can be customized
              result = await twitterService.searchTweets('from:twitter', limit);
              break;
            default:
              result = await twitterService.getHomeTimeline(limit);
          }

          const newPosts: TwitterPost[] = result.tweets;
          
          // Deduplicate posts by ID
          const existingPosts = get().allPosts;
          const existingIds = new Set(existingPosts.map(post => post.id));
          const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));
          
          set({
            posts: uniqueNewPosts,
            allPosts: [...existingPosts, ...uniqueNewPosts],
            nextToken: result.nextToken || null,
            hasMore: !!result.nextToken,
            isLoading: false
          });

          // Apply algorithm
          get().applyAlgorithm();
        } catch (error) {
          console.error('Twitter fetch error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch posts',
            isLoading: false
          });
        }
      },

      loadMorePosts: async () => {
        const { auth, feedSettings, nextToken, hasMore } = get();
        if (!auth.isAuthenticated || !hasMore || !nextToken) {
          return;
        }

        set({ isLoading: true });

        try {
          let result;
          
          switch (feedSettings.feedType) {
            case 'home':
              result = await twitterService.getHomeTimeline(feedSettings.limit, nextToken);
              break;
            case 'user':
              if (auth.user?.username) {
                result = await twitterService.getUserTweets(auth.user.username, feedSettings.limit, nextToken);
              } else {
                throw new Error('User not authenticated');
              }
              break;
            case 'search':
              result = await twitterService.searchTweets('from:twitter', feedSettings.limit, nextToken);
              break;
            default:
              result = await twitterService.getHomeTimeline(feedSettings.limit, nextToken);
          }

          const newPosts: TwitterPost[] = result.tweets;
          const existingPosts = get().allPosts;
          const existingIds = new Set(existingPosts.map(post => post.id));
          const uniqueNewPosts = newPosts.filter(post => !existingIds.has(post.id));

          set({
            posts: [...get().posts, ...uniqueNewPosts],
            allPosts: [...existingPosts, ...uniqueNewPosts],
            nextToken: result.nextToken || null,
            hasMore: !!result.nextToken,
            isLoading: false
          });

          get().applyAlgorithm();
        } catch (error) {
          console.error('Twitter loadMore error:', error);
          set({ isLoading: false });
        }
      },

      refreshFeed: async () => {
        set({ posts: [], allPosts: [], nextToken: null, hasMore: true });
        await get().fetchPosts();
      },

      setFeedType: (feedType: 'home' | 'user' | 'search') => {
        set({
          feedSettings: {
            ...get().feedSettings,
            feedType
          }
        });
        get().refreshFeed();
      },

      setLimit: (limit: number) => {
        set({
          feedSettings: {
            ...get().feedSettings,
            limit
          }
        });
      },

      setAlgorithm: (algorithm) => {
        set({ algorithm });
        get().applyAlgorithm();
      },

      setDisplayMode: (displayMode) => {
        set({ displayMode });
      },

      setDisplayLimit: (displayLimit) => {
        set({ displayLimit });
        get().applyAlgorithm();
      },

      applyAlgorithm: () => {
        const { allPosts, displayLimit, algorithm } = get();
        
        if (allPosts.length === 0) {
          set({ posts: [] });
          return;
        }

        let selectedPosts: TwitterPost[] = [];

        // Helper function to calculate engagement score
        const getEngagementScore = (post: TwitterPost): number => {
          const likes = post.public_metrics?.like_count || 0;
          const retweets = post.public_metrics?.retweet_count || 0;
          const replies = post.public_metrics?.reply_count || 0;
          return likes + (retweets * 2) + (replies * 1.5);
        };

        // Helper function to calculate time decay score
        const getTimeDecayScore = (post: TwitterPost): number => {
          const now = new Date().getTime();
          const postTime = new Date(post.created_at).getTime();
          const hoursAgo = (now - postTime) / (1000 * 60 * 60);
          return Math.max(0.1, 1 - (hoursAgo / 24)); // Decay over 24 hours
        };

        switch (algorithm) {
          case 'latest':
            selectedPosts = [...allPosts]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, displayLimit);
            break;

          case 'trending':
            selectedPosts = [...allPosts]
              .sort((a, b) => {
                const aScore = getEngagementScore(a) * getTimeDecayScore(a);
                const bScore = getEngagementScore(b) * getTimeDecayScore(b);
                return bScore - aScore;
              })
              .slice(0, displayLimit);
            break;

          case 'viral':
            selectedPosts = [...allPosts]
              .filter(post => {
                const engagement = getEngagementScore(post);
                const timeDecay = getTimeDecayScore(post);
                return (engagement * timeDecay) > 10;
              })
              .sort((a, b) => {
                const aScore = getEngagementScore(a) * getTimeDecayScore(a);
                const bScore = getEngagementScore(b) * getTimeDecayScore(b);
                return bScore - aScore;
              })
              .slice(0, displayLimit);
            break;

          default:
            selectedPosts = [...allPosts]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, displayLimit);
        }

        set({ posts: selectedPosts });
      },

      toggleLike: async (tweetId: string) => {
        const { auth, posts, allPosts } = get();
        if (!auth.isAuthenticated || !auth.bearerToken) {
          return;
        }

        const post = posts.find(p => p.id === tweetId) || allPosts.find(p => p.id === tweetId);
        if (!post) return;

        const isLiked = false; // Twitter API v2 doesn't provide like status in read-only mode

        try {
          if (isLiked) {
            await twitterService.unlikeTweet(tweetId);
          } else {
            await twitterService.likeTweet(tweetId);
          }

          // Update post counts optimistically
          const updatePost = (p: TwitterPost) => 
            p.id === tweetId
              ? {
                  ...p,
                  public_metrics: {
                    ...p.public_metrics,
                    like_count: isLiked 
                      ? Math.max(0, (p.public_metrics?.like_count || 0) - 1)
                      : (p.public_metrics?.like_count || 0) + 1
                  }
                }
              : p;

          set({
            posts: posts.map(updatePost),
            allPosts: allPosts.map(updatePost)
          });
        } catch (error) {
          console.error('Failed to toggle like:', error);
        }
      },

      toggleRetweet: async (tweetId: string) => {
        const { auth, posts, allPosts } = get();
        if (!auth.isAuthenticated || !auth.bearerToken) {
          return;
        }

        const post = posts.find(p => p.id === tweetId) || allPosts.find(p => p.id === tweetId);
        if (!post) return;

        const isRetweeted = false; // Twitter API v2 doesn't provide retweet status in read-only mode

        try {
          if (isRetweeted) {
            await twitterService.unretweet(tweetId);
          } else {
            await twitterService.retweet(tweetId);
          }

          // Update post counts optimistically
          const updatePost = (p: TwitterPost) => 
            p.id === tweetId
              ? {
                  ...p,
                  public_metrics: {
                    ...p.public_metrics,
                    retweet_count: isRetweeted 
                      ? Math.max(0, (p.public_metrics?.retweet_count || 0) - 1)
                      : (p.public_metrics?.retweet_count || 0) + 1
                  }
                }
              : p;

          set({
            posts: posts.map(updatePost),
            allPosts: allPosts.map(updatePost)
          });
        } catch (error) {
          console.error('Failed to toggle retweet:', error);
        }
      },

      toggleBookmark: async (tweetId: string) => {
        // Twitter API v2 doesn't have a bookmarks endpoint
        // So we'll use local storage
        const bookmarkedPosts = JSON.parse(localStorage.getItem('twitter-bookmarks') || '[]') as string[];
        const isBookmarked = bookmarkedPosts.includes(tweetId);

        if (isBookmarked) {
          const updated = bookmarkedPosts.filter(id => id !== tweetId);
          localStorage.setItem('twitter-bookmarks', JSON.stringify(updated));
        } else {
          bookmarkedPosts.push(tweetId);
          localStorage.setItem('twitter-bookmarks', JSON.stringify(bookmarkedPosts));
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearPosts: () => {
        set({ posts: [], allPosts: [], nextToken: null, hasMore: true });
      }
    }),
    {
      name: 'twitter-store',
      partialize: (state) => ({
        auth: state.auth,
        feedSettings: state.feedSettings,
        algorithm: state.algorithm,
        displayLimit: state.displayLimit,
        displayMode: state.displayMode
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.auth.bearerToken) {
          twitterService.setBearerToken(state.auth.bearerToken);
        }
      }
    }
  )
);

export default useTwitterStore;

