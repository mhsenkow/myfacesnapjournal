/**
 * Bluesky Store - Zustand store for managing Bluesky integration
 * 
 * This store handles:
 * - Bluesky authentication and session management
 * - Fetching and caching Bluesky posts
 * - Feed management and filtering
 * - Local storage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BskyAgent } from '@bluesky-social/api';
import { BlueskyPost, BlueskyAuth, BlueskySession, BlueskyFeedType, BlueskyFeedSettings } from '../types/bluesky';
import { useJournalStore } from './journalStore';
import { logger } from '../utils/logger';

interface BlueskyState {
  // Authentication
  auth: BlueskyAuth;
  sessionExpired: boolean;
  
  // Posts and feeds
  posts: BlueskyPost[];
  allPosts: BlueskyPost[];
  isLoading: boolean;
  error: string | null;
  
  // Feed settings
  feedSettings: BlueskyFeedSettings;
  
  // Algorithm and display settings
  algorithm: 'latest' | 'trending' | 'viral' | 'diverse' | 'balanced' | 'fresh' | 'media_rich' | 'conversational' | 'following' | 'random';
  displayMode: 'cards' | 'instagram' | 'dataviz' | 'dense' | 'refined' | 'focused' | 'tiktok';
  displayLimit: number;
  isLiveFeed: boolean;
  liveFeedBatchSize: number;
  liveFeedInterval: number;
  
  // Pagination
  cursor: string | null;
  hasMore: boolean;
  
  // Agent instance
  agent: BskyAgent | null;
}

interface BlueskyActions {
  // Authentication
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  
  // Profile management
  fetchUserProfile: () => Promise<void>;
  
  // Feed management
  fetchPosts: (limit?: number) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  
  // Settings
  setFeedType: (feedType: BlueskyFeedType) => void;
  setLimit: (limit: number) => void;
  
  // Algorithm and display settings
  setAlgorithm: (algorithm: 'latest' | 'trending' | 'viral' | 'diverse' | 'balanced' | 'fresh' | 'media_rich' | 'conversational' | 'following' | 'random') => void;
  setDisplayMode: (mode: 'cards' | 'instagram' | 'dataviz' | 'dense' | 'refined' | 'focused') => void;
  setDisplayLimit: (limit: number) => void;
  setIsLiveFeed: (isLive: boolean) => void;
  setLiveFeedBatchSize: (size: number) => void;
  setLiveFeedInterval: (interval: number) => void;
  applyAlgorithm: () => void;
  
  // Post interactions
  likePost: (uri: string, cid: string) => Promise<void>;
  toggleLike: (uri: string, cid: string) => Promise<void>;
  repostPost: (uri: string, cid: string) => Promise<void>;
  toggleRepost: (uri: string, cid: string) => Promise<void>;
  toggleBookmark: (uri: string) => Promise<void>; // Local bookmark (Bluesky doesn't have native bookmarks)
  
  // Utilities
  clearError: () => void;
  clearPosts: () => void;
  importPosts: () => Promise<void>;
  fetchMyPosts: () => Promise<BlueskyPost[] | undefined>;
}

export const useBlueskyStore = create<BlueskyState & BlueskyActions>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: {
        isAuthenticated: false,
        session: null,
        server: 'https://bsky.social',
        user: undefined
      },
      sessionExpired: false,
      
      posts: [],
      allPosts: [],
      isLoading: false,
      error: null,
      
      feedSettings: {
        feedType: 'timeline',
        limit: 50
      },
      
      // Algorithm and display settings
      algorithm: 'latest',
      displayMode: 'cards',
      displayLimit: 50,
      isLiveFeed: false,
      liveFeedBatchSize: 20,
      liveFeedInterval: 30000,
      
      cursor: null,
      hasMore: true,
      agent: null,

      // Actions
      login: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const agent = new BskyAgent({ service: 'https://bsky.social' });
          
          // Create session
          const response = await agent.login({
            identifier,
            password
          });
          
          if (response.success) {
            const session: BlueskySession = {
              did: response.data.did,
              handle: response.data.handle,
              accessJwt: response.data.accessJwt,
              refreshJwt: response.data.refreshJwt,
              email: response.data.email
            };
            
            set({
              auth: {
                isAuthenticated: true,
                session,
                server: 'https://bsky.social'
              },
              agent,
              isLoading: false
            });
            
            // Persist session to localStorage
            localStorage.setItem('bluesky-session', JSON.stringify(session));
            
            // Fetch user profile
            await get().fetchUserProfile();
            
            // Fetch initial posts
            await get().fetchPosts();
          } else {
            throw new Error('Login failed');
          }
        } catch (error) {
          console.error('Bluesky login error:', error);
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('bluesky-session');
        set({
          auth: {
            isAuthenticated: false,
            session: null,
            server: 'https://bsky.social',
            user: undefined
          },
          sessionExpired: true,
          posts: [],
          allPosts: [],
          cursor: null,
          hasMore: true,
          agent: null,
          error: null
        });
      },

      refreshSession: async () => {
        const { auth } = get();
        if (!auth.isAuthenticated || !auth.session) {
          logger.debug('Bluesky refreshSession: Not authenticated or no session');
          return;
        }
        
        try {
          logger.debug('Bluesky refreshSession: Attempting to refresh session');
          
          // Create a fresh agent for the refresh
          const agent = new BskyAgent({ service: 'https://bsky.social' });
          
          // Try to resume the session first
          try {
            await agent.resumeSession(auth.session as any);
            logger.debug('Bluesky refreshSession: Session resumed successfully');
            
            // Test the session by making a simple request
            try {
              const testResponse = await agent.getProfile({ actor: auth.session.did });
              if (testResponse.success) {
                logger.debug('Bluesky refreshSession: Session is valid');
                return;
              }
            } catch (testError) {
              logger.debug('Bluesky refreshSession: Session test failed, session may be expired');
            }
          } catch (resumeError) {
            logger.debug('Bluesky refreshSession: Session resume failed, session expired');
          }
          
          // If resume fails, the session is expired - we need to re-login
          logger.debug('Bluesky refreshSession: Session expired, user needs to re-login');
          
          // If session is expired, logout user and show notification
          logger.debug('Bluesky refreshSession: Session expired, logging out');
          get().logout();
          
          // Show user-friendly notification
          if (typeof window !== 'undefined') {
            // Import the toast system dynamically to avoid circular dependencies
            import('../contexts/AppContext').then(({ useApp }) => {
              // This will be handled by the component that calls refreshSession
            });
          }
          
        } catch (error) {
          console.error('Failed to refresh Bluesky session:', error);
          // If refresh fails, logout user
          get().logout();
        }
      },

      fetchUserProfile: async () => {
        const { auth } = get();
        if (!auth.isAuthenticated || !auth.session) {
          logger.debug('Bluesky fetchUserProfile: Not authenticated');
          return;
        }

        try {
          // Create a fresh agent for this request
          const agent = new BskyAgent({ service: 'https://bsky.social' });
          await agent.resumeSession(auth.session as any);

          // Fetch user profile
          const response = await agent.getProfile({
            actor: auth.session.did
          });

          if (response.success) {
            const profile = response.data;
            const userProfile = {
              did: profile.did,
              handle: profile.handle,
              displayName: profile.displayName,
              description: profile.description,
              avatar: profile.avatar,
              verified: false, // Bluesky doesn't have verified status like Twitter
              createdAt: profile.createdAt
            };

            set({
              auth: {
                ...auth,
                user: userProfile
              }
            });

            logger.debug('Bluesky user profile fetched successfully:', userProfile);
          }
        } catch (error) {
          console.error('Failed to fetch Bluesky user profile:', error);
        }
      },

      fetchPosts: async (limit = 50) => {
        const { auth, feedSettings } = get();
        if (!auth.isAuthenticated || !auth.session) {
          logger.debug('Bluesky fetchPosts: Not authenticated or no session', { 
            isAuthenticated: auth.isAuthenticated, 
            hasSession: !!auth.session,
            authSession: auth.session
          });
          return;
        }

        // Create a fresh agent for this request
        const agent = new BskyAgent({ service: 'https://bsky.social' });
        try {
          await agent.resumeSession(auth.session as any);
          logger.debug('Bluesky agent created and session resumed successfully');
        } catch (error) {
          console.error('Failed to resume session for fetchPosts:', error);
          
          // Try to refresh the session before giving up
          try {
            logger.debug('Attempting to refresh session before retrying fetchPosts');
            await get().refreshSession();
            
            // Try again with refreshed session
            const refreshedAuth = get().auth;
            if (refreshedAuth.isAuthenticated && refreshedAuth.session) {
              await agent.resumeSession(refreshedAuth.session as any);
              logger.debug('Bluesky agent created and refreshed session resumed successfully');
            } else {
              console.error('Session refresh failed, cannot fetch posts');
              return;
            }
          } catch (refreshError) {
            console.error('Failed to refresh session for fetchPosts:', refreshError);
            return;
          }
        }
        
        logger.debug('Bluesky fetchPosts: Starting fetch', { feedSettings, limit });
        set({ isLoading: true, error: null });
        
        try {
          let response;
          
          switch (feedSettings.feedType) {
            case 'timeline':
              logger.debug('Bluesky fetchPosts: Fetching timeline');
              response = await agent.getTimeline({
                limit,
                cursor: get().cursor || undefined
              });
              break;
            case 'following':
              logger.debug('Bluesky fetchPosts: Fetching author feed for', auth.session!.handle);
              logger.debug('Bluesky fetchPosts: Using DID for actor:', auth.session!.did);
              response = await agent.getAuthorFeed({
                actor: auth.session!.did, // Use DID instead of handle
                filter: 'posts_no_replies',
                limit,
                cursor: get().cursor || undefined
              });
              break;
            case 'likes':
              response = await agent.getActorLikes({
                actor: auth.session!.handle,
                limit,
                cursor: get().cursor || undefined
              });
              break;
            default:
              throw new Error(`Unknown feed type: ${feedSettings.feedType}`);
          }
          
          logger.debug('Bluesky fetchPosts: API response', { 
            success: response.success, 
            feedLength: response.data?.feed?.length,
            firstPost: response.data?.feed?.[0] ? {
              uri: response.data.feed[0].post.uri,
              author: {
                did: response.data.feed[0].post.author.did,
                handle: response.data.feed[0].post.author.handle
              }
            } : null
          });
          
          if (response.success) {
            logger.debug('Bluesky fetchPosts: Processing posts', { feedLength: response.data.feed.length });
            const newPosts: BlueskyPost[] = response.data.feed.map(item => ({
              id: item.post.uri,
              uri: item.post.uri,
              cid: item.post.cid,
              author: {
                did: item.post.author.did,
                handle: item.post.author.handle,
                displayName: item.post.author.displayName,
                description: (item.post.author as any).description,
                avatar: item.post.author.avatar,
                verified: (item.post.author as any).verified,
                createdAt: (item.post.author as any).createdAt
              },
              record: {
                text: (item.post.record as any).text || '',
                createdAt: (item.post.record as any).createdAt || new Date().toISOString(),
                reply: (item.post.record as any).reply,
                facets: (item.post.record as any).facets,
                embed: (item.post.record as any).embed
              },
              replyCount: item.post.replyCount || 0,
              repostCount: item.post.repostCount || 0,
              likeCount: item.post.likeCount || 0,
              indexedAt: item.post.indexedAt,
              viewer: item.post.viewer,
              labels: item.post.labels
            }));
            
            // Deduplicate posts by URI to prevent duplicates
            const existingPosts = get().posts;
            const existingUris = new Set(existingPosts.map(post => post.uri));
            const uniqueNewPosts = newPosts.filter(post => !existingUris.has(post.uri));
            
            logger.debug(`Bluesky fetchPosts: ${newPosts.length} new posts, ${uniqueNewPosts.length} unique after deduplication`);
            
            set({
              posts: [...existingPosts, ...uniqueNewPosts],
              allPosts: [...get().allPosts, ...uniqueNewPosts],
              cursor: response.data.cursor,
              hasMore: !!response.data.cursor,
              isLoading: false
            });
          } else {
            throw new Error('Failed to fetch posts');
          }
        } catch (error) {
          console.error('Bluesky fetch error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch posts',
            isLoading: false
          });
        }
      },

      loadMorePosts: async () => {
        const { hasMore, isLoading } = get();
        if (!hasMore || isLoading) return;
        
        await get().fetchPosts();
      },

      refreshFeed: async () => {
        set({ cursor: null, allPosts: [], hasMore: true });
        await get().fetchPosts();
      },

      setFeedType: (feedType: BlueskyFeedType) => {
        set({
          feedSettings: {
            ...get().feedSettings,
            feedType
          },
          cursor: null,
          allPosts: [],
          hasMore: true
        });
        
        // Fetch new feed type
        get().fetchPosts();
      },

      setLimit: (limit: number) => {
        set({
          feedSettings: {
            ...get().feedSettings,
            limit
          }
        });
      },

      // Algorithm and display settings
      setAlgorithm: (algorithm) => {
        set({ algorithm });
        
        // If switching to "following" algorithm, fetch timeline feed
        if (algorithm === 'following') {
          logger.debug('Bluesky: Switching to following algorithm, fetching timeline feed');
          set({ 
            feedSettings: { ...get().feedSettings, feedType: 'timeline' },
            cursor: null,
            allPosts: [],
            hasMore: true
          });
          // Fetch new posts from timeline
          get().fetchPosts();
        } else {
          // Apply algorithm to existing posts
          get().applyAlgorithm();
        }
      },

      setDisplayMode: (displayMode) => {
        set({ displayMode });
      },

      setDisplayLimit: (displayLimit) => {
        set({ displayLimit });
        get().applyAlgorithm();
      },

      setIsLiveFeed: (isLiveFeed) => {
        set({ isLiveFeed });
      },

      setLiveFeedBatchSize: (liveFeedBatchSize) => {
        const validSize = Math.max(10, Math.min(50, liveFeedBatchSize));
        set({ liveFeedBatchSize: validSize });
      },

      setLiveFeedInterval: (liveFeedInterval) => {
        const validInterval = Math.max(10000, Math.min(300000, liveFeedInterval));
        set({ liveFeedInterval: validInterval });
      },

      applyAlgorithm: () => {
        const { allPosts, displayLimit, algorithm } = get();
        
        if (allPosts.length === 0) {
          set({ posts: [] });
          return;
        }

        let selectedPosts: BlueskyPost[] = [];

        // Helper function to calculate engagement score
        const getEngagementScore = (post: BlueskyPost): number => {
          const likes = post.likeCount || 0;
          const reposts = post.repostCount || 0;
          const replies = post.replyCount || 0;
          return likes + (reposts * 2) + (replies * 1.5);
        };

        // Helper function to calculate time decay score
        const getTimeDecayScore = (post: BlueskyPost): number => {
          const now = new Date().getTime();
          const postTime = new Date(post.indexedAt).getTime();
          const hoursAgo = (now - postTime) / (1000 * 60 * 60);
          return Math.max(0.1, 1 - (hoursAgo / 24)); // Decay over 24 hours
        };

        switch (algorithm) {
          case 'latest':
            selectedPosts = [...allPosts]
              .sort((a, b) => new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime())
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
                return (engagement * timeDecay) > 10; // High engagement threshold
              })
              .sort((a, b) => {
                const aScore = getEngagementScore(a) * getTimeDecayScore(a);
                const bScore = getEngagementScore(b) * getTimeDecayScore(b);
                return bScore - aScore;
              })
              .slice(0, displayLimit);
            break;

          case 'diverse':
            // Mix of different types of posts
            const diverseShuffled = [...allPosts].sort(() => Math.random() - 0.5);
            selectedPosts = diverseShuffled.slice(0, displayLimit);
            break;

          case 'balanced':
            // Balance between recency and engagement
            selectedPosts = [...allPosts]
              .sort((a, b) => {
                const aScore = (getEngagementScore(a) * 0.7) + (getTimeDecayScore(a) * 0.3);
                const bScore = (getEngagementScore(b) * 0.7) + (getTimeDecayScore(b) * 0.3);
                return bScore - aScore;
              })
              .slice(0, displayLimit);
            break;

          case 'fresh':
            // Recent posts with some engagement
            selectedPosts = [...allPosts]
              .filter(post => {
                const hoursAgo = (new Date().getTime() - new Date(post.indexedAt).getTime()) / (1000 * 60 * 60);
                return hoursAgo < 6; // Within last 6 hours
              })
              .sort((a, b) => {
                const aScore = getEngagementScore(a) * getTimeDecayScore(a);
                const bScore = getEngagementScore(b) * getTimeDecayScore(b);
                return bScore - aScore;
              })
              .slice(0, displayLimit);
            break;

          case 'media_rich':
            // Posts with media content
            selectedPosts = [...allPosts]
              .filter(post => {
                const record = post.record as any;
                return record?.embed?.images || record?.embed?.external || record?.embed?.record;
              })
              .sort((a, b) => {
                const aScore = getEngagementScore(a) * getTimeDecayScore(a);
                const bScore = getEngagementScore(b) * getTimeDecayScore(b);
                return bScore - aScore;
              })
              .slice(0, displayLimit);
            break;

          case 'conversational':
            // Posts that encourage discussion (replies, questions, polls)
            selectedPosts = [...allPosts]
              .filter(post => {
                const content = (post.record as any)?.text?.toLowerCase() || '';
                const hasQuestion = content.includes('?');
                const hasReplies = post.replyCount > 0;
                const isReply = (post.record as any)?.reply !== undefined;
                const hasMentions = content.includes('@');
                const hasQuestionWords = /\b(what|how|why|when|where|who|which|would|could|should|do you|have you|are you|is there|can you)\b/.test(content);
                const hasDiscussionPrompts = /\b(thoughts|opinions|discuss|debate|agree|disagree|what do you think|your take|perspective)\b/.test(content);
                
                return hasQuestion || hasReplies || isReply || hasMentions || hasQuestionWords || hasDiscussionPrompts;
              })
              .sort((a, b) => {
                const aContent = (a.record as any)?.text?.toLowerCase() || '';
                const bContent = (b.record as any)?.text?.toLowerCase() || '';
                
                // Boost score for posts with more conversational elements
                const aConversationalScore = 
                  (aContent.includes('?') ? 2 : 0) +
                  (a.replyCount > 0 ? 1.5 : 0) +
                  (aContent.includes('@') ? 1 : 0) +
                  (/\b(what|how|why|when|where|who|which|would|could|should|do you|have you|are you|is there|can you)\b/.test(aContent) ? 1.5 : 0) +
                  (/\b(thoughts|opinions|discuss|debate|agree|disagree|what do you think|your take|perspective)\b/.test(aContent) ? 2 : 0);
                
                const bConversationalScore = 
                  (bContent.includes('?') ? 2 : 0) +
                  (b.replyCount > 0 ? 1.5 : 0) +
                  (bContent.includes('@') ? 1 : 0) +
                  (/\b(what|how|why|when|where|who|which|would|could|should|do you|have you|are you|is there|can you)\b/.test(bContent) ? 1.5 : 0) +
                  (/\b(thoughts|opinions|discuss|debate|agree|disagree|what do you think|your take|perspective)\b/.test(bContent) ? 2 : 0);
                
                const aScore = (getEngagementScore(a) + aConversationalScore) * getTimeDecayScore(a);
                const bScore = (getEngagementScore(b) + bConversationalScore) * getTimeDecayScore(b);
                return bScore - aScore;
              })
              .slice(0, displayLimit);
            break;

          case 'following':
            // Posts from people you follow (timeline posts)
            // Since we're using the timeline feed, most posts should be from people you follow
            // We'll filter out your own posts and prioritize posts with reasonable engagement
            selectedPosts = [...allPosts]
              .filter(post => {
                const author = post.author;
                if (!author) return false;
                
                // Exclude our own posts
                if (author.did === get().auth.session?.did) return false;
                
                // Include all other posts from the timeline (which should be from people you follow)
                // We can add some basic quality filters here if needed
                return true;
              })
              .sort((a, b) => {
                // Sort by recency first, then by engagement for recent posts
                const timeA = new Date(a.indexedAt).getTime();
                const timeB = new Date(b.indexedAt).getTime();
                const timeDiff = timeB - timeA;
                
                if (Math.abs(timeDiff) < 3600000) { // Within 1 hour, sort by engagement
                  const aScore = getEngagementScore(a) * getTimeDecayScore(a);
                  const bScore = getEngagementScore(b) * getTimeDecayScore(b);
                  return bScore - aScore;
                } else {
                  return timeDiff; // Sort by recency
                }
              })
              .slice(0, displayLimit);
            break;

          case 'random':
            // True random selection
            const randomShuffled = [...allPosts].sort(() => Math.random() - 0.5);
            selectedPosts = randomShuffled.slice(0, displayLimit);
            break;
        }

        set({ posts: selectedPosts });
      },

      // Restore session from localStorage
      restoreSession: async () => {
        try {
          const storedSession = localStorage.getItem('bluesky-session');
          if (storedSession) {
            const session = JSON.parse(storedSession);
            const agent = new BskyAgent({ service: 'https://bsky.social' });
            
            // Restore the session in the agent using the resume method
            try {
              await agent.resumeSession(session);
            } catch (resumeError) {
              console.warn('Failed to resume Bluesky session, will need to re-login:', resumeError);
              localStorage.removeItem('bluesky-session');
              return false;
            }
            
            set({
              auth: {
                isAuthenticated: true,
                session,
                server: 'https://bsky.social'
              },
              agent,
              isLoading: false
            });
            
            // Verify the agent was actually set in the store
            const storeState = get();
            logger.debug('Bluesky session restored from localStorage, agent set:', !!agent);
            logger.debug('Store state after setting agent:', {
              hasAgent: !!storeState.agent,
              agentType: typeof storeState.agent,
              agentConstructor: storeState.agent?.constructor?.name
            });
            
            // Trigger a fetch after successful session restoration
            setTimeout(() => {
              logger.debug('Auto-fetching posts after session restoration...');
              get().fetchPosts();
            }, 100);
            
            // Set up periodic session refresh (every 30 minutes)
            const refreshInterval = setInterval(async () => {
              const { auth } = get();
              if (auth.isAuthenticated) {
                try {
                  await get().refreshSession();
                  logger.debug('Bluesky session refreshed automatically');
                } catch (error) {
                  console.error('Failed to refresh Bluesky session automatically:', error);
                  clearInterval(refreshInterval);
                }
              } else {
                clearInterval(refreshInterval);
              }
            }, 30 * 60 * 1000); // 30 minutes
            
            return true;
          }
        } catch (error) {
          console.error('Failed to restore Bluesky session:', error);
          localStorage.removeItem('bluesky-session');
        }
        return false;
      },

      likePost: async (uri: string, cid: string) => {
        const { agent } = get();
        if (!agent) return;
        
        try {
          const response = await agent.like(uri, cid);
          // Update the post in the store
          const updatedPosts = get().posts.map(post => 
            post.uri === uri 
              ? {
                  ...post,
                  likeCount: post.likeCount + 1,
                  viewer: {
                    ...post.viewer,
                    like: response.uri
                  }
                }
              : post
          );
          
          set({ posts: updatedPosts });
        } catch (error) {
          console.error('Failed to like post:', error);
        }
      },

      toggleLike: async (uri: string, cid: string) => {
        const { agent, posts } = get();
        if (!agent) return;
        
        // Find the post to check if it's already liked
        const post = posts.find(p => p.uri === uri);
        if (!post) return;
        
        const isLiked = !!post.viewer?.like;
        
        try {
          logger.debug('🔄 Bluesky toggleLike:', { uri, cid, isLiked, action: isLiked ? 'unlike' : 'like' });
          
          let updatedPosts: BlueskyPost[];
          
          if (isLiked) {
            // Unlike the post
            await agent.deleteLike(post.viewer!.like!);
            updatedPosts = posts.map(p => 
              p.uri === uri 
                ? {
                    ...p,
                    likeCount: Math.max(0, p.likeCount - 1),
                    viewer: {
                      ...p.viewer,
                      like: undefined
                    }
                  }
                : p
            );
          } else {
            // Like the post
            const response = await agent.like(uri, cid);
            updatedPosts = posts.map(p => 
              p.uri === uri 
                ? {
                    ...p,
                    likeCount: p.likeCount + 1,
                    viewer: {
                      ...p.viewer,
                      like: response.uri
                    }
                  }
                : p
            );
          }
          
          set({ posts: updatedPosts });
          logger.debug(`✅ Bluesky post ${isLiked ? 'unliked' : 'liked'} successfully`);
        } catch (error) {
          console.error('Failed to toggle like:', error);
        }
      },

      repostPost: async (uri: string, cid: string) => {
        const { agent } = get();
        if (!agent) return;
        
        try {
          const response = await agent.repost(uri, cid);
          // Update the post in the store
          const updatedPosts = get().posts.map(post => 
            post.uri === uri 
              ? {
                  ...post,
                  repostCount: post.repostCount + 1,
                  viewer: {
                    ...post.viewer,
                    repost: response.uri
                  }
                }
              : post
          );
          
          set({ posts: updatedPosts });
        } catch (error) {
          console.error('Failed to repost:', error);
        }
      },

      toggleRepost: async (uri: string, cid: string) => {
        const { agent, posts, allPosts } = get();
        if (!agent) return;
        
        // Find the post to check if it's already reposted
        const post = posts.find(p => p.uri === uri) || allPosts.find(p => p.uri === uri);
        if (!post) return;
        
        const isReposted = !!post.viewer?.repost;
        
        try {
          logger.debug('🔄 Bluesky toggleRepost:', { uri, cid, isReposted, action: isReposted ? 'unrepost' : 'repost' });
          
          let updatedPosts: BlueskyPost[];
          let updatedAllPosts: BlueskyPost[];
          
          if (isReposted) {
            // Unrepost (delete the repost)
            if (!post.viewer?.repost) return;
            await agent.deleteRepost(post.viewer.repost);
            
            updatedPosts = posts.map(p => 
              p.uri === uri 
                ? {
                    ...p,
                    repostCount: Math.max(0, p.repostCount - 1),
                    viewer: {
                      ...p.viewer,
                      repost: undefined
                    }
                  }
                : p
            );
            
            updatedAllPosts = allPosts.map(p => 
              p.uri === uri 
                ? {
                    ...p,
                    repostCount: Math.max(0, p.repostCount - 1),
                    viewer: {
                      ...p.viewer,
                      repost: undefined
                    }
                  }
                : p
            );
          } else {
            // Repost
            const response = await agent.repost(uri, cid);
            
            updatedPosts = posts.map(p => 
              p.uri === uri 
                ? {
                    ...p,
                    repostCount: p.repostCount + 1,
                    viewer: {
                      ...p.viewer,
                      repost: response.uri
                    }
                  }
                : p
            );
            
            updatedAllPosts = allPosts.map(p => 
              p.uri === uri 
                ? {
                    ...p,
                    repostCount: p.repostCount + 1,
                    viewer: {
                      ...p.viewer,
                      repost: response.uri
                    }
                  }
                : p
            );
          }
          
          set({ posts: updatedPosts, allPosts: updatedAllPosts });
          logger.debug(`✅ Bluesky post ${isReposted ? 'unreposted' : 'reposted'} successfully`);
        } catch (error) {
          console.error('Failed to toggle repost:', error);
        }
      },

      toggleBookmark: async (uri: string) => {
        // Bluesky doesn't have native bookmarks, so we'll use local storage
        const { posts, allPosts } = get();
        
        // Check if bookmarked in local storage
        const bookmarkedPosts = JSON.parse(localStorage.getItem('bluesky-bookmarks') || '[]') as string[];
        const isBookmarked = bookmarkedPosts.includes(uri);
        
        try {
          let updatedBookmarks: string[];
          
          if (isBookmarked) {
            // Remove bookmark
            updatedBookmarks = bookmarkedPosts.filter(u => u !== uri);
          } else {
            // Add bookmark
            updatedBookmarks = [...bookmarkedPosts, uri];
          }
          
          localStorage.setItem('bluesky-bookmarks', JSON.stringify(updatedBookmarks));
          
          // Update posts with bookmark state (for UI feedback)
          const updatePostInArray = (postsArray: BlueskyPost[]) => {
            return postsArray.map(p => ({
              ...p,
              bookmarked: updatedBookmarks.includes(p.uri)
            }));
          };
          
          set({
            posts: updatePostInArray(posts),
            allPosts: updatePostInArray(allPosts)
          });
          
          logger.debug(`✅ Bluesky post ${isBookmarked ? 'unbookmarked' : 'bookmarked'} locally`);
        } catch (error) {
          console.error('Failed to toggle bookmark:', error);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearPosts: () => {
        set({
          posts: [],
          allPosts: [],
          cursor: null,
          hasMore: true
        });
      },

      fetchMyPosts: async () => {
        const { auth, agent } = get();
        
        if (!auth.isAuthenticated || !auth.session || !agent) {
          console.error('❌ Cannot fetch my posts - not authenticated');
          return;
        }

        logger.debug('📱 Fetching MY Bluesky posts for journal import...');
        logger.debug('👤 My DID:', auth.session.did);
        logger.debug('👤 My Handle:', auth.session.handle);
        
        try {
          // Try accessing your repository directly using raw AT Protocol
          logger.debug('🔍 Trying to access YOUR repository directly...');
          logger.debug('👤 My DID:', auth.session.did);
          logger.debug('👤 My Handle:', auth.session.handle);
          
          // Method 1: Try getProfile first to verify we can access your data
          logger.debug('🔄 Step 1: Getting your profile...');
          const profileResponse = await agent.getProfile({
            actor: auth.session.handle
          });
          
          logger.debug('📡 Profile response:', {
            success: profileResponse.success,
            handle: profileResponse.data?.handle,
            did: profileResponse.data?.did,
            postsCount: profileResponse.data?.postsCount,
            followersCount: profileResponse.data?.followersCount,
            followsCount: profileResponse.data?.followsCount
          });
          
          if (!profileResponse.success) {
            throw new Error('Cannot access your profile - authentication issue');
          }
          
          // Method 2: Try getAuthorFeed with your handle
          logger.debug('🔄 Step 2: Getting your posts with getAuthorFeed...');
          const feedResponse = await agent.getAuthorFeed({
            actor: auth.session.handle,
            filter: 'posts_no_replies',
            limit: 100
          });
          
          logger.debug('📡 getAuthorFeed response:', {
            success: feedResponse.success,
            feedLength: feedResponse.data?.feed?.length,
            firstPostAuthor: feedResponse.data?.feed?.[0]?.post?.author?.did,
            firstPostAuthorHandle: feedResponse.data?.feed?.[0]?.post?.author?.handle,
            myDID: auth.session.did,
            myHandle: auth.session.handle,
            isMyPost: feedResponse.data?.feed?.[0]?.post?.author?.did === auth.session.did
          });
          
          // Method 3: If getAuthorFeed doesn't work, try with DID
          if (!feedResponse.success || feedResponse.data.feed.length === 0) {
            logger.debug('🔄 Step 3: Trying getAuthorFeed with DID...');
            const feedResponse2 = await agent.getAuthorFeed({
              actor: auth.session.did,
              filter: 'posts_no_replies',
              limit: 100
            });
            
            logger.debug('📡 getAuthorFeed (DID) response:', {
              success: feedResponse2.success,
              feedLength: feedResponse2.data?.feed?.length,
              firstPostAuthor: feedResponse2.data?.feed?.[0]?.post?.author?.did,
              firstPostAuthorHandle: feedResponse2.data?.feed?.[0]?.post?.author?.handle,
              isMyPost: feedResponse2.data?.feed?.[0]?.post?.author?.did === auth.session.did
            });
            
            if (feedResponse2.success && feedResponse2.data.feed.length > 0) {
              feedResponse.data.feed = feedResponse2.data.feed;
            }
          }
          
          // Method 4: Try listRecords with different approach
          if (!feedResponse.success || feedResponse.data.feed.length === 0) {
            logger.debug('🔄 Step 4: Trying listRecords with your repository...');
            const listResponse = await agent.com.atproto.repo.listRecords({
              repo: auth.session.did,
              collection: 'app.bsky.feed.post',
              limit: 100
            });
            
            logger.debug('📡 listRecords response:', {
              success: listResponse.success,
              recordsLength: listResponse.data?.records?.length,
              firstRecord: listResponse.data?.records?.[0] ? {
                uri: listResponse.data.records[0].uri,
                collection: listResponse.data.records[0].collection
              } : null
            });
            
            // Convert listRecords to feed format if successful
            if (listResponse.success && listResponse.data.records.length > 0) {
              feedResponse.success = true;
              feedResponse.data = {
                feed: listResponse.data.records.map(record => ({
                  post: {
                    uri: record.uri,
                    cid: record.cid,
                    author: {
                      did: auth.session.did,
                      handle: auth.session.handle,
                      displayName: auth.session.handle
                    },
                    record: record.value,
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 0,
                    indexedAt: new Date().toISOString(),
                    viewer: {},
                    labels: []
                  }
                }))
              };
            }
          }
          
          // Process the results
          if (feedResponse.success && feedResponse.data.feed.length > 0) {
            logger.debug('Bluesky fetchMyPosts: Processing posts', { feedLength: feedResponse.data.feed.length });
            
            // Filter to only YOUR posts
            const myPosts = feedResponse.data.feed
              .filter(item => item.post.author.did === auth.session.did)
              .map(item => ({
                id: item.post.uri,
                uri: item.post.uri,
                cid: item.post.cid,
                author: {
                  did: item.post.author.did,
                  handle: item.post.author.handle,
                  displayName: item.post.author.displayName,
                  description: (item.post.author as any).description,
                  avatar: item.post.author.avatar,
                  verified: (item.post.author as any).verified,
                  createdAt: (item.post.author as any).createdAt
                },
                record: {
                  text: (item.post.record as any).text || '',
                  createdAt: (item.post.record as any).createdAt || new Date().toISOString(),
                  reply: (item.post.record as any).reply,
                  facets: (item.post.record as any).facets,
                  embed: (item.post.record as any).embed
                },
                replyCount: item.post.replyCount || 0,
                repostCount: item.post.repostCount || 0,
                likeCount: item.post.likeCount || 0,
                indexedAt: item.post.indexedAt,
                viewer: item.post.viewer,
                labels: item.post.labels
              }));
            
            logger.debug(`✅ Found ${myPosts.length} of MY posts after filtering`);
            
            // Store these posts separately for journal import
            set({ 
              allPosts: myPosts, // Replace with only MY posts
              isLoading: false 
            });
            
            return myPosts;
          } else {
            logger.debug('❌ No posts found with any method');
            throw new Error('No posts found - you may not have any posts on Bluesky');
          }
        } catch (error) {
          console.error('Bluesky fetchMyPosts error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch my posts',
            isLoading: false
          });
          throw error;
        }
      },

      importPosts: async () => {
        const { auth } = get();
        
        if (!auth.isAuthenticated || !auth.session) {
          console.error('❌ Cannot import posts - not authenticated');
          return;
        }

        logger.debug('📱 Starting Bluesky post import to journal...');
        
        try {
          // First, fetch MY posts specifically
          await get().fetchMyPosts();
          
          // Now get the updated allPosts with MY posts
          const { allPosts } = get();
          
          // Filter for MY posts (should be all of them now since fetchMyPosts only gets MY posts)
          const myPosts = allPosts.filter(post => {
            const isMyPost = post.author.did === auth.session!.did;
            logger.debug(`📋 Post ${post.id}: author DID "${post.author.did}" vs my DID "${auth.session!.did}" = ${isMyPost}`);
            return isMyPost;
          });
          
          logger.debug(`🔍 Found ${myPosts.length} of my posts out of ${allPosts.length} total posts`);
          
          let successCount = 0;
          let errorCount = 0;
          
          for (const post of myPosts) {
            try {
              logger.debug(`🔄 Creating journal entry for Bluesky post:`, post.id, post.record.text?.substring(0, 50));
              await useJournalStore.getState().createEntryFromSocialPost(post, 'bluesky');
              successCount++;
              logger.debug(`✅ Successfully imported Bluesky post ${post.id} to journal`);
            } catch (error) {
              errorCount++;
              console.error('❌ Failed to import Bluesky post to journal:', post.id, error);
            }
          }
          
          logger.debug(`📊 Bluesky import complete: ${successCount} successful, ${errorCount} errors`);
        } catch (error) {
          console.error('❌ Failed to fetch my posts for import:', error);
          throw error;
        }
      }
    }),
    {
      name: 'bluesky-store',
      partialize: (state) => ({
        auth: state.auth,
        feedSettings: state.feedSettings,
        algorithm: state.algorithm,
        displayMode: state.displayMode,
        displayLimit: state.displayLimit,
        isLiveFeed: state.isLiveFeed,
        liveFeedBatchSize: state.liveFeedBatchSize,
        liveFeedInterval: state.liveFeedInterval
      })
    }
  )
);
