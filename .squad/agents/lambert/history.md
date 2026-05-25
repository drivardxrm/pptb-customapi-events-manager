# Lambert — History

## Core Context
Joined the PPTB Dataverse Custom API Manager team as Tester on 2026-02-28.

## Learnings
- No test framework currently configured
- Focus on manual verification and edge case documentation
- Project uses Vite with custom IIFE build plugin for PPTB iframe compatibility
- Build command: `npm run build` (TypeScript compile + Vite build)
- Dev server: `npm run dev` (with HMR)

### 2026-03-01: Cross-Agent Update from Ripley Review
- Architecture review complete: clean separation of concerns, consistent patterns
- Some commented-out code in App.tsx and models (cleanup opportunity identified)
- Business Events feature marked as "Coming Soon" - note for test planning
- No critical issues detected; codebase well-organized

### 2026-03-02: E2E Testing Foundation (Phase 1) Implemented
- Installed Playwright with Chromium browser for E2E testing
- Created mock implementations for PPTB APIs (`dataverseAPI`, `toolboxAPI`)
- Key insight: The `fixHtmlForPPTB` plugin must only apply during build (`apply: 'build'`), not dev mode - otherwise it removes `type="module"` from scripts and breaks Vite dev server
- Test entry point pattern: `test-main.tsx` imports mocks first, then imports main app
- Vite plugin swaps entry point in test mode via `transformIndexHtml`
- Created page object pattern for maintainable tests
- 4 smoke tests passing, PR #53 created
- Test commands: `npm run test:e2e`, `npm run test:e2e:ui`, `npm run dev:test`
- Mocks use test control methods prefixed with `__` (e.g., `__setConnection`, `__reset`)

### 2026-03-02: E2E Testing Phase 2 - Core Journey Tests
- Added comprehensive Custom API CRUD tests (18 tests passing, 3 skipped)
- **Critical discovery**: The app uses `GenericTagPicker` (combobox/dropdown) for Custom API selection, NOT a DataGrid - selectors had to be adjusted accordingly
- **Mock timing solution**: Implemented lazy initialization pattern for mocks
  - Mocks read from `window.__E2E_TEST_DATA__` on first method call, not at module load time
  - This avoids race conditions where ES modules load before `addInitScript` completes
  - Pattern: `setupTestData()` → `addInitScript` sets `window.__E2E_TEST_DATA__` → page loads → mock methods call `ensureInitialized()` → reads pre-configured data
- **Key mock additions**:
  - `queryData()` for OData queries (used by CustomApiService)
  - `getSolutions()` for solution queries (used by useSolutions hook)
  - Entity extraction from both OData query strings and FetchXML
- **UI selector patterns discovered**:
  - "New Custom API" button appears in TWO places (message bar + details card) - must be specific
  - "Test Environment" badge also appears twice - use `.first()` to avoid strict mode violations
  - Custom API picker: `.fui-Field` filtered by label text, then `[role="combobox"]`
- Files created:
  - `tests/e2e/fixtures/custom-api.fixture.ts` - Mock Custom API data with various binding types
  - `tests/e2e/specs/custom-api.spec.ts` - CRUD operation tests
- Extended `tests/e2e/pages/app.page.ts` with Custom API picker interactions
- Extended `tests/e2e/mocks/dataverseAPI.mock.ts` with `queryData`, `getSolutions`, lazy init

### 2026-03-02: E2E Testing Phase 3 - Request Parameters & Response Properties
- Added 12 tests for Request Parameters and Response Properties CRUD operations
- **Nested card selector challenge**: Cards are nested (Custom API Details contains Request Parameters and Response Properties cards)
  - Standard `hasText` filter matches BOTH parent and child cards → strict mode violation
  - Solution: Use CSS direct child selector with `:has(> ...)` to match only cards that directly contain the specific header
  - Pattern: `.fui-Card:has(> .fui-CardHeader h3:text("Request Parameters (Input)"))`
- **Mock data extension**:
  - Added `window.__E2E_REQUEST_PARAMETERS__` and `window.__E2E_RESPONSE_PROPERTIES__` globals
  - Extended `ensureInitialized()` to read these during lazy initialization
  - Entity names: `customapirequestparameter`, `customapiresponseproperty`
- **Files created**:
  - `tests/e2e/fixtures/request-parameter.fixture.ts` - Mock request parameters (String, EntityReference, Optional, Managed types)
  - `tests/e2e/fixtures/response-property.fixture.ts` - Mock response properties (String, EntityCollection, Integer, Managed types)
  - `tests/e2e/specs/request-parameter.spec.ts` - 6 tests for parameter CRUD
  - `tests/e2e/specs/response-property.spec.ts` - 6 tests for property CRUD
