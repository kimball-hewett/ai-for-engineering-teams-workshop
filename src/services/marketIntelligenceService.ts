/**
 * Market Intelligence Service
 *
 * Service layer for fetching and caching market intelligence data.
 * Includes mock data generation for workshop reliability.
 */

import type { MarketIntelligence, MarketHeadline, MarketCache } from '@/types/market';
import { MarketIntelligenceError } from '@/types/market';
import { generateMockMarketData, calculateMockSentiment } from '@/data/mock-market-intelligence';

// ============================================================================
// Cache Configuration
// ============================================================================

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_SIZE = 100; // Maximum companies to cache

// In-memory cache (in production, use Redis or similar)
const marketDataCache = new Map<string, MarketCache>();

// ============================================================================
// Input Validation
// ============================================================================

/**
 * Validates and sanitizes company name input
 */
function validateCompanyName(company: string): string {
  // Trim whitespace
  const trimmed = company.trim();

  // Check length
  if (trimmed.length === 0) {
    throw new MarketIntelligenceError(
      'Company name cannot be empty',
      400,
      'validation'
    );
  }

  if (trimmed.length > 100) {
    throw new MarketIntelligenceError(
      'Company name too long (max 100 characters)',
      400,
      'validation'
    );
  }

  // Check for valid characters (alphanumeric, spaces, hyphens, ampersand, periods)
  const validPattern = /^[a-zA-Z0-9\s\-&.]+$/;
  if (!validPattern.test(trimmed)) {
    throw new MarketIntelligenceError(
      'Company name contains invalid characters',
      400,
      'validation'
    );
  }

  // Sanitize: remove any potentially dangerous characters
  const sanitized = trimmed.replace(/[<>'"]/g, '');

  return sanitized;
}

// ============================================================================
// Mock Data Generation
// ============================================================================

/**
 * Generates deterministic mock market intelligence for a company
 * Same company name always generates same data (within cache period)
 */
function generateMockIntelligence(company: string): MarketIntelligence {
  // Generate mock news data
  const mockData = generateMockMarketData(company);

  // Calculate sentiment from headlines
  const sentiment = calculateMockSentiment(mockData.headlines);

  // Convert mock headlines to MarketHeadline format
  const headlines: MarketHeadline[] = mockData.headlines.map((headline, index) => ({
    id: `${company.toLowerCase().replace(/\s+/g, '-')}-${index}-${Date.now()}`,
    title: headline.title,
    source: headline.source,
    publishedAt: new Date(headline.publishedAt),
    sentiment: sentiment.label,
    sentimentScore: sentiment.score,
    url: headline.url,
  }));

  // Add variety to sentiment based on company name characteristics
  // This creates deterministic but varied sentiment across different companies
  const companyHash = company.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const sentimentVariation = (companyHash % 3) - 1; // -1, 0, or 1

  let finalSentiment: 'positive' | 'neutral' | 'negative' = sentiment.label;
  let finalScore = sentiment.score;

  // Introduce some company-specific variation
  if (company.toLowerCase().includes('global') || company.toLowerCase().includes('solutions')) {
    finalSentiment = 'negative';
    finalScore = -0.4;
  } else if (company.toLowerCase().includes('innovation') || company.toLowerCase().includes('ventures')) {
    finalSentiment = 'positive';
    finalScore = 0.7;
  } else if (company.toLowerCase().includes('tech') || company.toLowerCase().includes('data')) {
    finalSentiment = 'positive';
    finalScore = 0.5;
  }

  return {
    company,
    sentiment: finalSentiment,
    sentimentScore: finalScore,
    confidence: sentiment.confidence,
    newsCount: headlines.length,
    headlines,
    lastUpdated: new Date(),
    cached: false,
    source: 'mock',
  };
}

// ============================================================================
// Cache Management
// ============================================================================

/**
 * Retrieves cached market data if available and not expired
 */
function getCachedData(company: string): MarketIntelligence | null {
  const cached = marketDataCache.get(company.toLowerCase());

  if (!cached) {
    return null;
  }

  // Check if cache expired
  if (new Date() > cached.expiresAt) {
    marketDataCache.delete(company.toLowerCase());
    return null;
  }

  // Return cached data with cached flag
  return {
    ...cached.data,
    cached: true,
  };
}

/**
 * Stores market data in cache
 */
function setCachedData(company: string, data: MarketIntelligence): void {
  // Implement LRU eviction if cache is full
  if (marketDataCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    const firstKey = marketDataCache.keys().next().value;
    if (firstKey) {
      marketDataCache.delete(firstKey);
    }
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + CACHE_TTL_MS);

  marketDataCache.set(company.toLowerCase(), {
    company,
    data,
    cachedAt: now,
    expiresAt,
  });
}

/**
 * Invalidates cache for a specific company
 */
export function invalidateCache(company: string): void {
  marketDataCache.delete(company.toLowerCase());
}

/**
 * Clears entire cache
 */
export function clearCache(): void {
  marketDataCache.clear();
}

/**
 * Gets cache statistics
 */
export function getCacheStats(): {
  size: number;
  maxSize: number;
  companies: string[];
} {
  return {
    size: marketDataCache.size,
    maxSize: MAX_CACHE_SIZE,
    companies: Array.from(marketDataCache.keys()),
  };
}

// ============================================================================
// Market Intelligence Service Class
// ============================================================================

export class MarketIntelligenceService {
  private rateLimitMap = new Map<string, number[]>();
  private readonly rateLimit = 30; // requests per minute
  private readonly rateLimitWindow = 60 * 1000; // 1 minute in ms

  /**
   * Checks rate limiting for a client
   */
  private checkRateLimit(clientId: string): void {
    const now = Date.now();
    const clientRequests = this.rateLimitMap.get(clientId) || [];

    // Remove requests outside the time window
    const recentRequests = clientRequests.filter(
      timestamp => now - timestamp < this.rateLimitWindow
    );

    if (recentRequests.length >= this.rateLimit) {
      throw new MarketIntelligenceError(
        'Rate limit exceeded. Please try again later.',
        429,
        'rate_limit'
      );
    }

    // Record this request
    recentRequests.push(now);
    this.rateLimitMap.set(clientId, recentRequests);
  }

  /**
   * Fetches market intelligence for a company
   * Uses cache when available, generates mock data for workshop
   */
  async fetchMarketIntelligence(
    company: string,
    clientId: string = 'default',
    bypassCache: boolean = false
  ): Promise<MarketIntelligence> {
    // Rate limiting
    this.checkRateLimit(clientId);

    // Validate and sanitize input
    const sanitizedCompany = validateCompanyName(company);

    // Check cache first (unless bypass requested)
    if (!bypassCache) {
      const cached = getCachedData(sanitizedCompany);
      if (cached) {
        return cached;
      }
    }

    // Generate mock data (in production, this would call real API)
    try {
      const intelligence = generateMockIntelligence(sanitizedCompany);

      // Cache the result
      setCachedData(sanitizedCompany, intelligence);

      return intelligence;
    } catch (error) {
      throw new MarketIntelligenceError(
        `Failed to fetch market intelligence: ${error instanceof Error ? error.message : 'Unknown error'}`,
        500,
        'api_error'
      );
    }
  }

  /**
   * Fetches market intelligence for multiple companies in batch
   * More efficient than individual requests
   */
  async fetchBatchMarketIntelligence(
    companies: string[],
    clientId: string = 'default'
  ): Promise<Map<string, MarketIntelligence>> {
    const results = new Map<string, MarketIntelligence>();

    // Process in parallel for efficiency
    const promises = companies.map(async (company) => {
      try {
        const intelligence = await this.fetchMarketIntelligence(company, clientId);
        return { company, intelligence };
      } catch (error) {
        // Log error but don't fail entire batch
        console.error(`Failed to fetch intelligence for ${company}:`, error);
        return null;
      }
    });

    const settled = await Promise.all(promises);

    // Collect successful results
    settled.forEach(result => {
      if (result) {
        results.set(result.company, result.intelligence);
      }
    });

    return results;
  }

  /**
   * Refreshes market intelligence for a company (bypasses cache)
   */
  async refreshMarketIntelligence(
    company: string,
    clientId: string = 'default'
  ): Promise<MarketIntelligence> {
    return this.fetchMarketIntelligence(company, clientId, true);
  }
}

// Export singleton instance
export const marketIntelligenceService = new MarketIntelligenceService();
