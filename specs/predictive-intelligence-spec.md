# Spec Template for Workshop

## Feature: Predictive Intelligence Platform

### Context

**Purpose**: The Predictive Intelligence Platform is an integrated system that combines internal customer health monitoring with external market intelligence to provide proactive, context-aware alerts and insights. It serves as the "early warning system" of the Customer Intelligence Dashboard, enabling customer success teams to identify risks and opportunities before they become critical issues.

**System Integration**: This feature integrates two complementary intelligence subsystems:
1. **Predictive Alerts Engine** - Internal monitoring system analyzing customer behavior patterns, health scores, payment history, and engagement metrics
2. **Market Intelligence Service** - External signal monitoring analyzing news sentiment, market trends, and company-specific market conditions

These systems work together to provide:
- Context-enriched alerts (e.g., "Payment delayed AND negative company news")
- Market-triggered proactive outreach opportunities (e.g., "Positive funding announcement")
- Risk amplification detection (internal health issues + external market pressures)
- Intelligent alert prioritization considering both internal and external factors

**Users and Usage**: Customer success managers and account executives will use this platform to:
- Receive proactive alerts about at-risk customers with full context
- Understand external market factors affecting customer behavior
- Prioritize outreach based on combined internal and external signals
- Identify opportunities for expansion or upsell based on customer company success
- Monitor portfolio health with comprehensive predictive analytics

**Educational Context**: This feature demonstrates advanced AI collaboration for complex rule design, reactive and proactive AI features, API integration patterns, service layer architecture, and multi-signal analytics.

### Requirements

#### Functional Requirements

**Predictive Alerts Engine** (`src/lib/alerts.ts`, `src/services/alertsService.ts`):
- Multi-tier alert priority system: **Critical**, **High**, **Medium** (expanded from original two tiers)
- Rule-based triggering with configurable thresholds and conditions
- Alert types with specific triggering conditions:

  **Critical Priority Alerts** (immediate action required + external signals):
  - **Market-Amplified Payment Risk**: Payment overdue >30 days AND negative company sentiment
  - **Dual-Signal Churn Risk**: Health score <30 AND negative market news in last 7 days

  **High Priority Alerts** (immediate action required):
  - **Payment Risk**: Payment overdue >30 days OR health score drops >20 points in 7 days
  - **Engagement Cliff**: Login frequency drops >50% compared to 30-day average
  - **Contract Expiration Risk**: Contract expires in <90 days AND health score <50

  **Medium Priority Alerts** (monitor closely):
  - **Support Ticket Spike**: >3 support tickets in 7 days OR escalated ticket
  - **Feature Adoption Stall**: No new feature usage in 30 days for growing accounts

  **Opportunity Alerts** (new category):
  - **Market Opportunity**: Positive company news (funding, growth) + healthy customer (score >70)
  - **Expansion Signal**: High engagement (>30% increase) + contract renewal approaching

- Alert enrichment with market context:
  - Fetch market sentiment for customer's company when alert triggers
  - Include relevant news headlines in alert details
  - Calculate risk amplification score (internal + external signals)
- Alert prioritization algorithm considering:
  - Customer ARR (higher value = higher priority)
  - Alert severity (critical > high > medium)
  - Market sentiment impact (negative amplifies, positive may reduce priority)
  - Alert recency and frequency
  - Team workload balancing
- Cooldown periods to prevent alert fatigue:
  - Critical alerts: 12-hour cooldown per customer/type
  - High alerts: 24-hour cooldown per customer/type
  - Medium alerts: 48-hour cooldown per customer/type
  - Opportunity alerts: 7-day cooldown per customer/type
- Deduplication logic to prevent multiple alerts for same issue
- Alert history and audit trail tracking

**Market Intelligence Service** (`src/services/marketIntelligenceService.ts`, `src/app/api/market-intelligence/[company]/route.ts`):
- Next.js API Route Handler: `GET /api/market-intelligence/[company]`
- MarketIntelligenceService class with caching layer:
  - 10-minute TTL cache for market data (prevents excessive API calls)
  - Cache invalidation on demand
  - Memory-efficient cache storage (LRU eviction for >100 companies)
