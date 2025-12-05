'use client';

import { Suspense, useState } from 'react';
import type { Customer } from '@/data/mock-customers';

// Dynamic component imports with error boundaries
const CustomerSelectorDemo = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  try {
    const CustomerSelector = require('../components/CustomerSelector')?.default;
    const mockCustomers = require('../data/mock-customers')?.mockCustomers;

    if (CustomerSelector && mockCustomers?.length > 0) {
      return (
        <div className="space-y-4">
          <p className="text-green-600 text-sm font-medium">✅ CustomerSelector with search and selection</p>
          <CustomerSelector
            customers={mockCustomers}
            onCustomerSelect={(customer: Customer) => setSelectedCustomer(customer)}
            initialSelectedId={mockCustomers[0]?.id}
          />
          {selectedCustomer && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Selected:</strong> {selectedCustomer.name} at {selectedCustomer.company}
              </p>
            </div>
          )}
        </div>
      );
    }
  } catch (error) {
    console.error('CustomerSelector error:', error);
  }

  return (
    <div className="text-gray-500 text-sm">
      CustomerSelector component will appear here when implemented.
    </div>
  );
};

const CustomerHealthDemo = () => {
  try {
    const CustomerHealthDisplay = require('../components/CustomerHealthDisplay')?.default;
    const { mockCustomers, generateMockHealthData } = require('../data/mock-customers');

    if (CustomerHealthDisplay && mockCustomers?.length > 0) {
      const customer = mockCustomers[0];
      const healthData = generateMockHealthData(customer.id);

      return (
        <div className="space-y-4">
          <p className="text-green-600 text-sm font-medium">✅ Health Score Calculator with factor breakdown</p>
          <CustomerHealthDisplay
            customerId={customer.id}
            healthData={healthData}
            onError={(error) => console.error('Health calculation error:', error)}
          />
        </div>
      );
    }
  } catch (error) {
    console.error('CustomerHealthDisplay error:', error);
  }

  return (
    <div className="text-gray-500 text-sm">
      CustomerHealthDisplay component will appear here when implemented.
    </div>
  );
};

