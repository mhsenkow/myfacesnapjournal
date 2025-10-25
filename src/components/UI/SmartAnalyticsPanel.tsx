/**
 * Smart Analytics Panel Component
 * 
 * Provides AI-powered analytics and insights for the feed screen:
 * - Real-time engagement metrics
 * - AI analysis of content patterns
 * - Trending topics and themes
 * - Social media performance insights
 */

import React, { useState, useEffect } from 'react';
import { X, Users, Heart, MessageCircle, BarChart3, Brain, Hash, Eye, Info } from 'lucide-react';
import { useMastodonStore } from '../../stores/mastodonStore';
import { useBlueskyStore } from '../../stores/blueskyStore';
import { webAIService } from '../../services/webAIService';

interface AnalyticsData {
  totalPosts: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPlatforms: Array<{ platform: string; count: number; percentage: number }>;
  trendingTopics: Array<{ topic: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  aiInsights: string[];
  engagementTrend: Array<{ date: string; engagement: number }>;
  contentTypes: Array<{ type: string; count: number; percentage: number }>;
}

type InsightAlgorithm = 'pattern' | 'sentiment' | 'engagement' | 'trending';

interface AlgorithmInfo {
  name: string;
  description: string;
  tooltip: string;
}

interface SmartAnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Algorithm-specific insight generation
const generateAlgorithmInsights = async (
  algorithm: InsightAlgorithm, 
  data: {
    totalPosts: number;
    avgEngagementRate: number;
    topPlatforms: Array<{ platform: string; count: number; percentage: number }>;
    contentTypesArray: Array<{ type: string; count: number; percentage: number }>;
    trendingTopics: Array<{ topic: string; count: number; trend: 'up' | 'down' | 'stable' }>;
    allPosts: any[];
  }
): Promise<string[]> => {
  const { totalPosts, avgEngagementRate, topPlatforms, contentTypesArray, trendingTopics } = data;
  
  let analysisPrompt = '';
  
  switch (algorithm) {
    case 'pattern':
      analysisPrompt = `Analyze the social media feed patterns and provide 3-4 meaningful insights about content trends, posting behaviors, and community patterns across ALL posts in this feed.

Feed Analysis Summary:
- Total posts in feed: ${totalPosts}
- Average engagement across all posts: ${avgEngagementRate.toFixed(1)} per post
- Platform distribution: ${topPlatforms.map(p => `${p.platform} (${p.count} posts)`).join(', ')}
- Most common content types: ${contentTypesArray.slice(0, 3).map(t => t.type).join(', ')}
- Trending topics across feed: ${trendingTopics.slice(0, 5).map(t => `#${t.topic}`).join(', ')}

Focus on behavioral patterns, content strategy trends, and community dynamics. Format as:
INSIGHT 1: [Observation] - [Interpretation/Implication]`;
      break;
      
    case 'sentiment':
      analysisPrompt = `Analyze the emotional tone and sentiment patterns across ALL posts in this social media feed. Provide 3-4 insights about mood trends, emotional patterns, and community sentiment.

Feed Analysis Summary:
- Total posts in feed: ${totalPosts}
- Average engagement across all posts: ${avgEngagementRate.toFixed(1)} per post
- Platform distribution: ${topPlatforms.map(p => `${p.platform} (${p.count} posts)`).join(', ')}
- Most common content types: ${contentTypesArray.slice(0, 3).map(t => t.type).join(', ')}
- Trending topics across feed: ${trendingTopics.slice(0, 5).map(t => `#${t.topic}`).join(', ')}

Focus on emotional patterns, mood trends, and sentiment shifts. Format as:
INSIGHT 1: [Observation] - [Interpretation/Implication]`;
      break;
      
    case 'engagement':
      analysisPrompt = `Analyze what drives engagement and interaction patterns across ALL posts in this social media feed. Provide 3-4 insights about viral content characteristics, response patterns, and interaction drivers.

Feed Analysis Summary:
- Total posts in feed: ${totalPosts}
- Average engagement across all posts: ${avgEngagementRate.toFixed(1)} per post
- Platform distribution: ${topPlatforms.map(p => `${p.platform} (${p.count} posts)`).join(', ')}
- Most common content types: ${contentTypesArray.slice(0, 3).map(t => t.type).join(', ')}
- Trending topics across feed: ${trendingTopics.slice(0, 5).map(t => `#${t.topic}`).join(', ')}

Focus on engagement drivers, viral patterns, and interaction characteristics. Format as:
INSIGHT 1: [Observation] - [Interpretation/Implication]`;
      break;
      
    case 'trending':
      analysisPrompt = `Analyze topic evolution and trending patterns across ALL posts in this social media feed. Provide 3-4 insights about topic emergence, hashtag evolution, and trending dynamics.

Feed Analysis Summary:
- Total posts in feed: ${totalPosts}
- Average engagement across all posts: ${avgEngagementRate.toFixed(1)} per post
- Platform distribution: ${topPlatforms.map(p => `${p.platform} (${p.count} posts)`).join(', ')}
- Most common content types: ${contentTypesArray.slice(0, 3).map(t => t.type).join(', ')}
- Trending topics across feed: ${trendingTopics.slice(0, 5).map(t => `#${t.topic}`).join(', ')}

Focus on topic trends, hashtag patterns, and emerging themes. Format as:
INSIGHT 1: [Observation] - [Interpretation/Implication]`;
      break;
  }

  const aiResponse = await webAIService.generateChat({
    message: analysisPrompt,
    model: undefined
  });

  // Parse insights from AI response
  const insightLines = aiResponse.response.split('\n').filter((line: string) => 
    line.toLowerCase().includes('insight') && line.includes(':')
  );
  
  return insightLines.map((line: string) => {
    const match = line.match(/INSIGHT \d+:\s*(.+)/i);
    return match ? match[1].trim() : line.replace(/^INSIGHT \d+:\s*/i, '').trim();
  }).filter((insight: string) => insight.length > 0);
};

const SmartAnalyticsPanel: React.FC<SmartAnalyticsPanelProps> = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAlgorithm, setActiveAlgorithm] = useState<InsightAlgorithm>('pattern');
  
  const { posts: mastodonPosts } = useMastodonStore();
  const { posts: blueskyPosts } = useBlueskyStore();

  // Algorithm definitions with tooltips
  const algorithms: Record<InsightAlgorithm, AlgorithmInfo> = {
    pattern: {
      name: 'Pattern',
      description: 'Content & Behavior',
      tooltip: 'Analyzes posting patterns, content types, and community behavior trends. Uses statistical analysis of post frequency, content diversity, and platform usage to identify behavioral patterns.'
    },
    sentiment: {
      name: 'Sentiment',
      description: 'Mood & Tone',
      tooltip: 'Analyzes emotional tone and sentiment across posts using natural language processing. Identifies mood trends, emotional patterns, and community sentiment shifts over time.'
    },
    engagement: {
      name: 'Engagement',
      description: 'Interaction Analysis',
      tooltip: 'Focuses on what drives interactions - analyzes engagement rates, response patterns, and viral content characteristics. Identifies what content types and topics generate the most community response.'
    },
    trending: {
      name: 'Trending',
      description: 'Topic Evolution',
      tooltip: 'Tracks topic emergence, hashtag evolution, and trending patterns. Uses temporal analysis to identify rising topics, declining interests, and seasonal trends in your feed.'
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, mastodonPosts, blueskyPosts, activeAlgorithm]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Calculate basic metrics
      const allPosts = [...mastodonPosts, ...blueskyPosts];
      
      if (allPosts.length === 0) {
        setAnalytics({
          totalPosts: 0,
          totalEngagement: 0,
          avgEngagementRate: 0,
          topPlatforms: [],
          trendingTopics: [],
          aiInsights: ['No posts available in feed yet. Import from Mastodon or Bluesky to see feed analytics!'],
          engagementTrend: [],
          contentTypes: []
        });
        setIsLoading(false);
        return;
      }

      // Calculate engagement metrics
      const totalEngagement = allPosts.reduce((sum, post) => {
        let engagement = 0;
        
        // Handle Mastodon posts
        if ('favourites_count' in post) {
          engagement = (post.favourites_count || 0) + 
                      (post.reblogs_count || 0) + 
                      (post.replies_count || 0);
        }
        // Handle Bluesky posts
        else if ('like_count' in post) {
          engagement = (post.like_count || 0) + 
                      (post.repostCount || 0) + 
                      (post.replyCount || 0);
        }
        
        return sum + engagement;
      }, 0);

      const avgEngagementRate = allPosts.length > 0 ? totalEngagement / allPosts.length : 0;

      // Platform distribution
      const mastodonCount = mastodonPosts.length;
      const blueskyCount = blueskyPosts.length;
      const totalPosts = allPosts.length;

      const topPlatforms = [
        { platform: 'Mastodon', count: mastodonCount, percentage: totalPosts > 0 ? (mastodonCount / totalPosts) * 100 : 0 },
        { platform: 'Bluesky', count: blueskyCount, percentage: totalPosts > 0 ? (blueskyCount / totalPosts) * 100 : 0 }
      ].filter(p => p.count > 0);

      // Extract hashtags and topics
      const hashtags: Record<string, number> = {};
      const contentTypes: Record<string, number> = {};

      allPosts.forEach(post => {
        // Count hashtags
        const text = ('content' in post ? post.content : '') || '';
        const hashtagMatches = text.match(/#\w+/g) || [];
        hashtagMatches.forEach((tag: string) => {
          const cleanTag = tag.toLowerCase();
          hashtags[cleanTag] = (hashtags[cleanTag] || 0) + 1;
        });

        // Categorize content types
        if (text.includes('http')) {
          contentTypes['Links'] = (contentTypes['Links'] || 0) + 1;
        }
        if (text.length > 280) {
          contentTypes['Long-form'] = (contentTypes['Long-form'] || 0) + 1;
        } else {
          contentTypes['Short-form'] = (contentTypes['Short-form'] || 0) + 1;
        }
        if (text.includes('!') || text.includes('?')) {
          contentTypes['Questions/Exclamations'] = (contentTypes['Questions/Exclamations'] || 0) + 1;
        }
      });

      const trendingTopics = Object.entries(hashtags)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({
          topic: topic.replace('#', ''),
          count,
          trend: 'stable' as const
        }));

      const contentTypesArray = Object.entries(contentTypes)
        .map(([type, count]) => ({
          type,
          count,
          percentage: totalPosts > 0 ? (count / totalPosts) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Generate AI insights based on selected algorithm
      let aiInsights: string[] = [];
      try {
        const isOllamaAvailable = await webAIService.checkAvailability();
        if (isOllamaAvailable && allPosts.length > 0) {
          aiInsights = await generateAlgorithmInsights(activeAlgorithm, {
            totalPosts,
            avgEngagementRate,
            topPlatforms,
            contentTypesArray,
            trendingTopics,
            allPosts
          });
        }
      } catch (aiError) {
        console.warn('AI analysis failed:', aiError);
      }

      // Fallback insights if AI fails - make them algorithm-specific
      if (aiInsights.length === 0) {
        const platformDominance = topPlatforms.length > 0 ? topPlatforms[0] : null;
        const engagementLevel = avgEngagementRate > 5 ? 'high' : avgEngagementRate > 2 ? 'moderate' : 'low';
        const contentDiversity = contentTypesArray.length > 2 ? 'diverse' : 'focused';
        
        switch (activeAlgorithm) {
          case 'pattern':
            aiInsights = [
              `Feed contains ${totalPosts} posts with ${engagementLevel} engagement (${avgEngagementRate.toFixed(1)} avg) - suggests ${engagementLevel === 'high' ? 'active community interaction' : engagementLevel === 'moderate' ? 'selective engagement patterns' : 'passive consumption or niche audience'}`,
              platformDominance ? `${platformDominance.platform} dominates with ${platformDominance.percentage.toFixed(0)}% of posts - indicates ${platformDominance.platform === 'Bluesky' ? 'early adopter community or tech-savvy audience' : 'established social media ecosystem'}` : 'Balanced platform usage suggests diverse community preferences',
              trendingTopics.length > 0 ? `Top hashtags (#${trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) show ${trendingTopics.length > 2 ? 'diverse interests' : 'focused community themes'} - suggests ${trendingTopics.length > 2 ? 'broad community engagement' : 'specialized or niche discussions'}` : 'Limited hashtag usage suggests informal or personal communication style',
              contentTypesArray.length > 0 ? `Content mix favors ${contentTypesArray[0].type} (${contentTypesArray[0].percentage.toFixed(0)}%) - indicates ${contentTypesArray[0].type === 'Links' ? 'information-sharing community' : contentTypesArray[0].type === 'Long-form' ? 'thoughtful discussion culture' : 'quick communication preferences'}` : 'Balanced content types suggest diverse communication styles'
            ];
            break;
            
          case 'sentiment':
            aiInsights = [
              `Community sentiment appears ${engagementLevel === 'high' ? 'positive and engaged' : engagementLevel === 'moderate' ? 'balanced with selective enthusiasm' : 'reserved or contemplative'}`,
              platformDominance ? `${platformDominance.platform} community shows ${platformDominance.platform === 'Bluesky' ? 'optimistic early-adopter energy' : 'established social media comfort'}` : 'Mixed platform sentiment suggests diverse emotional responses',
              trendingTopics.length > 0 ? `Hashtag sentiment (#${trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) indicates ${trendingTopics.length > 2 ? 'broad emotional engagement' : 'focused community mood'}` : 'Limited hashtag usage suggests personal, less performative communication',
              contentTypesArray.length > 0 ? `Content tone favors ${contentTypesArray[0].type} (${contentTypesArray[0].percentage.toFixed(0)}%) - suggests ${contentTypesArray[0].type === 'Links' ? 'curious, information-seeking mood' : contentTypesArray[0].type === 'Long-form' ? 'thoughtful, reflective community' : 'quick, spontaneous communication style'}` : 'Balanced content suggests varied emotional expression'
            ];
            break;
            
          case 'engagement':
            aiInsights = [
              `Engagement patterns show ${engagementLevel === 'high' ? 'highly interactive community with strong response rates' : engagementLevel === 'moderate' ? 'selective engagement with quality over quantity' : 'passive consumption or niche audience behavior'}`,
              platformDominance ? `${platformDominance.platform} drives ${platformDominance.percentage.toFixed(0)}% of posts - indicates ${platformDominance.platform === 'Bluesky' ? 'emerging community with growing engagement' : 'established platform with consistent interaction patterns'}` : 'Balanced platform usage suggests diverse engagement preferences',
              trendingTopics.length > 0 ? `Top hashtags (#${trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) generate ${trendingTopics.length > 2 ? 'broad community response' : 'focused engagement'}` : 'Limited hashtag usage suggests direct, personal engagement style',
              contentTypesArray.length > 0 ? `Most engaging content type: ${contentTypesArray[0].type} (${contentTypesArray[0].percentage.toFixed(0)}%) - suggests ${contentTypesArray[0].type === 'Links' ? 'link-sharing drives community interaction' : contentTypesArray[0].type === 'Long-form' ? 'thoughtful content generates deeper engagement' : 'quick posts encourage frequent interaction'}` : 'Diverse content types suggest varied engagement drivers'
            ];
            break;
            
          case 'trending':
            aiInsights = [
              `Topic evolution shows ${trendingTopics.length > 0 ? `${trendingTopics.length} active themes` : 'limited trending topics'} - suggests ${trendingTopics.length > 2 ? 'dynamic, evolving community interests' : 'stable, focused community discussions'}`,
              platformDominance ? `${platformDominance.platform} trending patterns (${platformDominance.percentage.toFixed(0)}% of posts) indicate ${platformDominance.platform === 'Bluesky' ? 'emerging trends in early-adopter community' : 'established trending patterns'}` : 'Cross-platform trending suggests diverse topic evolution',
              trendingTopics.length > 0 ? `Current trending topics (#${trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) show ${trendingTopics.length > 2 ? 'broad community interests' : 'focused trending themes'}` : 'Limited trending topics suggest personal, non-trending communication style',
              contentTypesArray.length > 0 ? `Trending content types favor ${contentTypesArray[0].type} (${contentTypesArray[0].percentage.toFixed(0)}%) - indicates ${contentTypesArray[0].type === 'Links' ? 'information-sharing trends' : contentTypesArray[0].type === 'Long-form' ? 'thoughtful discussion trends' : 'quick communication trends'}` : 'Balanced content trends suggest diverse topic evolution'
            ];
            break;
        }
      }

