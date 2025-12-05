/**
 * Alert System Type Definitions
 *
 * Defines interfaces for the predictive alerts engine including alert types,
 * priorities, rules, and lifecycle tracking.
 */

import type { CustomerHealthData } from '@/lib/healthCalculator';
import type { MarketIntelligence, MarketHeadline } from './market';

export type AlertType =
  | 'payment_risk'
  | 'engagement_cliff'
  | 'contract_expiration'
  | 'support_spike'
  | 'adoption_stall'
  | 'market_opportunity'
  | 'dual_signal_churn'
  | 'market_amplified_payment'
  | 'expansion_signal';

export type AlertPriority = 'critical' | 'high' | 'medium' | 'opportunity';

export interface Alert {
  id: string;
  customerId: string;
  customerName: string;
  customerARR: number;

  // Alert classification
  type: AlertType;
  priority: AlertPriority;

  // Alert content
  message: string;
  detailedMessage: string;
  triggeringConditions: string[];

  // Market enrichment
  marketContext?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    sentimentScore: number;
    relevantHeadlines: MarketHeadline[];
    riskAmplification?: number; // 1.0 = no amplification, >1.0 = amplified
  };

  // Recommended actions
  recommendedActions: Array<{
    action: string;
    priority: number;
    reason: string;
  }>;

  // Lifecycle tracking
  triggeredAt: Date;
  dismissedAt?: Date;
  resolvedAt?: Date;
  actionTaken?: string;
  actionNotes?: string;

  // Metadata
  ruleId: string;
  evaluationContext: Record<string, unknown>;
  cooldownUntil: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  type: AlertType;
  priority: AlertPriority;

  // Rule definition
  condition: (customer: CustomerHealthData, customerId: string, customerARR: number, marketData?: MarketIntelligence) => boolean;
  message: (customerName: string) => string;
  detailedMessage: (customer: CustomerHealthData, customerName: string, marketData?: MarketIntelligence) => string;

  // Configuration
  cooldownHours: number;
  requiresMarketData: boolean;
  customerValueThreshold?: number; // Minimum ARR to trigger

  // Action recommendations
  getRecommendedActions: (customer: CustomerHealthData, marketData?: MarketIntelligence) => Array<{
    action: string;
    priority: number;
    reason: string;
  }>;
}

export interface CustomerState {
  customerId: string;
  healthData: CustomerHealthData;
  marketData?: MarketIntelligence;
  lastEvaluated: Date;
  activeAlerts: Alert[];
  alertHistory: Alert[];
}

export interface MonitoringResult {
  evaluatedCustomers: number;
  triggeredAlerts: Alert[];
  suppressedDuplicates: number;
  marketDataRefreshed: number;
  evaluationDuration: number; // ms
  errors: Array<{ customerId: string; error: string }>;
}
