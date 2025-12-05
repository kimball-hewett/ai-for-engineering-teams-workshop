/**
 * Alert Rules Engine
 *
 * Pure functions for evaluating alert conditions and generating alerts.
 * All functions are deterministic with no side effects.
 */

import type { CustomerHealthData } from '@/lib/healthCalculator';
import { getRiskLevel } from '@/lib/healthCalculator';
import type { MarketIntelligence } from '@/types/market';
import type { AlertRule, AlertType, AlertPriority } from '@/types/alerts';

// ============================================================================
// Alert Rule Definitions
// ============================================================================

/**
 * Critical Priority Alert Rules
 * These require immediate action and often combine internal + external signals
 */

const marketAmplifiedPaymentRule: AlertRule = {
  id: 'market_amplified_payment',
  name: 'Market-Amplified Payment Risk',
  type: 'market_amplified_payment',
  priority: 'critical',
  cooldownHours: 12,
  requiresMarketData: true,

  condition: (customer, customerId, customerARR, marketData) => {
    const paymentOverdue = customer.payment.daysSinceLastPayment > 30;
    const negativeSentiment = marketData?.sentiment === 'negative';
    return paymentOverdue && negativeSentiment;
  },

  message: (customerName) =>
    `CRITICAL: ${customerName} has overdue payment AND company facing negative market sentiment`,

  detailedMessage: (customer, customerName, marketData) =>
    `${customerName} has payment ${customer.payment.daysSinceLastPayment} days overdue with $${customer.payment.overdueAmount.toLocaleString()} outstanding. ` +
    `Company is experiencing negative market sentiment (${marketData?.sentimentScore.toFixed(2)}), which may amplify payment risk.`,

  getRecommendedActions: (customer, marketData) => [
    {
      action: 'Schedule urgent call with finance team',
      priority: 1,
      reason: 'Payment overdue and external pressures may indicate financial distress'
    },
    {
      action: 'Review payment plan options',
      priority: 2,
      reason: 'May need flexible payment terms due to company challenges'
    },
    {
      action: 'Assess market context impact',
      priority: 3,
      reason: `Company facing ${marketData?.newsCount || 0} negative news items`
    }
  ]
};

const dualSignalChurnRule: AlertRule = {
  id: 'dual_signal_churn',
  name: 'Dual-Signal Churn Risk',
  type: 'dual_signal_churn',
  priority: 'critical',
  cooldownHours: 12,
  requiresMarketData: true,

  condition: (customer, customerId, customerARR, marketData) => {
    const healthScore = calculateQuickHealthScore(customer);
    const criticalHealth = healthScore < 30;
    const recentNegativeNews = marketData?.sentiment === 'negative';
    return criticalHealth && recentNegativeNews;
  },

  message: (customerName) =>
    `CRITICAL: ${customerName} has poor health score AND negative company news`,

  detailedMessage: (customer, customerName, marketData) =>
    `${customerName} health score is critically low (<30) with poor engagement (last login ${customer.engagement.lastLoginDays} days ago). ` +
    `Company also experiencing negative market sentiment, creating dual churn risk signals.`,

  getRecommendedActions: () => [
    {
      action: 'Executive escalation - immediate intervention required',
      priority: 1,
      reason: 'Multiple critical risk factors combined'
    },
    {
      action: 'Schedule customer health review meeting',
      priority: 2,
      reason: 'Understand internal challenges and external pressures'
    },
    {
      action: 'Develop retention strategy',
      priority: 3,
      reason: 'High churn probability requires proactive retention plan'
    }
  ]
};

/**
 * High Priority Alert Rules
 * Internal issues requiring immediate attention
 */

const paymentRiskRule: AlertRule = {
  id: 'payment_risk',
  name: 'Payment Risk',
  type: 'payment_risk',
  priority: 'high',
  cooldownHours: 24,
  requiresMarketData: false,

  condition: (customer) => {
    return customer.payment.daysSinceLastPayment > 30 || customer.payment.overdueAmount > 5000;
  },

  message: (customerName) =>
    `HIGH: ${customerName} has significant payment issues`,

  detailedMessage: (customer, customerName) =>
    `${customerName} payment is ${customer.payment.daysSinceLastPayment} days overdue with $${customer.payment.overdueAmount.toLocaleString()} outstanding. ` +
    `Average payment delay: ${customer.payment.averagePaymentDelay} days.`,

  getRecommendedActions: () => [
    {
      action: 'Contact billing team urgently',
      priority: 1,
      reason: 'Payment significantly overdue'
    },
    {
      action: 'Review account status and history',
      priority: 2,
      reason: 'Understand payment pattern changes'
    },
    {
      action: 'Offer payment plan if needed',
      priority: 3,
      reason: 'Prevent account suspension while resolving'
    }
  ]
};

