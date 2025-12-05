# Implement Component from Specification

You are tasked with implementing a component based on a detailed specification file, then verifying and iteratively refining it until all acceptance criteria are met.

## Input Parameters
- Spec file path: {{{0}}}

## Implementation Process

### Phase 1: Read and Parse Specification

1. **Load Specification File**
   - Read the spec file from the provided path (supports `@specs/` notation)
   - Parse all sections: Context, Requirements, Constraints, Acceptance Criteria
   - Extract critical information:
     - Component name and file path
     - Props interface definition
     - Required imports and dependencies
     - Functional requirements
     - UI/styling requirements
     - Accessibility requirements

2. **Understand Requirements**
   - Identify the component's purpose and role
   - Note all functional requirements (what it must do)
   - Review UI requirements (visual design, layout, responsiveness)
   - Understand data requirements (props, types, data sources)
   - Check integration requirements (other components, services, mock data)
   - Review constraints (tech stack, performance, design, file structure)

### Phase 2: Plan Implementation

3. **Create Implementation Todo List**
   - Use the TodoWrite tool to create a task list with these items:
     - [ ] Read and parse specification file
     - [ ] Extract component requirements and constraints
     - [ ] Implement component with all required features
     - [ ] Run TypeScript type checking
     - [ ] Verify against acceptance criteria
     - [ ] Refine implementation (if needed)
     - [ ] Final verification and completion

   Mark tasks as completed as you progress through the implementation.

4. **Identify Dependencies**
   - List required imports (React, types from `@/data/`, utilities)
   - Check if component needs to be a client component (`'use client'`)
   - Identify any helper functions or utilities needed
   - Note integration points with mock data

### Phase 3: Component Implementation

5. **Generate Component Code**
   - Create component file at the specified path from spec (typically `src/components/[ComponentName].tsx`)
   - Include `'use client'` directive if component uses hooks, events, or browser APIs
   - Implement the complete component following all requirements:
     - Define and export the props interface
     - Implement all functional requirements
     - Apply Tailwind CSS classes for styling (no separate CSS files)
     - Handle all specified states (loading, error, empty, success)
     - Implement responsive design for all breakpoints
     - Add accessibility features (ARIA labels, keyboard navigation, focus states)
   - Add helper functions if needed for complex logic
   - Use TypeScript strict mode (proper types, no `any`)

6. **Follow Established Patterns**
   - Use existing patterns from the codebase:
     - Health score color coding: red (0-30), yellow (31-70), green (71-100)
     - Import paths: Use `@/*` alias for `src/*`
     - Naming: PascalCase for components, kebab-case for files
   - Match the existing code style and structure
   - Use mock data from `src/data/` when needed

### Phase 4: Initial Verification

7. **Run Type Checking**
   - Execute `npm run type-check` to verify TypeScript compliance
   - Fix any type errors immediately
   - Ensure strict mode passes with zero errors

8. **Verify Core Functionality**
   - Check that component renders without errors
   - Verify all required props are defined in interface
   - Confirm all functional requirements are implemented
   - Check edge case handling (null values, empty data, errors)

### Phase 5: Acceptance Criteria Verification

9. **Check Against Acceptance Criteria**
   - Go through EACH criterion in the acceptance criteria section
   - For each criterion:
     - ✅ Mark as PASS if fully implemented
     - ❌ Mark as FAIL if missing or incomplete
     - Document what's missing for failed criteria

10. **Create Verification Report**
    - List all acceptance criteria with pass/fail status
    - Provide specific details for any failures
    - Identify what needs to be fixed or added

### Phase 6: Iterative Refinement

11. **Refine Implementation**
    - If ANY acceptance criteria failed:
      - Prioritize critical failures (rendering errors, type errors, missing functionality)
      - Fix issues one by one
      - Re-run type checking after each fix
      - Update the verification report
      - Repeat until ALL criteria pass

12. **Performance and Polish**
    - Verify performance requirements are met
    - Check responsive design at all breakpoints (320px, 768px, 1024px)
    - Ensure accessibility requirements are fully implemented
    - Test edge cases thoroughly
    - Add any missing error handling

