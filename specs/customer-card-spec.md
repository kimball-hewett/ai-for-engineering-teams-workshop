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