const engagementCliffRule: AlertRule = {
  id: 'engagement_cliff',
  name: 'Engagement Cliff',
  type: 'engagement_cliff',
  priority: 'high',
  cooldownHours: 24,
  requiresMarketData: false,

  condition: (customer) => {
    // Detect sudden engagement drop
    const lowLoginFrequency = customer.engagement.loginFrequency < 5;
    const lastLoginRecent = customer.engagement.lastLoginDays > 14;
    const lowFeatureUsage = customer.engagement.featureUsageCount < 3;

    return lowLoginFrequency && (lastLoginRecent || lowFeatureUsage);
  },

  message: (customerName) =>
    `HIGH: ${customerName} showing significant engagement drop`,

  detailedMessage: (customer, customerName) =>
    `${customerName} engagement has dropped significantly: ${customer.engagement.loginFrequency} logins/month, ` +
    `last login ${customer.engagement.lastLoginDays} days ago, only ${customer.engagement.featureUsageCount} features used.`,

  getRecommendedActions: () => [
    {
      action: 'Schedule re-engagement call',
      priority: 1,
      reason: 'Understand why usage has declined'
    },
    {
      action: 'Offer training or onboarding refresh',
      priority: 2,
      reason: 'May need help maximizing platform value'
    },
    {
      action: 'Review feature adoption',
      priority: 3,
      reason: 'Identify unused features that could add value'
    }
  ]
};

const contractExpirationRule: AlertRule = {
  id: 'contract_expiration',
  name: 'Contract Expiration Risk',
  type: 'contract_expiration',
  priority: 'high',
  cooldownHours: 24,
  requiresMarketData: false,

  condition: (customer) => {
    const healthScore = calculateQuickHealthScore(customer);
    return customer.contract.daysUntilRenewal < 90 && healthScore < 50;
  },

  message: (customerName) =>
    `HIGH: ${customerName} contract expiring soon with low health score`,

  detailedMessage: (customer, customerName) =>
    `${customerName} contract expires in ${customer.contract.daysUntilRenewal} days with current health score below 50. ` +
    `Contract value: $${customer.contract.contractValue.toLocaleString()}. No recent upgrades.`,

  getRecommendedActions: () => [
    {
      action: 'Initiate renewal conversation immediately',
      priority: 1,
      reason: 'Limited time to address concerns before expiration'
    },
    {
      action: 'Conduct value review session',
      priority: 2,
      reason: 'Demonstrate ROI and address concerns'
    },
    {
      action: 'Prepare renewal proposal',
      priority: 3,
      reason: 'Have flexible options ready for discussion'
    }
  ]
};

/**
 * Medium Priority Alert Rules
 * Monitoring situations that need attention
 */

const supportSpikeRule: AlertRule = {
  id: 'support_spike',
  name: 'Support Ticket Spike',
  type: 'support_spike',
  priority: 'medium',
  cooldownHours: 48,
  requiresMarketData: false,

  condition: (customer) => {
    return customer.support.openTickets > 3 || customer.support.escalationCount > 2;
  },

  message: (customerName) =>
    `MEDIUM: ${customerName} experiencing elevated support issues`,

  detailedMessage: (customer, customerName) =>
    `${customerName} has ${customer.support.openTickets} open tickets and ${customer.support.escalationCount} escalations. ` +
    `Satisfaction score: ${customer.support.satisfactionScore}/5. Average resolution time: ${customer.support.averageResolutionTime}hrs.`,

  getRecommendedActions: () => [
    {
      action: 'Review open tickets for patterns',
      priority: 1,
      reason: 'Identify systemic issues or training gaps'
    },
    {
      action: 'Schedule check-in with customer',
      priority: 2,
      reason: 'Proactively address concerns before escalation'
    },
    {
      action: 'Consider CSM intervention',
      priority: 3,
      reason: 'Elevated support may indicate deeper issues'
    }
  ]
};

