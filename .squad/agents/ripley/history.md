# Ripley — History

## Core Context
Joined the PPTB Dataverse Custom API Manager team as Lead on 2026-02-28.

## Learnings
- Initial team formation with Dallas (Frontend), Kane (Backend), Lambert (Tester)

### 2026-03-XX: CustomAPI Selector Redesign Analysis

**Current Implementation Review:**
- Component: `src/components/CustomApiSelector.tsx` (line 19-161)
- Layout: Solution selector (lines 55-106) comes FIRST, then Custom API selector (lines 109-155)
- Uses: `GenericTagPicker` for both selectors, `ManagedStateToggle` for managed/unmanaged filter
- Data sources: `useSolutions()` and `useCustomApis()` hooks (TanStack Query)
- State: Zustand store (`selectedSolutionId`, `selectedCustomApiId`)
- Filter state: `showSolutions`, `showCustomApis` (local component state)
- Managed filter: Both selectors have independent managed/unmanaged toggles

**Model Insights:**
- `CustomApi` entity includes `_fxexpressionid_value` lookup to PowerFx entity (line 23 in CustomApi.ts)
- `isfunction` boolean distinguishes between Actions and Functions (line 19 in CustomApi.ts)
- BindingType options: Global, Entity, EntityCollection (for filtering potential)
- PowerFx is displayed in separate `PowerFxDetails.tsx` component

**UX Analysis:**
1. **Information Architecture Issue:** Custom API is the PRIMARY user goal (it's the app's main purpose), but Solution selector comes first. This misrepresents the mental model.
2. **Filter vs. Primary Selector:** Solution is truly a filter (narrows available APIs), not a primary selection.
3. **Extensibility Gap:** Adding new filters (PowerFx enabled, Business Events, bindingtype, isfunction) to current flat layout will cause UI clutter.
4. **Managed Filter Consistency:** Both selectors have independent toggle state — duplication/confusion potential.
5. **Edge Case:** Empty results when filters are too restrictive — no error messaging.
6. **Session State:** Filter state persists only in-session (lost on reload) — users may prefer to reset or persist between sessions.
7. **Collapse Pattern:** Similar to `CatalogSelector.tsx` (lines 55-109) which also has Solution-first problem.
8. **Mobile Consideration:** Current side-by-side toggle buttons and multiple fields may not scale well on mobile.

**Architectural Precedent:**
- `CatalogSelector.tsx` has identical pattern (Solution first, Catalog second) with toggle button UI (more clunky than ManagedStateToggle)
- Decision: Fix both components or just CustomAPI in this issue? (Recommended: CustomAPI only, note CatalogSelector for follow-up)

**Key Files for Implementation:**
- Primary: `src/components/CustomApiSelector.tsx`
- Hooks: `src/hooks/useCustomApis.tsx`, `src/hooks/useSolutions.tsx`
- Models: `src/models/CustomApi.ts` (entity properties for filtering)
- Styles: `src/styles/Styles.ts` (existing collapsible/expandable section support)
- Similar: `src/components/CatalogSelector.tsx` (same pattern issue)

### 2026-02-28: Project Structure Review

**Directory Layout:**
- `src/components/` - Feature components + `generic/` for reusable UI + detail views (`customApiDetails/`, etc.)
- `src/models/` - Entity interfaces (Full/Createable/Updateable patterns) + OptionSets + Lookups
- `src/services/` - Entity services extending `EntityService` base class
- `src/hooks/` - TanStack Query hooks (`use<Entity>s.tsx`) + PPTB integration hooks
- `src/store/` - Zustand store (`useAppStore.ts`)
- `src/utils/` - diff.ts, queryKeys.ts, notify.ts, validation.ts, string.ts
- `src/styles/` - Shared Fluent UI styles (Styles.ts)
- `src/assets/` - Static images (logos, icons)

**Key Architectural Patterns:**
1. **Model Pattern**: Full interface → Createable/Updateable picks → Lookups mapping → OptionSets → DEFAULT_CREATE_TEMPLATE
2. **Service Pattern**: Abstract `EntityService` base with `entityName`, `entityCollectionName`, `componenttype`; FetchXML for complex queries
3. **Hook Pattern**: Query + mutation hooks in single file per entity, solution-scoped cache keys
4. **Diff Utilities**: `buildCreatePayload()` / `buildUpdatePayload()` handle OData binding automatically
5. **IIFE Build**: Custom Vite plugin for PPTB iframe compatibility (no ES modules)

**Key Files:**
- Entry: `src/main.tsx` → `src/components/App.tsx`
- Store: `src/store/useAppStore.ts` (connection, selections, editing lock, logs, theme)
- Query Keys: `src/utils/queryKeys.ts` (solution-scoped caching)
- Base Service: `src/services/EntityService.ts`

**Strengths:**
- Clean separation of concerns (models/services/hooks/components)
- Consistent entity patterns across CustomApi, RequestParameter, ResponseProperty, Catalog
- Solution-aware caching with `instanceId` + `connectionId` + `solutionId`
- Immutable state updates with Immer
- Good TypeScript coverage with strict typing

**Areas for Attention:**
- No test framework configured (noted in build commands)
- Business Events feature marked as "Coming Soon"
- Some commented-out code in App.tsx and models (cleanup opportunity)
- Single Styles.ts file may grow large - consider component-level styles

### 2026-03-01: Backlog Creation from Codebase Analysis

**Comprehensive Analysis Completed:**
- Analyzed 50+ files across components, models, services, hooks
- Identified 3 TODO comments in active code
- Found "Coming Soon" Business Events feature stub
- Discovered no test files (*.test.*, *.spec.*) exist
- Reviewed validation patterns, error handling, and data flow