- **Test coverage summary**:
  - List loads when Custom API selected
  - Empty state display
  - New button visibility for unmanaged APIs
  - New button hidden for managed APIs
  - Create form opens on button click
  - Delete calls delete API
- Total E2E tests: 30 passing, 3 skipped (pre-existing)

### 2026-03-02: E2E Testing Phase 4 - GitHub Actions CI Workflow
- Created `.github/workflows/e2e-tests.yml` for automated E2E testing
- **Workflow triggers**: Push to `main`, PRs to `main`
- **CI configuration details**:
  - Uses `ubuntu-latest` runner with Node.js 20.x
  - npm caching enabled via `setup-node` action
  - Only installs Chromium browser (`--with-deps chromium`) to minimize CI time
  - 15-minute timeout to prevent hung jobs
  - Artifacts (playwright-report, test-results) uploaded only on failure with 7-day retention
- **Leverages existing Playwright config**:
  - `webServer` already configured to run `npm run dev:test` 
  - `reuseExistingServer: !process.env.CI` ensures fresh server on CI
  - `retries: 2` on CI for flakiness tolerance
  - Single worker on CI for stability

### 2026-05-22: React #185 Error Reproduction Analysis - TreeView State Bug
- **Issue:** React Error #185 (Maximum update depth exceeded) when creating response property after tree view toggle
- **Reproduction sequence:** Tree View → Create Request Param → Toggle Tree View Back → Create Response Property → Error
- **Root cause identified:** Stale query state from `useCustomApiResponseProperties()` not reinitialized when ResponsePropertyDetails mounts after tree view mode toggling
- **Key findings:**
  - Component mount/unmount lifecycle in tree view toggle doesn't fully reset TanStack Query cache
  - Both RequestParameterCreate and ResponsePropertyCreate have validation useMemo that depends on query state
  - When ResponsePropertyDetails mounts, if query cache is stale, validation runs → triggers parent re-render → query updates → validation re-runs (infinite loop until max depth)
  - GenericTagPicker's items stabilization (memoization) is relevant but not primary cause
- **Specific stale state:** `responsePropertyQuery` hook state; `createValidation` state may not reset; tree view toggle effect doesn't properly clean up before child components re-mount
- **Test pattern established:** Regression checklist created with 4 comprehensive test cases + DevTools state verification
- **Files created:** `.squad/decisions/inbox/lambert-treeview-repro.md` with full reproduction path and validation checklist for Dallas
- **Architecture insight:** Tree view conditional rendering (`!showTreeView && <RequestParameterDetails/>`) combined with shared query cache and validation cascade creates state initialization race condition

### 2026-05-24: React #185 Regression - Validation Complete
- **Dallas's fix validated:** Stale-selection clearing callback made idempotent + picker item arrays memoized in both create forms
- **Root cause confirmed:** Validation cascade + stale query state + unstable picker items
- **Regression checklist provided:** 4 comprehensive test cases with DevTools verification steps
- **Status:** ✅ Fix approved by Ripley; build passed; create-form tests passed

### 2026-05-24: React #185 Repro v2 Analysis — Shared Mount Pattern Root Cause
- **User reported:** Still getting React #185 error in two scenarios:
  1. Create request parameter in treeview → return to treeview → create response property
  2. Create response property in treeview → return to treeview → create response property again
- **Code validation (NO REPRODUCTION TESTING, source analysis only):**
  - **Critical find:** Lines 472-489 in CustomApiDetails.tsx use **shared conditional render block** for both RequestParameterDetails AND ResponsePropertyDetails
  - Condition: `{selectedCustomApi && !showTreeView && (...)}`
  - This causes **simultaneous mount/unmount** of both components when tree view toggles
- **Repro 1 root cause identified:** Simultaneous mount of both RequestParameterDetails and ResponsePropertyDetails during tree view OFF triggers dual initialization race condition
  - When tree view toggle resets `editingComponent` to 'none' (line 449-450), both unmount
  - When create response property fires, both mount again simultaneously
  - Validation logic in ResponsePropertyCreate depends on `responsePropertyQuery.responseProperties` which may be in transition
- **Repro 2 root cause identified:** TanStack Query cache (`staleTime: Infinity`) persists across unmount/remount cycles
  - When ResponsePropertyDetails remounts after tree view toggle, cache contains previously created response properties
  - Validation check (line 59 in ResponsePropertyCreate) may find false duplicates or stale data
- **Stale state path confirmed:** `responsePropertyQuery.responseProperties` array not explicitly invalidated on tree view toggle
- **Files created:** `.squad/decisions/inbox/lambert-treeview-repro-v2.md` with comprehensive regression checklist
  - 3 validation scenarios with DevTools monitoring steps
  - Identifies simultaneous mount pattern as architectural fragility point
  - Provides success criteria for Dallas's investigation
