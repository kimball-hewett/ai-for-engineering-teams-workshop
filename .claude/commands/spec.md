# Generate Specification from Requirements

You are tasked with generating a detailed specification for a component based on business requirements.

## Input Parameters
- Component name: {{{0}}}

## Process

1. **Locate Requirements File**
   - Convert component name to kebab-case
   - Look for `@requirements/[component-name].md`
   - If not found, ask the user to provide the requirements or specify the correct filename

2. **Read Template Structure**
   - Use `@templates/spec-template.md` as the structural guide
   - Follow all four required sections

3. **Generate Comprehensive Specification**

   Create a detailed specification with these sections:

   ### Context
   - Explain the component's purpose and role in the Customer Intelligence Dashboard
   - Describe how it fits into the larger application architecture
   - Identify who will use it (dashboard users, admins) and when
   - Reference integration with existing mock data from `src/data/`

   ### Requirements
   - **Functional Requirements**: What the component must do (core behaviors, user interactions)
   - **User Interface Requirements**: Visual design, layout, responsiveness
   - **Data Requirements**: Props interface, data sources (mock data), data transformations
   - **Integration Requirements**: How it connects with other components, services, or data
   - **Accessibility Requirements**: WCAG 2.1 compliance (ARIA labels, keyboard navigation, focus states, screen reader support)

   ### Constraints
   - **Technical Stack**: Next.js 15, React 19, TypeScript (strict mode), Tailwind CSS v4
   - **Performance Requirements**:
     - Component render time < 16ms (60fps)
     - First Contentful Paint < 1.5s
     - No layout shifts
     - Efficient re-renders (React.memo if needed)
   - **Design Constraints**:
     - Responsive breakpoints: mobile (320px+), tablet (768px+), desktop (1024px+)
     - Minimum touch target: 44x44px
     - Use Tailwind utility classes only (no separate CSS files)
   - **File Structure**:
     - Component path: `src/components/[ComponentName].tsx` (PascalCase)
     - Export props interface: `[ComponentName]Props`
     - Use path alias: `@/*` for imports
   - **TypeScript Definitions**:
     - Define complete props interface
     - Import types using `import type { }` syntax
     - Ensure strict mode compliance
   - **Security Considerations**:
     - Sanitize dynamic content (XSS prevention)
     - Validate data at component boundaries
     - No sensitive data in client-side code

   ### Acceptance Criteria
   Create a testable checklist covering:
   - [ ] Component renders without errors
   - [ ] TypeScript strict mode passes (`npm run type-check`)
   - [ ] All functional requirements implemented
   - [ ] Responsive design works at all breakpoints
   - [ ] Accessibility requirements met (ARIA, keyboard, focus)
   - [ ] Performance targets achieved
   - [ ] Props interface exported correctly
   - [ ] Integration with mock data working
   - [ ] Edge cases handled (loading, error, empty states)
   - [ ] No console errors or warnings

4. **Save Specification**
   - Save to `@specs/[component-name]-spec.md` (kebab-case)
   - Confirm file path and creation to user

## Important Notes

- Reference existing patterns from the codebase (health score colors, component discovery pattern, mock data usage)
- Include specific TypeScript interfaces and type definitions
- Specify exact Tailwind classes where applicable for consistency
- Consider workshop context: this spec will be used by students to implement the component
- Be thorough but clear - specifications should be implementable by AI agents or developers
- If requirements are ambiguous, make reasonable assumptions documented in the Context section

Generate the specification now.