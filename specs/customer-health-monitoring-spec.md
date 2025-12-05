# Spec Template for Workshop

## Feature: Customer Health Monitoring System

### Context

**Purpose**: The Customer Health Monitoring system provides comprehensive, real-time intelligence about customer relationship health through predictive analytics and proactive alerting. It serves as the core analytical engine of the Customer Intelligence Dashboard, enabling customer success teams to identify at-risk customers before churn occurs and take proactive action.

**System Integration**: This feature integrates with the existing CustomerSelector component and dashboard layout, consisting of two primary subsystems:
1. **Health Score Calculator** - Pure calculation engine that computes multi-factor health scores (0-100 scale)
2. **Predictive Alerts Engine** - Real-time monitoring system that generates prioritized alerts based on customer behavior patterns

**Users and Usage**: Customer success managers and account executives will use this system throughout their daily workflow to:
- Monitor overall customer portfolio health at a glance
- Receive proactive alerts about customers requiring immediate attention
- Understand the specific factors contributing to each customer's health score
- Prioritize outreach and intervention activities based on risk and customer value

**Educational Context**: This feature demonstrates AI collaboration for complex business logic development, algorithm design, and reactive/proactive AI features with real-time monitoring capabilities.

### Requirements

#### Functional Requirements

**Health Score Calculation Engine** (`src/lib/healthCalculator.ts`):
- Calculate customer health scores on 0-100 scale with multi-factor weighted algorithm
- Scoring factors with weights: Payment History (40%), Engagement (30%), Contract Status (20%), Support Satisfaction (10%)
- Risk level classification: Healthy (71-100), Warning (31-70), Critical (0-30)
- Individual pure functions for each scoring factor:
  - `calculatePaymentScore()` - analyzes days since last payment, average payment delay, overdue amounts
  - `calculateEngagementScore()` - evaluates login frequency, feature usage count, support tickets
  - `calculateContractScore()` - assesses days until renewal, contract value, recent upgrades
  - `calculateSupportScore()` - measures average resolution time, satisfaction scores, escalation counts
- Main `calculateHealthScore()` function that combines all factors with proper weighting
- Comprehensive input validation with descriptive error messages
- TypeScript interfaces for all data structures (`CustomerHealthData`, `HealthScoreResult`, `ScoreBreakdown`)

**Predictive Alerts Engine** (`src/lib/alerts.ts`):
- Multi-tier alert priority system: High Priority (immediate action required), Medium Priority (monitor closely)
- Rule-based triggering with configurable thresholds
- Alert types with specific conditions:
  - **High Priority Alerts**:
    - Payment Risk: Payment overdue >30 days OR health score drops >20 points in 7 days
    - Engagement Cliff: Login frequency drops >50% compared to 30-day average
    - Contract Expiration Risk: Contract expires in <90 days AND health score <50
  - **Medium Priority Alerts**:
    - Support Ticket Spike: >3 support tickets in 7 days OR escalated ticket
    - Feature Adoption Stall: No new feature usage in 30 days for growing accounts
- Alert prioritization considering customer ARR and workload balancing
- Cooldown periods to prevent alert spam (24 hours for same customer/alert type)
- Deduplication logic to prevent duplicate alerts
- Alert history tracking for effectiveness analysis

**Data Monitoring System**:
- Real-time monitoring of health score changes and threshold crossings
- Pattern analysis for login behavior (gradual vs sudden drops)
- Payment timing and behavior change detection
- Support satisfaction trends and ticket escalation monitoring
- Feature usage depth and adoption pattern tracking

#### User Interface Requirements

**CustomerHealthDisplay Component** (`src/components/CustomerHealthDisplay.tsx`):
- Overall health score display with large, prominent numeric value
- Color-coded visualization matching dashboard standards:
  - Red (0-30): Critical health
  - Yellow (31-70): Warning health
  - Green (71-100): Healthy
- Expandable breakdown panel showing individual factor scores with weights
- Visual progress bars or charts for each factor
- Loading state with skeleton UI
- Error state with user-friendly messaging
- Responsive design adapting to mobile/tablet/desktop layouts

**PredictiveAlertsWidget Component** (`src/components/PredictiveAlertsWidget.tsx`):
- Real-time alert display integrated into main dashboard
- Alert cards with priority color coding (high/medium)
- Alert detail panels showing:
  - Alert type and priority badge
  - Customer name and basic info
  - Specific triggering condition
  - Recommended actions
  - Timestamp and alert ID
- Dismissal functionality with confirmation
- Historical alerts view with filtering (last 7/30/90 days)
- Empty state when no active alerts
- Loading and error states consistent with dashboard patterns

**Integration with CustomerSelector**:
- Real-time health score updates when customer selection changes
- Alert count badge on customer cards showing active alerts
- Selected customer's alerts highlighted in PredictiveAlertsWidget
- Smooth transitions and animations for score updates

#### Data Requirements

