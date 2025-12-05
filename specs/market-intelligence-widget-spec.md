# Spec: Market Intelligence Widget

## Feature: Market Intelligence Widget

### Context
- **Purpose**: Real-time market sentiment and news analysis widget that provides intelligence about customer companies to help customer success teams stay informed about market conditions affecting their clients
- **Role in application**: Dashboard widget that fetches and displays company-specific market news, sentiment analysis, and intelligence data to support proactive customer relationship management
- **Users**: Customer success managers and account executives who need market context about their customers' companies to anticipate risks and identify opportunities
- **Usage scenario**: Automatically loads market intelligence when a customer is selected from CustomerSelector, displays sentiment indicators and relevant news headlines, updates periodically with cached data
- **System fit**: Integrates with main dashboard alongside CustomerHealthDisplay and other widgets, follows established widget patterns for consistency, demonstrates multi-layer architecture (API + Service + UI)

### Requirements

#### Functional Requirements - API Layer

**Next.js API Route** (`/api/market-intelligence/[company]`):
- Dynamic route handler using Next.js 15 App Router Route Handlers
- Accept company name as URL parameter (dynamic segment)
- Validate and sanitize company name input
- Return JSON response with consistent structure:
  ```typescript
  {
    company: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    newsCount: number;
    headlines: Array<{
      title: string;
      source: string;
      publishedAt: string;
      url: string;
    }>;
    lastUpdated: string;
  }
  ```
- Handle errors with appropriate HTTP status codes:
  - 400: Invalid company name
  - 404: Company not found
  - 500: Server/processing error
- Simulate realistic API delay (200-500ms) for authentic user experience
- Use mock data generation for reliable workshop demonstration
- Follow RESTful conventions and Next.js route handler patterns

**API Response Validation**:
- Company name must be non-empty string, 2-100 characters
- Sanitize special characters to prevent injection attacks
- Return top 5 headlines maximum
- Include cache headers for client-side caching
- Set appropriate Content-Type (application/json)

#### Functional Requirements - Service Layer

**MarketIntelligenceService Class** (`src/services/MarketIntelligenceService.ts`):
- Singleton pattern or module-based service
- Core methods:
  - `fetchMarketIntelligence(company: string): Promise<MarketIntelligenceData>`
  - `clearCache(company?: string): void`
  - `getCacheStats(): CacheStats`
- Implement caching with TTL (10-minute expiration)
- Cache key structure: `market-intel:${company.toLowerCase()}`
- Centralized error handling with custom `MarketIntelligenceError` class
- Pure function implementations for testability
- Mock data generation that produces consistent, realistic results

**Mock Data Generation**:
- Generate company-specific headlines (deterministic based on company name)
- Sentiment calculation based on headline analysis
- Realistic news sources (TechCrunch, Reuters, Bloomberg, WSJ, etc.)
- Publication dates within last 7 days
- URL generation for article links (mock URLs)

**Caching Strategy**:
- In-memory cache using Map or similar structure
- Cache entries include: data, timestamp, expiresAt
- Automatic cache cleanup on expiration
- Per-company caching (independent cache entries)
- Cache invalidation API for manual refresh

**Error Handling**:
- Custom `MarketIntelligenceError` extends Error
- Error types: ValidationError, NotFoundError, ServiceError
- Descriptive error messages without exposing sensitive information
- Retry logic for transient failures (optional)
- Graceful degradation when data unavailable

#### Functional Requirements - UI Component

**MarketIntelligenceWidget Component**:
- Display company name prominently with visual indicator
- Market sentiment badge with color coding:
  - **Positive**: Green background, "Positive" text
  - **Neutral**: Yellow/gray background, "Neutral" text
  - **Negative**: Red background, "Negative" text
- News article count display (e.g., "5 recent articles")
- Last updated timestamp (relative time format)
- Top 3 headlines displayed as a list with:
  - Headline title (truncated if > 80 characters)
  - News source
  - Publication date (relative format)
  - Clickable link (opens in new tab)
- Manual refresh button to force cache invalidation
- Loading state with skeleton loader or spinner
- Error state with retry button
- Empty state when no data available