- Mock data generation for workshop reliability:
  - Company-specific realistic news headlines (5-10 headlines per company)
  - Sentiment analysis (positive/neutral/negative with confidence scores)
  - Publication dates (last 30 days)
  - News sources (Reuters, Bloomberg, TechCrunch, etc.)
  - Deterministic generation (same company = same headlines per cache period)
- API response format:
```typescript
{
  company: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
  newsCount: number;
  headlines: Array<{
    title: string;
    source: string;
    publishedAt: Date;
    sentiment: 'positive' | 'neutral' | 'negative';
    url?: string; // For future real API integration
  }>;
  lastUpdated: Date;
  cached: boolean;
}
```
- Input validation and sanitization:
  - Company name validation (alphanumeric, spaces, hyphens only)
  - Maximum length limits (100 characters)
  - SQL injection and XSS prevention
- Error handling with custom MarketIntelligenceError class
- Rate limiting: 30 requests per minute per client

**Data Monitoring and Evaluation System** (`src/lib/monitoringEngine.ts`):
- Real-time monitoring of customer health score changes
- Pattern analysis for behavior changes:
  - Login behavior tracking (gradual vs sudden drops)
  - Payment timing and behavior change detection
  - Support satisfaction trends and ticket escalation monitoring
  - Feature usage depth and adoption pattern tracking
- Market signal monitoring:
  - Periodic market data refresh for active customers (every 10 minutes)
  - Sentiment change detection (positive → negative transitions)
  - Breaking news identification (new headlines since last check)
- Combined signal evaluation:
  - Correlation analysis between internal metrics and market sentiment
  - Risk amplification calculation (multiplicative effect of negative signals)
  - Opportunity scoring (internal health + positive market signals)
- Alert generation pipeline:
  - Evaluate all rules against current customer state
  - Enrich triggered alerts with market context
  - Apply prioritization algorithm
  - Execute cooldown and deduplication logic
  - Persist alerts to history

**Integration Layer** (`src/lib/intelligenceIntegration.ts`):
- Unified interface combining alerts and market intelligence
- Cross-system data enrichment:
  - Add market sentiment to customer records
  - Include health scores in market intelligence displays
  - Link alerts to relevant market news
- Real-time update coordination:
  - Health score changes trigger market data refresh
  - New market data triggers alert re-evaluation
  - Batch processing for efficiency (process multiple customers together)

#### User Interface Requirements

**PredictiveIntelligenceWidget Component** (`src/components/PredictiveIntelligenceWidget.tsx`):
- Primary dashboard widget integrating alerts and market intelligence
- Three-panel layout:

  **1. Active Alerts Panel** (left, 40% width):
  - Alert cards sorted by priority (Critical → High → Medium → Opportunity)
  - Priority badge with color coding:
    - Critical: Red with urgent icon
    - High: Orange with warning icon
    - Medium: Yellow with info icon
    - Opportunity: Green with growth icon
  - Alert card content:
    - Customer name (linked to customer detail)
    - Alert type and message
    - Triggered timestamp (relative: "2 hours ago")
    - Market context indicator (icon showing if market-enriched)
    - Quick action buttons (View Details, Dismiss, Take Action)
  - Alert count summary at top ("3 Critical, 5 High, 8 Medium")
  - Empty state when no active alerts ("All customers healthy")

  **2. Alert Detail Panel** (center, 35% width, conditional):
  - Appears when alert card clicked
  - Full alert information:
    - Detailed triggering conditions
    - Historical context (score trend chart, engagement graph)
    - Market intelligence context (if applicable):
      - Company sentiment badge
      - Top 3 relevant headlines
      - Sentiment change indicator
    - Recommended actions (prioritized list):
      - "Schedule check-in call"
      - "Review payment status"
      - "Offer technical support"
    - Related alerts (other alerts for same customer)
  - Action tracking:
    - Action taken dropdown (call scheduled, email sent, issue resolved)
    - Notes field for context
    - "Dismiss Alert" button with confirmation
  - Close button to return to alert list

  **3. Market Intelligence Summary** (right, 25% width):
  - Selected customer's market context (if customer selected)
  - Company name with logo placeholder
  - Overall sentiment with large color-coded badge:
    - Positive: Green with upward arrow
    - Neutral: Gray with horizontal line
    - Negative: Red with downward arrow
  - Sentiment score display (e.g., "+0.65" with confidence)
  - News count and last updated timestamp
  - Top 3 headlines with:
    - Headline text (truncated to 60 characters)
    - Source and date
    - Sentiment icon (small indicator)
  - "View All News" button expanding to full news list
  - Refresh button to bypass cache
  - Loading state with skeleton UI
  - Error state with retry option

