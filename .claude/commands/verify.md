# Verify Component Implementation

You are tasked with verifying a component implementation to ensure it meets quality standards, type safety, rendering requirements, and responsive design criteria.

## Input Parameters
- Component file path: {{{0}}}

## Verification Process

### Phase 1: Initial Setup

1. **Parse Component Path**
   - Extract component name from file path
   - Convert path to absolute if relative (handle `components/`, `src/components/`, `@/components/`)
   - Verify file exists, if not report error

2. **Create Verification Todo List**
   - Use TodoWrite tool to track verification progress:
     - [ ] Read component file
     - [ ] Run TypeScript type checking
     - [ ] Analyze component structure
     - [ ] Verify props interface
     - [ ] Check mock data compatibility
     - [ ] Verify responsive design patterns
     - [ ] Generate verification report

### Phase 2: TypeScript Verification

3. **Run Type Checking**
   - Execute `npm run type-check`
   - Capture output and analyze results
   - Identify specific type errors related to the component
   - Check for:
     - ✅ Zero TypeScript errors overall
     - ✅ Strict mode compliance
     - ✅ No `any` types used
     - ✅ Proper return types for functions
     - ✅ Props interface properly typed

4. **Type Check Results**
   - **PASS**: Zero errors, all types correct
   - **FAIL**: List each error with file/line number and description
   - Extract component-specific errors vs. project-wide errors

### Phase 3: Component Structure Analysis

5. **Read Component File**
   - Read the component file contents
   - Parse and analyze:
     - Component type (client vs server component)
     - Exported interfaces (especially props interface)
     - Imports and dependencies
     - Props destructuring and usage
     - State management (useState, useEffect, etc.)
     - Event handlers
     - Styling approach (Tailwind classes)

6. **Verify Component Structure**
   - ✅ **Proper Exports**:
     - Props interface exported (named export)
     - Component exported as default
   - ✅ **Client Directive**:
     - `'use client'` present if using hooks, events, or browser APIs
   - ✅ **TypeScript Interface**:
     - Props interface defined with proper types
     - No `any` types
     - Optional vs required props clearly marked
   - ✅ **Clean Code**:
     - Proper naming conventions (PascalCase for components)
     - Clear variable names
     - Reasonable complexity

### Phase 4: Mock Data Compatibility

7. **Check Data Integration**
   - Identify component's data requirements from props interface
   - Check if component expects Customer type from `@/data/mock-customers`
   - Verify mock data compatibility:
     - Read `src/data/mock-customers.ts` to get Customer interface
     - Compare component props with available mock data fields
     - Check if all required props can be satisfied by mock data
     - Identify any missing or incompatible fields

8. **Mock Data Verification**
   - ✅ **PASS**: Component props compatible with mock data structure
   - ❌ **FAIL**: List specific incompatibilities:
     - Props expecting fields not in mock data
     - Type mismatches between props and mock data
     - Required props that mock data doesn't provide

9. **Example Usage Generation**
   - Generate example code showing how to use component with mock data:
   ```typescript
   import ComponentName from '@/components/ComponentName';
   import { mockCustomers } from '@/data/mock-customers';

   // Example usage
   <ComponentName customer={mockCustomers[0]} />
   ```

### Phase 5: Responsive Design Verification

10. **Analyze Responsive Patterns**
    - Search for Tailwind responsive prefixes in component:
      - `sm:` prefix (640px+)
      - `md:` prefix (768px+)
      - `lg:` prefix (1024px+)
      - `xl:` prefix (1280px+)
    - Check for mobile-first design approach
    - Verify responsive patterns for:
      - Layout (flex, grid, spacing)
      - Typography (text sizes)
      - Spacing (padding, margin)
      - Display properties (hidden, block, flex)
      - Width/height constraints

11. **Responsive Design Criteria**
    - ✅ **Mobile (320px+)**:
      - Base styles work at smallest viewport
      - No horizontal scroll
      - Touch targets >= 44x44px
      - Readable text (minimum text-sm)
    - ✅ **Tablet (768px+)**:
      - `md:` breakpoint styles present
      - Layout adapts appropriately
      - Spacing increases for larger screens
    - ✅ **Desktop (1024px+)**:
      - `lg:` breakpoint styles present
      - Optimal layout for large screens
      - Proper use of available space

