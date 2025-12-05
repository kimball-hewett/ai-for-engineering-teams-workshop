/**
 * Alerts Service
 *
 * Service layer for managing alert lifecycle: generation, enrichment,
 * prioritization, dismissal, and resolution.
 */

import { v4 as uuidv4 } from 'uuid';
import type { CustomerHealthData } from '@/lib/healthCalculator';
import type { MarketIntelligence } from '@/types/market';
import type { Alert, AlertPriority, AlertRule, CustomerState, MonitoringResult } from '@/types/alerts';
import {
  ALERT_RULES,
  evaluateAlertRules,
  getCooldownDuration,
  calculatePriorityScore,
  calculateRiskAmplification,
} from '@/lib/alerts';

// ============================================================================
// Alert Storage (in-memory for workshop, use database in production)
// ============================================================================

const activeAlertsStore = new Map<string, Alert>();
const alertHistoryStore: Alert[] = [];
const customerStateStore = new Map<string, CustomerState>();

// ============================================================================
// AlertsService Class
// ============================================================================

export class AlertsService {
  /**
   * Generates alerts for customers based on health data and market intelligence
   */
  async generateAlerts(
    customers: Array<{
      id: string;
      name: string;
      company: string;
      arr: number;
      healthData: CustomerHealthData;
    }>,
    marketDataFetcher?: (company: string) => Promise<MarketIntelligence | undefined>
  ): Promise<MonitoringResult> {
    const startTime = Date.now();
    const triggeredAlerts: Alert[] = [];
    const errors: Array<{ customerId: string; error: string }> = [];
    let suppressedDuplicates = 0;
    let marketDataRefreshed = 0;

    for (const customer of customers) {
      try {
        // Fetch market data if fetcher provided
        let marketData: MarketIntelligence | undefined;
        if (marketDataFetcher) {
          try {
            marketData = await marketDataFetcher(customer.company);
            if (marketData) {
              marketDataRefreshed++;
            }
          } catch (error) {
            console.error(`Failed to fetch market data for ${customer.company}:`, error);
            // Continue without market data
          }
        }

        // Evaluate alert rules
        const evaluations = evaluateAlertRules(
          customer.healthData,
          customer.id,
          customer.name,
          customer.arr,
          marketData
        );

        // Generate alerts for triggered rules
        for (const evaluation of evaluations) {
          if (!evaluation.triggered) continue;

          const rule = evaluation.rule;

          // Check cooldown period
          if (this.isInCooldown(customer.id, rule.type)) {
            suppressedDuplicates++;
            continue;
          }

          // Check for duplicate active alerts
          if (this.hasDuplicateActiveAlert(customer.id, rule.type)) {
            suppressedDuplicates++;
            continue;
          }

          // Create alert
          const alert = this.createAlert(
            customer.id,
            customer.name,
            customer.arr,
            customer.healthData,
            rule,
            marketData
          );

          triggeredAlerts.push(alert);
          activeAlertsStore.set(alert.id, alert);
          alertHistoryStore.push(alert);
        }

        // Update customer state
        this.updateCustomerState(customer.id, customer.healthData, marketData);

      } catch (error) {
        errors.push({
          customerId: customer.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Sort alerts by priority
    triggeredAlerts.sort((a, b) => {
      const scoreA = calculatePriorityScore(
        a.priority,
        a.customerARR,
        a.marketContext?.riskAmplification
      );
      const scoreB = calculatePriorityScore(
        b.priority,
        b.customerARR,
        b.marketContext?.riskAmplification
      );
      return scoreB - scoreA; // Descending order
    });

    const evaluationDuration = Date.now() - startTime;

    return {
      evaluatedCustomers: customers.length,
      triggeredAlerts,
      suppressedDuplicates,
      marketDataRefreshed,
      evaluationDuration,
      errors,
    };
  }

  /**
   * Creates an alert from a triggered rule
   */
  private createAlert(
    customerId: string,
    customerName: string,
    customerARR: number,
    healthData: CustomerHealthData,
    rule: AlertRule,
    marketData?: MarketIntelligence
  ): Alert {
    const now = new Date();
    const cooldownDuration = getCooldownDuration(rule.priority);

    // Calculate market context if available
    let marketContext;
    if (marketData) {
      const quickHealthScore = this.calculateQuickHealthScore(healthData);
      const riskAmplification = calculateRiskAmplification(
        quickHealthScore,
        marketData.sentiment,
        marketData.sentimentScore
      );

      marketContext = {
        sentiment: marketData.sentiment,
        sentimentScore: marketData.sentimentScore,
        relevantHeadlines: marketData.headlines.slice(0, 3), // Top 3 headlines
        riskAmplification,
      };
    }

    return {
      id: uuidv4(),
      customerId,
      customerName,
      customerARR,
      type: rule.type,
      priority: rule.priority,
      message: rule.message(customerName),
      detailedMessage: rule.detailedMessage(healthData, customerName, marketData),
      triggeringConditions: this.extractTriggeringConditions(healthData, rule),
      marketContext,
      recommendedActions: rule.getRecommendedActions(healthData, marketData),
      triggeredAt: now,
      ruleId: rule.id,
      evaluationContext: {
        healthData: this.sanitizeHealthDataForStorage(healthData),
        marketDataAvailable: !!marketData,
      },
      cooldownUntil: new Date(now.getTime() + cooldownDuration),
    };
  }

  /**
   * Quick health score calculation (simplified)
   */
  private calculateQuickHealthScore(customer: CustomerHealthData): number {
    const paymentScore = customer.payment.overdueAmount === 0 ? 100 :
                         customer.payment.overdueAmount < 1000 ? 70 : 30;
    const engagementScore = customer.engagement.loginFrequency > 20 ? 100 :
                            customer.engagement.loginFrequency > 10 ? 70 : 30;
    const contractScore = customer.contract.daysUntilRenewal > 90 ? 100 :
                          customer.contract.daysUntilRenewal > 30 ? 70 : 30;
    const supportScore = customer.support.satisfactionScore >= 4 ? 100 : 50;

    return (paymentScore * 0.4) + (engagementScore * 0.3) +
           (contractScore * 0.2) + (supportScore * 0.1);
  }

  /**
   * Extracts human-readable triggering conditions
   */
  private extractTriggeringConditions(
    healthData: CustomerHealthData,
    rule: AlertRule
  ): string[] {
    const conditions: string[] = [];

    switch (rule.type) {
      case 'payment_risk':
      case 'market_amplified_payment':
        conditions.push(`Payment overdue: ${healthData.payment.daysSinceLastPayment} days`);
        conditions.push(`Overdue amount: $${healthData.payment.overdueAmount.toLocaleString()}`);
        break;

      case 'engagement_cliff':
        conditions.push(`Login frequency: ${healthData.engagement.loginFrequency}/month`);
        conditions.push(`Last login: ${healthData.engagement.lastLoginDays} days ago`);
        conditions.push(`Features used: ${healthData.engagement.featureUsageCount}`);
        break;

      case 'contract_expiration':
        conditions.push(`Contract expires in: ${healthData.contract.daysUntilRenewal} days`);
        conditions.push(`Contract value: $${healthData.contract.contractValue.toLocaleString()}`);
        break;

      case 'support_spike':
        conditions.push(`Open tickets: ${healthData.support.openTickets}`);
        conditions.push(`Escalations: ${healthData.support.escalationCount}`);
        conditions.push(`Satisfaction: ${healthData.support.satisfactionScore}/5`);
        break;

      case 'adoption_stall':
        conditions.push(`Features used: ${healthData.engagement.featureUsageCount}`);
        conditions.push(`Login frequency: ${healthData.engagement.loginFrequency}/month`);
        break;

      case 'dual_signal_churn':
        conditions.push(`Health score: <30 (critical)`);
        conditions.push(`Negative market sentiment detected`);
        break;

      case 'market_opportunity':
        conditions.push(`Health score: >70 (healthy)`);
        conditions.push(`Positive market sentiment detected`);
        break;

      case 'expansion_signal':
        conditions.push(`High engagement: ${healthData.engagement.loginFrequency} logins/month`);
        conditions.push(`Contract renewal: ${healthData.contract.daysUntilRenewal} days`);
        break;
    }

    return conditions;
  }

  /**
   * Sanitizes health data for storage (remove sensitive info if needed)
   */
  private sanitizeHealthDataForStorage(healthData: CustomerHealthData): Record<string, unknown> {
    return {
      payment: { ...healthData.payment },
      engagement: { ...healthData.engagement },
      contract: { ...healthData.contract },
      support: { ...healthData.support },
    };
  }

  /**
   * Checks if alert is within cooldown period
   */
  private isInCooldown(customerId: string, alertType: string): boolean {
    const now = new Date();

    // Check active alerts for same customer and type
    for (const alert of activeAlertsStore.values()) {
      if (alert.customerId === customerId &&
          alert.type === alertType &&
          now < alert.cooldownUntil) {
        return true;
      }
    }

    return false;
  }

  /**
   * Checks for duplicate active alerts
   */
  private hasDuplicateActiveAlert(customerId: string, alertType: string): boolean {
    for (const alert of activeAlertsStore.values()) {
      if (alert.customerId === customerId &&
          alert.type === alertType &&
          !alert.dismissedAt &&
          !alert.resolvedAt) {
        return true;
      }
    }
    return false;
  }

  /**
   * Updates customer state tracking
   */
  private updateCustomerState(
    customerId: string,
    healthData: CustomerHealthData,
    marketData?: MarketIntelligence
  ): void {
    const activeAlerts = Array.from(activeAlertsStore.values())
      .filter(alert => alert.customerId === customerId && !alert.dismissedAt && !alert.resolvedAt);

    const alertHistory = alertHistoryStore
      .filter(alert => alert.customerId === customerId);

    customerStateStore.set(customerId, {
      customerId,
      healthData,
      marketData,
      lastEvaluated: new Date(),
      activeAlerts,
      alertHistory,
    });
  }

  /**
   * Dismisses an alert
   */
  dismissAlert(alertId: string): boolean {
    const alert = activeAlertsStore.get(alertId);
    if (!alert) return false;

    alert.dismissedAt = new Date();
    activeAlertsStore.delete(alertId);

    return true;
  }

  /**
   * Resolves an alert with action taken
   */
  resolveAlert(alertId: string, action: string, notes?: string): boolean {
    const alert = activeAlertsStore.get(alertId);
    if (!alert) return false;

    alert.resolvedAt = new Date();
    alert.actionTaken = action;
    alert.actionNotes = notes;
    activeAlertsStore.delete(alertId);

    return true;
  }

  /**
   * Gets active alerts (optionally filtered by customer)
   */
  getActiveAlerts(customerId?: string): Alert[] {
    const alerts = Array.from(activeAlertsStore.values());

    if (customerId) {
      return alerts.filter(alert => alert.customerId === customerId);
    }

    // Sort by priority score
    return alerts.sort((a, b) => {
      const scoreA = calculatePriorityScore(
        a.priority,
        a.customerARR,
        a.marketContext?.riskAmplification
      );
      const scoreB = calculatePriorityScore(
        b.priority,
        b.customerARR,
        b.marketContext?.riskAmplification
      );
      return scoreB - scoreA;
    });
  }

  /**
   * Gets alert history with filters
   */
  getAlertHistory(filters?: {
    customerId?: string;
    priority?: AlertPriority;
    startDate?: Date;
    endDate?: Date;
    status?: 'active' | 'dismissed' | 'resolved';
  }): Alert[] {
    let filtered = [...alertHistoryStore];

    if (filters?.customerId) {
      filtered = filtered.filter(alert => alert.customerId === filters.customerId);
    }

    if (filters?.priority) {
      filtered = filtered.filter(alert => alert.priority === filters.priority);
    }

    if (filters?.startDate) {
      filtered = filtered.filter(alert => alert.triggeredAt >= filters.startDate!);
    }

    if (filters?.endDate) {
      filtered = filtered.filter(alert => alert.triggeredAt <= filters.endDate!);
    }

    if (filters?.status) {
      filtered = filtered.filter(alert => {
        if (filters.status === 'active') {
          return !alert.dismissedAt && !alert.resolvedAt;
        } else if (filters.status === 'dismissed') {
          return !!alert.dismissedAt;
        } else if (filters.status === 'resolved') {
          return !!alert.resolvedAt;
        }
        return true;
      });
    }

    return filtered.sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  /**
   * Gets customer state
   */
  getCustomerState(customerId: string): CustomerState | undefined {
    return customerStateStore.get(customerId);
  }

  /**
   * Clears all alerts (for testing)
   */
  clearAllAlerts(): void {
    activeAlertsStore.clear();
    alertHistoryStore.length = 0;
    customerStateStore.clear();
  }
}

// Export singleton instance
export const alertsService = new AlertsService();
