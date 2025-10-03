import React, { useState, useEffect } from 'react';
import { X, Calendar, User, MessageCircle, Heart, Repeat, Share } from 'lucide-react';
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
        console.log('🔵 Bluesky post - replies not implemented yet');
        // For Bluesky, we'd need to implement reply fetching
        // For now, we'll show placeholder data
        setReplies([]);
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
        <div className="text-lg leading-relaxed whitespace-pre-wrap">
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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Replies ({replies.length})
        </h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {loadingReplies ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              Loading replies...
            </div>
          ) : replies.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No replies yet
            </div>
          ) : (
            replies.map((reply, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src={reply.account?.avatar || '/default-avatar.png'}
                    alt={reply.account?.display_name || reply.account?.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {reply.account?.display_name || reply.account?.username}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(reply.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {reply.content?.replace(/<[^>]*>/g, '').trim()}
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
  const authorName = author?.displayName || author?.display_name || author?.handle || author?.username;
  const authorHandle = author?.handle || author?.username;
  const authorAvatar = author?.avatar;

  return (
    <>
      {/* Floating Close Button */}
      {isOpen && (
        <button
          onClick={onClose}
          className="fixed right-80 top-6 w-10 h-10 bg-neutral-700 hover:bg-neutral-600 text-white dark:bg-neutral-200 dark:hover:bg-neutral-300 dark:text-neutral-800 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-200 hover:scale-110"
          title="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-80 bg-glass-panel rounded-l-xl shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${isBluesky ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500'} rounded-lg flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">{isBluesky ? 'B' : 'M'}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Post Details
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isBluesky ? 'Bluesky' : 'Mastodon'} Post
              </p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Author Info */}
          <div className="flex items-center gap-3 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <img
              src={authorAvatar || '/default-avatar.png'}
              alt={authorName}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                {authorName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{authorHandle}
              </p>
            </div>
          </div>
          
          {/* Post Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Content
            </h3>
            {renderPostContent()}
          </div>
          
          {/* Chat History */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            {renderChatHistory()}
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Heart className="w-4 h-4" />
              Like
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm">
              <Repeat className="w-4 h-4" />
              Repost
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm">
              <Share className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default PostInspector;