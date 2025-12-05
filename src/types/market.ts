/**
 * Market Intelligence Type Definitions
 *
 * Defines interfaces for market intelligence data, news headlines, and caching.
 */

export interface MarketHeadline {
  id: string;
  title: string;
  source: string;
  publishedAt: Date;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1.0 to 1.0
  url?: string;
  summary?: string; // For future enhancement
}

export interface MarketIntelligence {
  company: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0

  newsCount: number;
  headlines: MarketHeadline[];

  // Metadata
  lastUpdated: Date;
  cached: boolean;
  source: 'mock' | 'api'; // For future real API integration
}

export interface MarketCache {
  company: string;
  data: MarketIntelligence;
  cachedAt: Date;
  expiresAt: Date;
}

/**
 * Custom error class for market intelligence operations
 */
export class MarketIntelligenceError extends Error {
  public readonly statusCode: number;
  public readonly category: 'validation' | 'not_found' | 'rate_limit' | 'api_error';

  constructor(message: string, statusCode: number, category: MarketIntelligenceError['category']) {
    super(message);
    this.name = 'MarketIntelligenceError';
    this.statusCode = statusCode;
    this.category = category;
  }
}