**Backlog Categories Created:**
- 50 backlog items across 11 categories
- Prioritized by impact: High (13), Medium (18), Low (19)
- Key findings: Testing infrastructure completely missing, Business Events incomplete, several UX gaps

**High Priority Items Identified:**
1. **B002**: Add Unit Test Framework - No testing infrastructure exists
2. **B003**: Integration tests for TanStack Query hooks
3. **B001**: Complete Business Events feature (currently stubbed)
4. **B007**: Error boundaries for major components
5. **B024**: Validation test suite
6. **B005**: Connection state validation (existing TODO)

**Architectural Observations:**
- Strong entity service pattern consistency (CustomApi, RequestParameter, ResponseProperty, Catalog all follow same model)
- TanStack Query hooks well-structured with solution-scoped caching
- Zustand store properly manages global state with Immer for immutability
- Diff utilities (buildCreatePayload/buildUpdatePayload) handle OData binding correctly
- Missing: Test coverage, Business Events UI, some error boundaries

**Key File Paths for Team:**
- Backlog: `.squad/backlog.md`
- Models pattern: `src/models/CustomApi.ts` (Full/Createable/Updateable/Lookups)
- Service pattern: `src/services/CustomApiService.ts` (extends EntityService)
- Hook pattern: `src/hooks/useCustomApis.tsx` (query + mutations)
- Diff utils: `src/utils/diff.ts` (payload builders)

### 2026-03-01: README Rewrite

**User Preference:** David prefers minimal README — he plans to create a GitHub Pages site for full documentation.

**Changes Made:**
- Rewrote README.md to be concise and focused
- Updated project title to "Custom API Studio" (matching package.json displayName)
- Included: brief description, quick start, dev commands, tech stack, license
- Added placeholder for future documentation site link
- Commented screenshot placeholder ready for when image is available

**Documentation Strategy:**
- README serves as quick reference only
- Full documentation to live on GitHub Pages (future)

### 2026-03-01: E2E Testing Architecture (Issue #20)

**Task:** Create architecture plan for E2E testing of critical user journeys.

**Key Decisions Made:**
1. **Framework:** Playwright over Cypress — superior iframe handling, native parallelization, excellent TypeScript support
2. **Mocking Strategy:** Window-level mock injection for `window.toolboxAPI` and `window.dataverseAPI`
   - Create `MockDataverseAPI` and `MockToolboxAPI` interfaces extending actual APIs
   - Add `__setQueryResult()`, `__setConnection()`, `__getCalls()` test control methods
   - Inject via `page.evaluate()` in Playwright tests
3. **Entry Point:** Separate `test-main.tsx` that injects mocks before app initialization
4. **Vite Integration:** Add `--mode test` for test-specific builds

**Critical Insight:**
The app's globals (`window.dataverseAPI`, `window.toolboxAPI`) are direct JS APIs, not HTTP endpoints. This rules out MSW (Mock Service Worker) which only intercepts fetch/XHR. Window-level injection is the correct pattern.

**Test Structure:**
- `tests/e2e/mocks/` — Mock implementations matching @pptb/types
- `tests/e2e/fixtures/` — Test data factories
- `tests/e2e/pages/` — Page object models
- `tests/e2e/specs/` — Test specifications

**Critical Paths Identified:**
1. Create Custom API flow
2. Add/edit request parameters
3. Add/edit response properties
4. Execute API via tester
5. Delete API with confirmation
6. Solution filtering behavior

**Output:** `.squad/decisions/inbox/ripley-e2e-architecture.md` — comprehensive proposal ready for Lambert implementation

### 2026-04-15: Collapsed Filter Summary Review

**Review Outcome:** Rejected Dallas's `CustomApiSelector` collapsed summary change for incompleteness.

**Key Findings:**
- `src/components/CustomApiSelector.tsx` now renders badge-based collapsed summaries for selected solution, Custom API managed-state, PowerFx, and Business Event filters.
- The collapsed summary omits the Solution managed/unmanaged filter (`showSolutions`), even though that control lives in the same collapsed filter section and materially changes the available solution list.
- The filter count also still excludes the Solution managed/unmanaged filter, so the collapsed affordance can under-report active filters.
- `npm run build` passed after the change, so the blocking issue is UX correctness/completeness rather than a compile regression.

**Pattern / Guidance:**
- Collapsed filter summaries must mirror every active control inside the collapsed section; partial summaries create misleading state.
- If a filter section shows an active-filter count, the count and the visual summary should be derived from the same source of truth.

**Key Files:**
- `src/components/CustomApiSelector.tsx`
- `src/styles/Styles.ts`
- `.squad/decisions/inbox/dallas-collapsed-filter-summary.md`

### 2026-04-15: Collapsed Filter Summary Re-Review

**Review Outcome:** Approved Kane's revision to the `CustomApiSelector` collapsed filter summary.

**Key Findings:**
- `src/components/CustomApiSelector.tsx` now includes the Solution managed/unmanaged toggle (`showSolutions`) in both the collapsed badge summary and the active-filter count.
- The collapsed state now reflects every active control in the filter section: selected solution, solution managed state, Custom API managed state, PowerFx, and Business Event.
- `npm run build` passed after the revision, so the UI correction is compile-safe.

**Pattern / Guidance:**
- Collapsed filter summaries are acceptable when they enumerate the full active filter set and the count is kept in sync with the same set.
- `styles.badgeContainer` remains the shared presentation pattern for compact collapsed-state overviews in selector cards.

**Key Files:**
- `src/components/CustomApiSelector.tsx`
- `src/styles/Styles.ts`
- `.squad/decisions/inbox/kane-collapsed-filter-revision.md`
