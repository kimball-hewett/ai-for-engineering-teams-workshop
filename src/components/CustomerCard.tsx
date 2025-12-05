'use client';

import type { Customer } from '@/data/mock-customers';

export interface CustomerCardProps {
  customer: Customer;
  onClick?: () => void;
}

/**
 * Determines the appropriate color class based on health score
 * Red: 0-30 (critical), Yellow: 31-70 (warning), Green: 71-100 (healthy)
 */
const getHealthScoreColor = (score: number): string => {
  if (score <= 30) return 'text-red-600';
  if (score <= 70) return 'text-yellow-600';
  return 'text-green-600';
};

/**
 * Determines the appropriate background color class based on health score
 */
const getHealthScoreBgColor = (score: number): string => {
  if (score <= 30) return 'bg-red-100';
  if (score <= 70) return 'bg-yellow-100';
  return 'bg-green-100';
};

/**
 * CustomerCard Component
 *
 * Displays individual customer information including name, company, email,
 * health score, and domains. Features color-coded health indicators and
 * responsive design for mobile, tablet, and desktop viewports.
 *
 * @param customer - Customer object containing all relevant data
 * @param onClick - Optional click handler for card interaction
 */
export default function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const { name, company, email, healthScore, domains } = customer;

  const healthScoreColor = getHealthScoreColor(healthScore);
  const healthScoreBgColor = getHealthScoreBgColor(healthScore);

  // Calculate domain count for display
  const domainCount = domains?.length || 0;

  return (
    <button
      onClick={onClick}
      className="w-full max-w-[400px] min-h-[120px] p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={`Customer card for ${name} at ${company}. Health score: ${healthScore}`}
    >
      {/* Header: Name and Health Score */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="text-lg font-semibold text-gray-900 leading-tight">
          {name}
        </h3>
        <div
          className={`${healthScoreBgColor} ${healthScoreColor} px-3 py-1 rounded-full text-sm font-bold shrink-0`}
          role="status"
          aria-label={`Health score ${healthScore} out of 100`}
        >
          {healthScore}
        </div>
      </div>

      {/* Company */}
      <p className="text-base text-gray-700 mb-1 font-medium">
        {company}
      </p>

      {/* Email */}
      {email && (
        <p className="text-sm text-gray-500 mb-3">
          {email}
        </p>
      )}

      {/* Domains */}
      {domains && domains.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">
              Domains
            </p>
            <span className="text-xs text-gray-500 font-semibold">
              {domainCount} {domainCount === 1 ? 'domain' : 'domains'}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {domains.map((domain, index) => (
              <p
                key={index}
                className="text-sm text-gray-700 truncate"
                title={domain}
              >
                {domain}
              </p>
            ))}
          </div>
        </div>
      )}
    </button>
  );
}
