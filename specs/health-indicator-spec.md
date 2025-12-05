# Spec: HealthIndicator Component

## Feature: HealthIndicator

### Context

The HealthIndicator is a foundational, reusable UI component for the Customer Intelligence Dashboard that provides visual feedback about customer health status. This component serves as a standardized way to display health scores across multiple dashboard features including CustomerCard, CustomerSelector, HealthScoreCalculator display, and PredictiveAlerts.

**Purpose**: Create a consistent, accessible, and visually intuitive health status indicator that can be reused throughout the application wherever customer health needs to be communicated.

**System Integration**: This component acts as a presentation layer component that:
- Accepts a numeric health score (0-100) and renders appropriate visual feedback
- Can be embedded in any parent component that needs to display health status
- Provides consistent color coding and visual language across the entire dashboard
- Supports multiple display variants (badge, bar, dot) for different UI contexts

**Users**: Dashboard users (account managers, customer success teams, executives) who need to quickly assess customer health at a glance without reading numeric values.

**Usage Context**: This component will be used in:
- CustomerCard components to show individual customer health
- CustomerSelector grid views for quick scanning
- HealthScoreCalculator results display
- PredictiveAlerts to indicate urgency levels
- Any future features requiring health status visualization

### Requirements

#### Functional Requirements

1. **Score Processing**
   - Accept a numeric health score value (0-100 scale)
   - Automatically categorize score into risk levels:
     - Critical: 0-30 (red)
     - Warning: 31-70 (yellow)
     - Healthy: 71-100 (green)
   - Handle edge cases: null, undefined, out-of-range values

2. **Display Variants**
   - **Badge variant**: Pill-shaped indicator with optional text label
   - **Bar variant**: Horizontal progress bar showing score visually
   - **Dot variant**: Small circular indicator for compact displays
   - **Text variant**: Text-only display with color coding

3. **Optional Features**
   - Show/hide numeric score value
   - Show/hide risk level label ("Critical", "Warning", "Healthy")
   - Customizable size (small, medium, large)
   - Optional icon support (alert, check, warning icons)

4. **Accessibility**
   - Provide semantic meaning beyond color (text labels, icons, patterns)
   - Screen reader announcements for health status
   - ARIA labels describing the health level
   - Keyboard focusable when interactive

#### User Interface Requirements

1. **Visual Design**
   - **Color Coding** (consistent with dashboard standards):
     - Critical (0-30): Red background (`bg-red-100`), red text (`text-red-700`), red border (`border-red-300`)
     - Warning (31-70): Yellow background (`bg-yellow-100`), yellow text (`text-yellow-700`), yellow border (`border-yellow-300`)
     - Healthy (71-100): Green background (`bg-green-100`), green text (`text-green-700`), green border (`border-green-300`)

2. **Size Variants**
   - Small: Compact for dense layouts (height: 20px, text: text-xs)
   - Medium: Default size (height: 28px, text: text-sm)
   - Large: Prominent display (height: 36px, text: text-base)

3. **Badge Variant Layout**
   - Rounded pill shape (`rounded-full`)
   - Horizontal padding proportional to size
   - Optional icon on left side
   - Score and/or label text centered
   - Subtle border for definition

4. **Bar Variant Layout**
   - Full-width container with background
   - Filled progress bar indicating score percentage
   - Score text overlaid or positioned to the right
   - Minimum height for accessibility (8px)

5. **Responsive Behavior**
   - Maintain readability at all breakpoints
   - Scale appropriately in parent containers
   - Text wrapping prevention for labels
   - Icon sizing proportional to variant size

#### Data Requirements

1. **Props Interface** (`HealthIndicatorProps`)
   ```typescript
   export interface HealthIndicatorProps {
     score: number;                                    // Required: 0-100 health score
     variant?: 'badge' | 'bar' | 'dot' | 'text';     // Display style (default: 'badge')
     size?: 'small' | 'medium' | 'large';            // Component size (default: 'medium')
     showScore?: boolean;                             // Display numeric value (default: true)
     showLabel?: boolean;                             // Display risk level text (default: false)
     showIcon?: boolean;                              // Display status icon (default: false)
     className?: string;                              // Additional Tailwind classes
     ariaLabel?: string;                              // Custom ARIA label (auto-generated if not provided)
   }
   ```