const adoptionStallRule: AlertRule = {
  id: 'adoption_stall',
  name: 'Feature Adoption Stall',
  type: 'adoption_stall',
  priority: 'medium',
  cooldownHours: 48,
  requiresMarketData: false,
  customerValueThreshold: 10000, // Only for customers with >$10k ARR

  condition: (customer, customerId, customerARR) => {
    const lowFeatureUsage = customer.engagement.featureUsageCount < 5;
    const hasValue = customerARR > 10000;
    const stableEngagement = customer.engagement.loginFrequency >= 5; // Still logging in

    return lowFeatureUsage && hasValue && stableEngagement;
  },

  message: (customerName) =>
    `MEDIUM: ${customerName} has stalled feature adoption despite regular usage`,

  detailedMessage: (customer, customerName) =>
    `${customerName} logs in regularly (${customer.engagement.loginFrequency} times/month) but only uses ${customer.engagement.featureUsageCount} features. ` +
    `Opportunity to expand usage and increase value realization.`,

  getRecommendedActions: () => [
    {
      action: 'Conduct feature discovery session',
      priority: 1,
      reason: 'Show additional capabilities relevant to their needs'
    },
    {
      action: 'Share use cases and best practices',
      priority: 2,
      reason: 'Help them see value in additional features'
    },
    {
      action: 'Consider expansion opportunity',
      priority: 3,
      reason: 'Higher feature usage may lead to upsell'
    }
  ]
};

/**
 * Opportunity Alert Rules
 * Positive signals for expansion or engagement
 */

const marketOpportunityRule: AlertRule = {
  id: 'market_opportunity',
  name: 'Market Opportunity',
  type: 'market_opportunity',
  priority: 'opportunity',
  cooldownHours: 168, // 7 days
  requiresMarketData: true,

  condition: (customer, customerId, customerARR, marketData) => {
    const healthScore = calculateQuickHealthScore(customer);
    const healthyCustomer = healthScore > 70;
    const positiveSentiment = marketData?.sentiment === 'positive';

    return healthyCustomer && positiveSentiment;
  },

  message: (customerName) =>
    `OPPORTUNITY: ${customerName} is healthy and company has positive news`,

  detailedMessage: (customer, customerName, marketData) =>
    `${customerName} has strong health score (>70) and their company is experiencing positive market momentum. ` +
    `${marketData?.newsCount || 0} positive news items. Great time for expansion conversation.`,

  getRecommendedActions: () => [
    {
      action: 'Schedule expansion/upsell discussion',
      priority: 1,
      reason: 'Company growth and positive momentum create expansion opportunity'
    },
    {
      action: 'Reference positive company news',
      priority: 2,
      reason: 'Show awareness of their success and align with their growth'
    },
    {
      action: 'Propose additional features or seats',
      priority: 3,
      reason: 'Timing is ideal for expanding relationship'
    }
  ]
};

const expansionSignalRule: AlertRule = {
  id: 'expansion_signal',
  name: 'Expansion Signal',
  type: 'expansion_signal',
  priority: 'opportunity',
  cooldownHours: 168, // 7 days
  requiresMarketData: false,

  condition: (customer) => {
    const highEngagement = customer.engagement.loginFrequency > 20;
    const broadFeatureUsage = customer.engagement.featureUsageCount > 10;
    const renewalApproaching = customer.contract.daysUntilRenewal < 180 && customer.contract.daysUntilRenewal > 30;

    return (highEngagement || broadFeatureUsage) && renewalApproaching;
  },

  message: (customerName) =>
    `OPPORTUNITY: ${customerName} showing high engagement - expansion potential`,

  detailedMessage: (customer, customerName) =>
    `${customerName} demonstrates strong product adoption with ${customer.engagement.loginFrequency} logins/month and ` +
    `${customer.engagement.featureUsageCount} features used. Contract renewal in ${customer.contract.daysUntilRenewal} days.`,

  getRecommendedActions: () => [
    {
      action: 'Discuss expansion during renewal conversation',
      priority: 1,
      reason: 'High usage indicates they see value and may need more capacity'
    },
    {
      action: 'Review usage patterns for upsell opportunities',
      priority: 2,
      reason: 'Identify which features they use most and related add-ons'
    },
    {
      action: 'Prepare tiered renewal options',
      priority: 3,
      reason: 'Have upgrade paths ready for discussion'
    }
  ]
};

// ============================================================================
// Alert Rule Collection
// ============================================================================

