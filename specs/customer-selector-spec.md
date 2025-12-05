# Spec: CustomerSelector Component

## Feature: CustomerSelector

### Context
- **Purpose**: Main customer selection interface for the Customer Intelligence Dashboard that displays multiple customers and enables efficient search and selection
- **Role in application**: Primary navigation component that allows users to browse and select customers to view detailed information and analytics
- **Users**: Customer success managers, account executives, and support teams who need to quickly access customer information from a large database
- **Usage scenario**: Displayed on the dashboard page, users interact with it to filter through 100+ customers and select one to view detailed metrics and insights

### Requirements

#### Functional Requirements
- Display multiple customer cards in a responsive grid layout
- Render each customer with name, company, and health score (using CustomerCard component)
- Implement real-time search/filter functionality that filters customers by name or company
- Show visual indication of the currently selected customer
- Support single customer selection (radio button behavior - only one customer selected at a time)
- Handle click interactions to select customers
- Persist the selected customer across component re-renders
- Display appropriate message when no customers match search criteria
- Handle empty customer list gracefully
- Maintain filter state while selection changes

#### User Interface Requirements
- Responsive grid layout:
  - Mobile (< 768px): Single column
  - Tablet (768px - 1023px): 2 columns
  - Desktop (≥ 1024px): 3 columns
- Search input field prominently displayed above customer grid
- Visual selection state with border/background highlight on selected card
- Smooth transitions for filtering and selection changes
- Loading state while customer data is being fetched
- Empty state when no customers match filter criteria
- Clean, modern design using Tailwind CSS utilities
- Consistent spacing between cards (gap-4 for grid)

#### Data Requirements
- Accept customer data as props (array of Customer objects)
- Customer interface must include:
  - `id: string` (unique identifier)
  - `name: string`
  - `company: string`
  - `healthScore: number` (0-100)
  - Optional fields: `email`, `subscriptionTier`, `domains`, `createdAt`, `updatedAt`
- Accept optional `onCustomerSelect` callback to notify parent of selection changes
- Accept optional `initialSelectedId` prop for controlled selection
- Support controlled and uncontrolled selection modes

#### Integration Requirements
- Import and use CustomerCard component for rendering individual customers
- Import Customer type from `@/data/mock-customers`
- Use mock customer data from `@/data/mock-customers` for testing
- Expose selection state through callback prop for parent component integration
- Support integration with analytics tracking (future enhancement)

#### Accessibility Requirements
- Search input with proper `aria-label` or visible label
- Customer cards marked as interactive with proper ARIA roles
- Selected state announced to screen readers via `aria-selected`
- Keyboard navigation support:
  - Tab to navigate between search and cards
  - Enter/Space to select cards
  - Up/Down arrows to navigate grid (optional enhancement)
- Focus visible states for keyboard users
- Minimum touch target size of 44x44px for interactive elements
- Screen reader announcement when filter results change

### Constraints

#### Technical Stack
- Next.js 15 with App Router
- React 19 with Server Components (mark as client component with `'use client'`)
- TypeScript with strict mode enabled
- Tailwind CSS v4 for styling (utility classes only, no separate CSS files)

#### Performance Requirements
- Filter/search response time: < 100ms for datasets up to 500 customers
- Component rendering: < 16ms (maintain 60fps)
- Use React.memo or useMemo for expensive filtering operations
- Debounce search input to avoid excessive re-renders (300ms delay)
- Efficient re-rendering - only update affected cards
- First render: < 50ms with 100 customers

#### Design Constraints
- Responsive breakpoints:
  - Mobile: 320px minimum width
  - Tablet: 768px
  - Desktop: 1024px
- Maximum component width: 1440px (center on larger screens)
- Card spacing: 1rem (gap-4) between grid items
- Search input height: minimum 44px for touch targets
- Selected card border: 2px solid, using accent color
- Use health score color coding consistently:
  - Red (0-30): Critical health
  - Yellow (31-70): Warning health
  - Green (71-100): Healthy

#### File Structure and Naming
- Component location: `src/components/CustomerSelector.tsx`
- Export component as default export
- Component name: `CustomerSelector` (PascalCase)
- Props interface name: `CustomerSelectorProps`
- Internal state variable names:
  - `searchQuery` for filter text
  - `selectedCustomerId` for selected customer ID
  - `filteredCustomers` for filtered results

#### Props Interface and TypeScript Definitions

```typescript
import type { Customer } from '@/data/mock-customers';

export interface CustomerSelectorProps {
  customers: Customer[];
  onCustomerSelect?: (customer: Customer) => void;
  initialSelectedId?: string;
  className?: string;
}
```

#### Security Considerations
- Sanitize search input to prevent XSS attacks
- Validate customer data structure at component boundary
- No sensitive data logged to console
- Proper TypeScript types to prevent injection vulnerabilities
- Escape user-generated content in customer names/companies

### Acceptance Criteria

- [ ] Component renders successfully with mock customer data (8 customers)
- [ ] Grid layout is responsive (1 column mobile, 2 tablet, 3 desktop)
- [ ] Search input filters customers by name (case-insensitive)
- [ ] Search input filters customers by company (case-insensitive)
- [ ] Clicking a customer card selects it and highlights with visual indicator
- [ ] Only one customer can be selected at a time
- [ ] Selected state persists when search filter changes
- [ ] `onCustomerSelect` callback fires when selection changes
- [ ] Empty state message displays when no customers match search
- [ ] Component handles empty customer array gracefully
- [ ] TypeScript strict mode passes with no errors
- [ ] No console errors or warnings during interaction
- [ ] Search input has proper ARIA label for screen readers
- [ ] Selected cards have `aria-selected="true"` attribute
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Focus visible states are clear for keyboard users
- [ ] Touch targets meet 44x44px minimum requirement
- [ ] Component renders in < 50ms with 100 customers
- [ ] Search filtering completes in < 100ms
- [ ] CustomerCard component is reused for individual customer display
- [ ] Health score colors match specification (red/yellow/green)
- [ ] Component works in both controlled and uncontrolled modes