**MarketIntelligenceWidget Component** (`src/components/MarketIntelligenceWidget.tsx`):
- Standalone widget for detailed market intelligence
- Company search/selection input:
  - Autocomplete from customer list
  - Manual company name entry (for non-customers)
  - Validation and sanitization
- Expanded market intelligence display:
  - Overall sentiment with detailed breakdown
  - Sentiment trend chart (last 30 days, if available)
  - Full headline list with filters:
    - Filter by sentiment (all/positive/neutral/negative)
    - Sort by date or relevance
  - Headline cards with:
    - Full headline text
    - Source logo/name
    - Publication date (absolute and relative)
    - Sentiment badge
    - Expand for summary (future: actual article summary)
- Export functionality:
  - Export market intelligence report (CSV/JSON)
  - Date range selection
  - Include sentiment analysis
- Loading states:
  - Skeleton UI for initial load
  - Shimmer animation during data fetch
- Error states:
  - Company not found message
  - API error with retry button
  - No news available message

**AlertHistoryView Component** (`src/components/AlertHistoryView.tsx`):
- Historical alert dashboard for analytics
- Filter controls:
  - Date range picker (last 7/30/90 days, custom)
  - Priority filter (all/critical/high/medium/opportunity)
  - Customer filter (multi-select dropdown)
  - Status filter (active/dismissed/resolved)
  - Alert type filter (payment, engagement, contract, etc.)
- Alert history table:
  - Columns: Customer, Alert Type, Priority, Triggered At, Status, Action Taken, Resolved At
  - Sortable columns
  - Row click expands to show full details
  - Pagination (25 per page)
- Analytics summary cards:
  - Total alerts generated
  - Average resolution time
  - Alerts by priority (breakdown)
  - Most common alert types
  - Alert resolution rate
- Export historical data (CSV/JSON)

**Integration with CustomerSelector**:
- Real-time market intelligence fetch when customer selected
- Alert count badge on customer cards (shows active alert count)
- Priority indicator (red dot for critical, orange for high)
- Customer health score considers market sentiment (optional weighting)
- Smooth transitions when switching customers

#### Data Requirements

**Alert Data Structures**:
```typescript
interface Alert {
  id: string;
  customerId: string;
  customerName: string;
  customerARR: number;

  // Alert classification
  type: 'payment_risk' | 'engagement_cliff' | 'contract_expiration' |
        'support_spike' | 'adoption_stall' | 'market_opportunity' |
        'dual_signal_churn' | 'market_amplified_payment';
  priority: 'critical' | 'high' | 'medium' | 'opportunity';

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
  evaluationContext: Record<string, any>;
  cooldownUntil: Date;
}

interface AlertRule {
  id: string;
  name: string;
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'opportunity';

  // Rule definition
  condition: (customer: CustomerHealthData, marketData?: MarketIntelligence) => boolean;
  message: (customer: CustomerHealthData) => string;
  detailedMessage: (customer: CustomerHealthData, marketData?: MarketIntelligence) => string;

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
```

