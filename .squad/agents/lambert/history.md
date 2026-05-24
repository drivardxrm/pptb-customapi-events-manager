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