**Interactive Features**:
- Auto-fetch when company prop changes
- Refresh button triggers new fetch and cache clear
- Headline links open in new tab with proper security attributes
- Hover states on interactive elements
- Smooth transitions between states

#### User Interface Requirements

**Layout and Structure**:
- Card-based design matching other dashboard widgets
- Header section: Company name + sentiment badge
- Metadata row: News count + last updated
- Headlines section: List of top 3 articles
- Footer section: Refresh button
- Responsive padding and spacing (p-6 for card, gap-4 for sections)

**Visual Design**:
- Sentiment badge styling:
  - Positive: `bg-green-100 text-green-800 border-green-300`
  - Neutral: `bg-gray-100 text-gray-800 border-gray-300`
  - Negative: `bg-red-100 text-red-800 border-red-300`
- Card styling: `border rounded-lg shadow-sm bg-white`
- Headlines: Hover effect with background color change
- Typography: Follow dashboard type scale
- Icons: Use consistent icon library (if available)

**States**:
- **Loading**: Skeleton loader with pulse animation
- **Success**: Full data display with all elements
- **Error**: Error message + retry button + error icon
- **Empty**: "No market intelligence available" message
- **Stale**: Indicator when cache is near expiration (optional)

**Responsive Design**:
- Mobile (< 768px): Full width, stacked layout
- Tablet (768px - 1023px): Half width in grid
- Desktop (≥ 1024px): Third width or quarter width in grid
- Headlines truncate gracefully on smaller screens
- Touch-friendly tap targets (44x44px minimum)

#### Data Requirements

**TypeScript Interfaces**:

```typescript
// src/types/market-intelligence.ts
export interface MarketIntelligenceHeadline {
  title: string;
  source: string;
  publishedAt: string; // ISO 8601 date string
  url: string;
}

export interface MarketIntelligenceData {
  company: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  newsCount: number;
  headlines: MarketIntelligenceHeadline[];
  lastUpdated: string; // ISO 8601 date string
}

export interface MarketIntelligenceResponse {
  success: boolean;
  data?: MarketIntelligenceData;
  error?: {
    message: string;
    code: string;
  };
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
}
```

**Component Props**:
```typescript
export interface MarketIntelligenceWidgetProps {
  company: string;
  onError?: (error: Error) => void;
  onDataLoaded?: (data: MarketIntelligenceData) => void;
  autoRefresh?: boolean; // Auto-refresh every 10 minutes
  className?: string;
}
```

#### Integration Requirements

**Dashboard Integration**:
- Add to main dashboard page (`src/app/page.tsx`)
- Receive company name from selected customer
- Position in dashboard grid layout
- Maintain responsive grid with other widgets
- Follow same prop-passing patterns as existing widgets

**Customer Integration**:
- Extract company name from selected Customer object
- Handle customer selection changes
- Update widget when new customer selected
- Show loading state during customer switch

**API Client Integration**:
- Use fetch API or custom HTTP client
- Handle API errors gracefully
- Implement request timeout (5 seconds)
- Parse JSON responses safely
- Use React hooks (useEffect, useState) for data fetching

**Service Layer Integration**:
- MarketIntelligenceService used by API route
- Service handles all business logic and caching
- API route is thin wrapper around service
- Service can be tested independently of API route

#### Accessibility Requirements

- Sentiment badge has semantic text (not color-only)
- ARIA labels for sentiment indicators
- Screen reader announcements for loading/error states
- Keyboard navigation for interactive elements:
  - Tab to headlines and refresh button
  - Enter/Space to activate links and buttons
- Focus visible states for all interactive elements
- Alt text for any icons used
- Semantic HTML structure (article, list elements)
- Sufficient color contrast for all text (WCAG AA)
- Error messages announced to screen readers
- Loading state announced with `aria-live="polite"`

### Constraints

#### Technical Stack
- Next.js 15 with App Router (Route Handlers for API)
- React 19 with hooks (useState, useEffect, useMemo)
- TypeScript strict mode for all code
- Tailwind CSS v4 for styling
- Mark UI component as client component (`'use client'`)
- No external API dependencies (mock data only)

#### Performance Requirements