const MarketIntelligenceDemo = () => {
  try {
    const MarketIntelligenceWidget = require('../components/MarketIntelligenceWidget')?.default;
    const { mockCustomers } = require('../data/mock-customers');

    if (MarketIntelligenceWidget && mockCustomers?.length > 0) {
      return (
        <div className="space-y-4">
          <p className="text-green-600 text-sm font-medium">✅ Market Intelligence with sentiment analysis</p>
          <div className="border rounded-lg p-4">
            <MarketIntelligenceWidget
              company={mockCustomers[0].company}
              autoRefresh={false}
              onError={(error) => {
                console.error('Market intelligence error:', error);
                alert(`Market Intelligence Error: ${error.message}`);
              }}
              onDataLoaded={(data) => {
                console.log('Market data loaded successfully:', data);
              }}
            />
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error('MarketIntelligenceWidget component error:', error);
    return (
      <div className="text-red-600 text-sm p-4 bg-red-50 rounded-lg">
        <strong>Error loading MarketIntelligenceWidget:</strong> {String(error)}
      </div>
    );
  }

  return (
    <div className="text-gray-500 text-sm">
      MarketIntelligenceWidget component will appear here when implemented.
    </div>
  );
};

const PredictiveAlertsDemo = () => {
  try {
    const PredictiveIntelligenceWidget = require('../components/PredictiveIntelligenceWidget')?.default;
    const { mockCustomers, generateMockHealthData } = require('../data/mock-customers');
    const { alertsService } = require('../services/alertsService');
    const { marketIntelligenceService } = require('../services/marketIntelligenceService');

    if (PredictiveIntelligenceWidget && mockCustomers?.length > 0) {
      // Generate sample alerts
      const customersWithHealth = mockCustomers.slice(0, 3).map((customer: any) => ({
        ...customer,
        healthData: generateMockHealthData(customer.id),
      }));

      const alerts = alertsService.getActiveAlerts();

      return (
        <div className="space-y-4">
          <p className="text-green-600 text-sm font-medium">✅ Predictive Intelligence Platform with alerts</p>
          <p className="text-sm text-gray-600 mb-4">
            Click "Generate Sample Alerts" to see the alert system in action
          </p>
          <button
            onClick={async () => {
              await alertsService.generateAlerts(
                customersWithHealth,
                async (company: string) => marketIntelligenceService.fetchMarketIntelligence(company)
              );
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Sample Alerts
          </button>
          <PredictiveIntelligenceWidget
            alerts={alerts}
            onDismissAlert={(id) => {
              alertsService.dismissAlert(id);
              window.location.reload();
            }}
            onResolveAlert={(id, action, notes) => {
              alertsService.resolveAlert(id, action, notes);
              window.location.reload();
            }}
            onRefreshMarketData={async (company) => {
              await marketIntelligenceService.refreshMarketIntelligence(company);
            }}
          />
        </div>
      );
    }
  } catch (error) {
    console.error('PredictiveIntelligenceWidget error:', error);
  }

  return (
    <div className="text-gray-500 text-sm">
      PredictiveIntelligenceWidget component will appear here when implemented.
    </div>
  );
};


export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Customer Intelligence Dashboard
        </h1>
        <p className="text-gray-600">
          AI for Engineering Teams Workshop - Your Progress
        </p>
      </header>

      {/* Progress Indicator */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Implementation Status</h2>
        <div className="space-y-2 text-sm">
          <p className="text-green-600">✅ CustomerCard - Display customer info with health scores</p>
          <p className="text-green-600">✅ CustomerSelector - Search and select customers</p>
          <p className="text-green-600">✅ CustomerHealthDisplay - Health score calculator with breakdown</p>
          <p className="text-green-600">✅ MarketIntelligenceWidget - Market sentiment and news analysis</p>
          <p className="text-green-600">✅ PredictiveIntelligence - Alert system with market enrichment</p>
        </div>
      </div>

      {/* Component Showcase Area */}
      <div className="space-y-8">
        {/* CustomerSelector Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">1. CustomerSelector Component</h3>
          <p className="text-sm text-gray-600 mb-4">
            Interactive customer selector with search, filtering, and selection. Try searching by name or company!
          </p>
          <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
            <CustomerSelectorDemo />
          </Suspense>
        </section>

        {/* Customer Health Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">2. Customer Health Display</h3>
          <p className="text-sm text-gray-600 mb-4">
            Multi-factor health score calculator showing payment, engagement, contract, and support metrics.
          </p>
          <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
            <CustomerHealthDemo />
          </Suspense>
        </section>

        {/* Market Intelligence Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">3. Market Intelligence Widget</h3>
          <p className="text-sm text-gray-600 mb-4">
            Real-time market sentiment analysis with news headlines and refresh capability.
          </p>
          <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
            <MarketIntelligenceDemo />
          </Suspense>
        </section>

        {/* Predictive Intelligence Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">4. Predictive Intelligence Platform</h3>
          <p className="text-sm text-gray-600 mb-4">
            Advanced alert system combining internal health metrics with external market intelligence.
          </p>
          <Suspense fallback={<div className="text-gray-500">Loading...</div>}>
            <PredictiveAlertsDemo />
          </Suspense>
        </section>

        {/* API Endpoints */}
        <section className="bg-green-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">API Endpoints Available</h3>
          <div className="space-y-2 text-sm text-green-800">
            <p><strong>GET</strong> <code className="bg-green-100 px-2 py-1 rounded">/api/market-intelligence/[company]</code></p>
            <p className="text-xs text-green-700 ml-4">
              Example: <code>/api/market-intelligence/Acme%20Corp</code>
            </p>
            <p className="text-xs text-green-700 ml-4">
              Query params: <code>?refresh=true</code> to bypass cache
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