2. **Type Definitions**
   ```typescript
   type HealthLevel = 'critical' | 'warning' | 'healthy';

   interface HealthConfig {
     level: HealthLevel;
     color: string;
     bgColor: string;
     borderColor: string;
     label: string;
     icon?: React.ReactNode;
   }
   ```

3. **Data Validation**
   - Clamp scores outside 0-100 range to nearest boundary
   - Provide default fallback for null/undefined scores (show "N/A" state)
   - Type-safe props with TypeScript strict mode

#### Integration Requirements

1. **Component Imports**
   - Export as default export from `src/components/HealthIndicator.tsx`
   - Export `HealthIndicatorProps` interface as named export
   - No external dependencies beyond React and Tailwind

2. **Usage Pattern**
   ```typescript
   import HealthIndicator from '@/components/HealthIndicator';

   <HealthIndicator
     score={customer.healthScore}
     variant="badge"
     showLabel={true}
   />
   ```

3. **Reusability**
   - Pure presentation component (no business logic)
   - No direct dependency on Customer interface
   - Works with any numeric score source
   - Easily composable in other components

4. **Accessibility Integration**
   - Works with screen readers (tested with NVDA/JAWS)
   - Keyboard navigation support
   - Focus indicators for interactive variants
   - Semantic HTML structure

### Constraints

#### Technical Stack
- **Framework**: React 19 with TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 utility classes only
- **Build System**: Next.js 15 App Router
- **Component Type**: Client component (`'use client'` directive required)

#### Performance Requirements
- Component render time: < 5ms (lightweight, pure presentation)
- No unnecessary re-renders (use React.memo if parent re-renders frequently)
- No layout shifts during rendering
- Minimal DOM nodes (< 5 elements per variant)
- No external asset loading (icons can be inline SVG or Lucide React icons)

#### Design Constraints
- **Responsive Breakpoints**:
  - Mobile (320px+): All variants supported, prefer compact sizes
  - Tablet (768px+): All variants at default sizes
  - Desktop (1024px+): All variants, can use larger sizes

- **Touch Targets**: When interactive, minimum 44x44px touch area

- **Color Accessibility**:
  - Ensure 4.5:1 contrast ratio for text (WCAG AA)
  - Color is not the only indicator (include text/icons)
  - Support for color-blind users (patterns or labels)

- **Visual Consistency**:
  - Use established health score color scheme (red/yellow/green)
  - Match dashboard design language
  - Consistent spacing and typography with other components

#### File Structure
- **Component Path**: `src/components/HealthIndicator.tsx`
- **Exports**:
  ```typescript
  export interface HealthIndicatorProps { ... }
  export default function HealthIndicator(props: HealthIndicatorProps) { ... }
  ```
- **Imports**: Use `@/*` path alias for any internal imports

#### TypeScript Definitions
```typescript
// Component props interface
export interface HealthIndicatorProps {
  score: number;
  variant?: 'badge' | 'bar' | 'dot' | 'text';
  size?: 'small' | 'medium' | 'large';
  showScore?: boolean;
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
  ariaLabel?: string;
}

// Internal helper type
type HealthLevel = 'critical' | 'warning' | 'healthy';

// Helper function signature
function getHealthConfig(score: number): {
  level: HealthLevel;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}
```

#### Security Considerations
- No user-provided content rendering (only numeric scores)
- No XSS risk (controlled props only)
- Type safety prevents invalid score values
- No sensitive data exposure

### Acceptance Criteria

- [ ] **Component Renders Successfully**
  - Renders without errors with valid score (0-100)
  - Handles edge cases: score = 0, score = 100, negative values, > 100 values
  - Handles null/undefined score gracefully (shows "N/A" or default state)
  - No console errors or warnings