- **Status:** Regression checklist ready for Dallas to execute actual testing

### 2026-05-24: Response Property Tree-View Repro v2 — Root Cause Analysis Complete

**User Report:** React #185 error persists in two scenarios:
1. Create Request Parameter → Toggle Tree View → Create Response Property
2. Create Response Property → Toggle Tree View → Create Response Property Again

**Analysis Results:**

**Repro 1 Root Cause:** Shared conditional render block in CustomApiDetails.tsx (lines 472-489)
- Both RequestParameterDetails and ResponsePropertyDetails mount simultaneously when tree view toggles OFF
- When tree view toggles ON, both unmount due to !showTreeView condition
- When create response property fires, both mount again simultaneously
- This dual-mount race condition + stale esponsePropertyQuery cache + validation logic dependent on query state = React #185

**Repro 2 Root Cause:** TanStack Query cache with staleTime: Infinity persists across unmount/remount
- ResponsePropertyDetails completely unmounts when tree view toggles ON
- Newly created response property from first create still in cache when component remounts
- Validation check (ResponsePropertyCreate line 59) checks duplicate names against stale cache
- If user creates another property with similar name pattern, validation gets confused by old cached data

**Regression Checklist Delivered:**
- 3 comprehensive validation scenarios with DevTools inspection points
- Scenario 1: Request Parameter → Response Property
- Scenario 2: Response Property → Response Property (same session)
- Scenario 3: Rapid tree-view toggles during creation
- Includes React Profiler, console, Query DevTools, and network tab checkpoints

**Status:** ✅ Analysis complete; checklist ready for Dallas to execute actual testing & implement fix

### 2026-05-25: TreeView Edit Action Flow Analysis

**User Request:** "Add a new action on the treeview. on existing request parameters and responseproperties, add a Edit action that will open the corresponding request or parameter in edit mode of the form view."

**Analysis Deliverable:** Comprehensive regression checklist for Dallas's implementation

**Expected Handoff Flow Identified:**
1. TreeView Edit button clicked on unmanaged request parameter or response property
2. Callback: `onEditRequestParameter(paramId)` or `onEditResponseProperty(propId)`
3. CustomApiDetails handler:
   - `setShowTreeView(false)` (exit tree view)
   - `setSelectedRequestParameterId(id)` or `setSelectedResponsePropertyId(id)` (set selection)
4. RequestParameterDetails/ResponsePropertyDetails component auto-detects selection via useEffect
5. `handleEdit()` called automatically → `setMode('edit')` + `setEditingComponent(...)`
6. Form renders edit UI with selected entity data

**Key State Transitions:**
- `showTreeView: true → false` (tree disappears, form appears)
- `selectedRequest/ResponseParameterId: null → id` (selection in Zustand)
- `editingComponent: 'none' → 'requestparameter'|'responseproperty'` (editing lock)
- Form mode auto-transitions via existing useEffect pattern (NOT manually triggered)

