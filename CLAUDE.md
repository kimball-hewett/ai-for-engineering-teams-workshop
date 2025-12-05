# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **workshop application** teaching spec-driven development with AI agents. Students build a Customer Intelligence Dashboard using Next.js 15, React 19, and TypeScript. The workshop emphasizes transforming business requirements into detailed specifications before implementation.

**Key characteristic**: This is an educational codebase with progressive feature building. Components may not exist yet as students work through exercises. The app gracefully handles missing components using dynamic imports with try/catch.

## Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint

# Type checking (standalone, no build)
npm run type-check
```

## Architecture

### Tech Stack
- **Next.js 15** with App Router (file-based routing in `src/app/`)
- **React 19** with Server Components (mark client components with `'use client'`)
- **TypeScript** strict mode enabled
- **Tailwind CSS v4** with inline theme in `globals.css`

### Directory Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx     # Main dashboard (client component)
│   ├── layout.tsx   # Root layout with fonts
│   └── globals.css  # Tailwind + theme configuration
└── data/            # Mock data services
    ├── mock-customers.ts            # Customer interface & data
    └── mock-market-intelligence.ts  # Market data generation

exercises/           # 8 workshop exercises (markdown files)
requirements/        # Business requirements (input files)
specs/              # Generated specifications (AI output)
templates/          # Specification template
```

### Component Locations

Components are created progressively during workshop exercises:
- **Components**: `src/components/[ComponentName].tsx` (PascalCase)
- **Props interfaces**: Export `[ComponentName]Props` from component file
- **Services**: `src/services/[ServiceName].ts` (if needed)

Example: `src/components/CustomerCard.tsx` exports `CustomerCardProps` interface.

### Path Aliases

Use `@/*` to reference `src/*`:
```typescript
import { Customer } from '@/data/mock-customers';
```

## Mock Data Architecture

The application uses mock data (no external APIs initially). This enables offline workshop completion.

### Customer Data (`src/data/mock-customers.ts`)

```typescript
interface Customer {
  id: string;
  name: string;
  company: string;
  healthScore: number;          // 0-100 scale
  email?: string;
  subscriptionTier?: 'basic' | 'premium' | 'enterprise';
  domains?: string[];
  createdAt?: string;
  updatedAt?: string;
}
```

Export: `mockCustomers` array with 8 sample customers.

### Market Intelligence (`src/data/mock-market-intelligence.ts`)

Functions:
- `generateMockMarketData(company: string)`: Returns company-specific news headlines
- `calculateMockSentiment(headlines)`: Analyzes sentiment (positive/neutral/negative)

These functions are deterministic but generate realistic data for demos.

## Spec-Driven Development Workflow

This is the core methodology taught in the workshop:

### 1. Requirements → Specification

Business requirements (in `requirements/`) are transformed into detailed specifications using the template from `templates/spec-template.md`.

**Specification structure**:
- **Context**: Purpose, users, system fit
- **Requirements**: Functional, UI, data, integration, accessibility
- **Constraints**: Tech stack, performance, design, file structure, security
- **Acceptance Criteria**: Testable checklist for verification

Save generated specs to `specs/[component-name]-spec.md` (kebab-case).

### 2. Specification → Implementation

Components are implemented from specifications. Each spec includes:
- Exact file path (e.g., `src/components/CustomerCard.tsx`)
- TypeScript interfaces to export
- Props structure
- Styling approach (Tailwind utilities)
- Accessibility requirements

### 3. Verification

Check implementation against acceptance criteria checklist in spec. Verify:
- TypeScript strict mode passes (`npm run type-check`)
- No console errors/warnings
- Component renders with mock data
- Responsive design at breakpoints (mobile 320px+, tablet 768px+, desktop 1024px+)

## Key Patterns and Conventions

### Component Discovery Pattern

The main page (`src/app/page.tsx`) uses dynamic component loading:

```typescript
try {
  const CustomerCard = require('../components/CustomerCard')?.default;
  if (CustomerCard && mockCustomers?.[0]) {
    return <CustomerCard customer={mockCustomers[0]} />;
  }
} catch (error) {
  // Component doesn't exist yet - gracefully skip
}
```

This allows the app to run even when components haven't been built yet.

### Health Score Color Coding

Consistent across all components:
- **Red** (0-30): Critical/poor health
- **Yellow** (31-70): Warning/moderate health
- **Green** (71-100): Healthy/good health

### Styling Patterns

**Tailwind CSS v4**: Use utility classes inline, no separate CSS files for components.

**Responsive design**: Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).

