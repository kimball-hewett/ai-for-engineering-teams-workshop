/**
 * Health Score Calculator System
 *
 * Comprehensive customer health scoring algorithm that combines multiple factors:
 * - Payment History (40% weight)
 * - Engagement Metrics (30% weight)
 * - Contract Status (20% weight)
 * - Support Satisfaction (10% weight)
 *
 * All scoring functions are pure functions with no side effects.
 */

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface PaymentData {
  daysSinceLastPayment: number;
  averagePaymentDelay: number;
  overdueAmount: number;
  totalPayments: number;
}

export interface EngagementData {
  loginFrequency: number;
  featureUsageCount: number;
  lastLoginDays: number;
  activeUsers: number;
}

export interface ContractData {
  daysUntilRenewal: number;
  contractValue: number;
  recentUpgrades: boolean;
  contractLength: number;
}

export interface SupportData {
  averageResolutionTime: number;
  satisfactionScore: number; // 1-5 scale
  escalationCount: number;
  openTickets: number;
}

export interface CustomerHealthData {
  payment: PaymentData;
  engagement: EngagementData;
  contract: ContractData;
  support: SupportData;
}

export interface HealthScoreResult {
  overallScore: number;
  riskLevel: 'healthy' | 'warning' | 'critical';
  breakdown: {
    payment: number;
    engagement: number;
    contract: number;
    support: number;
  };
  calculatedAt: Date;
}

export interface FactorScore {
  score: number;
  weight: number;
  weightedScore: number;
}

// ============================================================================
// Custom Error Classes
// ============================================================================

export class HealthCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HealthCalculationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================================
// Input Validation Functions
// ============================================================================

/**
 * Validates payment data for calculation
 */
function validatePaymentData(data: PaymentData): void {
  if (typeof data.daysSinceLastPayment !== 'number' || data.daysSinceLastPayment < 0) {
    throw new ValidationError('daysSinceLastPayment must be a non-negative number');
  }
  if (typeof data.averagePaymentDelay !== 'number') {
    throw new ValidationError('averagePaymentDelay must be a number');
  }
  if (typeof data.overdueAmount !== 'number' || data.overdueAmount < 0) {
    throw new ValidationError('overdueAmount must be a non-negative number');
  }
  if (typeof data.totalPayments !== 'number' || data.totalPayments < 0) {
    throw new ValidationError('totalPayments must be a non-negative number');
  }
}

/**
 * Validates engagement data for calculation
 */
function validateEngagementData(data: EngagementData): void {
  if (typeof data.loginFrequency !== 'number' || data.loginFrequency < 0) {
    throw new ValidationError('loginFrequency must be a non-negative number');
  }
  if (typeof data.featureUsageCount !== 'number' || data.featureUsageCount < 0) {
    throw new ValidationError('featureUsageCount must be a non-negative number');
  }
  if (typeof data.lastLoginDays !== 'number' || data.lastLoginDays < 0) {
    throw new ValidationError('lastLoginDays must be a non-negative number');
  }
  if (typeof data.activeUsers !== 'number' || data.activeUsers < 0) {
    throw new ValidationError('activeUsers must be a non-negative number');
  }
}

/**
 * Validates contract data for calculation
 */
function validateContractData(data: ContractData): void {
  if (typeof data.daysUntilRenewal !== 'number') {
    throw new ValidationError('daysUntilRenewal must be a number');
  }
  if (typeof data.contractValue !== 'number' || data.contractValue < 0) {
    throw new ValidationError('contractValue must be a non-negative number');
  }
  if (typeof data.recentUpgrades !== 'boolean') {
    throw new ValidationError('recentUpgrades must be a boolean');
  }
  if (typeof data.contractLength !== 'number' || data.contractLength <= 0) {
    throw new ValidationError('contractLength must be a positive number');
  }
}

/**
 * Validates support data for calculation
 */
function validateSupportData(data: SupportData): void {
  if (typeof data.averageResolutionTime !== 'number' || data.averageResolutionTime < 0) {
    throw new ValidationError('averageResolutionTime must be a non-negative number');
  }
  if (typeof data.satisfactionScore !== 'number' || data.satisfactionScore < 1 || data.satisfactionScore > 5) {
    throw new ValidationError('satisfactionScore must be a number between 1 and 5');
  }
  if (typeof data.escalationCount !== 'number' || data.escalationCount < 0) {
    throw new ValidationError('escalationCount must be a non-negative number');
  }
  if (typeof data.openTickets !== 'number' || data.openTickets < 0) {
    throw new ValidationError('openTickets must be a non-negative number');
  }
}

// ============================================================================
// Core Calculation Functions
// ============================================================================

/**
 * Calculates payment health score (0-100 scale)
 *
 * Algorithm (40% weight in overall score):
 * - Days since last payment: 0-7 days = 100%, 8-30 = 80%, 31-60 = 50%, 60+ = 0%
 * - Average payment delay: Early = +10%, On-time = 0%, Late = -20%
 * - Overdue amount: None = 100%, < $1000 = 70%, $1000-$5000 = 40%, > $5000 = 0%
 * - New customers (totalPayments = 0) get neutral score of 50
 *
 * @param paymentData Payment history data
 * @returns Payment health score (0-100)
 */