**API Layer**:
- Route handler response time: < 100ms (with cache hit)
- Mock data generation: < 50ms
- API simulation delay: 200-500ms for realism
- JSON serialization: < 10ms

**Service Layer**:
- Cache lookup: < 1ms
- Cache expiration check: < 1ms
- Mock data generation: < 50ms
- Memory usage: < 10MB for cache

**UI Component**:
- Component rendering: < 16ms (60fps)
- API request timeout: 5 seconds
- Auto-refresh interval: 10 minutes (if enabled)
- Smooth state transitions: 200ms animations
- Avoid unnecessary re-renders (use React.memo, useMemo)

**Optimization**:
- Memoize expensive calculations
- Use SWR or similar for efficient data fetching (optional)
- Debounce company name changes to avoid excessive requests
- Lazy load headlines (render only visible items)

#### Design Constraints

**Color Coding System**:
- Must match existing dashboard health score colors
- Green: Positive sentiment (#22c55e family)
- Yellow/Gray: Neutral sentiment (#6b7280 family)
- Red: Negative sentiment (#ef4444 family)
- Maintain consistent opacity and shades

**Typography Scale**:
- Company name: text-lg (18px), font-semibold
- Sentiment badge: text-sm (14px), font-medium
- Metadata: text-sm (14px), text-gray-600
- Headlines: text-base (16px), font-normal
- Sources: text-xs (12px), text-gray-500

**Spacing and Layout**:
- Card padding: 1.5rem (p-6)
- Section gaps: 1rem (gap-4)
- Headline item padding: 0.75rem (p-3)
- Border radius: 0.5rem (rounded-lg)
- Maximum width: 500px for widget

**Component Consistency**:
- Follow same card structure as CustomerHealthDisplay
- Use same loading skeleton pattern as other widgets
- Match error state design across dashboard
- Consistent button styles and sizes
- Same hover/focus states as existing components

#### File Structure and Naming

**API Route**:
- Location: `src/app/api/market-intelligence/[company]/route.ts`
- Export: `GET` function (Route Handler)
- Named: `route.ts` (Next.js convention)

**Service Layer**:
- Location: `src/services/MarketIntelligenceService.ts`
- Export: `MarketIntelligenceService` class or module
- Mock data generation functions in same file or separate util

**UI Component**:
- Location: `src/components/MarketIntelligenceWidget.tsx`
- Default export: `MarketIntelligenceWidget` component
- Named export: `MarketIntelligenceWidgetProps` interface

**Type Definitions**:
- Location: `src/types/market-intelligence.ts`
- Export all interfaces as named exports

**Mock Data Integration**:
- Extend `src/data/mock-market-intelligence.ts` if exists
- Or create new mock data utility functions
- Keep mock data generation deterministic and testable

#### Security Considerations

**Input Validation**:
- Sanitize company name parameter before processing
- Validate length (2-100 characters)
- Remove special characters that could cause issues
- Prevent path traversal attacks in dynamic route
- Validate against allowlist of characters (alphanumeric, spaces, hyphens)

**Output Sanitization**:
- Escape HTML in company names and headlines
- Validate URLs before rendering links
- Use `rel="noopener noreferrer"` on external links
- Sanitize error messages (no stack traces to client)

**API Security**:
- Rate limiting consideration (future enhancement)
- No sensitive data in API responses
- Proper error status codes
- No internal implementation details exposed
- CORS headers if needed

**Mock Data Security**:
- Mock data generation prevents external API vulnerabilities
- No actual HTTP requests to external services
- Deterministic data generation for consistent testing
- No personally identifiable information in mock data

#### Algorithm and Business Logic

**Sentiment Calculation** (Mock Implementation):
- Analyze headline text for sentiment keywords
- Positive keywords: "growth", "success", "innovation", "expansion", "profit"
- Negative keywords: "layoff", "decline", "loss", "lawsuit", "scandal"
- Neutral: No strong indicators either way
- Default to neutral for ambiguous cases

**Mock Data Generation Algorithm**:
- Use company name as seed for deterministic generation
- Hash company name to generate consistent headlines
- Rotate through predefined headline templates
- Assign realistic sources based on company industry (if known)
- Generate dates within last 7 days, weighted toward recent
- Ensure variety in headline topics and sources

**Cache Expiration Strategy**:
- TTL: 10 minutes (600 seconds)
- Check expiration on every cache access
- Automatic cleanup of expired entries
- LRU eviction if cache size exceeds limit (optional)

### Acceptance Criteria

#### API Layer
- [ ] API route created at `/api/market-intelligence/[company]/route.ts`
- [ ] GET request returns proper JSON structure with all required fields
- [ ] Company name validation returns 400 for invalid input
- [ ] API simulates realistic delay (200-500ms)
- [ ] Error responses include proper status codes and error messages
- [ ] Cache headers set appropriately
- [ ] Mock data generation produces consistent results
- [ ] No TypeScript errors in strict mode

#### Service Layer
- [ ] MarketIntelligenceService class/module implemented
- [ ] `fetchMarketIntelligence` method returns proper data structure
- [ ] Caching implemented with 10-minute TTL
- [ ] Cache hit returns data in < 1ms
- [ ] Cache miss generates new data in < 50ms
- [ ] `clearCache` method properly invalidates cache entries
- [ ] Custom `MarketIntelligenceError` class extends Error
- [ ] Error handling covers all edge cases
- [ ] Mock data generation is deterministic (same input = same output)
- [ ] Service testable independently of API layer

#### UI Component
- [ ] MarketIntelligenceWidget component renders successfully
- [ ] Company name displays prominently
- [ ] Sentiment badge shows with correct color for each sentiment type
- [ ] News count displays correctly
- [ ] Last updated timestamp shows in relative format
- [ ] Top 3 headlines render with title, source, date
- [ ] Headlines are clickable and open in new tab
- [ ] Refresh button triggers new fetch and clears cache
- [ ] Loading state displays during data fetch
- [ ] Error state shows error message and retry button
- [ ] Component marked as client component (`'use client'`)

#### Integration
- [ ] Widget integrates into main dashboard page
- [ ] Receives company name from selected customer
- [ ] Updates when customer selection changes
- [ ] Maintains responsive grid layout with other widgets
- [ ] API client properly handles fetch errors
- [ ] Service layer used by API route
- [ ] No console errors during normal operation

#### Visual Design and Consistency
- [ ] Sentiment colors match specification (green/yellow/red)
- [ ] Card layout matches other dashboard widgets
- [ ] Typography follows dashboard type scale
- [ ] Spacing and padding consistent with design system
- [ ] Hover states work on interactive elements
- [ ] Smooth transitions between loading/success/error states
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Touch targets meet 44x44px minimum

#### Accessibility
- [ ] Sentiment badge uses semantic text + color
- [ ] ARIA labels present for sentiment indicators
- [ ] Loading state announced to screen readers
- [ ] Error state announced with proper ARIA attributes
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Focus visible states clear on all interactive elements
- [ ] External links use `rel="noopener noreferrer"`
- [ ] Color contrast meets WCAG AA standards
- [ ] Semantic HTML structure (article, ul, li elements)

#### Security
- [ ] Company name input validated and sanitized
- [ ] Special characters handled safely
- [ ] No XSS vulnerabilities in headline rendering
- [ ] External links properly secured with rel attributes
- [ ] Error messages don't expose sensitive information
- [ ] No stack traces sent to client
- [ ] Mock data contains no PII or sensitive information

#### Performance
- [ ] API route responds in < 100ms with cache hit
- [ ] Mock data generation completes in < 50ms
- [ ] Component renders in < 16ms
- [ ] Cache lookup in < 1ms
- [ ] No unnecessary re-renders
- [ ] useMemo/useCallback used appropriately
- [ ] Memory usage reasonable (< 10MB for cache)

#### Testing (if implemented)
- [ ] Unit tests for service layer methods
- [ ] Unit tests for mock data generation
- [ ] Cache expiration tests
- [ ] API route integration tests
- [ ] Component rendering tests
- [ ] Error handling tests
- [ ] Input validation tests

#### Documentation
- [ ] JSDoc comments on all public methods
- [ ] Type definitions properly documented
- [ ] API response format documented
- [ ] Cache strategy explained in comments
- [ ] Mock data generation algorithm documented