**Custom theme variables** (in `src/app/globals.css`):
```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

### TypeScript Patterns

**Strict mode enabled**: All code must pass strict type checking.

**Interface exports**: Always export props interfaces from component files:
```typescript
export interface CustomerCardProps {
  customer: Customer;
}
```

**Type imports**: Import types from `@/data/`:
```typescript
import type { Customer } from '@/data/mock-customers';
```

### File Naming

- **Components**: PascalCase (e.g., `CustomerCard.tsx`)
- **Specs**: kebab-case with `-spec.md` suffix (e.g., `customer-card-spec.md`)
- **Requirements**: kebab-case (e.g., `customer-selector.md`)
- **Data files**: kebab-case with `mock-` prefix (e.g., `mock-customers.ts`)

## Workshop Context

### Exercise Progression

1. **Effective Prompting** - Learn AI communication techniques
2. **Thinking in Specs** - Write first specifications (CustomerCard, CustomerSelector)
3. **Expanding Dashboard Specs** - Generate more component specs
4. **Advanced Spec Integration** - Multi-component features
5. **Implementing from Specs** - Transform specs to code
6. **Custom Slash Commands** - Workflow automation
7. **Introduction to Subagents** - Specialized AI agents
8. **Advanced Subagent Orchestration** - Batch operations

### Expected Component Build Order

1. CustomerCard (displays single customer with health score)
2. CustomerSelector (grid of customer cards)
3. HealthScoreCalculator (business logic for scoring)
4. MarketIntelligenceWidget (news and sentiment)
5. PredictiveAlerts (customer health alerts)
6. Additional production features

### Custom Slash Commands (Exercise 5)

Students create custom commands like:
- `/spec [ComponentName]` - Generate specification from requirements
- `/implement [spec-file]` - Generate component from spec
- `/verify [component-file]` - Verify against acceptance criteria

These commands reference files using `@requirements/`, `@specs/`, `@templates/` notation.

## Performance and Accessibility Standards

### Performance Targets (from specs)
- Component rendering: < 16ms (60fps)
- First Contentful Paint: < 1.5s
- No layout shift during state changes
- Efficient re-renders (use React.memo where appropriate)

### Accessibility Requirements (WCAG 2.1)
- Minimum touch target: 44x44px
- Proper ARIA labels for dynamic content
- Keyboard navigation support (Enter/Space for buttons)
- Focus visible states using Tailwind `focus-visible:` utilities
- Screen reader announcements for loading/error states

### Security Patterns
- Sanitize user inputs and dynamic content (XSS prevention)
- No sensitive data in client-side logs
- Proper TypeScript types to prevent injection
- Validate data at component boundaries

## Configuration Notes

### TypeScript (`tsconfig.json`)
- Strict mode enabled
- Module resolution: `bundler` (Next.js optimized)
- No emit during type checking (faster validation)
- Path alias: `@/*` → `./src/*`

### Next.js (`next.config.ts`)
- Uses Next.js defaults
- App Router enabled (no Pages Router)
- Server Components by default

### Tailwind (`postcss.config.mjs`)
- Tailwind CSS v4 (PostCSS plugin)
- No separate `tailwind.config.js`
- Theme configured inline in `globals.css`

### Dev Container (`.devcontainer/`)
- Node.js LTS (Debian Bookworm)
- Claude Code, GitHub Copilot, Roo Cline pre-installed
- Startup script auto-configures Claude Code settings
- Port 3000 forwarded for Next.js dev server

## Working with This Codebase

### When creating specifications:
1. Use `@templates/spec-template.md` as the structure
2. Reference business requirements from `@requirements/`
3. Save to `specs/[component-name]-spec.md`
4. Include all sections: Context, Requirements, Constraints, Acceptance Criteria

### When implementing components:
1. Read the spec first to understand requirements fully
2. Create component at path specified in spec (usually `src/components/`)
3. Export TypeScript interface for props
4. Use mock data from `src/data/` for demos
5. Apply Tailwind utilities (no separate CSS files)
6. Verify against acceptance criteria checklist

### When verifying implementations:
1. Run `npm run type-check` for TypeScript validation
2. Run `npm run dev` and test in browser
3. Check responsive design at breakpoints (320px, 768px, 1024px)
4. Verify no console errors/warnings
5. Test with mock data from `src/data/`
6. Review acceptance criteria checklist in spec

### Common patterns to follow:
- Mark interactive components with `'use client'` directive
- Use Suspense boundaries for async components
- Import types with `import type { }` syntax
- Export component as default, interfaces as named exports
- Use health score color coding consistently (red/yellow/green)
- Apply WCAG 2.1 accessibility standards (44px touch targets, ARIA labels, keyboard support)

## Important Notes

**This is a workshop codebase**: Components are built progressively through exercises. Missing components are normal and expected. The application handles this gracefully with dynamic imports.

**Spec-first approach**: Always create or reference a specification before implementation. Specifications serve as the "source of truth" and include acceptance criteria for verification.

**Mock data patterns**: The application uses realistic mock data with no external API dependencies initially. This ensures workshop exercises can be completed offline.

**AI assistance workflow**: This repository teaches using AI agents (Claude Code, GitHub Copilot) for specification generation and implementation. The methodology emphasizes clear specifications as the bridge between human intent and AI execution.
