# Spec: Health Score Calculator System

## Feature: Health Score Calculator

### Context
- **Purpose**: Comprehensive customer health scoring system that provides predictive analytics for customer relationship health and churn risk assessment
- **Role in application**: Core business logic engine that calculates health scores and powers the CustomerHealthDisplay widget on the dashboard
- **Users**: Customer success managers and account executives who need data-driven insights into customer health to proactively manage relationships and reduce churn
- **Usage scenario**: Automatically calculates health scores when customers are selected, displays real-time health metrics with factor breakdowns, and provides actionable risk level indicators
- **System fit**: Integrates with CustomerSelector to provide health scores for each customer, demonstrates AI collaboration for complex algorithm development

### Requirements

#### Functional Requirements - Core Algorithm

**Multi-factor Scoring System**:
- Calculate customer health scores on 0-100 scale
- Four weighted factors:
  - Payment History: 40% weight
  - Engagement Metrics: 30% weight
  - Contract Status: 20% weight
  - Support Satisfaction: 10% weight
- Risk level classification:
  - **Healthy**: 71-100 (green)
  - **Warning**: 31-70 (yellow)
  - **Critical**: 0-30 (red)

**Pure Function Architecture**:
- Individual scoring functions for each factor (pure functions, no side effects)
- Main `calculateHealthScore` function combining all factors
- Input validation for all data inputs with descriptive errors
- Normalization strategies for different data types and ranges
- Edge case handling for new customers and missing data
- Trend analysis consideration for improving vs declining customers

**Calculation Functions** (in `lib/healthCalculator.ts`):
1. `calculatePaymentScore(paymentData)`: Payment history analysis
2. `calculateEngagementScore(engagementData)`: User engagement metrics
3. `calculateContractScore(contractData)`: Contract health evaluation
4. `calculateSupportScore(supportData)`: Support satisfaction assessment
5. `calculateHealthScore(allFactors)`: Main function combining all scores
6. `getRiskLevel(score)`: Risk classification helper

#### Functional Requirements - Data Inputs

**Payment History Data**:
- `daysSinceLastPayment: number` (0-365)
- `averagePaymentDelay: number` (days, can be negative for early payment)
- `overdueAmount: number` (currency amount)
- `totalPayments: number` (count of payments made)

**Engagement Metrics**:
- `loginFrequency: number` (logins per month)
- `featureUsageCount: number` (distinct features used)
- `lastLoginDays: number` (days since last login)
- `activeUsers: number` (active users in organization)

**Contract Information**:
- `daysUntilRenewal: number` (can be negative if overdue)
- `contractValue: number` (annual contract value)
- `recentUpgrades: boolean` (upgrades in last 90 days)
- `contractLength: number` (months)

**Support Data**:
- `averageResolutionTime: number` (hours)
- `satisfactionScore: number` (1-5 scale)
- `escalationCount: number` (escalations in last 90 days)
- `openTickets: number` (currently open support tickets)

#### Functional Requirements - UI Component

**CustomerHealthDisplay Widget**:
- Display overall health score prominently with large numeric display
- Show risk level with color-coded badge (Healthy/Warning/Critical)
- Expandable breakdown section showing all four factor scores
- Individual factor score bars with percentages
- Loading state during calculation
- Error state for calculation failures
- Tooltip/info icons explaining each factor
- Responsive design matching dashboard patterns
- Integration with CustomerSelector for real-time updates

#### User Interface Requirements