**Market Intelligence Data Structures**:
```typescript
interface MarketIntelligence {
  company: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0

  newsCount: number;
  headlines: MarketHeadline[];

  // Metadata
  lastUpdated: Date;
  cached: boolean;
  source: 'mock' | 'api'; // For future real API integration
}

interface MarketHeadline {
  id: string;
  title: string;
  source: string;
  publishedAt: Date;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  url?: string;
  summary?: string; // For future enhancement
}

interface MarketCache {
  company: string;
  data: MarketIntelligence;
  cachedAt: Date;
  expiresAt: Date;
}
```

**Monitoring Data Structures**:
```typescript
interface CustomerState {
  customerId: string;
  healthData: CustomerHealthData;
  marketData?: MarketIntelligence;
  lastEvaluated: Date;
  activeAlerts: Alert[];
  alertHistory: Alert[];
}

interface MonitoringResult {
  evaluatedCustomers: number;
  triggeredAlerts: Alert[];
  suppressedDuplicates: number;
  marketDataRefreshed: number;
  evaluationDuration: number; // ms
  errors: Array<{ customerId: string; error: string }>;
}
```

#### Integration Requirements

- Seamless integration with existing CustomerSelector component
- Integration with CustomerHealthDisplay for health score data
- Real-time data synchronization:
  - Health score changes trigger alert re-evaluation
  - Market data updates trigger combined signal analysis
  - Alert dismissals update UI immediately
- API integration patterns:
  - REST API for market intelligence data
  - WebSocket consideration for real-time alerts (future enhancement)
  - Polling strategy for market data (every 10 minutes for active customers)
- Data flow:
  1. Customer selection → Fetch health data + market data
  2. Health score calculation → Trigger alert evaluation
  3. Alert evaluation → Enrich with market context
  4. Alert display → Show in PredictiveIntelligenceWidget
  5. User action → Update alert status, log to history

### Constraints

#### Technical Stack and Frameworks
- **Next.js 15** with App Router and Route Handlers
- **React 19** with Server Components and `'use client'` for interactive widgets
- **TypeScript** strict mode with comprehensive interfaces
- **Tailwind CSS v4** utility classes (no separate CSS files)
- **Next.js API Routes** for market intelligence endpoints
- Pure function architecture for alert rules and evaluation logic
- Service layer pattern for data management (MarketIntelligenceService, AlertsService)

#### Performance Requirements
- Alert evaluation: < 10ms per customer (support 100+ customers)
- Market intelligence API: < 200ms response time (with caching)
- UI rendering: < 16ms for 60fps (smooth animations)
- Alert list rendering: < 100ms for 50+ alerts (use virtualization if needed)
- Market data cache hit rate: >90% (reduce redundant fetches)
- Real-time update latency: < 500ms from data change to UI update
- Memory usage: < 5MB for alert engine + market cache
- No memory leaks during continuous monitoring (24+ hours)

