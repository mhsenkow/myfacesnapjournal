import React from 'react';
import { X, User, Calendar, Hash, AtSign, Globe, Lock, EyeOff, Heart, MessageCircle, Repeat2, Bookmark, Image, Video, Tag } from 'lucide-react';

interface PostInspectorProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
}

const PostInspector: React.FC<PostInspectorProps> = ({ post, isOpen, onClose }) => {
  if (!isOpen || !post) return null;

  const isBluesky = post.url?.includes('bsky.app');
  const platformColor = isBluesky ? 'from-blue-500 to-cyan-500' : 'from-purple-500 to-pink-500';
  const platformName = isBluesky ? 'Bluesky' : 'Mastodon';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatContent = (content: string) => {
    if (!content) return 'No content';
    // Remove HTML tags and clean up
    return content.replace(/<[^>]*>/g, '').trim();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${platformColor} rounded-lg flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">{platformName[0]}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold glass-text-primary">Post Inspector</h2>
              <p className="text-sm glass-text-muted">{platformName} Post Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 dark:hover:bg-black/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 glass-text-primary" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Author Info */}
              <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold glass-text-primary">Author</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm glass-text-muted">Display Name:</span>
                    <p className="font-medium glass-text-primary">{post.account?.display_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm glass-text-muted">Username:</span>
                    <p className="font-medium glass-text-primary">@{post.account?.username || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm glass-text-muted">ID:</span>
                    <p className="font-mono text-xs glass-text-secondary break-all">{post.account?.id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Post Info */}
              <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold glass-text-primary">Post Details</h3>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm glass-text-muted">Created:</span>
                    <p className="font-medium glass-text-primary">{formatDate(post.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-sm glass-text-muted">Post ID:</span>
                    <p className="font-mono text-xs glass-text-secondary break-all">{post.id}</p>
                  </div>
                  <div>
                    <span className="text-sm glass-text-muted">URL:</span>
                    <p className="font-mono text-xs glass-text-secondary break-all">{post.url || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold glass-text-primary">Content</h3>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="glass-text-primary whitespace-pre-wrap leading-relaxed">
                  {formatContent(post.content)}
                </p>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 text-center">
                <Heart className={`w-6 h-6 mx-auto mb-2 ${post.favourited ? 'text-red-500 fill-current' : 'text-neutral-400'}`} />
                <div className="text-2xl font-bold glass-text-primary">{post.favourites_count || 0}</div>
                <div className="text-xs glass-text-muted">Likes</div>
              </div>
              <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 text-center">
                <Repeat2 className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
                <div className="text-2xl font-bold glass-text-primary">{post.reblogs_count || 0}</div>
                <div className="text-xs glass-text-muted">Reposts</div>
              </div>
              <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 text-center">
                <MessageCircle className="w-6 h-6 mx-auto mb-2 text-neutral-400" />
                <div className="text-2xl font-bold glass-text-primary">{post.replies_count || 0}</div>
                <div className="text-xs glass-text-muted">Replies</div>
              </div>
              <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 text-center">
                <Bookmark className={`w-6 h-6 mx-auto mb-2 ${post.bookmarked ? 'text-yellow-500 fill-current' : 'text-neutral-400'}`} />
                <div className="text-2xl font-bold glass-text-primary">{post.bookmarked ? '1' : '0'}</div>
                <div className="text-xs glass-text-muted">Bookmarked</div>
              </div>
            </div>

            {/* Tags and Mentions */}
            {(post.tags?.length > 0 || post.mentions?.length > 0) && (
              <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Tag className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold glass-text-primary">Tags & Mentions</h3>
                </div>
                <div className="space-y-3">
                  {post.tags?.length > 0 && (
                    <div>
                      <span className="text-sm glass-text-muted">Hashtags:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {post.tags.map((tag: any, index: number) => (
                          <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            <Hash className="w-3 h-3" />
                            {tag.name || tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {post.mentions?.length > 0 && (
                    <div>
                      <span className="text-sm glass-text-muted">Mentions:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {post.mentions.map((mention: any, index: number) => (
                          <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs rounded-full">
                            <AtSign className="w-3 h-3" />
                            {mention.username || mention.acct || mention}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Media Attachments */}
            {post.media_attachments?.length > 0 && (
              <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Image className="w-5 h-5 text-pink-600" />
                  <h3 className="font-semibold glass-text-primary">Media ({post.media_attachments.length})</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {post.media_attachments.map((media: any, index: number) => (
                    <div key={index} className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        {media.type === 'video' ? <Video className="w-4 h-4 text-red-500" /> : <Image className="w-4 h-4 text-blue-500" />}
                        <span className="text-sm font-medium glass-text-primary">{media.type}</span>
                      </div>
                      {media.description && (
                        <p className="text-xs glass-text-muted mb-2">{media.description}</p>
                      )}
                      <div className="text-xs glass-text-muted break-all">
                        {media.url}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy & Visibility */}
            <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold glass-text-primary">Privacy & Visibility</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm glass-text-muted">Visibility:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {post.visibility === 'public' && <Globe className="w-4 h-4 text-green-500" />}
                    {post.visibility === 'unlisted' && <Globe className="w-4 h-4 text-yellow-500" />}
                    {post.visibility === 'private' && <Lock className="w-4 h-4 text-orange-500" />}
                    {post.visibility === 'direct' && <AtSign className="w-4 h-4 text-purple-500" />}
                    <span className="capitalize font-medium glass-text-primary">{post.visibility}</span>
                  </div>
                </div>
                <div>
                  <span className="text-sm glass-text-muted">Sensitive:</span>
                  <div className="flex items-center gap-2 mt-1">
                    {post.sensitive ? (
                      <>
                        <EyeOff className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 font-medium">Content Warning</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">Safe</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {post.spoiler_text && (
                <div className="mt-3">
                  <span className="text-sm glass-text-muted">Content Warning:</span>
                  <p className="text-sm glass-text-primary mt-1">{post.spoiler_text}</p>
                </div>
              )}
            </div>

            {/* Raw Data (for debugging) */}
            <details className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
              <summary className="cursor-pointer font-semibold glass-text-primary">Raw Post Data</summary>
              <pre className="mt-3 text-xs glass-text-secondary overflow-auto bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3">
                {JSON.stringify(post, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostInspector;
