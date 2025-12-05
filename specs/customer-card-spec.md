# Spec: CustomerCard Component

## Feature: CustomerCard

### Context
- **Purpose**: Display individual customer information in a card format for the Customer Intelligence Dashboard
- **Role in system**: Presentation component used within the CustomerSelector container to show at-a-glance customer details including health scores and domain information
- **Users**: Customer Success Managers and Account Managers who need quick visual identification of customer status
- **Usage scenario**: Rendered as part of a grid of customer cards, providing foundation for domain health monitoring integration

### Requirements

#### Functional Requirements
- Display customer name prominently as the primary identifier
- Display company name as secondary information
- Show numeric health score (0-100 scale) with color-coded visual indicator
- Display customer domains (websites) for health monitoring context
- Show domain count badge when customer has multiple domains (e.g., "+2 more")
- Health score color coding:
  - **Red** (0-30): Poor health score - critical attention needed
  - **Yellow** (31-70): Moderate health score - monitoring required
  - **Green** (71-100): Good health score - healthy customer

#### User Interface Requirements
- Card-based design with clear visual hierarchy
- Responsive layout supporting mobile (320px+), tablet (768px+), and desktop (1024px+)
- Clean, modern aesthetic using Tailwind CSS utilities
- Health score indicator as colored badge or visual element
- Domain information displayed in readable format
- Interactive hover state to indicate card is a visual unit
- Minimum touch target: 44x44px for any interactive elements (WCAG 2.1)

#### Data Requirements
- Consume `Customer` type from `@/data/mock-customers`
- Required customer properties: `id`, `name`, `company`, `healthScore`
- Optional customer properties: `domains` (array of website URLs)
- Handle customers with 1 domain, multiple domains, or no domains
- Use mock data from `mockCustomers` array for development and testing

#### Integration Requirements
- Export component as default export from `src/components/CustomerCard.tsx`
- Export `CustomerCardProps` interface for type safety
- Accept single `customer` prop of type `Customer`
- Designed to be used within CustomerSelector grid component
- No external API calls - uses mock data exclusively

#### Accessibility Requirements
- Use semantic HTML elements (article, heading tags)
- Include ARIA labels for health score status
- Ensure color is not the only indicator (include text/icons with colors)
- Support keyboard navigation and focus states
- Screen reader friendly health score announcements

### Constraints

#### Technical Stack
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 (utility classes only, no separate CSS files)
- **Type Safety**: TypeScript strict mode enabled
- **Client Component**: Mark with `'use client'` directive (interactive UI)

#### Performance Requirements
- Component rendering time: < 16ms (60fps target)
- No layout shift during render
- Efficient re-renders (consider React.memo if used in large lists)
- Lazy loading of customer data handled by parent container

#### Design Constraints
- Responsive breakpoints:
  - Mobile: 320px - 767px (full width cards)
  - Tablet: 768px - 1023px (2-column grid consideration)
  - Desktop: 1024px+ (3+ column grid consideration)
- Card minimum width: 280px
- Card padding: Consistent internal spacing (p-4 to p-6)
- Health score badge: Clearly visible, minimum 24px height
- Domain display: Truncate long URLs with ellipsis if needed

#### File Structure and Naming
- **File path**: `src/components/CustomerCard.tsx`
- **Component name**: `CustomerCard` (PascalCase)
- **Props interface**: `CustomerCardProps` (exported)
- **Type imports**: Use `import type { Customer } from '@/data/mock-customers'`

#### Props Interface and TypeScript Definitions
```typescript
import type { Customer } from '@/data/mock-customers';

export interface CustomerCardProps {
  customer: Customer;
}
```

#### Security Considerations
- Sanitize domain URLs if displayed as links (XSS prevention)
- Validate customer data structure at component boundary
- No sensitive customer data logged to console
- TypeScript types prevent injection of malformed data

### Acceptance Criteria

- [ ] Component renders without errors in development mode (`npm run dev`)
- [ ] TypeScript strict mode validation passes (`npm run type-check`)
- [ ] Customer name displayed prominently (h3 or h4 heading level)
- [ ] Company name displayed as secondary text
- [ ] Health score displays numeric value (0-100)
- [ ] Health score color matches range:
  - Red for 0-30
  - Yellow for 31-70
  - Green for 71-100
- [ ] Single domain displayed when customer has 1 domain
- [ ] Multiple domains show count badge (e.g., "example.com +2 more")
- [ ] Component handles customers with no domains gracefully
- [ ] Responsive design works at 320px, 768px, and 1024px breakpoints
- [ ] Card has visible hover state
- [ ] All interactive elements meet 44x44px minimum touch target
- [ ] ARIA labels present for health score status
- [ ] Health status includes text indicator (not color alone)
- [ ] Focus visible states applied for keyboard navigation
- [ ] Component exports CustomerCardProps interface
- [ ] Component exported as default export
- [ ] Successfully integrates with mock data from `mockCustomers[0]`
- [ ] No console errors or warnings during render
- [ ] No layout shift during component mount

## Integration Architecture

### Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Main Dashboard Page                      │
│                    (src/app/page.tsx)                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ renders multiple instances
                            ▼
                ┌───────────────────────────┐
                │   CustomerSelector        │
                │  (Future Component)       │
                │  Grid/List Container      │
                └─────────────┬─────────────┘
                              │
                              │ maps over customers array
                              │ renders individual cards
                              ▼
                    ┌─────────────────────┐
                    │   CustomerCard      │◄──── Customer data
                    │   (This Component)  │
                    └─────────────────────┘
                              │
                              │ imports types
                              ▼
                ┌──────────────────────────┐
                │  @/data/mock-customers   │
                │  - Customer interface    │
                │  - mockCustomers array   │
                └──────────────────────────┘
```

### Data Flow Description

**Downstream Flow (Parent → CustomerCard)**
1. **Data Source**: `mockCustomers` array from `@/data/mock-customers.ts` provides sample customer data
2. **Parent Component** (future CustomerSelector): Passes individual `Customer` object as prop
3. **CustomerCard**: Receives customer prop and renders display-only presentation
4. **Rendering**: Component extracts properties (`name`, `company`, `healthScore`, `domains`) and applies conditional styling

**Key Data Transformations**
- **Health Score → Color Mapping**: Numeric score (0-100) transformed to color class:
  - `0-30` → `bg-red-500` (Critical)
  - `31-70` → `bg-yellow-500` (Moderate)
  - `71-100` → `bg-green-500` (Healthy)
- **Domain Array → Display Logic**:
  - Single domain: Show full domain name
  - Multiple domains: Show first domain + "+N more" badge
  - No domains: Show "No domains" placeholder
- **No upstream data flow**: Component is presentation-only (no callbacks, events, or state updates to parent)

### Key Integration Points

#### 1. Type System Integration
```typescript
import type { Customer } from '@/data/mock-customers';
```
- **Tight coupling**: Component relies on `Customer` interface definition
- **Contract**: Any changes to `Customer` type directly impact component
- **Validation**: TypeScript strict mode enforces type safety at compile time

#### 2. Parent Component Integration (CustomerSelector)
- **Usage Pattern**: `<CustomerCard customer={customer} />`
- **Rendering Context**: Expected to be rendered within a grid/flex container
- **Styling Considerations**: Component has minimum width (280px) but adapts to container
- **No click handlers**: Current spec is display-only (future specs may add interactivity)

#### 3. Mock Data Integration
- **Development**: Uses `mockCustomers[0]` for testing during development
- **Dynamic Import Pattern**: Main page uses try/catch dynamic imports to handle component existence
```typescript
const CustomerCard = require('../components/CustomerCard')?.default;
const mockCustomers = require('../data/mock-customers')?.mockCustomers;
```

#### 4. Styling System Integration
- **Tailwind CSS v4**: All styles via utility classes (no external CSS)
- **Theme Variables**: Uses CSS variables from `globals.css` for consistency
- **Responsive Design**: Inherits responsive behavior from parent grid layout

### Dependencies on Previously Created Specs

#### Direct Dependencies
1. **Mock Data Specification** (Foundational)
   - **File**: `src/data/mock-customers.ts`
   - **Relationship**: CustomerCard depends on `Customer` interface definition
   - **Breaking Changes Impact**: Changes to `Customer` type require component updates
   - **Required Properties**: `id`, `name`, `company`, `healthScore`
   - **Optional Properties**: `domains`, `email`, `subscriptionTier`, `createdAt`, `updatedAt`

#### Future Dependencies (Planned)
1. **CustomerSelector Component** (Exercise 4)
   - **Relationship**: CustomerSelector will consume CustomerCard as child component
   - **Integration Point**: CustomerSelector maps over customer array, rendering CustomerCard for each
   - **Props Flow**: CustomerSelector passes individual customer objects to CustomerCard
   - **Expected by**: Exercise 4 implementation

2. **HealthScoreCalculator Service** (Future)
   - **Relationship**: May provide business logic for health score calculations
   - **Current State**: CustomerCard displays pre-calculated scores from mock data
   - **Future Enhancement**: Dynamic health score calculation based on multiple metrics

3. **Domain Health Monitoring Widget** (Exercise 5)
   - **Relationship**: Both components display domain information
   - **Shared Concern**: Domain URLs and health status
   - **Potential Integration**: Click on domain badge could navigate to detailed domain health view

#### No Dependencies On
- ✓ External APIs (uses mock data exclusively)
- ✓ State management libraries (Redux, Context, etc.)
- ✓ Authentication/authorization systems
- ✓ Backend services or databases
- ✓ Other dashboard widgets (MarketIntelligence, PredictiveAlerts)

#### Dependency Graph
```
[mock-customers.ts] ──── provides Customer type ───► [CustomerCard]
                                                            │
                                                            │ consumed by
                                                            ▼
[Dashboard Page] ──── uses (via dynamic import) ───► [CustomerSelector]
                                                       (future component)
```

### Integration Constraints
- **Read-only component**: No mutations to customer data
- **Stateless**: No internal state management (fully controlled by props)
- **No side effects**: No API calls, logging, or external interactions
- **Isolated rendering**: Each card renders independently (suitable for virtualization)
