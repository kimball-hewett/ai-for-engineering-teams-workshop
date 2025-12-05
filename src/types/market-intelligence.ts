/**
 * Type definitions for Market Intelligence Widget system
 * Defines interfaces for headlines, data structures, API responses, and caching
 */

/**
 * Represents a single news headline with metadata
 */
export interface MarketIntelligenceHeadline {
  title: string;
  source: string;
  publishedAt: string; // ISO 8601 date string
  url: string;
}

/**
 * Complete market intelligence data for a company
 */
export interface MarketIntelligenceData {
  company: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  newsCount: number;
  headlines: MarketIntelligenceHeadline[];
  lastUpdated: string; // ISO 8601 date string
}

/**
 * API response wrapper with success/error handling
 */
export interface MarketIntelligenceResponse {
  success: boolean;
  data?: MarketIntelligenceData;
  error?: {
    message: string;
    code: string;
  };
}

/**
 * Cache entry with TTL metadata
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Cache performance statistics
 */
export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
}