export function calculatePaymentScore(paymentData: PaymentData): number {
  validatePaymentData(paymentData);

  // Handle new customers with no payment history
  if (paymentData.totalPayments === 0) {
    return 50; // Neutral score for new customers
  }

  let score = 0;
  let components = 0;

  // Component 1: Days since last payment (33% of payment score)
  const daysSince = paymentData.daysSinceLastPayment;
  let daysScore = 0;
  if (daysSince <= 7) daysScore = 100;
  else if (daysSince <= 30) daysScore = 80;
  else if (daysSince <= 60) daysScore = 50;
  else daysScore = 0;

  score += daysScore;
  components++;

  // Component 2: Average payment delay (33% of payment score)
  const delay = paymentData.averagePaymentDelay;
  let delayScore = 100;
  if (delay < 0) delayScore = 110; // Early payment bonus
  else if (delay === 0) delayScore = 100; // On-time
  else delayScore = 80; // Late payment penalty

  score += delayScore;
  components++;

  // Component 3: Overdue amount (34% of payment score)
  const overdue = paymentData.overdueAmount;
  let overdueScore = 0;
  if (overdue === 0) overdueScore = 100;
  else if (overdue < 1000) overdueScore = 70;
  else if (overdue <= 5000) overdueScore = 40;
  else overdueScore = 0;

  score += overdueScore;
  components++;

  // Calculate average and normalize to 0-100
  const normalizedScore = score / components;
  return Math.max(0, Math.min(100, normalizedScore));
}

/**
 * Calculates engagement health score (0-100 scale)
 *
 * Algorithm (30% weight in overall score):
 * - Login frequency: > 20/month = 100%, 10-20 = 75%, 5-10 = 50%, < 5 = 25%
 * - Feature usage: > 10 features = 100%, 5-10 = 70%, 2-5 = 40%, < 2 = 20%
 * - Last login: < 7 days = 100%, 7-14 = 75%, 14-30 = 50%, > 30 = 0%
 * - Active users: Considered in overall engagement assessment
 *
 * @param engagementData User engagement metrics
 * @returns Engagement health score (0-100)
 */
export function calculateEngagementScore(engagementData: EngagementData): number {
  validateEngagementData(engagementData);

  let score = 0;
  let components = 0;

  // Component 1: Login frequency (33% of engagement score)
  const logins = engagementData.loginFrequency;
  let loginScore = 0;
  if (logins > 20) loginScore = 100;
  else if (logins >= 10) loginScore = 75;
  else if (logins >= 5) loginScore = 50;
  else loginScore = 25;

  score += loginScore;
  components++;

  // Component 2: Feature usage count (33% of engagement score)
  const features = engagementData.featureUsageCount;
  let featureScore = 0;
  if (features > 10) featureScore = 100;
  else if (features >= 5) featureScore = 70;
  else if (features >= 2) featureScore = 40;
  else featureScore = 20;

  score += featureScore;
  components++;

  // Component 3: Last login days (34% of engagement score)
  const lastLogin = engagementData.lastLoginDays;
  let lastLoginScore = 0;
  if (lastLogin < 7) lastLoginScore = 100;
  else if (lastLogin <= 14) lastLoginScore = 75;
  else if (lastLogin <= 30) lastLoginScore = 50;
  else lastLoginScore = 0;

  score += lastLoginScore;
  components++;

  // Note: activeUsers is considered as a contextual metric
  // For simplified calculation, we weight it less directly
  // In production, you might compare activeUsers to licensed seats

  // Calculate average and normalize to 0-100
  const normalizedScore = score / components;
  return Math.max(0, Math.min(100, normalizedScore));
}

/**
 * Calculates contract health score (0-100 scale)
 *
 * Algorithm (20% weight in overall score):
 * - Days until renewal: > 90 days = 100%, 30-90 = 80%, 0-30 = 50%, overdue = 20%
 * - Recent upgrades: Yes = +15% bonus
 * - Contract value: Higher value customers get slight bonus consideration
 *
 * @param contractData Contract information
 * @returns Contract health score (0-100)
 */
