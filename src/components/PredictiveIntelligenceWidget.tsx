/**
 * PredictiveIntelligenceWidget Component
 *
 * Main integrated widget combining active alerts, alert details, and market intelligence.
 * Three-panel layout on desktop, stacked on mobile/tablet.
 */

'use client';

import { useState, useMemo } from 'react';
import type { Alert } from '@/types/alerts';
import type { MarketIntelligence } from '@/types/market';
import type { CustomerHealthData } from '@/lib/healthCalculator';
import AlertCard from './AlertCard';
import AlertDetailPanel from './AlertDetailPanel';

export interface PredictiveIntelligenceWidgetProps {
  customerId?: string;
  alerts: Alert[];
  marketData?: MarketIntelligence;
  customerHealthData?: CustomerHealthData; // For selected customer
  onDismissAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string, action: string, notes?: string) => void;
  onRefreshMarketData: (company: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

/**
 * Gets sentiment badge styles and icon
 */
function getSentimentDisplay(sentiment: 'positive' | 'neutral' | 'negative'): {
  color: string;
  bg: string;
  icon: string;
  text: string;
} {
  switch (sentiment) {
    case 'positive':
      return {
        color: 'text-green-700',
        bg: 'bg-green-100',
        icon: '↑',
        text: 'Positive',
      };
    case 'neutral':
      return {
        color: 'text-gray-700',
        bg: 'bg-gray-100',
        icon: '→',
        text: 'Neutral',
      };
    case 'negative':
      return {
        color: 'text-red-700',
        bg: 'bg-red-100',
        icon: '↓',
        text: 'Negative',
      };
  }
}

export default function PredictiveIntelligenceWidget({
  customerId,
  alerts,
  marketData,
  customerHealthData,
  onDismissAlert,
  onResolveAlert,
  onRefreshMarketData,
  loading = false,
  error,
}: PredictiveIntelligenceWidgetProps) {
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [refreshingMarket, setRefreshingMarket] = useState(false);

  // Filter alerts by customer if specified
  const filteredAlerts = useMemo(() => {
    if (customerId) {
      return alerts.filter(alert => alert.customerId === customerId);
    }
    return alerts;
  }, [alerts, customerId]);

  // Count alerts by priority
  const alertCounts = useMemo(() => {
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      opportunity: 0,
    };

    filteredAlerts.forEach(alert => {
      counts[alert.priority]++;
    });

    return counts;
  }, [filteredAlerts]);

  // Get selected alert
  const selectedAlert = useMemo(() => {
    return filteredAlerts.find(alert => alert.id === selectedAlertId) || null;
  }, [filteredAlerts, selectedAlertId]);

  // Handle alert dismissal
  const handleDismiss = (alertId: string) => {
    onDismissAlert(alertId);
    if (selectedAlertId === alertId) {
      setSelectedAlertId(null);
    }
  };

  // Handle alert resolution
  const handleResolve = (action: string, notes?: string) => {
    if (!selectedAlertId) return;
    onResolveAlert(selectedAlertId, action, notes);
    setSelectedAlertId(null);
  };

  // Handle market data refresh
  const handleRefreshMarket = async () => {
    if (!marketData?.company) return;
    setRefreshingMarket(true);
    try {
      await onRefreshMarketData(marketData.company);
    } finally {
      setRefreshingMarket(false);
    }
  };

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg">
      {/* Error State */}
      {error && (
        <div
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm text-red-700">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Three-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
        {/* Panel 1: Active Alerts (40% width on desktop) */}
        <div className="lg:col-span-5 bg-white rounded-lg shadow-sm p-4 overflow-hidden flex flex-col">
          {/* Alert Count Summary */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Active Alerts</h2>
            <div className="flex flex-wrap gap-2 text-xs">
              {alertCounts.critical > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                  {alertCounts.critical} Critical
                </span>
              )}
              {alertCounts.high > 0 && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                  {alertCounts.high} High
                </span>
              )}
              {alertCounts.medium > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                  {alertCounts.medium} Medium
                </span>
              )}
              {alertCounts.opportunity > 0 && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  {alertCounts.opportunity} Opportunity
                </span>
              )}
            </div>
          </div>

          {/* Alert List */}
          <div className="flex-1 overflow-y-auto space-y-3" role="list">
            {loading ? (
              // Loading Skeleton
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 rounded-lg h-32"
                    aria-label="Loading alert"
                  />
                ))}
              </div>
            ) : filteredAlerts.length === 0 ? (
              // Empty State
              <div
                className="flex flex-col items-center justify-center h-full text-center py-12"
                role="status"
              >
                <div className="text-6xl mb-4" aria-hidden="true">✅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  All Clear!
                </h3>
                <p className="text-sm text-gray-600">
                  {customerId
                    ? 'This customer has no active alerts.'
                    : 'No active alerts at this time. All customers are healthy!'}
                </p>
              </div>
            ) : (
              // Alert Cards
              filteredAlerts.map(alert => (
                <div key={alert.id} role="listitem">
                  <AlertCard
                    alert={alert}
                    selected={selectedAlertId === alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    onDismiss={handleDismiss}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 2: Alert Detail (35% width on desktop, conditional) */}
        {selectedAlert && customerHealthData && (
          <div className="lg:col-span-4 overflow-hidden">
            <AlertDetailPanel
              alert={selectedAlert}
              customerHealthData={customerHealthData}
              marketData={marketData}
              onResolve={handleResolve}
              onDismiss={() => handleDismiss(selectedAlert.id)}
              onClose={() => setSelectedAlertId(null)}
            />
          </div>
        )}

        {/* Panel 3: Market Intelligence Summary (25% width on desktop) */}
        {marketData && (
          <div
            className={`${selectedAlert ? 'lg:col-span-3' : 'lg:col-span-7'} bg-white rounded-lg shadow-sm p-4 overflow-hidden flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Market Intelligence</h2>
                <p className="text-sm text-gray-600">{marketData.company}</p>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefreshMarket}
                disabled={refreshingMarket}
                className="
                  p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-150
                "
                aria-label="Refresh market data"
                title="Refresh market data"
              >
                <svg
                  className={`w-5 h-5 ${refreshingMarket ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            {/* Sentiment Display */}
            {(() => {
              const sentimentDisplay = getSentimentDisplay(marketData.sentiment);
              return (
                <div className="mb-4">
                  <div
                    className={`
                      ${sentimentDisplay.bg} ${sentimentDisplay.color}
                      rounded-lg p-4 text-center
                    `}
                  >
                    <div className="text-3xl font-bold mb-1" aria-hidden="true">
                      {sentimentDisplay.icon}
                    </div>
                    <div className="text-lg font-semibold">
                      {sentimentDisplay.text}
                    </div>
                    <div className="text-sm opacity-75">
                      Score: {marketData.sentimentScore > 0 ? '+' : ''}
                      {marketData.sentimentScore.toFixed(2)}
                      {' '}({Math.round(marketData.confidence * 100)}% confidence)
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* News Count and Last Updated */}
            <div className="mb-4 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <span className="font-medium">{marketData.newsCount} news items</span>
                {marketData.cached && (
                  <span
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                    title="Data served from cache"
                  >
                    Cached
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last updated: {new Date(marketData.lastUpdated).toLocaleTimeString()}
              </p>
            </div>

            {/* Top Headlines */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Headlines</h3>
              <div className="space-y-3">
                {marketData.headlines.slice(0, 3).map(headline => {
                  const sentimentDisplay = getSentimentDisplay(headline.sentiment);
                  return (
                    <div
                      key={headline.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span
                          className={`${sentimentDisplay.color} text-lg`}
                          aria-label={`Sentiment: ${headline.sentiment}`}
                        >
                          {sentimentDisplay.icon}
                        </span>
                        <p className="text-sm font-medium text-gray-900 flex-1">
                          {headline.title.length > 60
                            ? `${headline.title.slice(0, 60)}...`
                            : headline.title}
                        </p>
                      </div>
                      <div className="text-xs text-gray-600 ml-7">
                        <span className="font-medium">{headline.source}</span>
                        {' • '}
                        <time dateTime={headline.publishedAt.toISOString()}>
                          {new Date(headline.publishedAt).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View All News Link */}
              {marketData.headlines.length > 3 && (
                <button
                  className="
                    w-full mt-4 px-4 py-2 text-sm font-medium text-blue-600
                    hover:text-blue-700 hover:bg-blue-50 rounded-lg
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    transition-colors duration-150
                  "
                  aria-label={`View all ${marketData.headlines.length} headlines`}
                >
                  View All {marketData.headlines.length} Headlines →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Placeholder when no market data and no alert selected */}
        {!marketData && !selectedAlert && (
          <div className="lg:col-span-7 bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4" aria-hidden="true">📊</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Market Data Available
              </h3>
              <p className="text-sm">
                Select a customer to view their market intelligence
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
