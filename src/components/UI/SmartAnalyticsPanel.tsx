/**
 * Smart Analytics Panel Component
 * 
 * Provides AI-powered analytics and insights for the feed screen:
 * - Real-time engagement metrics
 * - AI analysis of content patterns
 * - Trending topics and themes
 * - Social media performance insights
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Users, Heart, MessageCircle, BarChart3, Brain, Hash, Eye } from 'lucide-react';
import { useMastodonStore } from '../../stores/mastodonStore';
import { useBlueskyStore } from '../../stores/blueskyStore';
import { webAIService } from '../../services/webAIService';
import { 
  ShimmerCard, 
  ShimmerMetric, 
  ShimmerProgressBar, 
  ShimmerInsight, 
  ShimmerTabs 
} from './ShimmerLoader';

interface AnalyticsData {
  totalPosts: number;
  totalEngagement: number;
  avgEngagementRate: number;
  topPlatforms: Array<{ platform: string; count: number; percentage: number }>;
  trendingTopics: Array<{ topic: string; count: number; trend: 'up' | 'down' | 'stable' }>;
  aiInsights: Array<{ text: string; emoticon: string }>;
  engagementTrend: Array<{ date: string; engagement: number }>;
  contentTypes: Array<{ type: string; count: number; percentage: number }>;
  lastUpdated: number;
  dataHash: string;
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
): Promise<Array<{ text: string; emoticon: string }>> => {
  const { totalPosts, avgEngagementRate, topPlatforms, contentTypesArray, trendingTopics } = data;
  
  let analysisPrompt = '';
  
  switch (algorithm) {
    case 'pattern':
      analysisPrompt = `Analyze the social media feed patterns and provide 3-4 concise insights about content trends, posting behaviors, and community patterns.

Feed Analysis Summary:
- Total posts in feed: ${totalPosts}
- Average engagement across all posts: ${avgEngagementRate.toFixed(1)} per post
- Platform distribution: ${topPlatforms.map(p => `${p.platform} (${p.count} posts)`).join(', ')}
- Most common content types: ${contentTypesArray.slice(0, 3).map(t => t.type).join(', ')}
- Trending topics across feed: ${trendingTopics.slice(0, 5).map(t => `#${t.topic}`).join(', ')}

CRITICAL: You MUST use this exact format with pipe separator:
INSIGHT 1: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 2: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 3: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 4: [Clear observation and implication] | [single relevant emoticon]

Choose ONE emoticon per insight that represents the core meaning:
- Platform dominance/usage → 🏢 👥 📱
- Content patterns/types → 📝 📊 📋
- User behavior → 🎯 🔍 👤
- Community trends → 🌟 📈 🔗`;
      break;
      
    case 'sentiment':
      analysisPrompt = `Analyze the emotional tone and sentiment patterns across the social media feed. Provide 3-4 concise insights about mood trends, emotional patterns, and community sentiment.

Feed Analysis Summary:
- Total posts in feed: ${totalPosts}
- Average engagement across all posts: ${avgEngagementRate.toFixed(1)} per post
- Platform distribution: ${topPlatforms.map(p => `${p.platform} (${p.count} posts)`).join(', ')}
- Most common content types: ${contentTypesArray.slice(0, 3).map(t => t.type).join(', ')}
- Trending topics across feed: ${trendingTopics.slice(0, 5).map(t => `#${t.topic}`).join(', ')}

CRITICAL: You MUST use this exact format with pipe separator:
INSIGHT 1: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 2: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 3: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 4: [Clear observation and implication] | [single relevant emoticon]

Choose ONE emoticon per insight that represents the emotional tone:
- Positive/optimistic → 😊 🌟 ✨
- Negative/concerned → 😔 😟 😕
- Neutral/analytical → 🤔 💭 🧠
- Excited/energetic → ⚡ 🔥 🎉`;
      break;
      
    case 'engagement':
      analysisPrompt = `Analyze what drives engagement and interaction patterns across the social media feed. Provide 3-4 concise insights about viral content characteristics, response patterns, and interaction drivers.

Feed Analysis Summary:
- Total posts in feed: ${totalPosts}
- Average engagement across all posts: ${avgEngagementRate.toFixed(1)} per post
- Platform distribution: ${topPlatforms.map(p => `${p.platform} (${p.count} posts)`).join(', ')}
- Most common content types: ${contentTypesArray.slice(0, 3).map(t => t.type).join(', ')}
- Trending topics across feed: ${trendingTopics.slice(0, 5).map(t => `#${t.topic}`).join(', ')}

CRITICAL: You MUST use this exact format with pipe separator:
INSIGHT 1: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 2: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 3: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 4: [Clear observation and implication] | [single relevant emoticon]

Choose ONE emoticon per insight that represents the engagement level:
- High engagement → 🔥 💬 🎯
- Low engagement → 😴 👀 🔇
- Interactive content → ⚡ 🎪 🎮
- Community building → 👥 🤝 🏘️`;
      break;
      
    case 'trending':
      analysisPrompt = `Analyze topic evolution and trending patterns across the social media feed. Provide 3-4 concise insights about topic emergence, hashtag evolution, and trending dynamics.

Feed Analysis Summary:
- Total posts in feed: ${totalPosts}
- Average engagement across all posts: ${avgEngagementRate.toFixed(1)} per post
- Platform distribution: ${topPlatforms.map(p => `${p.platform} (${p.count} posts)`).join(', ')}
- Most common content types: ${contentTypesArray.slice(0, 3).map(t => t.type).join(', ')}
- Trending topics across feed: ${trendingTopics.slice(0, 5).map(t => `#${t.topic}`).join(', ')}

CRITICAL: You MUST use this exact format with pipe separator:
INSIGHT 1: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 2: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 3: [Clear observation and implication] | [single relevant emoticon]
INSIGHT 4: [Clear observation and implication] | [single relevant emoticon]

Choose ONE emoticon per insight that represents the trending nature:
- Rising trends → 📈 🔥 🚀
- Stable topics → ⚖️ 🏠 🎯
- Emerging themes → 🌟 🆕 💡
- Declining interests → 📉 ⏰ 🔚`;
      break;
  }

  const aiResponse = await webAIService.generateChat({
    message: analysisPrompt,
    model: undefined
  });

  // Parse insights from AI response
  const responseText = aiResponse.response;
  
  // Remove any intro text before insights
  const insightSection = responseText.split(/INSIGHT \d+:/i)[0] ? 
    responseText.substring(responseText.indexOf('INSIGHT 1:') || responseText.indexOf('INSIGHT 1')) : 
    responseText;
  
  const insightLines = insightSection.split('\n').filter((line: string) => 
    line.toLowerCase().includes('insight') && line.includes(':')
  );
  
  return insightLines.map((line: string) => {
    // Extract content after "INSIGHT X:"
    const match = line.match(/INSIGHT \d+:\s*(.+)/i);
    if (match) {
      let insightContent = match[1].trim();
      
      // Split by pipe separator to get text and emoticon
      const parts = insightContent.split('|');
      let text = parts[0]?.trim() || insightContent;
      let emoticon = parts[1]?.trim() || '';
      
      // If no pipe separator, look for emoticon at the end of the text
      if (!parts[1] && text) {
        const emoticonMatch = text.match(/([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])$/u);
        if (emoticonMatch) {
          emoticon = emoticonMatch[1];
          text = text.replace(emoticonMatch[0], '').trim();
        }
      }
      
      // Remove any bold formatting (**text**)
      text = text.replace(/\*\*(.*?)\*\*/g, '$1');
      // Remove any remaining markdown formatting
      text = text.replace(/\*([^*]+)\*/g, '$1');
      
      // Remove any remaining emoticons from the text
      text = text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u, '').trim();
      
      // Clean up emoticon (remove extra spaces, take first emoji)
      emoticon = emoticon.replace(/\s+/g, '').match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u)?.[0] || '📊';
      
      return { text, emoticon };
    }
    return { text: line.replace(/^INSIGHT \d+:\s*/i, '').trim(), emoticon: '📊' };
  }).filter((insight: { text: string; emoticon: string }) => insight.text.length > 0);
};