export const ALERT_RULES: AlertRule[] = [
  // Critical
  marketAmplifiedPaymentRule,
  dualSignalChurnRule,

  // High
  paymentRiskRule,
  engagementCliffRule,
  contractExpirationRule,

  // Medium
  supportSpikeRule,
  adoptionStallRule,

  // Opportunity
  marketOpportunityRule,
  expansionSignalRule,
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Quick health score calculation for alert conditions
 * Simplified version for fast evaluation
 */
function calculateQuickHealthScore(customer: CustomerHealthData): number {
  // Simplified weighted calculation
  const paymentScore = customer.payment.overdueAmount === 0 ? 100 :
                       customer.payment.overdueAmount < 1000 ? 70 : 30;

  const engagementScore = customer.engagement.loginFrequency > 20 ? 100 :
                          customer.engagement.loginFrequency > 10 ? 70 :
                          customer.engagement.loginFrequency > 5 ? 50 : 20;

  const contractScore = customer.contract.daysUntilRenewal > 90 ? 100 :
                        customer.contract.daysUntilRenewal > 30 ? 70 : 30;

  const supportScore = customer.support.satisfactionScore >= 4 ? 100 :
                       customer.support.satisfactionScore >= 3 ? 70 : 40;

  return (paymentScore * 0.4) + (engagementScore * 0.3) +
         (contractScore * 0.2) + (supportScore * 0.1);
}

/**
 * Calculate risk amplification score based on internal + external signals
 */
export function calculateRiskAmplification(
  healthScore: number,
  marketSentiment: 'positive' | 'neutral' | 'negative',
  marketSentimentScore: number
): number {
  let amplification = 1.0;

  // Negative market sentiment amplifies internal issues
  if (marketSentiment === 'negative' && healthScore < 50) {
    // More negative sentiment = higher amplification
    const sentimentFactor = Math.abs(marketSentimentScore); // 0 to 1
    amplification = 1.0 + (sentimentFactor * 0.5); // 1.0 to 1.5
  }

  // Positive market sentiment may reduce perceived risk slightly
  if (marketSentiment === 'positive' && healthScore > 50 && healthScore < 70) {
    amplification = 0.9; // Slight risk reduction
  }

  return amplification;
}

/**
 * Evaluate all alert rules for a customer
 * Returns triggered rules that should generate alerts
 */
export function evaluateAlertRules(
  customer: CustomerHealthData,
  customerId: string,
  customerName: string,
  customerARR: number,
  marketData?: MarketIntelligence
): Array<{
  rule: AlertRule;
  triggered: boolean;
  reason: string;
}> {
  return ALERT_RULES.map(rule => {
    // Skip rules requiring market data if not available
    if (rule.requiresMarketData && !marketData) {
      return {
        rule,
        triggered: false,
        reason: 'Market data not available'
      };
    }

    // Skip rules with ARR threshold if customer doesn't meet it
    if (rule.customerValueThreshold && customerARR < rule.customerValueThreshold) {
      return {
        rule,
        triggered: false,
        reason: `Customer ARR ($${customerARR}) below threshold ($${rule.customerValueThreshold})`
      };
    }

    // Evaluate rule condition
    try {
      const triggered = rule.condition(customer, customerId, customerARR, marketData);
      return {
        rule,
        triggered,
        reason: triggered ? 'Condition met' : 'Condition not met'
      };
    } catch (error) {
      return {
        rule,
        triggered: false,
        reason: `Evaluation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  });
}

/**
 * Get cooldown duration in milliseconds based on priority
 */
export function getCooldownDuration(priority: AlertPriority): number {
  const HOUR_MS = 60 * 60 * 1000;

  switch (priority) {
    case 'critical': return 12 * HOUR_MS;
    case 'high': return 24 * HOUR_MS;
    case 'medium': return 48 * HOUR_MS;
    case 'opportunity': return 168 * HOUR_MS; // 7 days
  }
}

/**
 * Calculate priority score for alert ordering
 * Higher score = higher priority
 */
export function calculatePriorityScore(
  priority: AlertPriority,
  customerARR: number,
  marketAmplification: number = 1.0
): number {
  // Base priority scores
  const basePriority: Record<AlertPriority, number> = {
    critical: 1000,
    high: 500,
    medium: 100,
    opportunity: 50,
  };

  // ARR weight
  const arrWeight = customerARR > 100000 ? 2.0 :
                    customerARR > 50000 ? 1.5 : 1.0;

  // Market amplification bonus
  const amplificationBonus = marketAmplification > 1.0 ? 200 :
                            marketAmplification < 1.0 ? 100 : 0;

  return (basePriority[priority] * arrWeight) + amplificationBonus;
}
