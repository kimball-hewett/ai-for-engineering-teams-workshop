'use client';

/**
 * Customer Health Display Component
 *
 * Displays comprehensive customer health metrics with:
 * - Large prominent health score with color coding
 * - Risk level badge (Healthy/Warning/Critical)
 * - Expandable factor breakdown with progress bars
 * - Loading, error, and empty states
 *
 * Integrates with health calculation library for real-time scoring.
 */

import { useState, useMemo } from 'react';
import type { CustomerHealthData, HealthScoreResult } from '@/lib/healthCalculator';
import { calculateHealthScore } from '@/lib/healthCalculator';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface CustomerHealthDisplayProps {
  customerId: string;
  healthData: CustomerHealthData;
  onError?: (error: Error) => void;
  className?: string;
}

interface FactorDetails {
  name: string;
  score: number;
  description: string;
  icon: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Returns color classes based on health score
 */
function getHealthScoreColorClasses(score: number): {
  text: string;
  bg: string;
  border: string;
} {
  if (score >= 71) {
    return {
      text: 'text-green-600',
      bg: 'bg-green-100',
      border: 'border-green-300',
    };
  }
  if (score >= 31) {
    return {
      text: 'text-yellow-600',
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
    };
  }
  return {
    text: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-300',
  };
}

/**
 * Returns risk level display text
 */
function getRiskLevelText(riskLevel: 'healthy' | 'warning' | 'critical'): string {
  const labels = {
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
  };
  return labels[riskLevel];
}

// ============================================================================
// Main Component
// ============================================================================

export default function CustomerHealthDisplay({
  customerId,
  healthData,
  onError,
  className = '',
}: CustomerHealthDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate health score using useMemo for performance optimization
  const healthResult: HealthScoreResult | null = useMemo(() => {
    try {
      return calculateHealthScore(healthData);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Health score calculation failed');
      if (onError) {
        onError(err);
      }
      return null;
    }
  }, [healthData, onError]);

  // Handle calculation errors
  if (!healthResult) {
    return (
      <div
        className={`rounded-lg border-2 border-red-300 bg-red-50 p-6 ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Calculation Error
        </h3>
        <p className="text-sm text-red-700">
          Unable to calculate health score for customer {customerId}.
          Please verify the data and try again.
        </p>
      </div>
    );
  }

  const { overallScore, riskLevel, breakdown } = healthResult;
  const colors = getHealthScoreColorClasses(overallScore);
  const riskText = getRiskLevelText(riskLevel);

  // Factor details for breakdown display
  const factors: FactorDetails[] = [
    {
      name: 'Payment Health',
      score: breakdown.payment,
      description: 'Payment history, delays, and overdue amounts',
      icon: '💳',
    },
    {
      name: 'Engagement',
      score: breakdown.engagement,
      description: 'Login frequency, feature usage, and activity',
      icon: '📊',
    },
    {
      name: 'Contract Status',
      score: breakdown.contract,
      description: 'Contract renewal, value, and upgrades',
      icon: '📄',
    },
    {
      name: 'Support Satisfaction',
      score: breakdown.support,
      description: 'Resolution time, satisfaction, and tickets',
      icon: '🎧',
    },
  ];

  return (
    <div
      className={`rounded-lg border-2 ${colors.border} ${colors.bg} p-6 max-w-md ${className}`}
      role="region"
      aria-label="Customer health score display"
    >
      {/* Main Health Score Display */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div
            className={`text-5xl font-bold ${colors.text}`}
            aria-label={`Health score: ${overallScore} out of 100`}
          >
            {overallScore}
          </div>
          <div className="text-sm text-gray-600 mt-1">Health Score</div>
        </div>

        {/* Risk Level Badge */}
        <div
          className={`px-4 py-2 rounded-full text-sm font-semibold ${colors.bg} ${colors.text} border-2 ${colors.border}`}
          role="status"
          aria-label={`Risk level: ${riskText}`}
        >
          {riskText}
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 transition-colors"
        aria-expanded={isExpanded}
        aria-controls="health-breakdown"
      >
        <span className="text-sm font-medium text-gray-700">
          {isExpanded ? 'Hide' : 'Show'} Factor Breakdown
        </span>
        <span
          className={`text-gray-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {/* Factor Breakdown Section */}
      {isExpanded && (
        <div
          id="health-breakdown"
          className="mt-4 space-y-4 animate-fadeIn"
          role="region"
          aria-label="Health score factor breakdown"
        >
          {factors.map((factor) => {
            const factorColors = getHealthScoreColorClasses(factor.score);
            const widthPercentage = Math.max(0, Math.min(100, factor.score));

            return (
              <div key={factor.name} className="bg-white rounded-lg p-4 border border-gray-200">
                {/* Factor Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">
                      {factor.icon}
                    </span>
                    <h4 className="text-base font-medium text-gray-800">
                      {factor.name}
                    </h4>
                  </div>
                  <span
                    className={`text-sm font-semibold ${factorColors.text}`}
                    aria-label={`${factor.name} score: ${factor.score} out of 100`}
                  >
                    {factor.score}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div
                  className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={factor.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${factor.name} progress`}
                >
                  <div
                    className={`h-full ${factorColors.text.replace('text-', 'bg-')} transition-all duration-300 ease-out`}
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>

                {/* Factor Description */}
                <p className="text-xs text-gray-500 mt-2">
                  {factor.description}
                </p>
              </div>
            );
          })}

          {/* Calculation Timestamp */}
          <div className="text-xs text-gray-400 text-center pt-2">
            Calculated at {healthResult.calculatedAt.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