**Input Data Structures**:
```typescript
interface CustomerHealthData {
  customerId: string;
  paymentData: {
    daysSinceLastPayment: number;
    averagePaymentDelay: number;
    overdueAmount: number;
  };
  engagementData: {
    loginFrequency: number; // logins per week
    featureUsageCount: number;
    supportTicketCount: number;
  };
  contractData: {
    daysUntilRenewal: number;
    contractValue: number; // ARR
    recentUpgrades: boolean;
  };
  supportData: {
    averageResolutionTime: number; // hours
    satisfactionScore: number; // 0-5 scale
    escalationCount: number;
  };
}

interface AlertRule {
  id: string;
  type: 'payment_risk' | 'engagement_cliff' | 'contract_expiration' | 'support_spike' | 'adoption_stall';
  priority: 'high' | 'medium';
  condition: (customer: CustomerHealthData, history: HealthScoreHistory) => boolean;
  message: string;
  recommendedActions: string[];
}

interface Alert {
  id: string;
  customerId: string;
  ruleId: string;
  priority: 'high' | 'medium';
  type: string;
  message: string;
  recommendedActions: string[];
  triggeredAt: Date;
  dismissedAt?: Date;
  actionTaken?: string;
}
```

**Output Data Structures**:
```typescript
interface HealthScoreResult {
  overallScore: number; // 0-100
  riskLevel: 'healthy' | 'warning' | 'critical';
  breakdown: {
    paymentScore: number;
    engagementScore: number;
    contractScore: number;
    supportScore: number;
  };
  calculatedAt: Date;
}

interface AlertEngineResult {
  alerts: Alert[];
  evaluatedRules: number;
  triggeredRules: string[];
  suppressedDuplicates: number;
}
```

#### Integration Requirements

- Seamless integration with existing CustomerSelector component
- Integration with mock customer data from `src/data/mock-customers.ts`
- Extend mock data structure to include health-related fields
- Create `src/data/mock-health-data.ts` for sample health metrics
- Real-time updates when customer selection changes
- Consistent error handling and loading state patterns across all components
- Export capabilities for health score history and alert analytics

### Constraints

#### Technical Stack and Frameworks
- **Next.js 15** with App Router
- **React 19** with Server Components (mark client interactive components with `'use client'`)
- **TypeScript** strict mode enabled for all code
- **Tailwind CSS v4** with utility classes (no separate CSS files)
- Pure function architecture for calculation and alert logic (testable, predictable, no side effects)

#### Performance Requirements
- Health score calculation: < 5ms per customer
- Alert rule evaluation: < 10ms for full ruleset
- Component rendering: < 16ms (60fps target)
- Real-time monitoring without blocking UI
- Efficient caching for repeated calculations
- Optimized re-renders using React.memo where appropriate
- First Contentful Paint: < 1.5s for dashboard with health widgets

#### Design Constraints
- Responsive breakpoints: mobile 320px+, tablet 768px+, desktop 1024px+
- Color coding consistency with dashboard standards (red/yellow/green)
- Minimum touch target size: 44x44px (WCAG 2.1)
- Maximum alert card width: 400px
- Health score display minimum size: 60px (numeric value)
- Expandable panels use smooth transitions (200-300ms)

#### File Structure and Naming Conventions
```
src/
├── lib/
│   ├── healthCalculator.ts        # Pure calculation functions
│   └── alerts.ts                  # Alert rules engine
├── components/
│   ├── CustomerHealthDisplay.tsx  # Health score UI
│   └── PredictiveAlertsWidget.tsx # Alerts UI
├── data/
│   └── mock-health-data.ts        # Sample health metrics
└── types/
    └── health.ts                  # Shared TypeScript interfaces
```

- Components: PascalCase
- Functions: camelCase
- Types/Interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE

#### Props Interfaces and TypeScript Definitions

Export all props interfaces from component files:
```typescript
// CustomerHealthDisplay.tsx
export interface CustomerHealthDisplayProps {
  customerId: string;
  healthData: CustomerHealthData;
  onScoreCalculated?: (result: HealthScoreResult) => void;
}

// PredictiveAlertsWidget.tsx
export interface PredictiveAlertsWidgetProps {
  customerId?: string; // Optional - shows all alerts if not provided
  alerts: Alert[];
  onDismissAlert: (alertId: string) => void;
  onActionTaken: (alertId: string, action: string) => void;
}
```

#### Security Considerations
- **Input Validation**: Validate all numeric inputs (ranges, non-negative values)
- **Data Sanitization**: Sanitize all customer data before display (XSS prevention)
- **Error Handling**: Never expose sensitive data in error messages
- **Client-Side Security**: No sensitive customer PII in alert messages displayed client-side
- **Audit Trail**: Log all alert dismissals and actions with timestamps
- **Rate Limiting**: Implement client-side throttling for alert generation (prevent spam)

#### Algorithm Design Specifications
- Pure functions with no side effects for predictable testing
- Comprehensive JSDoc comments explaining business logic and mathematical formulas
- Normalization strategies for different data types and ranges (0-100 scale)
- Edge case handling for new customers with incomplete data (graceful degradation)
- Trend analysis for improving vs declining customers (compare historical scores)
- Weighted calculation with documented rationale:
  - Payment (40%): Strongest indicator of customer commitment
  - Engagement (30%): Usage patterns predict long-term retention
  - Contract (20%): Renewal timeline and value influence priority
  - Support (10%): Satisfaction important but not primary driver

