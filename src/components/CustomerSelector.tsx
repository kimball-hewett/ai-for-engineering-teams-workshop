'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Customer } from '@/data/mock-customers';
import CustomerCard from './CustomerCard';

export interface CustomerSelectorProps {
  customers: Customer[];
  onCustomerSelect?: (customer: Customer) => void;
  initialSelectedId?: string;
  className?: string;
}

/**
 * CustomerSelector Component
 *
 * Main customer selection interface that displays multiple customers in a responsive
 * grid layout with search/filter functionality. Allows users to browse and select
 * customers efficiently with visual selection indicators.
 *
 * Features:
 * - Responsive grid (1 col mobile, 2 tablet, 3 desktop)
 * - Real-time search filtering by name or company (debounced 300ms)
 * - Single customer selection with visual highlighting
 * - Keyboard navigation support
 * - Empty state handling
 * - WCAG 2.1 accessibility compliance
 *
 * @param customers - Array of Customer objects to display
 * @param onCustomerSelect - Optional callback fired when selection changes
 * @param initialSelectedId - Optional initial selected customer ID
 * @param className - Optional additional CSS classes
 */
export default function CustomerSelector({
  customers,
  onCustomerSelect,
  initialSelectedId,
  className = '',
}: CustomerSelectorProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    initialSelectedId || null
  );

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Filter customers based on debounced search query
  const filteredCustomers = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return customers;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();

    return customers.filter((customer) => {
      const nameMatch = customer.name.toLowerCase().includes(query);
      const companyMatch = customer.company.toLowerCase().includes(query);
      return nameMatch || companyMatch;
    });
  }, [customers, debouncedSearchQuery]);

  // Handle customer selection
  const handleCustomerSelect = useCallback(
    (customer: Customer) => {
      setSelectedCustomerId(customer.id);

      if (onCustomerSelect) {
        onCustomerSelect(customer);
      }
    },
    [onCustomerSelect]
  );

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle keyboard navigation for search input
  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow natural text input behavior
    if (event.key === 'Escape') {
      setSearchQuery('');
      event.currentTarget.blur();
    }
  };

  return (
    <div className={`w-full max-w-[1440px] mx-auto ${className}`}>
      {/* Search Input */}
      <div className="mb-6">
        <label htmlFor="customer-search" className="sr-only">
          Search customers by name or company
        </label>
        <input
          id="customer-search"
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search customers by name or company..."
          className="w-full h-12 px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          aria-label="Search customers by name or company"
          aria-controls="customer-grid"
          aria-describedby="search-results-status"
        />
      </div>

      {/* Screen reader announcement for search results */}
      <div
        id="search-results-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {debouncedSearchQuery.trim() && (
          <>
            Found {filteredCustomers.length} customer
            {filteredCustomers.length !== 1 ? 's' : ''} matching &quot;{debouncedSearchQuery}&quot;
          </>
        )}
      </div>

      {/* Customer Grid */}
      {filteredCustomers.length > 0 ? (
        <div
          id="customer-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          role="radiogroup"
          aria-label="Customer list"
        >
          {filteredCustomers.map((customer) => {
            const isSelected = selectedCustomerId === customer.id;

            return (
              <div
                key={customer.id}
                className={`relative rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-blue-500 ring-offset-2'
                    : 'ring-0'
                }`}
                role="radio"
                aria-checked={isSelected}
                aria-label={`${customer.name} at ${customer.company}`}
              >
                <CustomerCard
                  customer={customer}
                  onClick={() => handleCustomerSelect(customer)}
                />

                {/* Visual selection indicator */}
                {isSelected && (
                  <div
                    className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        // Empty state
        <div
          className="flex flex-col items-center justify-center py-12 px-4 text-center"
          role="status"
          aria-live="polite"
        >
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {customers.length === 0 ? (
            <>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No customers available
              </h3>
              <p className="text-sm text-gray-500">
                Add customers to get started with your dashboard.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No customers found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                No customers match your search for &quot;{searchQuery.trim()}&quot;
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
              >
                Clear search
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