**Main Display**:
- Large health score number (48px font size, bold)
- Risk level badge positioned near score
- Color coding matching health score standards:
  - Green (#22c55e): Healthy
  - Yellow (#eab308): Warning
  - Red (#ef4444): Critical
- Card-based layout with clean borders and shadows
- Expandable/collapsible factor breakdown section

**Factor Breakdown**:
- Four horizontal progress bars for each factor
- Factor name, score percentage, and visual bar
- Bar colors matching overall health color scheme
- Subtle animations on expand/collapse
- Clear visual hierarchy with proper spacing

**States**:
- **Loading**: Skeleton loader or spinner during calculation
- **Success**: Full display with all scores
- **Error**: Error message with retry option
- **No Data**: Empty state when customer has insufficient data

#### Data Requirements

**TypeScript Interfaces** (exported from `lib/healthCalculator.ts`):

```typescript
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
  satisfactionScore: number; // 1-5
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
```

**Component Props**:
```typescript
export interface CustomerHealthDisplayProps {
  customerId: string;
  healthData: CustomerHealthData;
  onError?: (error: Error) => void;
  className?: string;
}
```

#### Integration Requirements

- Import Customer type from `@/data/mock-customers`
- Extend Customer interface with healthData property (optional)
- Create mock health data generator function in `@/data/mock-customers`
- CustomerHealthDisplay integrates with CustomerSelector via customer selection
- Use React hooks (useState, useEffect, useMemo) for efficient calculation
- Export all calculation functions for testing and reuse
- Error boundary integration for calculation failures

#### Accessibility Requirements

- Health score display has proper ARIA labels (`aria-label="Health score: 85 out of 100"`)
- Risk level badge has semantic color and text (not color-only indication)
- Expandable section uses proper ARIA attributes:
  - `aria-expanded` on toggle button
  - `aria-controls` linking to content
- Factor breakdown accessible to screen readers with descriptive labels
- Keyboard navigation for expand/collapse functionality
- Focus management when expanding/collapsing sections
- Sufficient color contrast for all text and visual elements
- Tooltips accessible via keyboard (focus trigger)

### Constraints

#### Technical Stack
- TypeScript with strict mode for all calculation functions and interfaces
- React 19 with hooks (useState, useEffect, useMemo)
- Mark CustomerHealthDisplay as client component (`'use client'`)
- Tailwind CSS v4 for all styling
- No external calculation libraries - pure TypeScript implementation

#### Performance Requirements

**Calculation Performance**:
- Individual factor calculation: < 1ms per function
- Overall health score calculation: < 5ms total
- Real-time updates when customer selection changes
- Use `useMemo` for calculation caching
- Avoid unnecessary recalculations

**UI Performance**:
- Component rendering: < 16ms (60fps)
- Expand/collapse animations: smooth 60fps transitions
- Loading state displays within 100ms
- First paint: < 50ms

**Optimization**:
- Memoize calculation results for same input data
- Lazy calculate factor breakdown (only when expanded)
- Debounce updates if data changes rapidly
- Efficient data structures minimizing object creation

#### Design Constraints

**Layout**:
- Card-based design with rounded corners (rounded-lg)
- Padding: 1.5rem (p-6) for card content
- Maximum width: 400px for health display widget
- Responsive behavior: full width on mobile, fixed width on desktop
- Margin/spacing consistent with other dashboard widgets

**Typography**:
- Health score: text-5xl (48px), font-bold
- Risk level badge: text-sm (14px), font-semibold
- Factor labels: text-base (16px), font-medium
- Factor scores: text-sm (14px), font-normal

**Colors**:
- Follow health score color coding (red/yellow/green)
- Use Tailwind color utilities (green-500, yellow-500, red-500)
- Neutral grays for borders and backgrounds
- Proper contrast ratios (WCAG AA minimum)

**Animations**:
- Expand/collapse transition: 200ms ease-in-out
- Progress bar fill animations: 300ms ease-out
- No motion for users with prefers-reduced-motion

#### File Structure and Naming

**Calculation Library**:
- Location: `src/lib/healthCalculator.ts`
- Export all interfaces and functions as named exports
- Group related functions with JSDoc comments

**UI Component**:
- Location: `src/components/CustomerHealthDisplay.tsx`
- Default export: CustomerHealthDisplay component
- Named export: CustomerHealthDisplayProps interface

**Mock Data**:
- Add health data generation to `src/data/mock-customers.ts`
- Function: `generateMockHealthData(customerId: string): CustomerHealthData`

**Tests** (if implemented):
- Location: `src/lib/__tests__/healthCalculator.test.ts`
- Component tests: `src/components/__tests__/CustomerHealthDisplay.test.tsx`

#### Algorithm Design Specifications

**Payment Score Calculation** (40% weight):
- Days since last payment: 0-7 days = 100%, 8-30 = 80%, 31-60 = 50%, 60+ = 0%
- Average payment delay: Early = +10%, On-time = 0%, Late = -20%
- Overdue amount: None = 100%, < $1000 = 70%, $1000-$5000 = 40%, > $5000 = 0%
- Normalize to 0-100 scale

**Engagement Score Calculation** (30% weight):
- Login frequency: > 20/month = 100%, 10-20 = 75%, 5-10 = 50%, < 5 = 25%
- Feature usage: > 10 features = 100%, 5-10 = 70%, 2-5 = 40%, < 2 = 20%
- Last login: < 7 days = 100%, 7-14 = 75%, 14-30 = 50%, > 30 = 0%
- Active users ratio: Consider total licensed seats
- Normalize to 0-100 scale

**Contract Score Calculation** (20% weight):
- Days until renewal: > 90 days = 100%, 30-90 = 80%, 0-30 = 50%, overdue = 20%
- Contract value: Higher value = higher priority consideration
- Recent upgrades: Yes = +15% bonus
- Normalize to 0-100 scale

**Support Score Calculation** (10% weight):
- Average resolution time: < 24hrs = 100%, 24-48 = 80%, 48-72 = 60%, > 72 = 40%
- Satisfaction score: 5 = 100%, 4 = 80%, 3 = 60%, 2 = 40%, 1 = 20%
- Escalations: 0 = 100%, 1-2 = 70%, 3-5 = 40%, > 5 = 0%
- Open tickets: 0 = 100%, 1-3 = 80%, 4-7 = 60%, > 7 = 30%
- Normalize to 0-100 scale

**Weighted Combination**:
```
overallScore = (paymentScore * 0.40) +
               (engagementScore * 0.30) +
               (contractScore * 0.20) +
               (supportScore * 0.10)
```

**Input Validation**:
- Validate all numeric inputs are within expected ranges
- Handle null/undefined values with defaults or errors
- Throw descriptive errors for invalid data (use custom Error classes)
- Document all assumptions and edge cases

#### Props Interface and TypeScript Definitions

See Data Requirements section above for complete interface definitions.

#### Security Considerations

- Validate all input data at function boundaries
- No eval() or dynamic code execution
- Sanitize any customer data displayed in UI
- No sensitive financial data logged to console
- Error messages don't expose internal implementation details
- TypeScript strict mode prevents type-related vulnerabilities

### Acceptance Criteria

#### Core Algorithm
- [ ] `calculatePaymentScore` function implemented with proper weighting logic
- [ ] `calculateEngagementScore` function implemented with normalization
- [ ] `calculateContractScore` function implemented with renewal consideration
- [ ] `calculateSupportScore` function implemented with satisfaction metrics
- [ ] `calculateHealthScore` combines all factors with correct weights (40/30/20/10)
- [ ] `getRiskLevel` correctly classifies scores (Healthy/Warning/Critical)
- [ ] All calculation functions are pure (no side effects)
- [ ] Input validation throws descriptive errors for invalid data
- [ ] Edge cases handled: missing data, new customers, negative values

#### TypeScript and Code Quality
- [ ] All interfaces exported from `lib/healthCalculator.ts`
- [ ] TypeScript strict mode passes with no errors
- [ ] JSDoc comments explain business logic and formulas
- [ ] Function signatures clearly document parameters and return types
- [ ] No `any` types used
- [ ] Custom error classes for validation failures

#### UI Component
- [ ] CustomerHealthDisplay component renders with mock data
- [ ] Overall health score displays prominently with correct color
- [ ] Risk level badge shows correct classification
- [ ] Factor breakdown section expands/collapses smoothly
- [ ] All four factor scores display with progress bars
- [ ] Loading state displays during calculation
- [ ] Error state displays with proper error messages
- [ ] Component integrates with CustomerSelector

#### Visual Design
- [ ] Color coding matches specification (green/yellow/red)
- [ ] Typography sizes match design constraints
- [ ] Card layout with proper padding and spacing
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Animations smooth and performant (60fps)
- [ ] No layout shift during expand/collapse

#### Accessibility
- [ ] Health score has proper ARIA labels
- [ ] Risk level badge uses semantic text + color
- [ ] Expand/collapse uses proper ARIA attributes
- [ ] Keyboard navigation works for all interactions
- [ ] Screen readers announce all important information
- [ ] Color contrast meets WCAG AA standards
- [ ] Tooltips accessible via keyboard focus

#### Performance
- [ ] Individual factor calculations complete in < 1ms
- [ ] Overall calculation completes in < 5ms
- [ ] Component renders in < 16ms
- [ ] useMemo prevents unnecessary recalculations
- [ ] No console warnings or errors

#### Integration
- [ ] Mock health data generator added to `mock-customers.ts`
- [ ] Component receives customer data via props
- [ ] Real-time updates when customer selection changes
- [ ] Error handling integrated with parent component
- [ ] Works with existing CustomerSelector component

#### Testing (if implemented)
- [ ] Unit tests for all calculation functions
- [ ] Edge case tests for boundary conditions
- [ ] Input validation tests with invalid data
- [ ] Mathematical accuracy verification
- [ ] Component rendering tests
- [ ] Integration tests with mock data

#### Documentation
- [ ] JSDoc comments explain all business logic
- [ ] Algorithm weighting rationale documented
- [ ] Edge case handling documented
- [ ] Assumptions clearly stated in code comments
- [ ] README or inline comments explain calculation methodology
