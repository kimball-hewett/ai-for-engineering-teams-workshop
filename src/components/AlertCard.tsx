/**
 * AlertCard Component
 *
 * Displays an individual alert with priority badge, customer info, and quick actions.
 * Used in the Active Alerts panel of the Predictive Intelligence Widget.
 */

'use client';

import type { Alert } from '@/types/alerts';

export interface AlertCardProps {
  alert: Alert;
  selected?: boolean;
  onClick?: () => void;
  onDismiss?: (alertId: string) => void;
  onQuickAction?: (alertId: string, action: string) => void;
  compact?: boolean;
}

/**
 * Gets priority color classes based on alert priority
 */
function getPriorityStyles(priority: Alert['priority']): {
  badge: string;
  border: string;
  icon: string;
} {
  switch (priority) {
    case 'critical':
      return {
        badge: 'bg-red-100 text-red-700 border-red-300',
        border: 'border-l-red-600',
        icon: '🚨',
      };
    case 'high':
      return {
        badge: 'bg-orange-100 text-orange-700 border-orange-300',
        border: 'border-l-orange-600',
        icon: '⚠️',
      };
    case 'medium':
      return {
        badge: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        border: 'border-l-yellow-600',
        icon: 'ℹ️',
      };
    case 'opportunity':
      return {
        badge: 'bg-green-100 text-green-700 border-green-300',
        border: 'border-l-green-600',
        icon: '📈',
      };
  }
}

/**
 * Formats relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

/**
 * Formats alert type for display
 */
function formatAlertType(type: Alert['type']): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function AlertCard({
  alert,
  selected = false,
  onClick,
  onDismiss,
  onQuickAction,
  compact = false,
}: AlertCardProps) {
  const styles = getPriorityStyles(alert.priority);

  return (
    <div
      className={`
        relative border-l-4 ${styles.border} bg-white rounded-lg shadow-sm
        hover:shadow-md transition-all duration-200 cursor-pointer
        ${selected ? 'ring-2 ring-blue-500 shadow-md' : ''}
        ${compact ? 'p-3' : 'p-4'}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Alert for ${alert.customerName}: ${alert.message}`}
    >
      {/* Priority Badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <span
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
            border ${styles.badge}
          `}
          aria-label={`Priority: ${alert.priority}`}
        >
          <span className="text-sm" aria-hidden="true">{styles.icon}</span>
          {alert.priority.toUpperCase()}
        </span>

        {/* Market Context Indicator */}
        {alert.marketContext && (
          <span
            className="text-sm"
            title="Market intelligence available"
            aria-label="Market intelligence context available"
          >
            🌐
          </span>
        )}
      </div>

      {/* Customer Name */}
      <h3 className="font-semibold text-gray-900 mb-1 text-sm">
        {alert.customerName}
      </h3>

      {/* Alert Type */}
      <p className="text-xs text-gray-600 mb-2">
        {formatAlertType(alert.type)}
      </p>

      {/* Alert Message */}
      <p className={`text-gray-700 ${compact ? 'text-xs' : 'text-sm'} mb-3 line-clamp-2`}>
        {alert.message}
      </p>

      {/* Timestamp */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <time dateTime={alert.triggeredAt.toISOString()}>
          {formatRelativeTime(alert.triggeredAt)}
        </time>

        {/* ARR Badge */}
        {alert.customerARR && (
          <span
            className="text-xs font-medium text-gray-600"
            aria-label={`Annual Recurring Revenue: $${alert.customerARR.toLocaleString()}`}
          >
            ${(alert.customerARR / 1000).toFixed(0)}K ARR
          </span>
        )}
      </div>

      {/* Quick Actions (on hover) */}
      {!compact && (
        <div
          className="
            absolute bottom-3 right-3 opacity-0 group-hover:opacity-100
            transition-opacity duration-200 flex gap-2
          "
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="
              px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50
              hover:bg-blue-100 rounded transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
            "
            aria-label="View alert details"
          >
            Details
          </button>

          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(alert.id);
              }}
              className="
                px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50
                hover:bg-gray-100 rounded transition-colors duration-150
                focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500
              "
              aria-label="Dismiss alert"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Focus Indicator */}
      <div
        className="
          absolute inset-0 rounded-lg pointer-events-none
          focus-within:ring-2 focus-within:ring-blue-500
        "
        aria-hidden="true"
      />
    </div>
  );
}