export function calculateContractScore(contractData: ContractData): number {
  validateContractData(contractData);

  let score = 0;

  // Component 1: Days until renewal (primary factor)
  const daysUntilRenewal = contractData.daysUntilRenewal;
  let renewalScore = 0;
  if (daysUntilRenewal > 90) renewalScore = 100;
  else if (daysUntilRenewal >= 30) renewalScore = 80;
  else if (daysUntilRenewal >= 0) renewalScore = 50;
  else renewalScore = 20; // Overdue renewal

  score = renewalScore;

  // Component 2: Recent upgrades bonus
  if (contractData.recentUpgrades) {
    score += 15; // 15% bonus for recent upgrades (positive signal)
  }

  // Component 3: Contract value consideration (slight bonus for high-value)
  // Higher contract value indicates more investment and stickiness
  if (contractData.contractValue > 100000) {
    score += 5; // High-value contract bonus
  } else if (contractData.contractValue > 50000) {
    score += 2; // Medium-value contract bonus
  }

  // Normalize to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculates support satisfaction score (0-100 scale)
 *
 * Algorithm (10% weight in overall score):
 * - Average resolution time: < 24hrs = 100%, 24-48 = 80%, 48-72 = 60%, > 72 = 40%
 * - Satisfaction score: 5 = 100%, 4 = 80%, 3 = 60%, 2 = 40%, 1 = 20%
 * - Escalations: 0 = 100%, 1-2 = 70%, 3-5 = 40%, > 5 = 0%
 * - Open tickets: 0 = 100%, 1-3 = 80%, 4-7 = 60%, > 7 = 30%
 *
 * @param supportData Support satisfaction metrics
 * @returns Support health score (0-100)
 */
export function calculateSupportScore(supportData: SupportData): number {
  validateSupportData(supportData);

  let score = 0;
  let components = 0;

  // Component 1: Average resolution time (25% of support score)
  const resolutionTime = supportData.averageResolutionTime;
  let resolutionScore = 0;
  if (resolutionTime < 24) resolutionScore = 100;
  else if (resolutionTime <= 48) resolutionScore = 80;
  else if (resolutionTime <= 72) resolutionScore = 60;
  else resolutionScore = 40;

  score += resolutionScore;
  components++;

  // Component 2: Satisfaction score (25% of support score)
  const satisfaction = supportData.satisfactionScore;
  let satisfactionScore = 0;
  if (satisfaction === 5) satisfactionScore = 100;
  else if (satisfaction === 4) satisfactionScore = 80;
  else if (satisfaction === 3) satisfactionScore = 60;
  else if (satisfaction === 2) satisfactionScore = 40;
  else satisfactionScore = 20; // satisfaction === 1

  score += satisfactionScore;
  components++;

  // Component 3: Escalation count (25% of support score)
  const escalations = supportData.escalationCount;
  let escalationScore = 0;
  if (escalations === 0) escalationScore = 100;
  else if (escalations <= 2) escalationScore = 70;
  else if (escalations <= 5) escalationScore = 40;
  else escalationScore = 0;

  score += escalationScore;
  components++;

  // Component 4: Open tickets (25% of support score)
  const openTickets = supportData.openTickets;
  let ticketsScore = 0;
  if (openTickets === 0) ticketsScore = 100;
  else if (openTickets <= 3) ticketsScore = 80;
  else if (openTickets <= 7) ticketsScore = 60;
  else ticketsScore = 30;

  score += ticketsScore;
  components++;

  // Calculate average and normalize to 0-100
  const normalizedScore = score / components;
  return Math.max(0, Math.min(100, normalizedScore));
}

/**
 * Calculates overall customer health score combining all factors
 *
 * Weighted combination:
 * - Payment: 40% weight
 * - Engagement: 30% weight
 * - Contract: 20% weight
 * - Support: 10% weight
 *
 * @param healthData Complete customer health data
 * @returns Health score result with breakdown
 */
export function calculateHealthScore(healthData: CustomerHealthData): HealthScoreResult {
  // Calculate individual factor scores
  const paymentScore = calculatePaymentScore(healthData.payment);
  const engagementScore = calculateEngagementScore(healthData.engagement);
  const contractScore = calculateContractScore(healthData.contract);
  const supportScore = calculateSupportScore(healthData.support);

  // Apply weighted combination
  const overallScore =
    (paymentScore * 0.40) +
    (engagementScore * 0.30) +
    (contractScore * 0.20) +
    (supportScore * 0.10);

  // Determine risk level
  const riskLevel = getRiskLevel(overallScore);

  return {
    overallScore: Math.round(overallScore * 10) / 10, // Round to 1 decimal place
    riskLevel,
    breakdown: {
      payment: Math.round(paymentScore * 10) / 10,
      engagement: Math.round(engagementScore * 10) / 10,
      contract: Math.round(contractScore * 10) / 10,
      support: Math.round(supportScore * 10) / 10,
    },
    calculatedAt: new Date(),
  };
}

/**
 * Classifies health score into risk level categories
 *
 * Risk levels:
 * - Healthy: 71-100 (green)
 * - Warning: 31-70 (yellow)
 * - Critical: 0-30 (red)
 *
 * @param score Overall health score (0-100)
 * @returns Risk level classification
 */
export function getRiskLevel(score: number): 'healthy' | 'warning' | 'critical' {
  if (score < 0 || score > 100) {
    throw new ValidationError('Score must be between 0 and 100');
  }

  if (score >= 71) return 'healthy';
  if (score >= 31) return 'warning';
  return 'critical';
}

/**
 * Helper function to create a FactorScore object with weight information
 *
 * @param score Raw factor score (0-100)
 * @param weight Weight percentage (e.g., 0.40 for 40%)
 * @returns FactorScore object
 */
export function createFactorScore(score: number, weight: number): FactorScore {
  return {
    score,
    weight,
    weightedScore: score * weight,
  };
}
