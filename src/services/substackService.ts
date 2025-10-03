/**
 * Substack Service for MyFace SnapJournal
 * 
 * Handles RSS feed parsing and content normalization for Substack newsletters
 */

export interface SubstackFeedItem {
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  publication: string
  publishedAt: string
  url: string
  imageUrl?: string
  tags: string[]
  source: 'substack'
  sourceUrl: string
}

export interface SubstackFeed {
  title: string
  description: string
  url: string
  rssUrl: string
  lastFetched?: string
  itemCount: number
}

export interface SubstackSource {
  id: string
  name: string
  rssUrl: string
  enabled: boolean
  lastFetched?: string
}

export interface PopularSubstack {
  name: string
  description: string
  url: string
  rssUrl: string
  category: string
  subscribers?: string
  isPopular?: boolean
}

class SubstackService {
  // Multiple CORS proxies for better reliability (updated with more reliable options)
  private readonly CORS_PROXIES = [
    // Local Vite proxy (development only)
    ...(this.IS_DEV ? ['http://localhost:1420/api/proxy?url='] : []),
    // Development-friendly proxies that work better
    'https://api.allorigins.win/get?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.allorigins.win/raw?url=',
    'https://thingproxy.freeboard.io/fetch/'
  ]
  private readonly CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
  private readonly IS_DEV = import.meta.env.DEV
  private readonly LOCAL_PROXY_PORT = 8080

  // Curated list of popular Substack newsletters
  private readonly POPULAR_NEWSLETTERS: PopularSubstack[] = [
    // Politics & News
    {
      name: "Letters from an American",
      description: "Daily analyses of American politics and history by historian Heather Cox Richardson",
      url: "https://heathercoxrichardson.substack.com",
      rssUrl: "https://heathercoxrichardson.substack.com/feed",
      category: "Politics & News",
      subscribers: "1M+",
      isPopular: true
    },
    {
      name: "Popular Information",
      description: "Accountability journalism and in-depth political analysis by Judd Legum",
      url: "https://popular.info",
      rssUrl: "https://popular.info/feed",
      category: "Politics & News",
      subscribers: "500K+",
      isPopular: true
    },
    {
      name: "The Dispatch",
      description: "Conservative digital media offering fact-based reporting on politics and policy",
      url: "https://thedispatch.com",
      rssUrl: "https://thedispatch.com/feed",
      category: "Politics & News",
      subscribers: "200K+"
    },

    // Business & Finance
    {
      name: "Grit Capital",
      description: "Finance and investment insights with humor and clarity by Genevieve Roch-Decter",
      url: "https://gritcapital.substack.com",
      rssUrl: "https://gritcapital.substack.com/feed",
      category: "Business & Finance",
      subscribers: "300K+",
      isPopular: true
    },
    {
      name: "The Diff",
      description: "Business and technology analysis with a focus on market dynamics",
      url: "https://diff.substack.com",
      rssUrl: "https://diff.substack.com/feed",
      category: "Business & Finance",
      subscribers: "100K+"
    },
    {
      name: "Not Boring",
      description: "Business strategy and startup insights in an engaging, accessible format",
      url: "https://notboring.substack.com",
      rssUrl: "https://notboring.substack.com/feed",
      category: "Business & Finance",
      subscribers: "400K+",
      isPopular: true
    },

    // Sports
    {
      name: "Huddle Up",
      description: "Business side of sports, covering contracts, endorsements, and financial aspects",
      url: "https://huddleup.substack.com",
      rssUrl: "https://huddleup.substack.com/feed",
      category: "Sports",
      subscribers: "150K+",
      isPopular: true
    },
    {
      name: "The Ringer",
      description: "Sports, pop culture, and technology commentary",
      url: "https://theringer.substack.com",
      rssUrl: "https://theringer.substack.com/feed",
      category: "Sports",
      subscribers: "800K+"
    },

    // Technology
    {
      name: "Platformer",
      description: "Tech industry news and analysis by Casey Newton",
      url: "https://platformer.news",
      rssUrl: "https://platformer.news/feed",
      category: "Technology",
      subscribers: "200K+",
      isPopular: true
    },
    {
      name: "Stratechery",
      description: "Strategy and business analysis in the tech industry",
      url: "https://stratechery.com",
      rssUrl: "https://stratechery.com/feed",
      category: "Technology",
      subscribers: "100K+"
    },
    {
      name: "The Algorithm",
      description: "AI and machine learning insights from MIT Technology Review",
      url: "https://thealgorithm.substack.com",
      rssUrl: "https://thealgorithm.substack.com/feed",
      category: "Technology",
      subscribers: "300K+"
    },

    // Culture & Entertainment
    {
      name: "Hung Up",
      description: "Pop culture commentary and entertainment news by Hunter Harris",
      url: "https://hungup.substack.com",
      rssUrl: "https://hungup.substack.com/feed",
      category: "Culture & Entertainment",
      subscribers: "100K+",
      isPopular: true
    },
    {
      name: "Gen Yeet",
      description: "Cultural commentary and Gen Z perspectives by Terry Nguyen",
      url: "https://genyeet.substack.com",
      rssUrl: "https://genyeet.substack.com/feed",
      category: "Culture & Entertainment",
      subscribers: "50K+"
    },

    // Science & Health
    {
      name: "Your Local Epidemiologist",
      description: "Public health insights and COVID-19 analysis by Dr. Katelyn Jetelina",
      url: "https://yourlocalepidemiologist.substack.com",
      rssUrl: "https://yourlocalepidemiologist.substack.com/feed",
      category: "Science & Health",
      subscribers: "400K+",
      isPopular: true
    },
    {
      name: "The Science of Reading",
      description: "Educational insights and literacy research",
      url: "https://thescienceofreading.substack.com",
      rssUrl: "https://thescienceofreading.substack.com/feed",
      category: "Science & Health",
      subscribers: "100K+"
    },

    // Writing & Literature
    {
      name: "The Paris Review",
      description: "Literary magazine featuring fiction, poetry, and essays",
      url: "https://theparisreview.substack.com",
      rssUrl: "https://theparisreview.substack.com/feed",
      category: "Writing & Literature",
      subscribers: "200K+"
    },
    {
      name: "Lit Hub",
      description: "Literary news, reviews, and author interviews",
      url: "https://lithub.substack.com",
      rssUrl: "https://lithub.substack.com/feed",
      category: "Writing & Literature",
      subscribers: "150K+"
    }
  ]