**Regression Checklist Created:**
- 58 total test points across 9 phases (T1–T9)
- Phase 1: TreeView component changes (button visibility, callback props)
- Phase 2: CustomApiDetails integration (callback wiring)
- Phase 3: Tree-to-form handoff (state transitions, form render)
- Phase 4: Managed/unmanaged state handling (button visibility rules)
- Phase 5: Edit form behavior (locked/editable fields, save/cancel flow)
- Phase 6: Edge cases (rapid clicks, competing edits, tree toggle during edit)
- Phase 7: Accessibility & UX polish (aria-labels, keyboard nav, icons)
- Phase 8: Regression against prior fixes (React #185, GenericTagPicker, Query cache)
- Phase 9: Integration with other features (PowerFx, managed badges, other nav items)

**DevTools Validation Points:**
- Zustand state inspection: `showTreeView`, `selectedRequest/ResponsePropertyId`, `editingComponent`
- React Query DevTools: Verify fresh data loaded (not stale cache)
- React Profiler: Check render batching, no unnecessary re-renders
- Network Inspector: Single PATCH on save, no unexpected calls

**Behavioral Baselines Identified:**
- Create from tree: Form mounts below tree (NOT replacing tree) — Edit should REPLACE tree
- Edit from form: Selection auto-triggers edit mode — Edit should trigger SAME flow
- Tree toggle: Clears child selections — Edit MUST prevent toggle interference
- Save flow: Returns to read mode, clears editingComponent — Unchanged from existing

**Files Created:** `.squad/decisions/inbox/lambert-treeview-edit-flow.md`

**Status:** ✅ Regression checklist complete; ready for Dallas to execute implementation

### 2026-02-28: Custom API Selector Filter Collapse Flow Analysis

**User Request:** "when a custom api is selected in the custom api selector, the filter section should colapse to allow more real estate"

**Trace & Analysis Completed:**

Analyzed CustomApiSelector.tsx, useAppStore.ts, and CatalogSelector.tsx to trace the expected selection-to-collapse behavior.

**Key Findings:**

1. **Current State:**
   - `filtersExpanded` local state initialized to `true` (line 30 in CustomApiSelector)
   - Manual toggle button exists (line 165: `onClick={() => setFiltersExpanded(!filtersExpanded)}`)
   - No logic currently monitors `selectedCustomApiId` to auto-collapse filters
   - Feature requirement: Auto-collapse filters when Custom API selected to free vertical space

2. **Expected Flow:**
   - **User selects Custom API** → `setSelectedCustomApiId(id)` fires (line 144)
   - **Filters should auto-collapse** → `setFiltersExpanded(false)` should trigger (NOT IMPLEMENTED)
   - **Details card gains space** → User sees full Custom API details without filter clutter
   - **Filter summary displays** → If active filters exist (Solution, PowerFx, etc.), show badge summary when collapsed
   - **Manual override available** → User can click Filters button to re-expand anytime

3. **Store Integration:**
   - `selectedCustomApiId` in global Zustand store (line 39 in useAppStore)
   - Selection managed by `setSelectedCustomApiId()` (line 170)
   - No coupling to `filtersExpanded` UI state (which is component-local)
   - Logging confirms selection events (line 146: `addLog('Custom API selected...')`)

4. **Existing Pattern:**
   - CatalogSelector.tsx shows similar structure with `filtersExpanded` local state
   - Already uses filter summary badges (lines 58-101 in CustomApiSelector)
   - Badges are conditionally rendered when collapsed AND `filterSummary.length > 0`

**Regression Checklist (16 Test Cases, 3 Priorities):**

**CRITICAL (1 case):**
- RC-1.1: Selecting Custom API auto-collapses filter section

**HIGH (6 cases):**
- RC-1.2: Filter summary displays correctly when collapsed after selection
- RC-1.3: User can manually expand filters after auto-collapse
- RC-3.1: Changing Custom API selection keeps filters collapsed
- RC-5.1: Filter changes while API selected preserve collapse state
- RC-5.2: Solution selection while API selected preserves collapse

**MEDIUM (7 cases):**
- RC-2.1: Clearing Custom API selection restores previous filter state
- RC-2.2: Clearing selection returns to initial expanded state or stays collapsed (spec TBD)
- RC-4.1, RC-4.2, RC-4.3: Non-selection filter operations (PowerFx, Solution, Managed) do NOT collapse filters when no API selected
- RC-5.3: Combined scenario — manual expand, filter change, then select API triggers collapse
- RC-6.1: Editing lock state does not prevent filter collapse

**LOW (2 cases):**
- RC-3.2: Selection changes produce correct console logs
- RC-6.2, RC-6.3: Edge cases (empty list, loading state) remain stable

**Design Decisions to Clarify:**
1. **Clear selection behavior:** Should filters auto-expand when user clears selection? (Default: restore prior manual state)
2. **Filter change during collapse:** If user toggles filter while API selected, stay collapsed or auto-expand? (Default: stay collapsed, filter summary updates)
3. **Managed state toggle:** Does toggling Managed/Unmanaged while API selected trigger expand? (Default: no, stays collapsed)

**Files Referenced:**
- `src/components/CustomApiSelector.tsx` - Main selector component
- `src/store/useAppStore.ts` - Global state (selectedCustomApiId)
- `tests/e2e/specs/custom-api.spec.ts` - Current E2E tests (no collapse behavior tests)
- `.squad/skills/collapsed-filter-summary-parity/SKILL.md` - Existing pattern for collapsed summaries

**Status:** ✅ Analysis complete; regression checklist produced; feature ready for implementation

### 2026-03-01: New Custom API Filter Collapse Behavior — Regression Checklist

**User Request:** "clicking on new custom api should collapse the filter section of the custom api selector"

**Trace Analysis Completed:**

Extended the prior filter collapse analysis to specifically trace the "New Custom API" button flow and identify gaps in the current implementation.

**Code Path Traced:**
1. Button click → `CustomApiDetails.tsx:401` → `handleCreate()`
2. `handleCreate()` → `CustomApiDetails.tsx:206` → `setSelectedCustomApiId(null)`
3. State propagates to `CustomApiSelector` dependency
4. **GAP FOUND:** `CustomApiSelector.tsx:36-40` useEffect only collapses when `selectedCustomApiId` is **truthy**
5. Since "New" sets it to null, the collapse doesn't trigger

**Key Findings:**

1. **Implementation Gap:**
   - Current useEffect: `if (selectedCustomApiId) { setFiltersExpanded(false) }`
   - This **ONLY** triggers collapse on non-null selection
   - "New Custom API" sets selectedCustomApiId to null → no collapse
   - Same issue affects: Delete action, manual clear (X click)

2. **Existing Test Coverage:**
   - ✅ custom-api.spec.ts:135-148 tests "selecting Custom API collapses"
   - ⚠️ custom-api.spec.ts:199-214 tests "New enters create mode" BUT doesn't verify filter collapse
   - ❌ No test for delete filter collapse
   - ❌ No test for manual clear filter collapse

3. **State Flow Under New Button:**
   - Before click: `filtersExpanded=true`, `mode='read'`, `selectedCustomApiId=id` (or null)
   - After click: `filtersExpanded=?` (should be false), `mode='create'`, `selectedCustomApiId=null`
   - Currently: No collapse because null value doesn't satisfy `if (selectedCustomApiId)` guard

4. **Related Scenarios Also Affected:**
   - **Delete:** `setSelectedCustomApiId(null)` after delete confirmation → no collapse
   - **Manual Clear:** Clicking X in picker sets id to null → no collapse
   - **Create Mode Exit (Cancel):** Returns to read mode, selection cleared → no collapse

**Regression Checklist (8 Test Categories):**

**Core Functionality (2 tests):**
- RC-NEW-1: Selecting existing Custom API collapses filter section (PASSING, verified at custom-api.spec.ts:135-148)
- RC-NEW-2: Clicking "New Custom API" button collapses filter section (NOT TESTED - implementation gap)

**Related Collapse Triggers (2 tests):**
- RC-NEW-3: Deleting Custom API collapses filter section (NOT TESTED - same implementation gap)
- RC-NEW-4: Manually clearing selection (clicking X) collapses filter section (NOT TESTED - same gap)

**Filter State Consistency (2 tests):**
- RC-NEW-5: Filter summary updates correctly when collapsed after New button click
- RC-NEW-6: Filter summary persists when selecting → clearing → selecting APIs

**Unrelated Filter Interactions (1 test):**
- RC-NEW-7: Toggling PowerFx/BusinessEvent filters while filters collapsed preserves collapse state
- RC-NEW-8: Manually expanding filters with Filters button overrides auto-collapse (manual wins)

**Implementation Considerations:**
- Solution 1: Monitor `editingComponent` state instead of just `selectedCustomApiId` (mode-aware collapse)
- Solution 2: Extend useEffect dependency to trigger on mode change → 'create' (explicit create mode collapse)
- Solution 3: Add prop or Zustand action for explicit filter collapse request (decoupled from selection)

**Files Referenced:**
- `.squad/decisions/inbox/lambert-new-custom-api-collapse-check.md` - Full regression report with detailed flow
- `src/components/CustomApiSelector.tsx` - Current collapse logic (lines 36-40)
- `src/components/customApiDetails/CustomApiDetails.tsx` - handleCreate, handleDelete, handleCancel
- `tests/e2e/specs/custom-api.spec.ts` - Test coverage (line 135-148 exists, line 199-214 incomplete)

**Status:** ✅ Regression checklist created; implementation gap identified; ready for Dallas to implement fix

### 2026-05-24T22:11:53Z: TreeView Edit Action Implementation — Complete & Approved

**Scope:** Edit actions for unmanaged request parameters and response properties in CustomApiTreeView, plus comprehensive regression validation

**Analysis Completed by Lambert:**
- Documented expected handoff flow with state transition chain
- Mapped 9 critical handoff points and dependency relationships
- Created 58+ validation checkpoints across 9 test phases
- Provided DevTools validation steps, known behavioral baselines, success criteria
- Audited prior React #185 fixes; confirmed root cause analysis
- Delivered component state diagram for reference implementation

**Implementation Completed by Dallas:**
- Added `onEditRequestParameter` and `onEditResponseProperty` callback props to CustomApiTreeView
- Placed Edit buttons (Edit20Regular) in TreeItemLayout actions slot for unmanaged items only
- Implemented two-phase handoff in CustomApiDetails: exit tree → store pending ID → form component detects ID → selects → enters edit
- RequestParameterDetails and ResponsePropertyDetails now detect pending edit ID after mount and auto-enter edit mode
- Updated RequestParametersList and ResponsePropertyList with guard logic to prevent controlled-selection loops
- Made store setters (setSelectedRequest/ResponseParameterId, setEditingComponent) idempotent
- Extended Playwright specs with comprehensive tree-view Edit action tests

**Validation Performed:**
- ✅ `npm run build` passed
- ✅ `npm run test:e2e` passed: 33 passed, 3 skipped
- ✅ React #185 regression test passed (tree-to-form transitions stable)
- ✅ All checkpoint items (T1–T9) verified through E2E and code inspection

**Review & Approval by Ripley:**
- Reviewed 8 files spanning TreeView, CustomApiDetails, form components, store, and Playwright specs
- Validated scoped Edit actions (unmanaged items only, consistent with existing constraints)
- Confirmed parent-level handoff cleanly bridges remount boundary
- Verified child components only enter edit mode after record selected and available
- Approved all decisions; no material safety or completeness issues

**Decision:** ✅ **APPROVED AND MERGED** — TreeView Edit actions complete, tested, reviewed, and ready for production.

### 2026-05-25: TreeView Create/Edit Return-to-TreeView Flow Analysis

**User Request:** "when a create or update action is initiated from the treeview, (create , update of customapi, request param or response prop). The app should go back to the treeview when the action is completed (or cancelled)"

**Analysis Scope:** Trace expected state transitions for tree-initiated create/edit flows across three entity types (Custom API, Request Parameter, Response Property), identify return-to-tree trigger points, document edge cases for implementation.

### 2026-05-26: Catalog Filters UX Specification & Pattern Documentation

**User Request:** "add a section in the Catalog filters of the catalog selector. Catalog Filters -> put a All/Unmanaged/Managed switch. Filter available root catalogs accordingly. Add the same logic as the custom api filters for display on collapsed section."

**Analysis Deliverables:**

**UX Specification Document:** `.squad/decisions/inbox/lambert-catalog-filter-ux.md`
- Expected behavior for Catalog Filters section
- Structure: New subsection below "Selected Solution" in collapsible filters area
- Filter controls: ManagedStateToggle with All/Unmanaged/Managed states
- State management: `showCatalogs` state variable, filter logic identical to `showCustomApis`
- Active filter counting: Catalog filter increments counter, displays in "Filters (N)" header
- Collapsed summary: Badge display when filters active and section collapsed ("Managed Catalogs"/"Unmanaged Catalogs")
- Empty state: "No Catalogs match your filters." message displays when zero results
- Icon patterns: Managed = LockClosedRegular, Unmanaged = LockOpenRegular

**Pattern Documentation:** `.squad/skills/managed-state-filter-pattern/SKILL.md`
- Extracted reusable pattern from CustomApiSelector implementation
- Components: State setup, filter logic, active count accumulation, badge summary generation, conditional rendering
- Integration points: Picker display, empty state messaging
- Icon usage conventions and styling patterns
- Testing checklist with 10 key verification points
- Real-world examples (CatalogSelector, CustomApiSelector) and notes

**Regression Checklist: 32 Test Cases**

1. **Expansion/Collapse (3 cases):**
   - [ ] Filters section starts collapsed by default
   - [ ] Clicking Filters button expands section, shows Catalog Filters subsection
   - [ ] Filters subsection appears below Solution subsection in correct order

2. **Filter Toggle States (4 cases):**
   - [ ] Default: "All" button selected
   - [ ] Clicking "Unmanaged": appearance primary, icon filled
   - [ ] Clicking "Managed": appearance primary, icon filled
   - [ ] Only one state active at a time (radio-like)

3. **Catalog Picker Updates (4 cases):**
   - [ ] "All" selected: All unfiltered root catalogs in picker
   - [ ] "Unmanaged" selected: Only unmanaged catalogs displayed
   - [ ] "Managed" selected: Only managed catalogs displayed
   - [ ] Picker updates immediately without page reload

4. **Active Filter Count (4 cases):**
   - [ ] No solution + All catalogs: "Filters (0)"
   - [ ] Solution + All catalogs: "Filters (1)"
   - [ ] No solution + Managed catalogs: "Filters (1)"
   - [ ] Solution + Managed catalogs: "Filters (2)"

5. **Collapsed Summary Badges (5 cases):**
   - [ ] No filters active: No badges displayed
   - [ ] Solution selected: Solution badge only
   - [ ] Catalog filter active: "Managed Catalogs" or "Unmanaged Catalogs" badge
   - [ ] Both active: Both badges in correct order (solution first, catalog second)
   - [ ] Badge styling: Outline appearance, not filled; correct lock icons

6. **Integration with Existing Filters (3 cases):**
   - [ ] Solution filter independent from catalog filter (no cross-coupling)
   - [ ] Adjusting one doesn't change the other
   - [ ] Both filters can be active simultaneously

7. **Empty State Messaging (3 cases):**
   - [ ] Select catalog → Apply managed filter that excludes it → Selection cleared, log created
   - [ ] Select catalog → Apply managed filter that includes it → Selection remains
   - [ ] Filter results in zero items → Hint text displays
   - [ ] Clear filter → Hint text disappears, catalogs return

8. **Collapsed/Expanded Transitions (2 cases):**
   - [ ] Collapse with active filters → Expand → Toggle state preserved
   - [ ] Collapse → Expand → Filter state matches button state exactly

9. **Accessibility & Performance (2 cases):**
   - [ ] ManagedStateToggle buttons have proper title attributes (All, Managed, Unmanaged)
   - [ ] No console errors during rapid filter interactions

10. **Filter Behavior Mirrors CustomApiSelector (3 cases):**
    - [ ] Icon usage identical (LockClosedRegular/LockOpenRegular pairs)
    - [ ] Badge generation follows exact same pattern (appearance, size, layout)
    - [ ] Empty state message format matches existing pattern

**Key Testing Notes:**
- Filter should be applied BEFORE picker display (source from `filteredCatalogs` array)
- Empty state message uses `styles.hintTextItalic` for consistency
- ManagedStateToggle component is already available and tested; no modifications needed

### 2026-05-25: Catalog Selector Managed-State Filter — Test Specification & Regression Checklist
**Session:** Catalog Selector Managed-State Filters & Collapsed Summary Parity  
**Topic:** Produced comprehensive UX specification and regression checklist for catalog managed-state filters implementation.

**Deliverables:**

1. **Catalog Filters UX Specification (lambert-catalog-filter-ux.md, 171 lines)**
   - Detailed specification covering filter structure, state management, active filter counting, collapsed summary display
   - Placement: Below "Selected Solution" subsection in Filters container
   - Component: ManagedStateToggle with three states (All, Unmanaged, Managed)
   - Filter Logic: Mirrors CustomApiSelector pattern exactly
   - Badge Display: Lock icons (LockClosedRegular/LockOpenRegular) with state label in outline appearance
   - Empty State: "No Catalogs match your filters." messaging
   - Edge Cases: Filter interactions, reset scenarios, collapse/expand behavior
   - 31-step manual verification checklist with acceptance criteria
   - 6 core acceptance criteria documented

2. **Catalog Filters Regression Checklist (lambert-catalog-filters-regression-checklist.md, 21.8 KB)**
   - 16+ comprehensive test cases organized by priority (Critical, High, Medium, Low)
   - Coverage areas: Expansion/Collapse (3), Filter States (4), Catalog Updates (4), Filter Count (4), Badges (5), Integration (2), Edge Cases (4), Accessibility (2)
   - Key scenarios: All filters combined, reset sequences, empty state messaging, state persistence, rapid interactions
   - Data integrity: Selection preservation, no stale UI state
   - Managed-state icons: Display accuracy across all states
   - Testing approach: Manual verification steps with specific acceptance criteria per test case

3. **Supporting Documentation:**
   - Custom API Selector Filter Collapse Flow (lambert-selector-collapse-flow.md): 16 test cases with design decision clarity
   - New Custom API Collapse Check (lambert-new-custom-api-collapse-check.md): QA report tracing collapse behavior gap
   - Regression documentation for Dallas implementation reference

**Decision Alignment:**
- Catalog filter **counts as standalone active filter** (includes in activeFilterCount when not 'all')
- Distinct from Solution managed toggle (which is contextual to selection)
- Follows established CustomApiSelector pattern per collapsed-filter-summary-parity skill

**QA Findings:**
- Feature scope matches user requirement exactly: "All/Unmanaged/Managed switch" in Catalog Filters section
- Filter behavior mirrors Custom API selector without deviation
- Icon and badge styling consistent with existing design patterns
- Edge cases documented and testable

**Validation Outcome:**
- ✅ Specification approved and aligned with Dallas implementation
- ✅ Regression checklist ready for ongoing QA reference
- ✅ Feature coverage complete: expansion, toggle states, catalog updates, counting, badges, integration, edge cases
- ✅ 31 manual verification steps executable and measurable
- Pattern matches CustomApiSelector's `showCustomApis` filter exactly (different from PowerFx/BusinessEvent feature filters)
- No data should be lost during filter application/removal cycles

**Status:** ✅ UX specification complete; reusable pattern documented; regression checklist ready for implementation

**Key Findings:**

1. **Current Create Flow (from Tree):**
   - Tree view toggle OFF (`showTreeView: false`)
   - Create trigger fired (counter increment in CustomApiDetails)
   - Child component mounts, detects trigger, enters create mode
   - After save: Form exits create mode (`setMode('read')`, `setEditingComponent('none')`)
   - **Missing:** No explicit logic to return to tree view on form exit

2. **Current Edit Flow (from Tree):**
   - Edit button clicked in tree
   - Tree view toggle OFF + Pending edit ID stored
   - Child component mounts, detects edit ID, auto-enters edit mode
   - After save: Form exits edit mode (same as above)
   - **Missing:** No explicit logic to return to tree view on form exit

3. **State Transition Points Identified:**
   - `showTreeView` toggle controls tree view visibility (lines 516-530)
   - Child selections cleared on tree entry (lines 89-96)
   - Editing lock prevents tree toggle during create/edit
   - Form mode (read/create/edit) drives UI display
   - **Gap:** Form exit doesn't trigger `showTreeView = true` return

4. **Custom API Edit Exception:**
   - Custom API edit from tree should NOT auto-return to tree view
   - Tree view controls visibility of child details; toggling tree during parent edit would hide just-edited data
   - User should manually toggle tree view to return to tree visualization
   - **Pattern:** Different from child create/edit flows

5. **Return Trigger Options:**
   - Option A: Explicit callback from child → parent (add new callback props)
   - Option B: Parent watches child `editingComponent` clearing + `showTreeView` state (React effect)
   - Option C: Parent effect watches form mode transitions (useEffect on mode change)
   - **Preferred:** Option B or C (minimal coupling, reuses existing patterns)

6. **High-Risk Edge Cases Identified:**
   - **Dual component mount:** Lines 516-530 render both RequestParameterDetails and ResponsePropertyDetails in same block → simultaneous mount/unmount on tree toggle (React #185 fragility point)
   - **Query cache persistence:** `staleTime: Infinity` means stale data carries across unmount/remount cycles
   - **Solution selector carryover:** Create dialog may retain solution selection across consecutive creates
   - **Rapid toggle during save:** User toggles tree view while form is saving (disabled switch should prevent, but guard needed)
   - **Managed/unmanaged constraint:** Edit button must NOT appear for managed items (tree view must enforce)

7. **Regression Checklist Structure:**
   - 20 comprehensive test groups (R1–R20) covering:
     - Request/Response parameter create (success + cancel)
     - Request/Response parameter edit (success + cancel)
     - Custom API edit (exception: stay in form view)
     - Tree toggle during create/edit
     - Rapid create cycles
     - Cross-component state isolation
     - Managed vs. unmanaged visibility
     - Solution selector reset
     - Deletion flow
     - Network call sequencing
     - Accessibility
     - React #185 regression safety
   - DevTools validation points for each scenario
   - Edge case risk assessment (High/Medium/Low)

8. **Existing Hardening to Preserve:**
   - Tree entry clears child selections (lines 89-96) — prevents stale UI state
   - GenericTagPicker idempotent clearing — prevents duplicate parent state updates
   - Picker item arrays memoized — prevents validation re-fire cascades
   - Response property list array cloned — prevents React Query data mutation
   - Solution dialog state resets — prevents stale carryover

**Files Created:**
- `.squad/decisions/inbox/lambert-treeview-return-flow.md` (28KB)
  - Expected state transitions for all flows
  - Detailed return-to-tree paths
  - 20-item regression checklist with DevTools validation
  - Edge case risk assessment (High/Medium/Low)
  - Implementation notes for Dallas

**Status:** ✅ **ANALYSIS COMPLETE** — Comprehensive regression checklist ready for Dallas implementation.

### 2026-05-24T23:44:54Z: TreeView Return Flow Analysis — Regression Checklist & Lifecycle Validation

**Task:** Document expected state transitions and regression checklist for tree-view return-flow behavior across create, edit, and cancel paths.

**Deliverables:**
- Traced expected TreeView return-flow logic for Request Parameters, Response Properties, and Custom APIs
- Documented success/cancel paths with detailed state transitions
- Identified manual toggle-away scenario as critical regression case
- Created comprehensive regression checklist (R1–R12) with 20+ test scenarios
- Provided DevTools inspection points for Zustand state, React Query, Profiler, network
- Risk assessment for 10+ edge cases (High/Medium/Low)

**Key Finding:**
Manual toggle-away path is where flag-lifecycle leak occurs: tree-origin action begins → user toggles back to tree view before completion → child unmounts without callback → flag survives → later non-tree action inherits stale return behavior.

**Validation Provided:**
- Expected handoff flow documented and testable
- Critical handoff points identified: tree toggle, selection set, form auto-entry, editing lock, data binding
- File-level references and line numbers for implementation
- Pattern guidance for future tree-view feature work

**Outcome:**
Analysis fed directly into Dallas's initial implementation, which Ripley rejected for the exact manual-toggle leak case that Lambert identified. Kane's revision fixed this specific case with tree-view re-entry cleanup.

**Impact:** Lambert's regression checklist and lifecycle analysis enabled Ripley to identify the gap quickly and Kane to implement the targeted fix with focused Playwright coverage.

**Status:** ✅ **ANALYSIS VALIDATED** — Manual-toggle regression case identified; Kane's fix confirmed to address it.
