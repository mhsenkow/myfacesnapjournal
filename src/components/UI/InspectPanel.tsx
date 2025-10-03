import React from 'react';
import { X, Calendar, User, MessageCircle, Heart, Repeat, Share } from 'lucide-react';

interface InspectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  post: any; // We'll type this properly based on your post structure
}

const InspectPanel: React.FC<InspectPanelProps> = ({ isOpen, onClose, post }) => {
  if (!isOpen || !post) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderPostContent = () => {
    if (!post.record?.text) return null;

    return (
      <div className="space-y-4">
        <div className="text-lg leading-relaxed whitespace-pre-wrap">
          {post.record.text}
        </div>
        
        {/* Render images if any */}
        {post.record.embed?.images && (
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
    // This would be populated with actual chat history
    // For now, showing placeholder structure
    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Chat History
        </h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {/* Placeholder chat messages */}
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">@user1</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Great post! Really enjoyed reading this.</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">@user2</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">Thanks for sharing this perspective!</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">@user3</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">30 min ago</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">This is exactly what I was thinking about today.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Post Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Author Info */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <img
                src={post.author?.avatar || '/default-avatar.png'}
                alt={post.author?.displayName || post.author?.handle}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                  {post.author?.displayName || post.author?.handle}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{post.author?.handle}
                </p>
              </div>
            </div>
            
            {/* Post Stats */}
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.record?.createdAt || post.indexedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.likeCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <Repeat className="w-4 h-4" />
                <span>{post.repostCount || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.replyCount || 0}</span>
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
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Heart className="w-4 h-4" />
                Like
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Repeat className="w-4 h-4" />
                Repost
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
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

export default InspectPanel;