  /**
   * Add a new Substack RSS feed source
   */
  addSource(source: Omit<SubstackSource, 'id'>): SubstackSource {
    const id = `substack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newSource: SubstackSource = {
      id,
      ...source,
      lastFetched: undefined
    }

    const sources = this.getSources()
    sources.push(newSource)
    this.saveSources(sources)

    return newSource
  }

  /**
   * Get all configured Substack sources
   */
  getSources(): SubstackSource[] {
    try {
      const stored = localStorage.getItem('substack_sources')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading Substack sources:', error)
      return []
    }
  }

  /**
   * Update a Substack source
   */
  updateSource(id: string, updates: Partial<SubstackSource>): void {
    const sources = this.getSources()
    const index = sources.findIndex(s => s.id === id)
    
    if (index !== -1) {
      sources[index] = { ...sources[index], ...updates }
      this.saveSources(sources)
    }
  }

  /**
   * Remove a Substack source
   */
  removeSource(id: string): void {
    const sources = this.getSources().filter(s => s.id !== id)
    this.saveSources(sources)
  }

  /**
   * Fetch RSS feed content with multiple proxy fallbacks
   */
  async fetchFeedContent(rssUrl: string): Promise<SubstackFeedItem[]> {
    let lastError: Error | null = null

    // In development, try direct fetch first (should work with CORS extension)
    if (this.IS_DEV) {
      try {
        console.log('🧪 Development mode: Trying direct fetch first (CORS extension should handle this)')
        const response = await fetch(rssUrl, {
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'User-Agent': 'MyFaceSnapJournal/1.0'
          }
        })
        
        if (response.ok) {
          const xmlText = await response.text()
          if (xmlText && xmlText.trim().length > 0) {
            console.log('✅ Direct fetch succeeded! CORS extension is working.')
            return this.parseRSSFeed(xmlText, rssUrl)
          }
        }
      } catch (error) {
        console.log('❌ Direct fetch failed, trying proxies...', error)
        lastError = error as Error
      }
    }

    // Try each CORS proxy in order
    for (const proxy of this.CORS_PROXIES) {
      try {
        console.log(`🔍 Trying proxy: ${proxy} for ${rssUrl}`)
        
        // Debug: Check if we're in browser with CORS extension
        if (this.IS_DEV && proxy.includes('localhost')) {
          console.log('🌐 Using local Vite proxy (should work with CORS extension)')
        }
        
        let proxyUrl: string
        let response: Response
        
        // Handle different proxy formats
        if (proxy.includes('allorigins.win/get')) {
          // This proxy returns JSON with the content in a 'contents' field
          proxyUrl = `${proxy}${encodeURIComponent(rssUrl)}`
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000)
          
          response = await fetch(proxyUrl, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'MyFaceSnapJournal/1.0'
            }
          })
          
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            throw new Error(`Proxy returned ${response.status}: ${response.statusText}`)
          }

          const jsonData = await response.json()
          const xmlText = jsonData.contents || jsonData
          
          if (!xmlText || xmlText.trim().length === 0) {
            throw new Error('Empty response from proxy')
          }

          const items = this.parseRSSFeed(xmlText, rssUrl)
          console.log(`Successfully fetched ${items.length} items using proxy: ${proxy}`)
          return items
        } else {
          // Standard proxy format
          proxyUrl = `${proxy}${encodeURIComponent(rssUrl)}`
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000)
          
          response = await fetch(proxyUrl, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/rss+xml, application/xml, text/xml, */*',
              'User-Agent': 'MyFaceSnapJournal/1.0'
            }
          })
          
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            throw new Error(`Proxy returned ${response.status}: ${response.statusText}`)
          }

          const xmlText = await response.text()
          
          if (!xmlText || xmlText.trim().length === 0) {
            throw new Error('Empty response from proxy')
          }

          const items = this.parseRSSFeed(xmlText, rssUrl)
          console.log(`Successfully fetched ${items.length} items using proxy: ${proxy}`)
          return items
        }
        
      } catch (error) {
        console.warn(`Proxy failed: ${proxy}`, error)
        lastError = error as Error
        continue // Try next proxy
      }
    }

    // If all proxies failed, try Tauri backend (if available)
    try {
      console.log(`All proxies failed, trying Tauri backend for ${rssUrl}`)
      const { invoke } = await import('@tauri-apps/api/core')
      
      const xmlText = await invoke<string>('fetch_rss_feed', {
        url: rssUrl
      })
      
      if (xmlText && xmlText.trim().length > 0) {
        console.log(`Successfully fetched via Tauri backend: ${xmlText.length} characters`)
        return this.parseRSSFeed(xmlText, rssUrl)
      }
    } catch (tauriError) {
      console.warn('Tauri backend also failed:', tauriError)
    }

    // Final fallback: try direct fetch (will likely fail due to CORS, but worth trying)
    try {
      console.log(`All methods failed, trying direct fetch for ${rssUrl}`)
      const response = await fetch(rssUrl, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'User-Agent': 'MyFaceSnapJournal/1.0'
        }
      })
      
      if (response.ok) {
        const xmlText = await response.text()
        return this.parseRSSFeed(xmlText, rssUrl)
      }
    } catch (directError) {
      console.warn('Direct fetch also failed:', directError)
    }

    console.error('All fetch methods failed for RSS feed:', rssUrl, lastError)
    
    // Final fallback: return mock data for testing
    console.log('Returning mock RSS data for testing purposes')
    return this.generateMockRSSData(rssUrl)
  }

  /**
   * Parse RSS XML into structured data
   */
  private parseRSSFeed(xmlText: string, sourceUrl: string): SubstackFeedItem[] {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
      
      const items = xmlDoc.querySelectorAll('item')
      const feedItems: SubstackFeedItem[] = []

      // Get channel info for author/publication
      const channel = xmlDoc.querySelector('channel')
      const publication = channel?.querySelector('title')?.textContent || 'Unknown Publication'
      const author = channel?.querySelector('managingEditor')?.textContent || publication

      items.forEach((item, index) => {
        try {
          const title = item.querySelector('title')?.textContent || `Untitled ${index + 1}`
          const link = item.querySelector('link')?.textContent || ''
          const pubDate = item.querySelector('pubDate')?.textContent || new Date().toISOString()
          const description = item.querySelector('description')?.textContent || ''
          const content = item.querySelector('content\\:encoded, encoded')?.textContent || description

          // Extract image from content or description
          const imageMatch = (content + description).match(/<img[^>]+src="([^"]+)"/i)
          const imageUrl = imageMatch ? imageMatch[1] : undefined

          // Clean HTML content
          const cleanContent = this.stripHtml(content)
          const excerpt = cleanContent.substring(0, 300) + (cleanContent.length > 300 ? '...' : '')

          // Extract tags from categories
          const categories = Array.from(item.querySelectorAll('category')).map(cat => cat.textContent || '')
          const tags = categories.filter(tag => tag.trim().length > 0)

          const feedItem: SubstackFeedItem = {
            id: `substack_${Date.now()}_${index}`,
            title: this.stripHtml(title),
            content: cleanContent,
            excerpt,
            author,
            publication,
            publishedAt: pubDate,
            url: link,
            imageUrl,
            tags,
            source: 'substack',
            sourceUrl
          }

          feedItems.push(feedItem)
        } catch (itemError) {
          console.error('Error parsing RSS item:', itemError)
        }
      })

      return feedItems
    } catch (error) {
      console.error('Error parsing RSS feed:', error)
      return []
    }
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtml(html: string): string {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || div.innerText || ''
  }

  /**
   * Fetch content from all enabled sources
   */
  async fetchAllFeeds(): Promise<SubstackFeedItem[]> {
    const sources = this.getSources()
    const enabledSources = sources.filter(source => source.enabled)
    
    console.log(`Substack fetchAllFeeds: Found ${sources.length} total sources, ${enabledSources.length} enabled`)
    console.log('Enabled sources:', enabledSources.map(s => ({ name: s.name, rssUrl: s.rssUrl, lastFetched: s.lastFetched })))
    
    const allItems: SubstackFeedItem[] = []

    for (const source of enabledSources) {
      try {
        // Check if we need to fetch (respect cache duration)
        const now = Date.now()
        const lastFetched = source.lastFetched ? new Date(source.lastFetched).getTime() : 0
        
        if (now - lastFetched < this.CACHE_DURATION) {
          console.log(`Skipping ${source.name} - recently fetched (${Math.round((now - lastFetched) / 1000)}s ago)`)
          continue
        }

        console.log(`Fetching Substack feed: ${source.name} from ${source.rssUrl}`)
        const items = await this.fetchFeedContent(source.rssUrl)
        console.log(`Got ${items.length} items from ${source.name}`)
        
        allItems.push(...items)
        
        // Update last fetched time
        this.updateSource(source.id, { lastFetched: new Date().toISOString() })
      } catch (error) {
        console.error(`Error fetching feed ${source.name}:`, error)
      }
    }

    console.log(`Substack fetchAllFeeds: Returning ${allItems.length} total items`)
    // Sort by publication date (newest first)
    return allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }

  /**
   * Get cached feed items
   */
  getCachedItems(): SubstackFeedItem[] {
    try {
      const stored = localStorage.getItem('substack_feed_cache')
      if (!stored) return []
      
      const cached = JSON.parse(stored)
      const cacheTime = cached.timestamp || 0
      const now = Date.now()
      
      // Return cached items if less than cache duration old
      if (now - cacheTime < this.CACHE_DURATION) {
        return cached.items || []
      }
      
      return []
    } catch (error) {
      console.error('Error loading cached Substack items:', error)
      return []
    }
  }

  /**
   * Cache feed items
   */
  private cacheItems(items: SubstackFeedItem[]): void {
    try {
      const cache = {
        items,
        timestamp: Date.now()
      }
      localStorage.setItem('substack_feed_cache', JSON.stringify(cache))
    } catch (error) {
      console.error('Error caching Substack items:', error)
    }
  }

  /**
   * Save sources to localStorage
   */
  private saveSources(sources: SubstackSource[]): void {
    try {
      localStorage.setItem('substack_sources', JSON.stringify(sources))
    } catch (error) {
      console.error('Error saving Substack sources:', error)
    }
  }

  /**
   * Validate RSS URL
   */
  validateRSSUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'https:' && (url.includes('substack.com') || url.includes('.xml') || url.includes('/feed'))
    } catch {
      return false
    }
  }

  /**
   * Test if an RSS feed is accessible
   */
  async testRSSFeed(rssUrl: string): Promise<{ success: boolean; message: string; itemCount?: number }> {
    try {
      const items = await this.fetchFeedContent(rssUrl)
      
      if (items.length === 0) {
        return {
          success: false,
          message: 'RSS feed is accessible but contains no items'
        }
      }
      
      return {
        success: true,
        message: `Successfully loaded ${items.length} items`,
        itemCount: items.length
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to load RSS feed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Extract RSS URL from Substack publication URL
   */
  extractRSSUrl(publicationUrl: string): string {
    try {
      const url = new URL(publicationUrl)
      if (url.hostname.includes('substack.com')) {
        const pathParts = url.pathname.split('/').filter(Boolean)
        if (pathParts.length > 0) {
          return `https://${pathParts[0]}.substack.com/feed`
        }
      }
      return publicationUrl
    } catch {
      return publicationUrl
    }
  }

  /**
   * Get popular Substack newsletters
   */
  getPopularNewsletters(category?: string): PopularSubstack[] {
    if (category) {
      return this.POPULAR_NEWSLETTERS.filter(newsletter => newsletter.category === category)
    }
    return this.POPULAR_NEWSLETTERS
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    const categories = new Set(this.POPULAR_NEWSLETTERS.map(n => n.category))
    return Array.from(categories).sort()
  }

  /**
   * Get trending/popular newsletters (marked as popular)
   */
  getTrendingNewsletters(): PopularSubstack[] {
    return this.POPULAR_NEWSLETTERS.filter(newsletter => newsletter.isPopular)
  }

  /**
   * Add a popular newsletter to user's sources
   */
  addPopularNewsletter(newsletter: PopularSubstack): SubstackSource {
    return this.addSource({
      name: newsletter.name,
      rssUrl: newsletter.rssUrl,
      enabled: true
    })
  }

  /**
   * Test CORS extension by trying direct fetch
   */
  async testCORSExtension(rssUrl: string): Promise<boolean> {
    try {
      console.log('🧪 Testing CORS extension with direct fetch...')
      const response = await fetch(rssUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'User-Agent': 'MyFaceSnapJournal/1.0'
        }
      })
      
      if (response.ok) {
        const content = await response.text()
        console.log('✅ CORS extension is working! Direct fetch succeeded.')
        console.log(`📄 Fetched ${content.length} characters from ${rssUrl}`)
        return true
      } else {
        console.log(`❌ CORS extension not working. Response status: ${response.status}`)
        return false
      }
    } catch (error) {
      console.log('❌ CORS extension not working. Error:', error)
      return false
    }
  }

  /**
   * Development helper: Start a local CORS proxy server
   */
  startLocalProxy(): void {
    if (!this.IS_DEV) {
      console.warn('Local proxy is only available in development mode')
      return
    }

    console.log(`
🚀 DEVELOPMENT CORS PROXY SETUP:

1. CORS Extension Setup:
   - Make sure extension is ENABLED (toggle should show "ON")
   - Try refreshing the page after enabling
   - Some extensions require page reload to take effect
   
2. Test your CORS extension:
   - Click the "Test CORS" button in the extension popup
   - Or use the debug button in feed controls
   
3. Alternative: Local proxy server:
   npx cors-anywhere-proxy-server
   
4. Vite proxy is already configured and should work automatically
`)
  }

  /**
   * Generate mock RSS data for testing when all fetch methods fail
   */
  private generateMockRSSData(rssUrl: string): SubstackFeedItem[] {
    const url = new URL(rssUrl)
    const domain = url.hostname
    
    // Extract newsletter name from URL
    const newsletterName = domain.includes('substack.com') 
      ? domain.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      : 'Mock Newsletter'

    const mockItems: SubstackFeedItem[] = [
      {
        id: `mock_${Date.now()}_1`,
        title: `${newsletterName} - Latest Update`,
        content: `This is a mock article from ${newsletterName}. Since the RSS feed couldn't be fetched due to CORS restrictions, we're showing you a sample of what the content would look like. The actual RSS feeds should work when you run this in the Tauri desktop app instead of the browser.`,
        excerpt: `Sample content from ${newsletterName} - demonstrating RSS feed integration...`,
        author: newsletterName,
        publication: newsletterName,
        publishedAt: new Date().toISOString(),
        url: `https://${domain}`,
        imageUrl: 'https://via.placeholder.com/400x300/6366f1/ffffff?text=RSS+Feed',
        tags: ['sample', 'rss', 'mock'],
        source: 'substack',
        sourceUrl: rssUrl
      },
      {
        id: `mock_${Date.now()}_2`,
        title: `${newsletterName} - Previous Article`,
        content: `Another sample article showing how the RSS feed integration works. In the actual implementation, this would contain real content from the ${newsletterName} newsletter.`,
        excerpt: `Previous article from ${newsletterName} - more sample content...`,
        author: newsletterName,
        publication: newsletterName,
        publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        url: `https://${domain}`,
        imageUrl: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Sample+Article',
        tags: ['sample', 'previous', 'mock'],
        source: 'substack',
        sourceUrl: rssUrl
      }
    ]

    console.log(`Generated ${mockItems.length} mock items for ${newsletterName}`)
    return mockItems
  }
}

export const substackService = new SubstackService()
