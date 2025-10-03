import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageCircle, Heart, Repeat, Share } from 'lucide-react';
import { useMastodonStore } from '../../stores/mastodonStore';
import { useBlueskyStore } from '../../stores/blueskyStore';

interface PostInspectorProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
}

const PostInspector: React.FC<PostInspectorProps> = ({ post, isOpen, onClose }) => {
  const [replies, setReplies] = useState<any[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const mastodonStore = useMastodonStore();
  const blueskyStore = useBlueskyStore();

  useEffect(() => {
    if (isOpen && post) {
      fetchReplies();
    }
  }, [isOpen, post]);

  const fetchReplies = async () => {
    if (!post) return;
    
    console.log('🔍 Fetching replies for post:', {
      postId: post.id,
      platform: post.platform,
      url: post.url
    });
    
    setLoadingReplies(true);
    try {
      const isBluesky = post.url?.includes('bsky.app') || post.platform === 'bluesky';
      
      if (isBluesky) {
        console.log('🔵 Bluesky post - fetching replies...');
        try {
          const { auth, agent } = blueskyStore;
          console.log('🔵 Bluesky store state:', { 
            isAuthenticated: auth.isAuthenticated, 
            hasAgent: !!agent, 
            hasSession: !!auth.session,
            sessionData: auth.session 
          });
          
          if (!auth.isAuthenticated || !auth.session) {
            console.log('🔵 Not authenticated with Bluesky, cannot fetch replies');
            setReplies([]);
            return;
          }

          // Create a new agent with the existing session if we don't have one
          let workingAgent = agent;
          if (!workingAgent) {
            console.log('🔵 Creating new Bluesky agent with existing session');
            const { BskyAgent } = await import('@bluesky-social/api');
            workingAgent = new BskyAgent({ service: 'https://bsky.social' });
            await workingAgent.resumeSession(auth.session as any);
          }

          // Use the Bluesky agent to get post thread (includes replies)
          const threadResponse = await workingAgent.getPostThread({
            uri: post.uri || post.id,
            depth: 1 // Only get direct replies, not nested ones
          });

          if (threadResponse.success && threadResponse.data.thread.replies) {
            console.log('📨 Bluesky thread response:', threadResponse.data.thread.replies);
            
            // Flatten the replies array and convert to our format
            const replies = threadResponse.data.thread.replies.map((reply: any) => ({
              id: reply.post.uri,
              uri: reply.post.uri,
              cid: reply.post.cid,
              account: {
                display_name: reply.post.author.displayName,
                username: reply.post.author.handle,
                avatar: reply.post.author.avatar
              },
              author: reply.post.author,
              content: reply.post.record.text,
              record: reply.post.record,
              created_at: reply.post.record.createdAt,
              indexedAt: reply.post.indexedAt,
              replyCount: reply.post.replyCount || 0,
              repostCount: reply.post.repostCount || 0,
              likeCount: reply.post.likeCount || 0
            }));

            console.log('📨 Bluesky replies processed:', replies);
            setReplies(replies);
          } else {
            console.log('📨 No replies found for this Bluesky post');
            setReplies([]);
          }
        } catch (error) {
          console.error('❌ Failed to fetch Bluesky replies:', error);
          setReplies([]);
        }
      } else {
        console.log('🟣 Mastodon post - fetching replies...');
        // For Mastodon, fetch replies using the post ID
        const replies = await mastodonStore.fetchPostReplies(post.id);
        console.log('📨 Mastodon replies received:', replies);
        setReplies(replies || []);
      }
    } catch (error) {
      console.error('❌ Failed to fetch replies:', error);
      setReplies([]);
    } finally {
      setLoadingReplies(false);
    }
  };

  if (!isOpen || !post) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderPostContent = () => {
    if (!post.content && !post.record?.text) return null;

    const content = post.content || post.record?.text || '';
    
    return (
      <div className="space-y-4">
        <div className="text-base leading-relaxed whitespace-pre-wrap glass-text-primary glass-subtle p-4 rounded-xl">
          {content.replace(/<[^>]*>/g, '').trim()}
        </div>
        
        {/* Render images if any */}
        {post.media_attachments && post.media_attachments.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {post.media_attachments.map((media: any, index: number) => (
              <img
                key={index}
                src={media.preview_url || media.url}
                alt={`Post image ${index + 1}`}
                className="rounded-lg max-w-full h-auto"
              />
            ))}
          </div>
        )}

        {/* Bluesky images */}
        {post.record?.embed?.images && (
          <div className="grid grid-cols-1 gap-4">
            {post.record.embed.images.map((image: any, index: number) => (
              <img
                key={index}
                src={image.thumb}
                alt={`Post image ${index + 1}`}
                className="rounded-lg max-w-full h-auto"
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderChatHistory = () => {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium glass-text-secondary flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Replies ({replies.length})
        </h3>
        
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {loadingReplies ? (
            <div className="text-center py-4 glass-text-secondary">
              Loading replies...
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-4 glass-text-secondary">
              No replies yet
            </div>
          ) : (
            replies.map((reply, index) => (
              <div key={index} className="glass-subtle p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={reply.account?.avatar || reply.author?.avatar || '/default-avatar.png'}
                    alt={reply.account?.display_name || reply.account?.username || reply.author?.displayName}
                    className="w-5 h-5 rounded-full"
                  />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {reply.account?.display_name || reply.account?.username || reply.author?.displayName || reply.author?.handle}
                  </span>
                  <span className="text-xs glass-text-muted">
                    {formatDate(reply.created_at || reply.record?.createdAt || reply.indexedAt)}
                  </span>
                </div>
                <p className="text-xs glass-text-primary leading-relaxed">
                  {(reply.content || reply.record?.text || '')?.replace(/<[^>]*>/g, '').trim()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Determine platform and author info
  const isBluesky = post.url?.includes('bsky.app') || post.platform === 'bluesky';
  const author = isBluesky ? post.author : post.account;
  
  // More robust author data extraction
  const authorName = author?.displayName || author?.display_name || author?.handle || author?.username || 'Unknown Author';
  const authorHandle = author?.handle || author?.username || 'unknown';
  const authorAvatar = author?.avatar;

  // Debug logging
  console.log('🔍 PostInspector Debug:', {
    postId: post.id,
    platform: isBluesky ? 'bluesky' : 'mastodon',
    author: author,
    authorName: authorName,
    authorHandle: authorHandle,
    authorAvatar: authorAvatar,
    postKeys: Object.keys(post)
  });

  return (
    <>
      {/* Floating Close Button */}
      {isOpen && (
        <button
          onClick={onClose}
          className="fixed right-80 top-16 w-10 h-10 glass-subtle hover:glass text-white rounded-full shadow-lg z-[60] flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Close panel"
        >
          <X className="w-5 h-5 glass-text-primary" />
        </button>
      )}

      {/* Glass Panel */}
      <div 
        className={`fixed right-4 top-20 bottom-20 w-80 z-50 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <div className="h-full flex flex-col glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-2xl shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={authorAvatar || '/default-avatar.png'}
                alt={authorName}
                className="w-10 h-10 rounded-full border-2 border-black/10 dark:border-white/10"
                onError={(e) => {
                  // Fallback to a simple colored circle if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div 
                className={`w-10 h-10 rounded-full border-2 border-black/10 dark:border-white/10 bg-gradient-to-r ${isBluesky ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'} flex items-center justify-center text-white text-sm font-bold`}
                style={{ display: 'none' }}
              >
                {isBluesky ? 'B' : 'M'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold glass-text-primary text-lg">
                  {authorName}
                </h3>
                <p className="text-sm glass-text-secondary">
                  @{authorHandle}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${isBluesky ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>
                {isBluesky ? 'Bluesky' : 'Mastodon'}
              </div>
            </div>
          </div>
        
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          
            {/* Post Stats */}
            <div className="flex items-center gap-8 text-sm glass-text-secondary">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.created_at || post.record?.createdAt || post.indexedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{post.favourites_count || post.likeCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Repeat className="w-4 h-4" />
              <span>{post.reblogs_count || post.repostCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{post.replies_count || post.replyCount || 0}</span>
            </div>
          </div>
          
            {/* Post Content */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium glass-text-secondary">
                Content
              </h3>
              {renderPostContent()}
            </div>
          
            {/* Chat History */}
            <div className="border-t border-black/10 dark:border-white/10 pt-6">
              {renderChatHistory()}
            </div>
        </div>
        
          {/* Footer Actions - Half On/Half Off */}
          <div className="relative">
            <div className="absolute -left-6 bottom-4 z-[55] flex flex-col gap-2">
              <button className="w-12 h-12 bg-blue-600/90 text-white rounded-xl hover:bg-blue-700/90 transition-all duration-200 shadow-lg shadow-blue-600/25 flex items-center justify-center hover:scale-105" title="Like">
                <Heart className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 glass-subtle glass-text-primary rounded-xl hover:glass transition-all duration-200 flex items-center justify-center hover:scale-105" title="Repost">
                <Repeat className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 glass-subtle glass-text-primary rounded-xl hover:glass transition-all duration-200 flex items-center justify-center hover:scale-105" title="Share">
                <Share className="w-5 h-5" />
              </button>
            </div>
          </div>
      </div>
    </div>
    </>
  );
};

export default PostInspector;