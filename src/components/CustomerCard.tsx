'use client';

import type { Customer } from '@/data/mock-customers';

export interface CustomerCardProps {
  customer: Customer;
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  // Helper function to determine health score color and status text
  const getHealthScoreColor = (score: number): string => {
    if (score >= 0 && score <= 30) return 'bg-red-500';
    if (score >= 31 && score <= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getHealthScoreStatus = (score: number): string => {
    if (score >= 0 && score <= 30) return 'Critical';
    if (score >= 31 && score <= 70) return 'Moderate';
    return 'Healthy';
  };

  const getHealthScoreAriaLabel = (score: number): string => {
    const status = getHealthScoreStatus(score);
    return `Health score: ${score} out of 100. Status: ${status}`;
  };

  // Format domain display
  const renderDomains = () => {
    if (!customer.domains || customer.domains.length === 0) {
      return <p className="text-sm text-gray-500">No domains</p>;
    }

    const firstDomain = customer.domains[0];
    const additionalCount = customer.domains.length - 1;

    return (
      <div className="text-sm text-gray-600">
        <span className="truncate block">{firstDomain}</span>
        {additionalCount > 0 && (
          <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            +{additionalCount} more
          </span>
        )}
      </div>
    );
  };

  const healthScoreColor = getHealthScoreColor(customer.healthScore);
  const healthScoreStatus = getHealthScoreStatus(customer.healthScore);
  const healthScoreAriaLabel = getHealthScoreAriaLabel(customer.healthScore);

  return (
    <article
      className="min-w-[280px] p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Customer Name - Primary Identifier */}
      <h3 className="text-xl font-semibold text-gray-900 mb-1">
        {customer.name}
      </h3>

      {/* Company Name - Secondary Information */}
      <p className="text-base text-gray-600 mb-4">{customer.company}</p>

      {/* Health Score with Color-Coded Badge */}
      <div className="mb-4">
        <div
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-white text-sm font-medium min-h-[24px] ${healthScoreColor}`}
          aria-label={healthScoreAriaLabel}
          role="status"
        >
          <span className="mr-1">{healthScoreStatus}:</span>
          <span className="font-bold">{customer.healthScore}</span>
        </div>
      </div>

      {/* Domain Information */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Domains
        </h4>
        {renderDomains()}
      </div>
    </article>
  );
}
