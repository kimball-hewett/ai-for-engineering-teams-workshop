'use client';

/**
 * Market Intelligence Widget Component
 * Displays real-time market sentiment and news analysis for customer companies
 * Features: sentiment badges, news headlines, manual refresh, loading/error states
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  MarketIntelligenceData,
  MarketIntelligenceResponse,
} from '@/types/market-intelligence';

/**
 * Props for MarketIntelligenceWidget component
 */
export interface MarketIntelligenceWidgetProps {
  company: string;
  onError?: (error: Error) => void;
  onDataLoaded?: (data: MarketIntelligenceData) => void;
  autoRefresh?: boolean; // Auto-refresh every 10 minutes
  className?: string;
}

/**
 * Formats a date string to relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Truncates text to specified length with ellipsis
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * MarketIntelligenceWidget Component
 */
export default function MarketIntelligenceWidget({
  company,
  onError,
  onDataLoaded,
  autoRefresh = false,
  className = '',
}: MarketIntelligenceWidgetProps) {
  const [data, setData] = useState<MarketIntelligenceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  /**
   * Fetches market intelligence data from API
   */
  const fetchData = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        setError(null);

        // Encode company name for URL
        const encodedCompany = encodeURIComponent(company);

        // Add cache-busting parameter if force refresh
        const url = `/api/market-intelligence/${encodedCompany}${
          forceRefresh ? `?refresh=${Date.now()}` : ''
        }`;

        // Fetch with 5-second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse JSON response
        const result: MarketIntelligenceResponse = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to fetch market intelligence');
        }

        setData(result.data);
        onDataLoaded?.(result.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        const errorObj = new Error(errorMessage);
        onError?.(errorObj);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [company, onDataLoaded, onError]
  );

  /**
   * Handles manual refresh button click
   */
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(true); // Force refresh bypasses cache
  }, [fetchData]);

  /**
   * Effect: Fetch data when company changes
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Effect: Auto-refresh every 10 minutes if enabled
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      fetchData(true);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(intervalId);
  }, [autoRefresh, fetchData]);

  /**
   * Sentiment badge styling based on sentiment type
   */
  const sentimentStyles = useMemo(() => {
    if (!data) return '';

    switch (data.sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'neutral':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }, [data]);

  /**
   * Renders loading skeleton
   */
  if (loading && !data) {
    return (
      <div
        className={`border rounded-lg shadow-sm bg-white p-6 ${className}`}
        role="status"
        aria-live="polite"
        aria-label="Loading market intelligence"
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Renders error state
   */
  if (error && !data) {
    return (
      <div
        className={`border rounded-lg shadow-sm bg-white p-6 ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center py-8">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Market Intelligence
            </h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Retry loading market intelligence"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /**
   * Renders empty state
   */
  if (!data) {
    return (
      <div className={`border rounded-lg shadow-sm bg-white p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center space-y-2 text-center py-8">
          <p className="text-gray-500">No market intelligence available</p>
        </div>
      </div>
    );
  }

  /**
   * Renders success state with data
   */
  const topHeadlines = data.headlines.slice(0, 3);

  return (
    <article
      className={`border rounded-lg shadow-sm bg-white p-6 ${className}`}
      aria-label={`Market intelligence for ${data.company}`}
    >
      {/* Header: Company name and sentiment badge */}
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{data.company}</h2>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full border ${sentimentStyles}`}
          role="status"
          aria-label={`Market sentiment: ${data.sentiment}`}
        >
          {data.sentiment.charAt(0).toUpperCase() + data.sentiment.slice(1)}
        </span>
      </header>

      {/* Metadata: News count and last updated */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span aria-label={`${data.newsCount} recent articles`}>
          {data.newsCount} recent article{data.newsCount !== 1 ? 's' : ''}
        </span>
        <span aria-label={`Last updated ${formatRelativeTime(data.lastUpdated)}`}>
          Updated {formatRelativeTime(data.lastUpdated)}
        </span>
      </div>

      {/* Headlines list */}
      <ul className="space-y-3 mb-4" aria-label="Top news headlines">
        {topHeadlines.map((headline, index) => (
          <li key={index}>
            <a
              href={headline.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-md hover:bg-gray-50 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 min-h-[44px] flex flex-col justify-center"
              aria-label={`Read article: ${headline.title}`}
            >
              <h3 className="text-base font-normal text-gray-900 mb-1">
                {truncateText(headline.title, 80)}
              </h3>
              <div className="flex items-center text-xs text-gray-500 space-x-2">
                <span>{headline.source}</span>
                <span aria-hidden="true">•</span>
                <time dateTime={headline.publishedAt}>
                  {formatRelativeTime(headline.publishedAt)}
                </time>
              </div>
            </a>
          </li>
        ))}
      </ul>

      {/* Footer: Refresh button */}
      <footer className="flex items-center justify-end pt-4 border-t">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center space-x-2"
          aria-label={isRefreshing ? 'Refreshing market intelligence' : 'Refresh market intelligence'}
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </footer>
    </article>
  );
}