#### Design Constraints
- Responsive breakpoints: mobile 320px+, tablet 768px+, desktop 1024px+
- Three-panel layout on desktop, stacked panels on mobile/tablet
- Color coding consistency:
  - Critical: Red (#DC2626)
  - High: Orange (#EA580C)
  - Medium: Yellow (#CA8A04)
  - Opportunity: Green (#16A34A)
  - Positive sentiment: Green
  - Neutral sentiment: Gray (#6B7280)
  - Negative sentiment: Red
- Alert card maximum width: 400px
- Headline truncation: 60 characters with ellipsis
- Minimum touch target: 44x44px
- Loading states use skeleton UI matching final content
- Smooth transitions: 200-300ms for panel slides, 150ms for color changes

#### File Structure and Naming Conventions
```
src/
├── app/
│   └── api/
│       └── market-intelligence/
│           └── [company]/
│               └── route.ts             # Next.js Route Handler
├── components/
│   ├── PredictiveIntelligenceWidget.tsx # Main integrated widget
│   ├── MarketIntelligenceWidget.tsx     # Standalone market widget
│   ├── AlertHistoryView.tsx             # Historical analytics
│   ├── AlertCard.tsx                    # Individual alert display
│   ├── AlertDetailPanel.tsx             # Alert detail view
│   └── MarketSentimentBadge.tsx         # Reusable sentiment display
├── services/
│   ├── marketIntelligenceService.ts     # Market data service
│   ├── alertsService.ts                 # Alert management service
│   └── monitoringService.ts             # Monitoring coordination
├── lib/
│   ├── alerts.ts                        # Alert rules engine (pure functions)
│   ├── monitoringEngine.ts              # Evaluation logic
│   ├── intelligenceIntegration.ts       # Cross-system integration
│   └── marketDataGenerator.ts           # Mock data generation
├── types/
│   ├── alerts.ts                        # Alert type definitions
│   └── market.ts                        # Market intelligence types
└── data/
    └── mock-market-data.ts              # Sample market data
```

#### Props Interfaces and TypeScript Definitions

```typescript
// PredictiveIntelligenceWidget.tsx
export interface PredictiveIntelligenceWidgetProps {
  customerId?: string; // Optional: shows all alerts if not provided
  alerts: Alert[];
  marketData?: MarketIntelligence;
  onDismissAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string, action: string, notes?: string) => void;
  onRefreshMarketData: (company: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

// MarketIntelligenceWidget.tsx
export interface MarketIntelligenceWidgetProps {
  company?: string; // Optional: for standalone use
  data?: MarketIntelligence; // Optional: can fetch internally
  onCompanyChange?: (company: string) => void;
  showSearch?: boolean; // Show company search input
  expandable?: boolean; // Allow full-screen expansion
}

// AlertCard.tsx
export interface AlertCardProps {
  alert: Alert;
  selected?: boolean;
  onClick?: () => void;
  onDismiss?: (alertId: string) => void;
  onQuickAction?: (alertId: string, action: string) => void;
  compact?: boolean; // Compact mode for mobile
}

// AlertDetailPanel.tsx
export interface AlertDetailPanelProps {
  alert: Alert;
  customerHealthData: CustomerHealthData;
  marketData?: MarketIntelligence;
  onResolve: (action: string, notes?: string) => void;
  onDismiss: () => void;
  onClose: () => void;
}
```

#### Security Considerations
- **Input Validation**: Company name validation (alphanumeric + spaces/hyphens, max 100 chars)
- **Input Sanitization**: Sanitize all user inputs before API calls or display
- **XSS Prevention**: Sanitize market headlines before rendering (DOMPurify)
- **SQL Injection Prevention**: Parameterized queries if database used (future)
- **Rate Limiting**:
  - Market intelligence API: 30 requests/minute per client
  - Alert actions: 60 requests/minute per user
- **Error Message Sanitization**: Never expose internal details in error messages
- **Data Privacy**: No PII in market intelligence logs or error messages
- **API Key Security**: Placeholder for future real API integration (environment variables)
- **CORS Configuration**: Restrict API access to same origin

#### Algorithm Design Specifications
- Pure functions for all alert rules (deterministic, testable)
- Alert prioritization algorithm:
  ```
  priority_score = (base_priority * customer_ARR_weight) + market_amplification

  base_priority:
    - Critical: 1000
    - High: 500
    - Medium: 100
    - Opportunity: 50

  customer_ARR_weight:
    - Enterprise (>$100k): 2.0
    - Premium ($50k-$100k): 1.5
    - Basic (<$50k): 1.0

  market_amplification:
    - Negative sentiment + internal issue: +200
    - Positive sentiment + opportunity: +100
    - Neutral or no market data: 0
  ```
- Cache eviction strategy: LRU (Least Recently Used) with 100-company limit
- Cooldown calculation: Exponential backoff for repeated alerts (2x cooldown after 3 occurrences)

### Acceptance Criteria

**Predictive Alerts Engine**:
- [ ] All 8 alert types (5 original + 3 new) trigger correctly based on conditions
- [ ] Critical alerts trigger for market-amplified risks (internal + external signals)
- [ ] High priority alerts trigger for internal issues (payment, engagement, contract)
- [ ] Medium priority alerts trigger for monitoring situations (support, adoption)
- [ ] Opportunity alerts trigger for positive signals (market + high health)
- [ ] Alert prioritization algorithm considers ARR, severity, and market sentiment
- [ ] Cooldown periods prevent duplicate alerts (12h/24h/48h/7d based on priority)
- [ ] Deduplication logic prevents multiple alerts for same customer/issue
- [ ] Alert history tracks all triggered alerts with timestamps and actions
- [ ] Alert evaluation completes in <10ms per customer
- [ ] TypeScript strict mode passes with no type errors
- [ ] Pure functions with no side effects (deterministic output)

**Market Intelligence Service**:
- [ ] Next.js API route `/api/market-intelligence/[company]` returns valid JSON
- [ ] API response includes sentiment, news count, headlines, and timestamps
- [ ] API responds in <200ms (with cache hit)
- [ ] Cache stores data for 10 minutes before expiration
- [ ] Cache hit rate >90% for repeated queries
- [ ] Mock data generation produces realistic, deterministic headlines
- [ ] Input validation rejects invalid company names (special characters, >100 chars)
- [ ] Input sanitization prevents XSS and injection attacks
- [ ] Rate limiting enforces 30 requests/minute limit
- [ ] Error handling returns appropriate HTTP status codes (400, 429, 500)
- [ ] MarketIntelligenceService class follows service layer patterns
- [ ] Custom MarketIntelligenceError class properly categorizes errors
- [ ] TypeScript interfaces defined for all data structures

**Market Data Enrichment**:
- [ ] Alerts automatically enriched with market context when applicable
- [ ] Market sentiment included in alert details for relevant customers
- [ ] Top 3 relevant headlines attached to market-enriched alerts
- [ ] Risk amplification score calculated for negative sentiment + internal issues
- [ ] Market context fetched only when alert rule requires it (performance optimization)
- [ ] Enrichment process doesn't block alert generation (async)
- [ ] Failed market data fetch doesn't prevent alert from triggering

**PredictiveIntelligenceWidget Component**:
- [ ] Widget renders with three-panel layout on desktop (40%/35%/25% widths)
- [ ] Widget adapts to stacked layout on mobile/tablet (<1024px)
- [ ] Active Alerts panel displays all alerts sorted by priority
- [ ] Alert cards show priority badge with correct color (red/orange/yellow/green)
- [ ] Alert card displays customer name, type, message, timestamp, market indicator
- [ ] Alert count summary shows breakdown by priority
- [ ] Empty state displays when no active alerts
- [ ] Clicking alert card opens Alert Detail Panel in center
- [ ] Alert Detail Panel shows full information, historical context, market context
- [ ] Alert Detail Panel displays recommended actions in prioritized list
- [ ] Action tracking allows user to select action taken and add notes
- [ ] Dismiss button works with confirmation dialog
- [ ] Market Intelligence Summary shows selected customer's market context
- [ ] Sentiment badge displays with correct color and icon (green up/gray line/red down)
- [ ] Top 3 headlines display with source, date, and sentiment icon
- [ ] "View All News" button expands to full headline list
- [ ] Refresh button fetches fresh market data (bypasses cache)
- [ ] Loading states show skeleton UI for all sections
- [ ] Error states display user-friendly messages with retry options
- [ ] Responsive design works at 320px, 768px, 1024px+ breakpoints
- [ ] No console errors or warnings in browser

**MarketIntelligenceWidget Component**:
- [ ] Standalone widget renders independently
- [ ] Company search/selection input with autocomplete from customer list
- [ ] Manual company name entry works with validation
- [ ] Overall sentiment displays with detailed breakdown and trend chart
- [ ] Full headline list displays with all headlines (not just top 3)
- [ ] Filter by sentiment works (all/positive/neutral/negative)
- [ ] Sort by date or relevance works correctly
- [ ] Headline cards show full text, source, date, sentiment badge
- [ ] Export functionality generates CSV/JSON with market intelligence data
- [ ] Loading state shows skeleton UI with shimmer animation
- [ ] Error states handle "company not found", API errors, no news available
- [ ] Responsive design adapts to mobile/tablet/desktop layouts

**AlertHistoryView Component**:
- [ ] Historical alert dashboard displays all past alerts
- [ ] Date range filter works (last 7/30/90 days, custom range)
- [ ] Priority filter shows only selected priorities
- [ ] Customer filter (multi-select) filters to selected customers
- [ ] Status filter shows active/dismissed/resolved alerts
- [ ] Alert type filter shows only selected types
- [ ] Alert history table displays all columns correctly
- [ ] Sortable columns work (sort by customer, date, priority, etc.)
- [ ] Row click expands to show full alert details
- [ ] Pagination works correctly (25 alerts per page)
- [ ] Analytics summary cards show accurate metrics (total, avg resolution, breakdown)
- [ ] Export historical data generates CSV/JSON correctly

**Integration with CustomerSelector**:
- [ ] Selecting customer fetches market intelligence data automatically
- [ ] Alert count badge appears on customer cards showing active alert count
- [ ] Priority indicator (colored dot) shows highest priority alert for customer
- [ ] Smooth transition when switching between customers (<300ms)
- [ ] Market data loads without blocking UI interaction
- [ ] Customer health score optionally considers market sentiment (configurable weighting)

**Performance and Optimization**:
- [ ] Alert evaluation completes in <10ms per customer (tested with 100 customers)
- [ ] Market intelligence API responds in <200ms with cache hit
- [ ] UI rendering maintains 60fps (16ms per frame)
- [ ] Alert list renders in <100ms for 50+ alerts
- [ ] Market data cache hit rate >90% (measure over 30-minute session)
- [ ] Real-time updates appear in <500ms from data change
- [ ] Memory usage <5MB for alert engine and market cache combined
- [ ] No memory leaks during 24-hour continuous monitoring session
- [ ] Virtual scrolling implemented for alert lists >50 items (if needed)

**Security and Validation**:
- [ ] Company name validation rejects invalid characters and long strings
- [ ] Input sanitization prevents XSS attacks in company names and notes
- [ ] DOMPurify sanitizes all market headlines before rendering
- [ ] Rate limiting enforced on API (30 req/min) and alert actions (60 req/min)
- [ ] Error messages don't expose sensitive internal information
- [ ] No PII logged in market intelligence requests or error logs
- [ ] CORS configuration restricts API access to same origin
- [ ] Security headers configured (X-Frame-Options, X-Content-Type-Options)

**Accessibility**:
- [ ] WCAG 2.1 Level AA compliance verified with axe-core
- [ ] Keyboard navigation works for all alert interactions
- [ ] ARIA labels present on all interactive elements
- [ ] aria-live regions announce new alerts and status changes
- [ ] Color contrast meets 4.5:1 ratio for text, 3:1 for UI components
- [ ] Touch targets minimum 44x44px with 8px spacing
- [ ] Focus indicators visible on all focusable elements
- [ ] Screen reader announces alert priority, customer, and message

**Testing and Code Quality**:
- [ ] Unit tests cover all alert rules with >90% code coverage
- [ ] Unit tests cover market intelligence service and caching logic
- [ ] Integration tests verify alert enrichment with market data
- [ ] Edge case tests for boundary conditions (score thresholds, date ranges)
- [ ] Performance tests verify <10ms evaluation, <200ms API response
- [ ] Security tests verify input validation and sanitization
- [ ] Mock data generation tested for consistency and determinism
- [ ] TypeScript strict mode passes with no errors or `any` types
- [ ] JSDoc comments on all public functions explaining business logic
- [ ] Error handling tested for all failure scenarios

**Deployment and Monitoring**:
- [ ] API routes deployed and accessible at `/api/market-intelligence/[company]`
- [ ] Market intelligence cache persists correctly in production
- [ ] Alert evaluation runs continuously without crashes
- [ ] Error monitoring captures and logs all failures
- [ ] Performance monitoring tracks API response times and cache hit rates
- [ ] Health check endpoint verifies alert engine and market intelligence status
- [ ] Production logs sanitized (no sensitive data)
- [ ] Rate limiting configured correctly in production environment
