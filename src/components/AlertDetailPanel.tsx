/**
 * AlertDetailPanel Component
 *
 * Displays detailed information about a selected alert including triggering conditions,
 * market context, recommended actions, and resolution controls.
 */

'use client';

import { useState } from 'react';
import type { Alert } from '@/types/alerts';
import type { CustomerHealthData } from '@/lib/healthCalculator';
import type { MarketIntelligence } from '@/types/market';

export interface AlertDetailPanelProps {
  alert: Alert;
  customerHealthData: CustomerHealthData;
  marketData?: MarketIntelligence;
  onResolve: (action: string, notes?: string) => void;
  onDismiss: () => void;
  onClose: () => void;
}

/**
 * Formats date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Gets sentiment badge styles
 */
function getSentimentStyles(sentiment: 'positive' | 'neutral' | 'negative'): {
  bg: string;
  text: string;
  icon: string;
} {
  switch (sentiment) {
    case 'positive':
      return { bg: 'bg-green-100', text: 'text-green-700', icon: '↑' };
    case 'neutral':
      return { bg: 'bg-gray-100', text: 'text-gray-700', icon: '→' };
    case 'negative':
      return { bg: 'bg-red-100', text: 'text-red-700', icon: '↓' };
  }
}

export default function AlertDetailPanel({
  alert,
  customerHealthData,
  marketData,
  onResolve,
  onDismiss,
  onClose,
}: AlertDetailPanelProps) {
  const [selectedAction, setSelectedAction] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);

  const handleResolve = () => {
    if (!selectedAction) return;
    onResolve(selectedAction, actionNotes || undefined);
    setShowResolveForm(false);
    setSelectedAction('');
    setActionNotes('');
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-6 h-full overflow-y-auto"
      role="dialog"
      aria-labelledby="alert-detail-title"
      aria-describedby="alert-detail-description"
    >
      {/* Header with Close Button */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 id="alert-detail-title" className="text-xl font-bold text-gray-900">
            {alert.customerName}
          </h2>
          <p className="text-sm text-gray-600">
            {alert.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </p>
        </div>

        <button
          onClick={onClose}
          className="
            text-gray-400 hover:text-gray-600 transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded
            p-1
          "
          aria-label="Close alert details"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Detailed Message */}
      <div id="alert-detail-description" className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Alert Details</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          {alert.detailedMessage}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Triggered: {formatDate(alert.triggeredAt)}
        </p>
      </div>

      {/* Triggering Conditions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Triggering Conditions</h3>
        <ul className="space-y-1">
          {alert.triggeringConditions.map((condition, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="text-red-500 mt-0.5" aria-hidden="true">•</span>
              <span>{condition}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Market Context (if available) */}
      {alert.marketContext && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span aria-hidden="true">🌐</span>
            Market Intelligence Context
          </h3>

          {/* Sentiment Badge */}
          <div className="mb-3">
            {(() => {
              const sentimentStyles = getSentimentStyles(alert.marketContext.sentiment);
              return (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">Sentiment:</span>
                  <span
                    className={`
                      inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                      ${sentimentStyles.bg} ${sentimentStyles.text}
                    `}
                  >
                    <span aria-hidden="true">{sentimentStyles.icon}</span>
                    {alert.marketContext.sentiment.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-600">
                    ({alert.marketContext.sentimentScore > 0 ? '+' : ''}
                    {alert.marketContext.sentimentScore.toFixed(2)})
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Risk Amplification */}
          {alert.marketContext.riskAmplification && alert.marketContext.riskAmplification > 1.0 && (
            <div className="mb-3 p-2 bg-red-50 rounded border border-red-200">
              <p className="text-xs text-red-700">
                <strong>Risk Amplification:</strong>{' '}
                {alert.marketContext.riskAmplification.toFixed(2)}x
                {' '}(internal issues + negative market sentiment)
              </p>
            </div>
          )}

          {/* Relevant Headlines */}
          {alert.marketContext.relevantHeadlines.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Recent Headlines:</h4>
              <ul className="space-y-2">
                {alert.marketContext.relevantHeadlines.map((headline) => (
                  <li key={headline.id} className="text-xs text-gray-700">
                    <div className="flex items-start gap-2">
                      {(() => {
                        const styles = getSentimentStyles(headline.sentiment);
                        return (
                          <span className={`${styles.text} mt-0.5`} aria-hidden="true">
                            {styles.icon}
                          </span>
                        );
                      })()}
                      <div className="flex-1">
                        <p className="font-medium">{headline.title}</p>
                        <p className="text-gray-500 mt-0.5">
                          {headline.source} • {new Date(headline.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recommended Actions */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Recommended Actions</h3>
        <ol className="space-y-3">
          {alert.recommendedActions
            .sort((a, b) => a.priority - b.priority)
            .map((action, index) => (
              <li key={index} className="flex gap-3">
                <span
                  className="
                    flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700
                    flex items-center justify-center text-xs font-semibold
                  "
                  aria-label={`Priority ${action.priority}`}
                >
                  {action.priority}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{action.action}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{action.reason}</p>
                </div>
              </li>
            ))}
        </ol>
      </div>

      {/* Action Buttons */}
      <div className="pt-6 border-t border-gray-200 space-y-3">
        {!showResolveForm ? (
          <>
            <button
              onClick={() => setShowResolveForm(true)}
              className="
                w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium
                hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                transition-colors duration-150
              "
            >
              Take Action & Resolve
            </button>

            <button
              onClick={onDismiss}
              className="
                w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium
                hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500
                transition-colors duration-150
              "
            >
              Dismiss Alert
            </button>
          </>
        ) : (
          <div className="space-y-3">
            {/* Action Selection */}
            <div>
              <label htmlFor="action-select" className="block text-sm font-medium text-gray-700 mb-1">
                Action Taken
              </label>
              <select
                id="action-select"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  text-sm
                "
              >
                <option value="">Select an action...</option>
                <option value="call_scheduled">Call Scheduled</option>
                <option value="email_sent">Email Sent</option>
                <option value="meeting_held">Meeting Held</option>
                <option value="issue_resolved">Issue Resolved</option>
                <option value="escalated">Escalated to Team</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Notes Field */}
            <div>
              <label htmlFor="action-notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                id="action-notes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  text-sm resize-none
                "
                placeholder="Add any relevant notes about this action..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleResolve}
                disabled={!selectedAction}
                className="
                  flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium
                  hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-150
                "
              >
                Resolve Alert
              </button>
              <button
                onClick={() => {
                  setShowResolveForm(false);
                  setSelectedAction('');
                  setActionNotes('');
                }}
                className="
                  px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium
                  hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500
                  transition-colors duration-150
                "
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