12. **Responsive Design Assessment**
    - Count responsive classes found
    - Identify which breakpoints are addressed
    - Flag missing responsive considerations
    - Check for common issues:
      - Fixed widths without responsive alternatives
      - Text that might overflow on mobile
      - Images without responsive sizing
      - Grid layouts without mobile fallbacks

### Phase 6: Accessibility Verification

13. **Check Accessibility Features**
    - ✅ **ARIA Labels**: Proper `aria-label`, `aria-describedby` for dynamic content
    - ✅ **Semantic HTML**: Appropriate use of semantic elements
    - ✅ **Keyboard Navigation**: Button/interactive elements support Enter/Space
    - ✅ **Focus States**: `focus-visible:` or `focus:` utilities present
    - ✅ **Touch Targets**: Interactive elements >= 44x44px
    - ✅ **Screen Reader Support**: `sr-only` classes for screen reader text
    - ✅ **Color Contrast**: Text has sufficient contrast (not sole indicator)

14. **Accessibility Assessment**
    - List accessibility features found
    - Flag missing accessibility patterns
    - Note potential issues (color-only indicators, missing labels, etc.)

### Phase 7: Performance Analysis

15. **Check Performance Patterns**
    - ✅ **Efficient Rendering**:
      - React.memo usage if appropriate
      - useMemo/useCallback for expensive operations
      - Conditional rendering optimization
    - ✅ **No Performance Anti-patterns**:
      - No inline object/array creation in render
      - No anonymous functions in props (if re-render sensitive)
      - No unnecessary state

16. **Performance Assessment**
    - Note optimization patterns found
    - Flag potential performance issues
    - Suggest improvements if needed

### Phase 8: Best Practices Check

17. **Code Quality Verification**
    - ✅ **Styling**:
      - Tailwind utilities used (no separate CSS files)
      - Consistent spacing and sizing
      - Proper use of theme colors
    - ✅ **Error Handling**:
      - Null/undefined checks for optional props
      - Edge case handling (empty data, zero values)
      - Graceful fallbacks
    - ✅ **Security**:
      - No XSS vulnerabilities (dangerouslySetInnerHTML usage)
      - Input sanitization if handling user content
      - No sensitive data exposure

### Phase 9: Generate Verification Report

18. **Compile Results**
    - Collect all verification results from phases 2-8
    - Calculate pass/fail for each category
    - Identify critical vs. minor issues
    - Prioritize issues by severity

