/**
 * Mock customer data for workshop exercises
 * Used throughout the Customer Intelligence Dashboard components
 */

import type { CustomerHealthData } from '@/lib/healthCalculator';

export interface Customer {
  id: string;
  name: string;
  company: string;
  healthScore: number;
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[]; // Customer websites to health check
  createdAt?: string;
  updatedAt?: string;
}

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    company: 'Acme Corp',
    healthScore: 85,
    email: 'john.smith@acmecorp.com',
    subscriptionTier: 'premium',
    domains: ['acmecorp.com', 'portal.acmecorp.com'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    company: 'TechStart Inc',
    healthScore: 45,
    email: 'sarah@techstart.io',
    subscriptionTier: 'basic',
    domains: ['techstart.io'],
    createdAt: '2024-01-20T14:22:00Z',
    updatedAt: '2024-01-20T14:22:00Z'
  },
  {
    id: '3',
    name: 'Michael Brown',
    company: 'Global Solutions',
    healthScore: 15,
    email: 'mbrown@globalsolutions.com',
    subscriptionTier: 'basic',
    domains: ['globalsolutions.com', 'api.globalsolutions.com', 'cdn.globalsolutions.com'],
    createdAt: '2024-01-25T09:45:00Z',
    updatedAt: '2024-01-25T09:45:00Z'
  },
  {
    id: '4',
    name: 'Emily Davis',
    company: 'Innovation Labs',
    healthScore: 92,
    email: 'emily.davis@innovationlabs.tech',
    subscriptionTier: 'enterprise',
    domains: ['innovationlabs.tech', 'app.innovationlabs.tech'],
    createdAt: '2024-01-10T16:18:00Z',
    updatedAt: '2024-01-10T16:18:00Z'
  },
  {
    id: '5',
    name: 'David Wilson',
    company: 'Future Systems',
    healthScore: 60,
    email: 'dwilson@futuresystems.net',
    subscriptionTier: 'premium',
    domains: ['futuresystems.net', 'secure.futuresystems.net'],
    createdAt: '2024-01-30T11:05:00Z',
    updatedAt: '2024-01-30T11:05:00Z'
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    company: 'Smart Ventures',
    healthScore: 73,
    email: 'lisa@smartventures.co',
    subscriptionTier: 'premium',
    domains: ['smartventures.co'],
    createdAt: '2024-02-01T13:40:00Z',
    updatedAt: '2024-02-01T13:40:00Z'
  },
  {
    id: '7',
    name: 'Robert Chen',
    company: 'DataFlow Analytics',
    healthScore: 88,
    email: 'robert@dataflow.ai',
    subscriptionTier: 'enterprise',
    domains: ['dataflow.ai', 'analytics.dataflow.ai', 'api.dataflow.ai'],
    createdAt: '2024-01-12T08:15:00Z',
    updatedAt: '2024-01-12T08:15:00Z'
  },
  {
    id: '8',
    name: 'Maria Rodriguez',
    company: 'CloudFirst Solutions',
    healthScore: 35,
    email: 'maria.rodriguez@cloudfirst.com',
    subscriptionTier: 'basic',
    domains: ['cloudfirst.com', 'support.cloudfirst.com'],
    createdAt: '2024-01-28T15:30:00Z',
    updatedAt: '2024-01-28T15:30:00Z'
  }
];

/**
 * Generates deterministic mock health data for a customer
 *
 * Creates realistic health factor data based on the customer's existing healthScore.
 * Data generation is deterministic (same customerId always generates same data).
 *
 * Algorithm:
 * - Uses customer ID as seed for deterministic pseudo-random generation
 * - Aligns factor scores to approximate the customer's overall healthScore
 * - Generates realistic values for all payment, engagement, contract, and support metrics
 *
 * @param customerId Customer identifier (used as deterministic seed)
 * @returns CustomerHealthData with all health factors
 */