      // Generate engagement trend (last 7 days)
      const engagementTrend = generateEngagementTrend(allPosts);

      setAnalytics({
        totalPosts,
        totalEngagement,
        avgEngagementRate,
        topPlatforms,
        trendingTopics,
        aiInsights,
        engagementTrend,
        contentTypes: contentTypesArray
      });

    } catch (err) {
      console.error('Analytics loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const generateEngagementTrend = (posts: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayPosts = posts.filter(post => {
        // Safely handle date parsing
        if (!post.created_at) return false;
        
        try {
          const postDate = new Date(post.created_at);
          // Check if the date is valid
          if (isNaN(postDate.getTime())) return false;
          
          return postDate.toISOString().split('T')[0] === date;
        } catch (error) {
          console.warn('Invalid date format:', post.created_at, error);
          return false;
        }
      });

      const engagement = dayPosts.reduce((sum, post) => {
        let postEngagement = 0;
        
        // Handle Mastodon posts
        if ('favourites_count' in post) {
          postEngagement = (post.favourites_count || 0) + 
                          (post.reblogs_count || 0) + 
                          (post.replies_count || 0);
        }
        // Handle Bluesky posts
        else if ('like_count' in post) {
          postEngagement = (post.like_count || 0) + 
                          (post.repostCount || 0) + 
                          (post.replyCount || 0);
        }
        
        return sum + postEngagement;
      }, 0);

      return { date, engagement };
    });
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full sm:w-96 glass-panel glass-subtle border-l border-neutral-200 dark:border-neutral-700 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-out ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-light glass-text-primary">Smart Analytics</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass-subtle rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-subtle p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm glass-text-muted">Total Posts</span>
                </div>
                <p className="text-2xl font-light glass-text-primary">{analytics.totalPosts}</p>
              </div>
              
              <div className="glass-subtle p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm glass-text-muted">Total Engagement</span>
                </div>
                <p className="text-2xl font-light glass-text-primary">{analytics.totalEngagement}</p>
              </div>
            </div>

            {/* Platform Distribution */}
            {analytics.topPlatforms.length > 0 && (
              <div>
                <h3 className="text-sm font-medium glass-text-secondary mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Platform Distribution
                </h3>
                <div className="space-y-2">
                  {analytics.topPlatforms.map((platform) => (
                    <div key={platform.platform} className="glass-subtle p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm glass-text-primary">{platform.platform}</span>
                        <span className="text-sm glass-text-muted">{platform.count} posts</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${platform.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Topics */}
            {analytics.trendingTopics.length > 0 && (
              <div>
                <h3 className="text-sm font-medium glass-text-secondary mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Trending Topics
                </h3>
                <div className="space-y-2">
                  {analytics.trendingTopics.map((topic) => (
                    <div key={topic.topic} className="glass-subtle p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm glass-text-primary">#{topic.topic}</span>
                        <span className="text-sm glass-text-muted">{topic.count} mentions</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights with Micro-tabs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium glass-text-secondary flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Insights
                </h3>
              </div>
              
              {/* Micro-tabs */}
              <div className="flex gap-1 mb-4 p-1 glass-subtle rounded-lg">
                {Object.entries(algorithms).map(([key, algorithm]) => (
                  <div key={key} className="relative group">
                    <button
                      onClick={() => setActiveAlgorithm(key as InsightAlgorithm)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                        activeAlgorithm === key
                          ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-sm'
                          : 'glass-text-muted hover:glass-text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {algorithm.name}
                    </button>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
                      <div className="font-medium mb-1">{algorithm.description}</div>
                      <div className="text-xs opacity-90">{algorithm.tooltip}</div>
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3">
                {analytics.aiInsights.map((insight, index) => (
                  <div key={index} className="glass-subtle p-3 rounded-lg">
                    <p className="text-sm glass-text-primary">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Types */}
            {analytics.contentTypes.length > 0 && (
              <div>
                <h3 className="text-sm font-medium glass-text-secondary mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Content Types
                </h3>
                <div className="space-y-2">
                  {analytics.contentTypes.slice(0, 4).map((type) => (
                    <div key={type.type} className="glass-subtle p-3 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm glass-text-primary">{type.type}</span>
                        <span className="text-sm glass-text-muted">{type.count} posts</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${type.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SmartAnalyticsPanel;
