/**
 * Web AI Service - Direct HTTP integration with Ollama for browser environments
 * 
 * This service provides AI capabilities when running in web mode by making
 * direct HTTP requests to Ollama's API instead of using Tauri commands.
 */

export interface WebAIChatRequest {
  message: string;
  context?: string;
  model?: string;
}

export interface WebAIChatResponse {
  response: string;
  model: string;
  done: boolean;
}

export interface WebAIAnalysisRequest {
  entryContents: string[];
}

export interface WebAIAnalysisResponse {
  patterns: Array<{
    id: string;
    title: string;
    description: string;
    strength: number;
    entryIds: string[];
    tags: string[];
    patternType: string;
  }>;
  insights: string[];
  moodTrends: Record<string, number>;
}

class WebAIService {
  private baseUrl: string;
  private defaultModel: string;

  constructor() {
    // Allow configuration via environment or localStorage
    this.baseUrl = (import.meta as any).env?.VITE_OLLAMA_URL || 
                   localStorage.getItem('ollama-url') || 
                   'http://localhost:11434';
    this.defaultModel = (import.meta as any).env?.VITE_OLLAMA_MODEL || 
                       localStorage.getItem('ollama-model') || 
                       'llama3.2';
  }

  /**
   * Check if Ollama is available
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.warn('Ollama not available:', error);
      return false;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) throw new Error('Failed to fetch models');
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Failed to get models:', error);
      return [];
    }
  }

  /**
   * Generate chat response using Ollama HTTP API
   */
  async generateChat(request: WebAIChatRequest): Promise<WebAIChatResponse> {
    const model = request.model || this.defaultModel;
    
    // Build system prompt with context
    const systemPrompt = request.context 
      ? `You are a helpful AI introspection companion for MyFace SnapJournal. \
         You help users reflect on their journal entries and social media posts. \
         Use the following context about the user's entries:\n\n${request.context}\n\n \
         Be empathetic, insightful, and encouraging. Help them discover patterns and insights in their writing.`
      : `You are a helpful AI introspection companion for MyFace SnapJournal. \
         You help users reflect on their journal entries and social media posts. \
         Be empathetic, insightful, and encouraging.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: request.message,
      },
    ];

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      response: data.message?.content || 'No response generated',
      model: data.model || model,
      done: data.done || true,
    };
  }

  /**
   * Analyze journal entries for patterns using AI
   */
  async analyzeEntries(request: WebAIAnalysisRequest): Promise<WebAIAnalysisResponse> {
    if (request.entryContents.length === 0) {
      return {
        patterns: [],
        insights: [],
        moodTrends: {},
      };
    }

    // Combine all entries into context for analysis
    const combinedEntries = request.entryContents.join('\n\n---\n\n');
    
    // Use AI to analyze patterns
    const analysisPrompt = `Analyze the following journal entries and identify patterns, themes, and insights. \
Look for recurring topics, emotions, daily rhythms, and personal growth patterns.

Journal Entries:
${combinedEntries}

Provide your analysis in this exact format:
PATTERNS:
- [pattern name]: [description]

INSIGHTS:
- [insight]

MOODS:
- [mood]: [percentage]`;

    try {
      const chatResponse = await this.generateChat({
        message: analysisPrompt,
        model: this.defaultModel,
      });

      return this.parseAnalysisResponse(chatResponse.response);
    } catch (error) {
      console.error('AI analysis failed:', error);
      // Return fallback analysis
      return this.generateFallbackAnalysis(request.entryContents);
    }
  }

  /**
   * Parse AI analysis response into structured format
   */
  private parseAnalysisResponse(analysisText: string): WebAIAnalysisResponse {
    const patterns: any[] = [];
    const insights: string[] = [];
    const moodTrends: Record<string, number> = {};

    // Extract patterns section
    const patternsMatch = analysisText.match(/PATTERNS:\s*([\s\S]*?)(?=INSIGHTS:|$)/i);
    if (patternsMatch) {
      const patternsText = patternsMatch[1];
      const patternLines = patternsText.split('\n').filter(line => line.trim().startsWith('-'));
      
      patternLines.forEach((line, index) => {
        const match = line.match(/-\s*(.+?):\s*(.+)/);
        if (match) {
          patterns.push({
            id: `pattern-${index}`,
            title: match[1].trim(),
            description: match[2].trim(),
            strength: 0.8,
            entryIds: [],
            tags: [],
            patternType: 'custom',
          });
        }
      });
    }

    // Extract insights section
    const insightsMatch = analysisText.match(/INSIGHTS:\s*([\s\S]*?)(?=MOODS:|$)/i);
    if (insightsMatch) {
      const insightsText = insightsMatch[1];
      const insightLines = insightsText.split('\n').filter(line => line.trim().startsWith('-'));
      
      insightLines.forEach(line => {
        const insight = line.replace(/^-\s*/, '').trim();
        if (insight) {
          insights.push(insight);
        }
      });
    }

    // Extract mood trends
    const moodsMatch = analysisText.match(/MOODS:\s*([\s\S]*?)$/i);
    if (moodsMatch) {
      const moodsText = moodsMatch[1];
      const moodLines = moodsText.split('\n').filter(line => line.trim().startsWith('-'));
      
      moodLines.forEach(line => {
        const match = line.match(/-\s*(.+?):\s*(\d+)%/);
        if (match) {
          const mood = match[1].trim();
          const percentage = parseInt(match[2]) / 100;
          moodTrends[mood] = percentage;
        }
      });
    }

    return { patterns, insights, moodTrends };
  }

  /**
   * Generate fallback analysis when AI fails
   */
  private generateFallbackAnalysis(entryContents: string[]): WebAIAnalysisResponse {
    const patterns = [];
    const insights = [];
    const moodTrends: Record<string, number> = {};

    if (entryContents.length > 3) {
      patterns.push({
        id: 'fallback-1',
        title: 'Regular Journaling',
        description: 'You maintain a consistent journaling habit',
        strength: 0.7,
        entryIds: [],
        tags: ['consistency'],
        patternType: 'habit',
      });

      insights.push('Your entries show a pattern of thoughtful reflection');
      insights.push('You maintain regular writing habits');
    }

    // Default mood distribution
    moodTrends['positive'] = 0.4;
    moodTrends['neutral'] = 0.4;
    moodTrends['negative'] = 0.2;

    return { patterns, insights, moodTrends };
  }

  /**
   * Update configuration
   */
  updateConfig(baseUrl: string, model: string) {
    this.baseUrl = baseUrl;
    this.defaultModel = model;
    localStorage.setItem('ollama-url', baseUrl);
    localStorage.setItem('ollama-model', model);
  }
}

export const webAIService = new WebAIService();