export function generateMockHealthData(customerId: string): CustomerHealthData {
  // Find the customer to align with their existing health score
  const customer = mockCustomers.find(c => c.id === customerId);
  const targetHealthScore = customer?.healthScore ?? 50;

  // Simple deterministic pseudo-random generator based on customer ID
  const seed = parseInt(customerId, 10) || 1;
  const random = (min: number, max: number, offset: number = 0): number => {
    const x = Math.sin(seed * 12.9898 + offset * 78.233) * 43758.5453;
    const rand = x - Math.floor(x);
    return Math.floor(rand * (max - min + 1)) + min;
  };

  // Generate payment data aligned with health score
  // Higher health score = better payment metrics
  let paymentData;
  if (targetHealthScore >= 71) {
    // Healthy customers have excellent payment behavior
    paymentData = {
      daysSinceLastPayment: random(1, 7, 1),
      averagePaymentDelay: random(-5, 0, 2),
      overdueAmount: 0,
      totalPayments: random(10, 50, 3),
    };
  } else if (targetHealthScore >= 31) {
    // Warning customers have moderate payment issues
    paymentData = {
      daysSinceLastPayment: random(8, 30, 1),
      averagePaymentDelay: random(0, 10, 2),
      overdueAmount: random(0, 3000, 3),
      totalPayments: random(5, 20, 3),
    };
  } else {
    // Critical customers have serious payment problems
    paymentData = {
      daysSinceLastPayment: random(31, 90, 1),
      averagePaymentDelay: random(15, 45, 2),
      overdueAmount: random(3000, 15000, 3),
      totalPayments: random(1, 10, 3),
    };
  }

  // Generate engagement data aligned with health score
  let engagementData;
  if (targetHealthScore >= 71) {
    // Healthy customers are highly engaged
    engagementData = {
      loginFrequency: random(20, 40, 4),
      featureUsageCount: random(10, 20, 5),
      lastLoginDays: random(0, 5, 6),
      activeUsers: random(10, 50, 7),
    };
  } else if (targetHealthScore >= 31) {
    // Warning customers have moderate engagement
    engagementData = {
      loginFrequency: random(5, 15, 4),
      featureUsageCount: random(3, 8, 5),
      lastLoginDays: random(7, 20, 6),
      activeUsers: random(3, 15, 7),
    };
  } else {
    // Critical customers have poor engagement
    engagementData = {
      loginFrequency: random(0, 5, 4),
      featureUsageCount: random(1, 3, 5),
      lastLoginDays: random(30, 90, 6),
      activeUsers: random(1, 5, 7),
    };
  }

  // Generate contract data aligned with health score
  let contractData;
  if (targetHealthScore >= 71) {
    // Healthy customers have stable, long-term contracts
    contractData = {
      daysUntilRenewal: random(90, 300, 8),
      contractValue: random(50000, 200000, 9),
      recentUpgrades: random(0, 1, 10) === 1,
      contractLength: random(12, 36, 11),
    };
  } else if (targetHealthScore >= 31) {
    // Warning customers approaching renewal or medium-value
    contractData = {
      daysUntilRenewal: random(30, 90, 8),
      contractValue: random(10000, 50000, 9),
      recentUpgrades: false,
      contractLength: random(6, 12, 11),
    };
  } else {
    // Critical customers have contract risk
    contractData = {
      daysUntilRenewal: random(-30, 30, 8),
      contractValue: random(5000, 20000, 9),
      recentUpgrades: false,
      contractLength: random(3, 12, 11),
    };
  }

  // Generate support data aligned with health score
  let supportData;
  if (targetHealthScore >= 71) {
    // Healthy customers have minimal support issues
    supportData = {
      averageResolutionTime: random(4, 20, 12),
      satisfactionScore: random(4, 5, 13) as 1 | 2 | 3 | 4 | 5,
      escalationCount: random(0, 1, 14),
      openTickets: random(0, 2, 15),
    };
  } else if (targetHealthScore >= 31) {
    // Warning customers have moderate support needs
    supportData = {
      averageResolutionTime: random(24, 60, 12),
      satisfactionScore: random(3, 4, 13) as 1 | 2 | 3 | 4 | 5,
      escalationCount: random(2, 4, 14),
      openTickets: random(3, 6, 15),
    };
  } else {
    // Critical customers have significant support problems
    supportData = {
      averageResolutionTime: random(60, 120, 12),
      satisfactionScore: random(1, 2, 13) as 1 | 2 | 3 | 4 | 5,
      escalationCount: random(5, 10, 14),
      openTickets: random(7, 15, 15),
    };
  }

  return {
    payment: paymentData,
    engagement: engagementData,
    contract: contractData,
    support: supportData,
  };
}

export default mockCustomers;