### Acceptance Criteria

**Health Score Calculator**:
- [ ] `calculateHealthScore()` returns scores 0-100 for valid input data
- [ ] Individual factor functions (`calculatePaymentScore`, etc.) return normalized scores 0-100
- [ ] Risk level classification correctly maps: Critical (0-30), Warning (31-70), Healthy (71-100)
- [ ] Weighted calculation applies correct percentages: 40/30/20/10
- [ ] Input validation throws descriptive errors for invalid data (negative values, out of range)
- [ ] Edge cases handled: new customers with minimal data, missing optional fields
- [ ] All functions have comprehensive JSDoc comments with business logic explanations
- [ ] TypeScript strict mode passes with no type errors
- [ ] Pure functions with no side effects (deterministic output for same input)

**Predictive Alerts Engine**:
- [ ] Alert rules correctly evaluate conditions for all 5 alert types
- [ ] High priority alerts trigger for: payment >30 days overdue, score drop >20 points in 7 days, engagement drop >50%, contract expiration <90 days with score <50
- [ ] Medium priority alerts trigger for: >3 support tickets in 7 days, no feature usage in 30 days
- [ ] Cooldown periods prevent duplicate alerts within 24 hours for same customer/type
- [ ] Alert prioritization considers customer ARR and urgency
- [ ] Deduplication logic prevents multiple alerts for same issue
- [ ] Alert history tracking stores all triggered alerts with timestamps
- [ ] TypeScript interfaces defined for Alert, AlertRule, AlertEngineResult
- [ ] Pure functions with comprehensive unit test coverage

**CustomerHealthDisplay Component**:
- [ ] Component renders with mock customer health data
- [ ] Overall health score displays prominently with correct color (red/yellow/green)
- [ ] Expandable breakdown panel shows all 4 factor scores with labels
- [ ] Loading state displays skeleton UI while calculating
- [ ] Error state shows user-friendly message with retry option
- [ ] Responsive design works at 320px (mobile), 768px (tablet), 1024px+ (desktop)
- [ ] Color transitions smooth when score updates (200-300ms animation)
- [ ] Accessibility: ARIA labels for score values, keyboard navigation for expand/collapse
- [ ] Touch targets minimum 44x44px for mobile interactions
- [ ] No console errors or warnings in browser

**PredictiveAlertsWidget Component**:
- [ ] Widget displays active alerts sorted by priority (high first) and timestamp
- [ ] Alert cards show priority badge, customer name, alert type, and message
- [ ] High priority alerts use red styling, medium priority use yellow
- [ ] Alert detail panel expands to show recommended actions
- [ ] Dismiss functionality works with confirmation dialog
- [ ] Historical alerts view shows past 7/30/90 days with filter controls
- [ ] Empty state displays when no active alerts
- [ ] Real-time updates when new alerts generated
- [ ] Responsive design adapts card layout to screen size
- [ ] Accessibility: ARIA announcements for new alerts, keyboard navigation, focus management
- [ ] No console errors or warnings in browser

**Integration with CustomerSelector**:
- [ ] Health score updates in real-time when customer selection changes
- [ ] Alert count badge appears on customer cards with active alerts
- [ ] Selected customer's alerts highlighted in PredictiveAlertsWidget
- [ ] Smooth transitions without layout shift (CLS = 0)
- [ ] Dashboard layout maintains responsive design with new widgets
- [ ] Color coding consistent across all health indicators

**Testing and Validation**:
- [ ] Unit tests cover all calculation functions with >90% code coverage
- [ ] Edge case tests for boundary conditions (score 0, 30, 70, 100)
- [ ] Realistic customer data scenarios tested (healthy, warning, critical)
- [ ] Mathematical accuracy verified (weighted calculation produces expected results)
- [ ] Error handling tests for invalid inputs
- [ ] Alert rule logic tests for all 5 alert types
- [ ] Performance tests confirm <5ms calculation, <10ms alert evaluation
- [ ] Integration tests verify component communication

**Security and Performance**:
- [ ] Input validation rejects negative values, out-of-range data
- [ ] No sensitive customer data in client-side logs or error messages
- [ ] XSS prevention: all customer data sanitized before display
- [ ] Rate limiting prevents alert spam (max 10 alerts per customer per day)
- [ ] Audit trail logs all alert dismissals and actions
- [ ] Performance budgets met: calculation <5ms, rendering <16ms
- [ ] No memory leaks during repeated calculations or alert updates

**Documentation and Code Quality**:
- [ ] JSDoc comments on all public functions explaining business logic
- [ ] README section documenting health scoring algorithm and rationale
- [ ] Inline comments for complex mathematical calculations
- [ ] TypeScript interfaces fully documented with field descriptions
- [ ] Examples provided for mock data usage
- [ ] Error handling documented with expected error types
- [ ] A/B testing considerations documented for algorithm refinement