19. **Generate Summary Report**

    ```
    =====================================
    COMPONENT VERIFICATION REPORT
    =====================================

    Component: [ComponentName]
    File: [file-path]
    Verified: [timestamp]

    -------------------------------------
    OVERALL STATUS: [PASS ✅ | FAIL ❌]
    -------------------------------------

    📋 VERIFICATION SUMMARY

    [X/Y] checks passed

    ✅ TypeScript Type Checking
    ✅ Component Structure
    ✅ Mock Data Compatibility
    ❌ Responsive Design
    ✅ Accessibility
    ✅ Performance
    ✅ Best Practices

    -------------------------------------
    📊 DETAILED RESULTS
    -------------------------------------

    ## 1. TypeScript Type Checking
    Status: [PASS ✅ | FAIL ❌]

    [If PASS:]
    ✅ Zero TypeScript errors
    ✅ Strict mode compliance
    ✅ All types properly defined

    [If FAIL:]
    ❌ Found [N] type errors:

    • [file:line] - [error description]
    • [file:line] - [error description]

    -------------------------------------
    ## 2. Component Structure
    Status: [PASS ✅ | FAIL ❌]

    Exports:
    ✅ Props interface exported: [InterfaceName]
    ✅ Component exported as default

    Component Type:
    ✅ Client component ('use client' directive present)
    [or]
    ✅ Server component (no client directive)

    Issues Found: [none | list issues]

    -------------------------------------
    ## 3. Mock Data Compatibility
    Status: [PASS ✅ | FAIL ❌]

    Props Interface:
    [List props and types]

    Mock Data Fields Available:
    [List matching fields from mockCustomers]

    ✅ All required props can be satisfied by mock data
    [or]
    ❌ Incompatibilities found:
    • [specific issue 1]
    • [specific issue 2]

    Example Usage:
    ```typescript
    [example code]
    ```

    -------------------------------------
    ## 4. Responsive Design
    Status: [PASS ✅ | FAIL ❌]

    Breakpoints Implemented:
    ✅ Mobile (base): [count] styles
    ✅ Tablet (md:): [count] styles
    ✅ Desktop (lg:): [count] styles

    Responsive Features:
    • [feature 1]
    • [feature 2]

    Issues:
    [none | list missing responsive considerations]

    -------------------------------------
    ## 5. Accessibility
    Status: [PASS ✅ | FAIL ❌]

    Features Found:
    ✅ ARIA labels: [yes/no]
    ✅ Keyboard navigation: [yes/no]
    ✅ Focus states: [yes/no]
    ✅ Semantic HTML: [yes/no]
    ✅ Touch targets: [yes/no]

    Issues:
    [none | list missing accessibility features]

    -------------------------------------
    ## 6. Performance
    Status: [PASS ✅ | FAIL ❌]

    Optimizations Found:
    • [optimization 1]
    • [optimization 2]

    Issues:
    [none | list potential performance concerns]

    -------------------------------------
    ## 7. Best Practices
    Status: [PASS ✅ | FAIL ❌]

    ✅ Tailwind CSS utilities used
    ✅ Error handling present
    ✅ No security concerns
    ✅ Clean code structure

    Issues:
    [none | list best practice violations]

    =====================================
    🎯 RECOMMENDATIONS
    =====================================

    [If PASS:]
    ✅ Component meets all verification criteria!
    ✅ Ready for integration into dashboard
    ✅ Follows workshop best practices

    [If FAIL with issues:]
    Priority Fixes Required:

    1. [Critical Issue 1]
       - Description: [detail]
       - Fix: [suggestion]

    2. [Critical Issue 2]
       - Description: [detail]
       - Fix: [suggestion]

    Minor Improvements:

    • [Improvement 1]
    • [Improvement 2]

    =====================================
    ```

20. **Update Todo List**
    - Mark all verification tasks as completed
    - Show final status in todo list

## Verification Criteria

### PASS Requirements
To receive an overall **PASS** status, component must meet:
- ✅ Zero TypeScript errors
- ✅ Props interface properly exported
- ✅ Component renders without errors
- ✅ Compatible with mock data (if data-driven)
- ✅ Basic responsive design present (at least 2 breakpoints)
- ✅ Basic accessibility features (ARIA labels or semantic HTML)
- ✅ No critical security issues

### FAIL Triggers
Component receives **FAIL** if:
- ❌ TypeScript errors present
- ❌ Missing required exports
- ❌ Props incompatible with mock data
- ❌ No responsive design patterns
- ❌ Missing all accessibility features
- ❌ Security vulnerabilities present

## Error Handling

- **File Not Found**: Report clear error with correct path format
- **Type Check Fails**: Continue verification, report all errors
- **Cannot Parse Component**: Report parsing error, skip structure analysis
- **Mock Data Missing**: Note limitation, skip mock data verification

## Important Notes

- Always run the full verification suite even if early checks fail
- Provide specific, actionable feedback for each issue
- Include line numbers and examples where possible
- Prioritize issues by severity (critical, important, minor)
- The report should be clear enough for students to understand what to fix
- Update todo list throughout verification process
- Final report should be comprehensive yet concise

## Output Format

Provide updates during verification:
1. **Start**: "Verifying component: [ComponentName] at [path]..."
2. **Progress**: Use TodoWrite tool to track verification phases
3. **Type Check**: "Running TypeScript type check..."
4. **Analysis**: "Analyzing component structure..."
5. **Final Report**: Display the complete verification report above

Begin verification now.

ARGUMENTS: {{{0}}}