- [ ] **TypeScript Strict Mode Compliance**
  - Passes `npm run type-check` with zero errors
  - All props properly typed in `HealthIndicatorProps` interface
  - Internal helper functions have proper return types
  - No `any` types used

- [ ] **Color Coding Accuracy**
  - Score 0-30: Red colors applied (bg-red-100, text-red-700, border-red-300)
  - Score 31-70: Yellow colors applied (bg-yellow-100, text-yellow-700, border-yellow-300)
  - Score 71-100: Green colors applied (bg-green-100, text-green-700, border-green-300)
  - Boundary values: 30 (red), 31 (yellow), 70 (yellow), 71 (green) correctly categorized

- [ ] **Variant Implementation**
  - Badge variant: Rounded pill with optional text/score/icon
  - Bar variant: Progress bar with filled percentage matching score
  - Dot variant: Small circular indicator with appropriate color
  - Text variant: Color-coded text display
  - Default variant is 'badge' when not specified

- [ ] **Size Variants Working**
  - Small: Compact sizing appropriate for dense layouts
  - Medium: Default sizing (used when size not specified)
  - Large: Prominent sizing for emphasis
  - Proportional scaling of text, icons, and spacing

- [ ] **Optional Features Functional**
  - `showScore={true}`: Displays numeric value (e.g., "75")
  - `showScore={false}`: Hides numeric value
  - `showLabel={true}`: Displays risk level text ("Critical", "Warning", "Healthy")
  - `showLabel={false}`: Hides risk level text
  - `showIcon={true}`: Displays appropriate status icon
  - `className` prop: Additional classes applied correctly

- [ ] **Responsive Design**
  - Renders correctly on mobile (320px width)
  - Renders correctly on tablet (768px width)
  - Renders correctly on desktop (1024px+ width)
  - No layout shifts or overflow issues
  - Text remains readable at all breakpoints

- [ ] **Accessibility Requirements Met**
  - Proper ARIA labels provided (auto-generated or custom via `ariaLabel` prop)
  - Screen reader announces health level (e.g., "Customer health: Critical, score 25")
  - Color not sole indicator (text labels or icons included for context)
  - When interactive, focus visible state present (Tailwind `focus-visible:` utilities)
  - Semantic HTML structure (e.g., `<span>` with `role="status"` for live regions)
  - Minimum touch target 44x44px if interactive

- [ ] **Performance Targets Achieved**
  - Render time < 5ms (measure with React DevTools Profiler)
  - No unnecessary re-renders (wrap with React.memo if needed)
  - No layout shifts during state changes
  - Lighthouse Performance score unaffected

- [ ] **Integration Testing**
  - Can be imported and used in other components
  - Works with mock customer data (mockCustomers healthScore values)
  - Reusable across multiple parent components
  - Props interface exported correctly

- [ ] **Edge Cases Handled**
  - Score = 0: Shows as Critical (red), not error
  - Score = 100: Shows as Healthy (green)
  - Score = null/undefined: Shows "N/A" state with neutral styling
  - Score < 0: Clamped to 0 and shown as Critical
  - Score > 100: Clamped to 100 and shown as Healthy
  - Empty className prop: Component still renders correctly

- [ ] **Visual Polish**
  - Smooth visual appearance (no jagged edges, proper anti-aliasing)
  - Consistent spacing and padding
  - Border radius appropriate for variant
  - Text centered and aligned properly
  - Icons (if shown) properly sized and positioned

- [ ] **Code Quality**
  - Component follows React best practices
  - Helper functions extracted for reusability
  - Clear, descriptive variable names
  - Minimal complexity (easy to understand and maintain)
  - No duplicate code
  - Comments for complex logic only (code should be self-documenting)

- [ ] **Workshop Readiness**
  - Specification is clear enough for students/AI agents to implement
  - Example usage code provided
  - Acceptance criteria testable by students
  - Component fits workshop learning objectives (spec-driven development)