const SmartAnalyticsPanel: React.FC<SmartAnalyticsPanelProps> = ({ isOpen, onClose }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [activeAlgorithm, setActiveAlgorithm] = useState<InsightAlgorithm>('pattern');
  
  const { posts: mastodonPosts } = useMastodonStore();
  const { posts: blueskyPosts } = useBlueskyStore();

  // Memoize data hash to detect changes
  const dataHash = useMemo(() => {
    const allPosts = [...mastodonPosts, ...blueskyPosts];
    return `${allPosts.length}-${mastodonPosts.length}-${blueskyPosts.length}-${activeAlgorithm}`;
  }, [mastodonPosts, blueskyPosts, activeAlgorithm]);

  // Check if we need to reload data
  const needsReload = useMemo(() => {
    if (!analytics) return true;
    return analytics.dataHash !== dataHash;
  }, [analytics, dataHash]);

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
    if (isOpen && needsReload) {
      loadAnalytics();
    }
  }, [isOpen, needsReload]);

  // Separate effect for algorithm changes (only reload AI insights)
  useEffect(() => {
    if (isOpen && analytics && !needsReload) {
      loadAIInsights();
    }
  }, [activeAlgorithm]);

  const loadAnalytics = async () => {
    setError(null);
    setLoadingSections(new Set(['metrics', 'platforms', 'topics', 'content', 'insights']));

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
          aiInsights: [{ text: 'No posts available in feed yet. Import from Mastodon or Bluesky to see feed analytics!', emoticon: '📊' }],
          engagementTrend: [],
          contentTypes: [],
          lastUpdated: Date.now(),
          dataHash
        });
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
          engagement = ((post as any).like_count || 0) + 
                      ((post as any).repostCount || 0) + 
                      ((post as any).replyCount || 0);
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
      let aiInsights: Array<{ text: string; emoticon: string }> = [];
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
        
        switch (activeAlgorithm) {
          case 'pattern':
            aiInsights = [
              { text: `Feed contains ${totalPosts} posts with ${engagementLevel} engagement (${avgEngagementRate.toFixed(1)} avg) - suggests ${engagementLevel === 'high' ? 'active community interaction' : engagementLevel === 'moderate' ? 'selective engagement patterns' : 'passive consumption or niche audience'}`, emoticon: '📊' },
              { text: platformDominance ? `${platformDominance.platform} dominates with ${platformDominance.percentage.toFixed(0)}% of posts - indicates ${platformDominance.platform === 'Bluesky' ? 'early adopter community or tech-savvy audience' : 'established social media ecosystem'}` : 'Balanced platform usage suggests diverse community preferences', emoticon: '👥' },
              { text: trendingTopics.length > 0 ? `Top hashtags (#${trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) show ${trendingTopics.length > 2 ? 'diverse interests' : 'focused community themes'} - suggests ${trendingTopics.length > 2 ? 'broad community engagement' : 'specialized or niche discussions'}` : 'Limited hashtag usage suggests informal or personal communication style', emoticon: '🏷️' },
              { text: contentTypesArray.length > 0 ? `Content mix favors ${contentTypesArray[0].type} (${contentTypesArray[0].percentage.toFixed(0)}%) - indicates ${contentTypesArray[0].type === 'Links' ? 'information-sharing community' : contentTypesArray[0].type === 'Long-form' ? 'thoughtful discussion culture' : 'quick communication preferences'}` : 'Balanced content types suggest diverse communication styles', emoticon: '📝' }
            ];
            break;
            
          case 'sentiment':
            aiInsights = [
              { text: `Community sentiment appears ${engagementLevel === 'high' ? 'positive and engaged' : engagementLevel === 'moderate' ? 'balanced with selective enthusiasm' : 'reserved or contemplative'}`, emoticon: '😊' },
              { text: platformDominance ? `${platformDominance.platform} community shows ${platformDominance.platform === 'Bluesky' ? 'optimistic early-adopter energy' : 'established social media comfort'}` : 'Mixed platform sentiment suggests diverse emotional responses', emoticon: '🌟' },
              { text: trendingTopics.length > 0 ? `Hashtag sentiment (#${trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) indicates ${trendingTopics.length > 2 ? 'broad emotional engagement' : 'focused community mood'}` : 'Limited hashtag usage suggests personal, less performative communication', emoticon: '💭' },
              { text: contentTypesArray.length > 0 ? `Content tone favors ${contentTypesArray[0].type} (${contentTypesArray[0].percentage.toFixed(0)}%) - suggests ${contentTypesArray[0].type === 'Links' ? 'curious, information-seeking mood' : contentTypesArray[0].type === 'Long-form' ? 'thoughtful, reflective community' : 'quick, spontaneous communication style'}` : 'Balanced content suggests varied emotional expression', emoticon: '🎭' }
            ];
            break;
            
          case 'engagement':
            aiInsights = [
              { text: `Engagement patterns show ${engagementLevel === 'high' ? 'highly interactive community with strong response rates' : engagementLevel === 'moderate' ? 'selective engagement with quality over quantity' : 'passive consumption or niche audience behavior'}`, emoticon: '🔥' },
              { text: platformDominance ? `${platformDominance.platform} drives ${platformDominance.percentage.toFixed(0)}% of posts - indicates ${platformDominance.platform === 'Bluesky' ? 'emerging community with growing engagement' : 'established platform with consistent interaction patterns'}` : 'Balanced platform usage suggests diverse engagement preferences', emoticon: '💬' },
              { text: trendingTopics.length > 0 ? `Top hashtags (#${trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) generate ${trendingTopics.length > 2 ? 'broad community response' : 'focused engagement'}` : 'Limited hashtag usage suggests direct, personal engagement style', emoticon: '👀' },
              { text: contentTypesArray.length > 0 ? `Most engaging content type: ${contentTypesArray[0].type} (${contentTypesArray[0].percentage.toFixed(0)}%) - suggests ${contentTypesArray[0].type === 'Links' ? 'link-sharing drives community interaction' : contentTypesArray[0].type === 'Long-form' ? 'thoughtful content generates deeper engagement' : 'quick posts encourage frequent interaction'}` : 'Diverse content types suggest varied engagement drivers', emoticon: '⚡' }
            ];
            break;
            
          case 'trending':
            aiInsights = [
              { text: `Topic evolution shows ${trendingTopics.length > 0 ? `${trendingTopics.length} active themes` : 'limited trending topics'} - suggests ${trendingTopics.length > 2 ? 'dynamic, evolving community interests' : 'stable, focused community discussions'}`, emoticon: '📈' },
              { text: platformDominance ? `${platformDominance.platform} trending patterns (${platformDominance.percentage.toFixed(0)}% of posts) indicate ${platformDominance.platform === 'Bluesky' ? 'emerging trends in early-adopter community' : 'established trending patterns'}` : 'Cross-platform trending suggests diverse topic evolution', emoticon: '🌊' },
              { text: trendingTopics.length > 0 ? `Current trending topics (#${trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) show ${trendingTopics.length > 2 ? 'broad community interests' : 'focused trending themes'}` : 'Limited trending topics suggest personal, non-trending communication style', emoticon: '🏷️' },
              { text: contentTypesArray.length > 0 ? `Trending content types favor ${contentTypesArray[0].type} (${contentTypesArray[0].percentage.toFixed(0)}%) - indicates ${contentTypesArray[0].type === 'Links' ? 'information-sharing trends' : contentTypesArray[0].type === 'Long-form' ? 'thoughtful discussion trends' : 'quick communication trends'}` : 'Balanced content trends suggest diverse topic evolution', emoticon: '⏰' }
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
        contentTypes: contentTypesArray,
        lastUpdated: Date.now(),
        dataHash
      });

    } catch (err) {
      console.error('Analytics loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoadingSections(new Set());
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
          postEngagement = ((post as any).like_count || 0) + 
                          ((post as any).repostCount || 0) + 
                          ((post as any).replyCount || 0);
        }
        
        return sum + postEngagement;
      }, 0);

      return { date, engagement };
    });
  };

  // Separate function to load only AI insights
  const loadAIInsights = useCallback(async () => {
    if (!analytics) return;
    
    setLoadingSections(new Set(['insights']));
    
    try {
      const allPosts = [...mastodonPosts, ...blueskyPosts];
      
      if (allPosts.length === 0) {
        setAnalytics(prev => prev ? {
          ...prev,
          aiInsights: [{ text: 'No posts available in feed yet. Import from Mastodon or Bluesky to see feed analytics!', emoticon: '📊' }],
          lastUpdated: Date.now()
        } : null);
        return;
      }

      // Generate AI insights based on selected algorithm
      let aiInsights: Array<{ text: string; emoticon: string }> = [];
      try {
        const isOllamaAvailable = await webAIService.checkAvailability();
        if (isOllamaAvailable && allPosts.length > 0) {
          aiInsights = await generateAlgorithmInsights(activeAlgorithm, {
            totalPosts: analytics.totalPosts,
            avgEngagementRate: analytics.avgEngagementRate,
            topPlatforms: analytics.topPlatforms,
            contentTypesArray: analytics.contentTypes,
            trendingTopics: analytics.trendingTopics,
            allPosts
          });
        }
      } catch (aiError) {
        console.warn('AI analysis failed:', aiError);
      }

      // Fallback insights if AI fails
      if (aiInsights.length === 0) {
        const platformDominance = analytics.topPlatforms.length > 0 ? analytics.topPlatforms[0] : null;
        const engagementLevel = analytics.avgEngagementRate > 5 ? 'high' : analytics.avgEngagementRate > 2 ? 'moderate' : 'low';
        
        switch (activeAlgorithm) {
          case 'pattern':
            aiInsights = [
              { text: `Feed contains ${analytics.totalPosts} posts with ${engagementLevel} engagement (${analytics.avgEngagementRate.toFixed(1)} avg) - suggests ${engagementLevel === 'high' ? 'active community interaction' : engagementLevel === 'moderate' ? 'selective engagement patterns' : 'passive consumption or niche audience'}`, emoticon: '📊' },
              { text: platformDominance ? `${platformDominance.platform} dominates with ${platformDominance.percentage.toFixed(0)}% of posts - indicates ${platformDominance.platform === 'Bluesky' ? 'early adopter community or tech-savvy audience' : 'established social media ecosystem'}` : 'Balanced platform usage suggests diverse community preferences', emoticon: '👥' },
              { text: analytics.trendingTopics.length > 0 ? `Top hashtags (#${analytics.trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) show ${analytics.trendingTopics.length > 2 ? 'diverse interests' : 'focused community themes'} - suggests ${analytics.trendingTopics.length > 2 ? 'broad community engagement' : 'specialized or niche discussions'}` : 'Limited hashtag usage suggests informal or personal communication style', emoticon: '🏷️' },
              { text: analytics.contentTypes.length > 0 ? `Content mix favors ${analytics.contentTypes[0].type} (${analytics.contentTypes[0].percentage.toFixed(0)}%) - indicates ${analytics.contentTypes[0].type === 'Links' ? 'information-sharing community' : analytics.contentTypes[0].type === 'Long-form' ? 'thoughtful discussion culture' : 'quick communication preferences'}` : 'Balanced content types suggest diverse communication styles', emoticon: '📝' }
            ];
            break;
            
          case 'sentiment':
            aiInsights = [
              { text: `Community sentiment appears ${engagementLevel === 'high' ? 'positive and engaged' : engagementLevel === 'moderate' ? 'balanced with selective enthusiasm' : 'reserved or contemplative'}`, emoticon: '😊' },
              { text: platformDominance ? `${platformDominance.platform} community shows ${platformDominance.platform === 'Bluesky' ? 'optimistic early-adopter energy' : 'established social media comfort'}` : 'Mixed platform sentiment suggests diverse emotional responses', emoticon: '🌟' },
              { text: analytics.trendingTopics.length > 0 ? `Hashtag sentiment (#${analytics.trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) indicates ${analytics.trendingTopics.length > 2 ? 'broad emotional engagement' : 'focused community mood'}` : 'Limited hashtag usage suggests personal, less performative communication', emoticon: '💭' },
              { text: analytics.contentTypes.length > 0 ? `Content tone favors ${analytics.contentTypes[0].type} (${analytics.contentTypes[0].percentage.toFixed(0)}%) - suggests ${analytics.contentTypes[0].type === 'Links' ? 'curious, information-seeking mood' : analytics.contentTypes[0].type === 'Long-form' ? 'thoughtful, reflective community' : 'quick, spontaneous communication style'}` : 'Balanced content suggests varied emotional expression', emoticon: '🎭' }
            ];
            break;
            
          case 'engagement':
            aiInsights = [
              { text: `Engagement patterns show ${engagementLevel === 'high' ? 'highly interactive community with strong response rates' : engagementLevel === 'moderate' ? 'selective engagement with quality over quantity' : 'passive consumption or niche audience behavior'}`, emoticon: '🔥' },
              { text: platformDominance ? `${platformDominance.platform} drives ${platformDominance.percentage.toFixed(0)}% of posts - indicates ${platformDominance.platform === 'Bluesky' ? 'emerging community with growing engagement' : 'established platform with consistent interaction patterns'}` : 'Balanced platform usage suggests diverse engagement preferences', emoticon: '💬' },
              { text: analytics.trendingTopics.length > 0 ? `Top hashtags (#${analytics.trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) generate ${analytics.trendingTopics.length > 2 ? 'broad community response' : 'focused engagement'}` : 'Limited hashtag usage suggests direct, personal engagement style', emoticon: '👀' },
              { text: analytics.contentTypes.length > 0 ? `Most engaging content type: ${analytics.contentTypes[0].type} (${analytics.contentTypes[0].percentage.toFixed(0)}%) - suggests ${analytics.contentTypes[0].type === 'Links' ? 'link-sharing drives community interaction' : analytics.contentTypes[0].type === 'Long-form' ? 'thoughtful content generates deeper engagement' : 'quick posts encourage frequent interaction'}` : 'Diverse content types suggest varied engagement drivers', emoticon: '⚡' }
            ];
            break;
            
          case 'trending':
            aiInsights = [
              { text: `Topic evolution shows ${analytics.trendingTopics.length > 0 ? `${analytics.trendingTopics.length} active themes` : 'limited trending topics'} - suggests ${analytics.trendingTopics.length > 2 ? 'dynamic, evolving community interests' : 'stable, focused community discussions'}`, emoticon: '📈' },
              { text: platformDominance ? `${platformDominance.platform} trending patterns (${platformDominance.percentage.toFixed(0)}% of posts) indicate ${platformDominance.platform === 'Bluesky' ? 'emerging trends in early-adopter community' : 'established trending patterns'}` : 'Cross-platform trending suggests diverse topic evolution', emoticon: '🌊' },
              { text: analytics.trendingTopics.length > 0 ? `Current trending topics (#${analytics.trendingTopics.slice(0, 3).map(t => t.topic).join(', #')}) show ${analytics.trendingTopics.length > 2 ? 'broad community interests' : 'focused trending themes'}` : 'Limited trending topics suggest personal, non-trending communication style', emoticon: '🏷️' },
              { text: analytics.contentTypes.length > 0 ? `Trending content types favor ${analytics.contentTypes[0].type} (${analytics.contentTypes[0].percentage.toFixed(0)}%) - indicates ${analytics.contentTypes[0].type === 'Links' ? 'information-sharing trends' : analytics.contentTypes[0].type === 'Long-form' ? 'thoughtful discussion trends' : 'quick communication trends'}` : 'Balanced content trends suggest diverse topic evolution', emoticon: '⏰' }
            ];
            break;
        }
      }

      setAnalytics(prev => prev ? {
        ...prev,
        aiInsights,
        lastUpdated: Date.now()
      } : null);
      
    } catch (err) {
      console.error('AI insights loading error:', err);
    } finally {
      setLoadingSections(prev => {
        const newSet = new Set(prev);
        newSet.delete('insights');
        return newSet;
      });
    }
  }, [analytics, mastodonPosts, blueskyPosts, activeAlgorithm]);

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

        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {loadingSections.has('metrics') ? (
                <>
                  <ShimmerMetric />
                  <ShimmerMetric />
                </>
              ) : analytics ? (
                <>
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
                </>
              ) : (
                <>
                  <ShimmerMetric />
                  <ShimmerMetric />
                </>
              )}
            </div>

            {/* Platform Distribution */}
            {loadingSections.has('platforms') ? (
              <div>
                <h3 className="text-sm font-medium glass-text-secondary mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Platform Distribution
                </h3>
                <div className="space-y-2">
                  <ShimmerProgressBar />
                  <ShimmerProgressBar />
                </div>
              </div>
            ) : analytics && analytics.topPlatforms.length > 0 ? (
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
            ) : null}

            {/* Trending Topics */}
            {loadingSections.has('topics') ? (
              <div>
                <h3 className="text-sm font-medium glass-text-secondary mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Trending Topics
                </h3>
                <div className="space-y-2">
                  <ShimmerCard />
                  <ShimmerCard />
                  <ShimmerCard />
                </div>
              </div>
            ) : analytics && analytics.trendingTopics.length > 0 ? (
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
            ) : null}

            {/* AI Insights with Micro-tabs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium glass-text-secondary flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Insights
                </h3>
              </div>
              
              {/* Micro-tabs */}
              {loadingSections.has('insights') ? (
                <ShimmerTabs count={4} />
              ) : (
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
              )}
              
              <div className="space-y-3">
                {loadingSections.has('insights') ? (
                  <>
                    <ShimmerInsight />
                    <ShimmerInsight />
                    <ShimmerInsight />
                    <ShimmerInsight />
                  </>
                ) : analytics ? (
                  analytics.aiInsights.map((insight, index) => (
                    <div key={index} className="glass-subtle p-3 rounded-lg relative">
                      <p className="text-sm glass-text-primary leading-relaxed pr-6">{insight.text}</p>
                      <div className="absolute bottom-4 -right-1 w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs shadow-lg border-2 border-white dark:border-neutral-800 transform translate-x-1/2 hover:scale-110 transition-transform duration-200 cursor-pointer group">
                        {insight.emoticon}
                        {/* Tooltip */}
                        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs whitespace-normal">
                          <div className="font-medium mb-1">Emoticon Meaning</div>
                          <div className="text-xs opacity-90">
                            {insight.emoticon === '🏢' && 'Platform dominance or corporate presence'}
                            {insight.emoticon === '👥' && 'Community or user groups'}
                            {insight.emoticon === '📱' && 'Mobile or platform usage'}
                            {insight.emoticon === '📝' && 'Content creation or writing'}
                            {insight.emoticon === '📊' && 'Data analysis or metrics'}
                            {insight.emoticon === '📋' && 'Content organization or lists'}
                            {insight.emoticon === '🎯' && 'Targeted behavior or focus'}
                            {insight.emoticon === '🔍' && 'Analysis or investigation'}
                            {insight.emoticon === '👤' && 'Individual user behavior'}
                            {insight.emoticon === '🌟' && 'Community highlights or stars'}
                            {insight.emoticon === '📈' && 'Growth trends or rising patterns'}
                            {insight.emoticon === '🔗' && 'Connections or linking behavior'}
                            {insight.emoticon === '😊' && 'Positive sentiment or happiness'}
                            {insight.emoticon === '✨' && 'Optimism or sparkle'}
                            {insight.emoticon === '😔' && 'Negative sentiment or sadness'}
                            {insight.emoticon === '😟' && 'Concern or worry'}
                            {insight.emoticon === '😕' && 'Confusion or mixed feelings'}
                            {insight.emoticon === '🤔' && 'Analytical thinking or contemplation'}
                            {insight.emoticon === '💭' && 'Thoughtful reflection'}
                            {insight.emoticon === '🧠' && 'Intellectual analysis'}
                            {insight.emoticon === '⚡' && 'High energy or excitement'}
                            {insight.emoticon === '🔥' && 'High engagement or viral content'}
                            {insight.emoticon === '🎉' && 'Celebration or excitement'}
                            {insight.emoticon === '💬' && 'Active conversation or interaction'}
                            {insight.emoticon === '😴' && 'Low engagement or inactivity'}
                            {insight.emoticon === '👀' && 'Passive viewing or attention'}
                            {insight.emoticon === '🔇' && 'Silence or lack of interaction'}
                            {insight.emoticon === '🎪' && 'Entertaining or engaging content'}
                            {insight.emoticon === '🎮' && 'Interactive or gamified content'}
                            {insight.emoticon === '🤝' && 'Community building or collaboration'}
                            {insight.emoticon === '🏘️' && 'Community or neighborhood'}
                            {insight.emoticon === '🚀' && 'Rapid growth or trending upward'}
                            {insight.emoticon === '⚖️' && 'Balanced or stable topics'}
                            {insight.emoticon === '🏠' && 'Stable or home-based content'}
                            {insight.emoticon === '🆕' && 'New or emerging themes'}
                            {insight.emoticon === '💡' && 'Innovation or new ideas'}
                            {insight.emoticon === '📉' && 'Declining trends or decreasing interest'}
                            {insight.emoticon === '⏰' && 'Time-sensitive or temporal patterns'}
                            {insight.emoticon === '🔚' && 'Ending trends or conclusion'}
                            {!['🏢', '👥', '📱', '📝', '📊', '📋', '🎯', '🔍', '👤', '🌟', '📈', '🔗', '😊', '✨', '😔', '😟', '😕', '🤔', '💭', '🧠', '⚡', '🔥', '🎉', '💬', '😴', '👀', '🔇', '🎪', '🎮', '🤝', '🏘️', '🚀', '⚖️', '🏠', '🆕', '💡', '📉', '⏰', '🔚'].includes(insight.emoticon) && 'Contextual insight indicator'}
                          </div>
                          {/* Tooltip arrow */}
                          <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <ShimmerInsight />
                    <ShimmerInsight />
                    <ShimmerInsight />
                    <ShimmerInsight />
                  </>
                )}
              </div>
            </div>

            {/* Content Types */}
            {loadingSections.has('content') ? (
              <div>
                <h3 className="text-sm font-medium glass-text-secondary mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Content Types
                </h3>
                <div className="space-y-2">
                  <ShimmerProgressBar />
                  <ShimmerProgressBar />
                  <ShimmerProgressBar />
                  <ShimmerProgressBar />
                </div>
              </div>
            ) : analytics && analytics.contentTypes.length > 0 ? (
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
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAnalyticsPanel;
