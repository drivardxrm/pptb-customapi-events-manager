# Dallas — History

## Core Context

**Foundation (2026-02-28 through 2026-03-09):**
- Joined PPTB Dataverse Custom API Manager team as Frontend Dev
- UI architecture: Fluent UI v9 with webLightTheme/webDarkTheme via ThemeProvider
- Styling pattern: makeStyles for component-scoped styles (component-level organization as project grows)
- Component structure: src/components/ with generic/ for reusables; detail views in <feature>Details/ folders
- Icons from @fluentui/react-icons
- Custom API Tester architecture: Main component + RequestPanel/ResponsePanel structure
- OData URL building: Created src/utils/odataUrl.ts utility supporting all binding types
- Selector pattern: Primary picker first, collapsible "Filters" section below (Solution/Managed toggles as contextual scoping)
- Selector auto-collapse: Filters collapse on selection to reclaim space; manual toggle always available
- Tree view pattern: Fluent UI Tree component with hierarchical display (CollapsibleTreeItem structure)
- Business Events UI: Full CRUD implementation with Catalog/CatalogAssignment modals, tree view, API integration
- Filter summary pattern: Fluent UI Badges showing active filter state; count calculated from logical filter set
- Solution filter scoping: Managed/unmanaged toggle is contextual (only counts as active filter when solution actually selected)
- Selector Redesign (Issue #65): Solution picker moved to collapsible filters, managed state badge filtering applied
- Key learning: Selectors must apply consistent collapse-on-selection pattern + collapsed summary badges for parity

**Architecture Decisions:**
- TanStack Query: solution-scoped cache keys (connectionId, instanceId, solutionId)
- Zustand store: Connection state, UI selections, editing lock, theme sync
- Service pattern: EntityService base class with CRUD operations via window.dataverseAPI
- Model pattern: Entity interfaces + Createable/Updateable + Lookups + OptionSets + DEFAULT_CREATE_TEMPLATE

## Learnings

### 2026-05-21: Solution Filter Count Refinement — Selection-Scoped Toggle
### 2026-05-21: Solution Filter Count Refinement — Selection-Scoped Toggle
- Applied the collapsed filter summary parity pattern to `CatalogSelector.tsx`
- Added a dedicated Catalog Filters managed-state toggle that filters `useRootCatalogs()` results without counting the Solution scoping toggle as a standalone active filter
- Collapsed Catalog selector badges now summarize selected Solution and managed/unmanaged Catalog filters from the same derived source as the filter count
- Added focused Playwright coverage in `tests/e2e/specs/catalog-selector.spec.ts` for managed root-catalog filtering and collapsed summary display
- Revised `CustomApiSelector.tsx` filter count calculation to exclude Solution managed/unmanaged toggle as standalone filter
- Collapsed filter badges conditionally show solution context only when a solution is selected
- Filter count now correctly reflects user-facing filters that materially change displayed records
- Custom API managed state, PowerFx, and Business Event remain independent badges
- Approved by Ripley as correct implementation of selection-scoped toggle behavior
- Key file: `src/components/CustomApiSelector.tsx`

### 2026-05-24: Tree View Create Flow React #185 Regression Fix
- **Problem:** React Error #185 (Maximum update depth exceeded) when creating response properties after toggling tree view mode
- **Root Cause (from Lambert):** Stale `responsePropertyQuery` cache state combined with validation cascades caused re-render loops. GenericTagPicker items instability compounded the issue during remounts.
- **Implementation:**
  - Fixed `src/components/generic/GenericTagPicker.tsx`: Made stale-selection clearing idempotent with ref-backed guard; prevents duplicate parent state updates during remounts; avoids clearing while option list is temporarily empty (important for modal remounts)
  - Updated `src/components/requestParameterDetails/RequestParameterCreate.tsx`: Memoized picker item arrays with `useMemo` to eliminate inline arrays
  - Updated `src/components/responsePropertyDetails/ResponsePropertyCreate.tsx`: Memoized picker item arrays with `useMemo` matching RequestParameterCreate pattern
- **Pattern Established:** Any `GenericTagPicker` fed by query data must receive memoized `items`; unstable arrays plus selection-reset effects trigger React max-depth loops
- **Validation:**
  - ✅ `npm run build` passed
  - ✅ Focused Playwright create-form specs for request parameters and response properties passed
  - ✅ Ripley approved fix with no material regressions
- **Files Modified:**
  - `src/components/generic/GenericTagPicker.tsx`
  - `src/components/requestParameterDetails/RequestParameterCreate.tsx`
  - `src/components/responsePropertyDetails/ResponsePropertyCreate.tsx`

### 2026-05-24: Response Property Tree-View Create Reset Follow-up
- Tree-view remounts do not reset Zustand selection or TanStack Query cache by themselves; both survive when `ResponsePropertyDetails` unmounts.
- Safe create handoff now clears `selectedResponsePropertyId` before opening the response-property form from `CustomApiTreeView`.
- `ResponsePropertyDetails.tsx` now passes a cloned response-property array into `ResponsePropertyList` so DataGrid sorting cannot mutate React Query cache state.
- `ResponsePropertyCreateDialog.tsx` now resets its optional solution picker state when the dialog closes, preventing consecutive create attempts from reusing stale dialog selection.
- `src/store/useAppStore.ts` now uses idempotent setters for `selectedResponsePropertyId` and `editingComponent` to avoid no-op store writes retriggering subscribers during remount-heavy flows.
- Added regression coverage in `tests/e2e/specs/response-property.spec.ts` for repeated response-property creates across tree-view remounts.

### 2026-05-24: Response Property Tree-View Create State Reset — Implementation & Validation

**Task:** Implement follow-up fix for React #185 regression on response-property tree-view create/create-again flows after Lambert identified shared conditional render block as root cause.

**Implementation (Four-Part Hardening):**
- Clear selectedResponsePropertyId before opening create mode from CustomApiTreeView
- Clone response-property query data at details boundary into ResponsePropertyList to prevent mutation of React Query cache
- Reset create-dialog solution selection on real open/close transitions (prevent stale solution across consecutive creates)
- Make Zustand setters for selectedResponsePropertyId and ditingComponent idempotent

**Why:** Tree-view toggles unmount form components, but Zustand selection state and TanStack Query cache survive remount. Consecutive create attempts were re-entering with stale selection/dialog state. Resetting handoff state and avoiding no-op store writes is safest frontend-only fix.

**Validation:**
- ✅ 
pm run build — TypeScript compile + Vite build passed
- ✅ Focused Playwright response-property suite — 7/7 tests passed (includes remount regression scenario)
- ✅ No page errors or React #185 warnings

**Status:** ✅ Complete & Approved by Ripley

### 2026-05-24: Tree View Entry Clears Child Selections
- `CustomApiDetails.tsx` now clears both `selectedRequestParameterId` and `selectedResponsePropertyId` whenever Custom API Details enters tree view.
- Pattern: tree/form mode switches should reset child-detail selections that cannot remain visible in the destination mode.
- Validation on this follow-up: `npm run build` passed; focused response-property remount regression test passed; full E2E suite still has one unrelated pre-existing failure in Custom API edit cancel flow.

### 2026-05-24: Tree View Entry Clears Child Selections — Implementation Complete & Approved
- Added `useEffect` in `CustomApiDetails.tsx` that clears both store selections whenever `showTreeView` becomes true
- User directive captured from Copilot interactive session: "When entering TreeView mode, clear `selectedRequestParameterId` and `selectedResponsePropertyId` from the store"
- Implementation scope: Narrowly targeted to tree-view entry, no impact on form-view flows or create/edit logic
- Approved by Ripley as safe and complete for requested scope
- Build status: ✅ `npm run build` passed
- Regression validation: ✅ Focused response-property remount scenario passed

### 2026-05-24: Tree View Edit Handoff for Request Parameters / Response Properties
- Added Edit actions to nested request parameter and response property tree items in `CustomApiTreeView.tsx`.
- Safe handoff pattern is now **two-phase**: parent stores a pending edit request and exits tree view; child details component selects the requested item after mount, then enters edit mode and clears the pending request.
- Direct pre-selection during the tree→form transition triggered React max-depth failures in Playwright; delaying selection until the details card is mounted resolved the issue.
- Hardened controlled selection flows with idempotent `selectedRequestParameterId` store updates and guarded DataGrid `onSelectionChange` handlers in both request/response lists.
- Validation: ✅ `npm run build` passed, ✅ focused tree-view edit Playwright tests passed, ✅ full `npm run test:e2e` passed (33 passed / 3 skipped).

### 2026-05-24T22:11:53Z: TreeView Edit Action Implementation Complete & Approved

**Final Status:** Implementation complete, reviewed by Ripley, and merged to main.

**Deliverables:**
- Edit buttons (Edit20Regular icon) added to CustomApiTreeView for unmanaged request parameters and response properties
- Two-phase handoff implemented: TreeView click → exit tree + store pending ID → form component detects pending ID after mount → select item → enter edit mode
- Form components (RequestParameterDetails, ResponsePropertyDetails) updated to detect pending edit IDs via new store fields
- Selection update logic hardened with guards to prevent controlled-selection loops
- Zustand store setters made idempotent to reduce no-op subscriber churn during remounts
- Playwright specs extended with comprehensive tree-view Edit action tests covering both parameter and property edit flows

**Validation Results:**
- ✅ All 9 regression test phases (T1–T9) verified through E2E and code inspection
- ✅ `npm run build` passed (TypeScript compile + Vite build)
- ✅ `npm run test:e2e` passed: 33 passed, 3 skipped (no new failures)
- ✅ React #185 regression test confirmed stable (tree-to-form transitions no longer cause max-depth errors)
- ✅ Managed/unmanaged visibility constraints correctly applied (Edit button hidden for managed items)
- ✅ State consistency verified (no stale selection persists across remount)

**Review Outcome (Ripley):**
- Approved all 8 files spanning TreeView, CustomApiDetails, form components, store, and E2E specs
- Confirmed scoped Edit actions (unmanaged items only, consistent with existing constraints)
- Validated parent-level handoff bridges remount boundary cleanly

### 2026-05-25: Business Event Selector Nav-Entry Expansion
- Updated `CatalogSelector.tsx` so entering the Business Events nav expands the filter section by default for browsing.
- Auto-collapse now keys off a new non-null catalog selection instead of any persisted selected catalog state, preventing immediate re-collapse on remount.
- Added focused Playwright coverage in `tests/e2e/specs/catalog-selector.spec.ts` for nav-entry expansion, managed filtering, and collapse after selection.
- Verified child components only enter edit mode after record selected and available
- No material safety or completeness issues identified

**Key Files Modified:**
- `src/components/customApiDetails/CustomApiTreeView.tsx` (added Edit callbacks)
- `src/components/customApiDetails/CustomApiDetails.tsx` (added two-phase handoff)
- `src/components/requestParameterDetails/RequestParameterDetails.tsx` (detect pending ID)

### 2026-05-25: Catalog Selector Managed-State Filter Implementation
**Session:** Catalog Selector Managed-State Filters & Collapsed Summary Parity  
**Topic:** Implemented All/Unmanaged/Managed filter toggle for root catalogs in CatalogSelector.tsx, mirroring Custom API selector pattern. Added collapsed-summary parity with filter badge display.

**Implementation Details:**
- **State:** Added `showCatalogs` state (type: `ManagedStateFilter`, default: `'all'`)
- **Filter Logic:** `filteredCatalogs = rootCatalogs?.filter(c => showCatalogs === 'all' || (c.ismanaged && showCatalogs === 'managed') || (!c.ismanaged && showCatalogs === 'unmanaged'))`
- **Active Filter Count:** `(selectedSolutionId ? 1 : 0) + (showSolutions !== 'all' ? 1 : 0) + (showCatalogs !== 'all' ? 1 : 0)`
- **Catalog Filters Section:** New subsection with ManagedStateToggle, positioned below "Selected Solution" filter
- **Collapsed Summary:** Filter badge shows with lock icons (LockClosedRegular / LockOpenRegular) and state label ("Managed Catalogs" / "Unmanaged Catalogs")
- **Empty State:** "No Catalogs match your filters." message using consistent hint-text styling

**Key Decision:**
- Catalog managed-state filter counts as **standalone active filter** (unlike Solution managed toggle, which is contextual to selection)
- This means filtered catalogs materially change the displayed set, warranting badge display on collapse

**Test Coverage:**
- Added focused E2E tests validating toggle states, filtered catalogs, empty state, badge display, filter count
- All tests passing: `npm run test:e2e -- tests/e2e/specs/catalog-selector.spec.ts` ✅

**Validation:**
- ✅ `npm run build` passed
- ✅ No regressions in existing E2E tests
- ✅ Collapsed summary badges align with CustomApiSelector pattern

**Files Modified:**
- `src/components/CatalogSelector.tsx`
- `tests/e2e/specs/catalog-selector.spec.ts`
- `src/components/requestParameterDetails/RequestParametersList.tsx` (guard selection)
- `src/components/responsePropertyDetails/ResponsePropertyDetails.tsx` (detect pending ID)
- `src/components/responsePropertyDetails/ResponsePropertyList.tsx` (guard selection)
- `src/store/useAppStore.ts` (idempotent setters)
- `tests/e2e/specs/request-parameter.spec.ts` (edit action tests)
- `tests/e2e/specs/response-property.spec.ts` (edit action tests)

### 2026-05-24: TreeView Return-on-Exit Flow
- Tree-originated edit/create flows should return to tree view only through a parent-owned completion callback; form-originated flows must keep existing read/form behavior.
- `CustomApiDetails.tsx` now tracks per-entity “return to tree” intent and only supplies `onActionFinished` to request/response detail panels when the action started from tree view.
- `RequestParameterDetails.tsx` and `ResponsePropertyDetails.tsx` treat cancel + successful save as action completion points; create-dialog cancellation does **not** exit tree-handled flows because the form action is still in progress.
- Validation: ✅ `npm run build` passed, ✅ targeted tree-view Playwright coverage passed, ✅ full Playwright suite passed serially (36 passed / 3 skipped).

### 2026-05-24T23:44:54Z: TreeView Return Flow Implementation V2 — Rejected, Kane Revised, Approved

**Initial Implementation (Rejected by Ripley):**
- Implemented tree-originated return-flow wiring with parent-owned completion callbacks
- Issue: Tree-return flags survived when user manually toggled back to tree view before child form completion
- Stale flags then corrupted later non-tree actions with unwanted return-to-tree behavior

**Revision Outcome (Kane's fix approved by Ripley):**
- Kane fixed flag-lifecycle gap by clearing return-intent state on every tree-view re-entry
- Clean boundary fix in `CustomApiDetails.tsx`: entering tree view now clears both return-to-tree flags and pending handoff state
- Child detail panels preserved existing save/cancel return behavior
- Focused Playwright regressions added: manual-toggle → non-tree action stays in form view
- ✅ `npm run build` passed
- ✅ Focused regressions passed; no new material issues
- ✅ Approved by Ripley for merge

**Key Learning:** Tree-origin return intent is transient, not durable state. Lifecycle cleanup must occur on every exit path (manual toggle, form unmount) to prevent state leakage into unrelated flows.

### 2026-05-25: Custom API Selector Create-Flow Collapse
- Extended `CustomApiSelector.tsx` auto-collapse so the Filters section also collapses when `editingComponent === 'customapi'`, covering "New Custom API" entry in addition to existing-record selection.
- Kept collapse behavior one-way: entering create/edit or selecting an API collapses the panel, but unrelated interactions still do not force a re-expand or re-collapse loop.
- Added focused Playwright regression coverage in `tests/e2e/specs/custom-api.spec.ts` asserting the selector card drops from two comboboxes to one after clicking `New Custom API`.
- Validation: ✅ `npm run build` passed, ✅ `npm run test:e2e` passed (40 passed / 3 skipped).

### 2026-05-25: Business Event Selector Filter Expand/Collapse Behavior Implementation
- Implemented auto-expand of `CatalogSelector` filters when Business Events nav item becomes active to invite users to browse/filter
- Collapse filters only when `selectedCatalogId` changes to a new non-null value
- Pattern preserves nav-entry expansion even if Zustand still has an older catalog selected (key insight from testing)
- Preserves manual filter toggle behavior after both auto-expand and auto-collapse
- Added focused E2E coverage for nav-entry expansion, managed filtering, and selection-collapse behavior
- Validation: ✅ `npm run build` passed, ✅ targeted catalog selector E2E tests passed
- Part of Business Event selector redesign to match custom API selector UX patterns