### Phase 7: Final Verification

13. **Complete Type Checking**
    - Run final `npm run type-check`
    - Confirm zero TypeScript errors
    - Verify all exports are correct

14. **Final Acceptance Criteria Review**
    - Go through acceptance criteria one final time
    - Confirm ALL criteria now pass
    - Document any assumptions or notes

15. **Completion Report**
    - Summarize what was implemented
    - Confirm component location and exports
    - List key features implemented
    - Note any deviations from spec (with justification)
    - Confirm all acceptance criteria met
    - Provide example usage code

## Important Guidelines

### Code Quality Standards
- **TypeScript Strict Mode**: All code must pass strict type checking
- **No `any` Types**: Use proper TypeScript types throughout
- **Proper Exports**:
  - Default export for component
  - Named export for props interface
- **Clean Code**:
  - Clear variable names
  - Minimal complexity
  - Self-documenting code
  - Comments only for complex logic

### Accessibility Requirements (WCAG 2.1)
- Minimum touch target: 44x44px for interactive elements
- Proper ARIA labels for dynamic content
- Keyboard navigation support (Enter/Space for buttons, Tab for focus)
- Focus visible states using Tailwind `focus-visible:` utilities
- Screen reader support (semantic HTML, ARIA announcements)
- Color not sole indicator (include text/icons)

### Performance Standards
- Component render time < 16ms (60fps target)
- No unnecessary re-renders (use React.memo if parent re-renders frequently)
- No layout shifts during rendering
- Efficient data handling

### Styling Standards
- **Tailwind CSS Only**: No separate CSS files
- **Responsive Design**: Mobile-first approach with breakpoints
  - Mobile: 320px+
  - Tablet: 768px+ (use `md:` prefix)
  - Desktop: 1024px+ (use `lg:` prefix)
- **Consistent Spacing**: Use Tailwind spacing scale
- **Color Scheme**: Follow dashboard color patterns

### Testing Approach
- Test with mock data from `src/data/`
- Verify all props combinations work
- Test edge cases (null, undefined, empty, out-of-range values)
- Check responsive behavior at all breakpoints
- Verify accessibility with keyboard navigation

### Iteration Strategy
- Fix critical issues first (build errors, type errors, crashes)
- Then functional requirements (core behaviors)
- Then UI/UX requirements (styling, responsiveness)
- Finally polish (accessibility, performance, edge cases)
- Run type check after each iteration
- Update todo list progress throughout

## Output Format

Provide clear updates during implementation:

1. **Initial Analysis**: "Reading spec from [path]... Found [ComponentName] component specification"

2. **Implementation Progress**: Use TodoWrite tool and update as you progress

3. **Verification Results**:
   ```
   Acceptance Criteria Verification:
   ✅ PASS: Component renders without errors
   ✅ PASS: TypeScript strict mode compliance
   ❌ FAIL: Responsive design - mobile breakpoint not handling overflow
   ...
   ```

4. **Refinement Updates**: "Fixing: [specific issue]... [result]"

5. **Final Report**:
   ```
   Implementation Complete: [ComponentName]

   Location: src/components/[ComponentName].tsx
   Exports: [ComponentName]Props interface, default [ComponentName] component

   Features Implemented:
   - [feature 1]
   - [feature 2]
   ...

   Acceptance Criteria: [X/Y] passed
   TypeScript: ✅ Zero errors

   Example Usage:
   [code example]
   ```

## Error Handling

- If spec file not found: Ask user to verify the path
- If spec is incomplete: Note missing sections and make reasonable assumptions
- If type checking fails: Show errors and fix immediately
- If acceptance criteria unclear: Implement reasonable interpretation and document
- If external dependencies missing: Note in completion report

## Notes

- Always prioritize the specifications over assumptions
- When in doubt about requirements, implement the most straightforward solution
- Document any deviations from spec with clear justification
- The goal is 100% acceptance criteria pass rate
- Use the TodoWrite tool throughout to track progress
- Mark todo items as completed immediately after finishing each phase

Begin implementation now.

ARGUMENTS: {{{0}}}
