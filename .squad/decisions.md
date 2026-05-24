# Decisions

Team decisions are recorded here. Append-only.

---

### 2026-02-28T23:19:00Z: Team Formation
**By:** Squad (Coordinator)
**What:** Initialized Squad team with Ripley (Lead), Dallas (Frontend), Kane (Backend), Lambert (Tester), Scribe, and Ralph.
**Why:** User confirmed roster for PPTB Dataverse Custom API Manager project.

---

### 2026-03-02: E2E Testing Architecture
**By:** Lambert (Tester), approved by team
**What:** Adopted Playwright with window-level mock injection for E2E testing.
**Architecture:**
- Window mock injection via `test-main.tsx` entry point
- Vite `--mode test` swaps entry point to load mocks before app
- Mocks for `window.dataverseAPI` and `window.toolboxAPI` match PPTB types
- Test control methods prefixed with `__` (e.g., `__setConnection`, `__reset`)
- Playwright config at `tests/e2e/playwright.config.ts`
**Why:** Window-level mocking is simple, robust, and requires no app code changes. It works with the existing architecture where the app expects global APIs.

---

### 2026-03-02: E2E CI Workflow Configuration
**By:** Lambert (Tester)  
**What:** Created `.github/workflows/e2e-tests.yml` for automated E2E test execution in GitHub Actions.
**Key Choices:**
- Chromium-only installation (not all browsers) to save ~2 minutes CI time
- 15-minute timeout balances expected runtime (~5 min) with buffer for retries
- Artifacts (playwright-report, test-results) uploaded only on failure to save storage
- 7-day artifact retention for debugging recent failures
- Relied on existing Playwright config for webServer and retry logic
**Why:** E2E tests will now run automatically on all PRs to main, catching regressions before merge.

---

### 2026-03-02: Nested Card Selector Pattern for E2E Tests
**By:** Lambert (Tester)  
**What:** Established CSS direct child selector pattern for Playwright to avoid strict mode violations with nested Fluent UI Cards.
**Pattern:** Use `:has(> ...)` to match cards that directly contain specific header elements
```typescript
page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Request Parameters (Input)"))')
```
**Why:** Direct child combinator ensures exact matches without parent card ambiguity. Resilient to UI changes while requiring no source code modifications.

---

### 2026-03-03: OData URL Display Pattern
**By:** Dallas (Frontend Dev)  
**What:** Implemented OData URL display feature in Custom API Tester (Issue #54).
**Implementation:**
- Created `src/utils/odataUrl.ts` with `buildCustomApiODataUrl()` function
- URL building supports Global, Entity-bound, EntityCollection-bound APIs
- Actions use request body; Functions include parameters in query string
- RequestPanel.tsx displays URL above JSON payload with copy-to-clipboard button
- Reactive updates using `useMemo` when parameters or binding changes
- Theme-aware styling: monospace font, word-break CSS, dark/light backgrounds
**Why:** Users need to see actual OData endpoints for external testing; URL format varies significantly by binding and operation type. Pattern established for future technical URL/endpoint displays.

---

### 2026-03-08: OData Card Component Pattern
**By:** Dallas (Frontend Dev)  
**What:** Created dedicated ODataCard component consolidating OData-related info in Custom API Tester (Issue #56).
**Implementation:**
- New `src/components/customApiTester/ODataCard.tsx` component
- Displays Request URL (with HTTP method badge), Request Body (for Actions), and Response JSON
- Single OData toggle moved to Test Custom API card header (CardHeader action slot)
- Toggle controls visibility of ODataCard below Request/Response panels
- Removed individual OData toggles from RequestPanel and ResponsePanel
- Uses existing `buildCustomApiODataUrl` and `buildFunctionParamString` utilities from `src/utils/odataUrl.ts`
**Why:** Consolidates OData technical details into a single card for cleaner UX. Users who don't need OData info see a simpler interface, while developers can toggle the card for detailed URL/JSON inspection.

---

### 2026-04-11: Polymorphic Lookup Handling for CatalogAssignment
**By:** Kane (Backend Developer)  
**What:** Established pattern for polymorphic lookup field handling in CatalogAssignment entity (Issue #69).
**Issue:** The `catalogassignment` entity has a polymorphic lookup field `_object_value` that can reference different entity types (customapi, workflow, entity) depending on the `catalogassignmenttype`.
**Decision:**
1. Use `skipKeys: ['_object_value']` in buildCreatePayload options
2. Manually construct the OData bind: `payload['Object@odata.bind'] = \`${collectionName}(${id})\``
3. Maintain a `getCollectionName()` helper in the service to map entity names to collection names
**Rationale:** The `buildCreatePayload()` diff utility assumes a single target entity per lookup field. Polymorphic lookups require runtime determination of the target entity collection name.
**Impact:**
- `CatalogAssignmentService.createCatalogAssignment()` requires `objectEntityName` parameter
- Future polymorphic lookups should follow this same pattern
- Frontend receives this contract for assignment creation UI

---

### 2026-04-11: Business Event UI Architecture
**By:** Dallas (Frontend Developer)  
**What:** Implemented Business Events UI as a tree-based hierarchical view with modal dialogs for CRUD operations (Issue #69).
**Architecture Choices:**
1. **Tree View Structure** - Root Catalogs → Categories → Assignments hierarchy using Fluent UI Tree component
   - Root catalogs use FolderRegular icon
   - Categories use FolderOpenRegular icon
   - Assignments use type-specific icons
   - Action buttons (Add, Edit, Delete) appear on hover for unmanaged items
2. **Component Organization** - Created `src/components/BusinessEventDetails/` with:
   - `BusinessEventDetails.tsx` - Main container, orchestrates modals
   - `CatalogTreeView.tsx` - Tree view with nested item components
   - `CatalogModal.tsx` - Unified create/edit modal with mode switching
   - `CatalogAssignmentModal.tsx` - Assignment-specific modal
   - `ConfirmDialog.tsx` - Reusable delete confirmation
3. **Hook Enhancements** - Added hooks for:
   - `useCatalogChildren()` for lazy-loading category children
   - `useCatalogAssignmentsByCatalog()` for catalog-scoped assignment queries
   - All mutations include notifications via `notify()` utility
   - Cache invalidation covers both solution-level and catalog-level queries
4. **Managed State Handling** - CRUD operations only available when `ismanaged === false`
   - Managed items display lock badge and hide edit/delete buttons
   - Consistent with CustomAPI patterns
**Rationale:** Tree view provides natural navigation for hierarchical Catalog data. Modal dialogs keep main view clean while supporting full CRUD. Lazy-loading children via separate queries improves performance.
**Files Changed:**
- `src/hooks/useCatalogs.tsx` - Added hooks, notifications
- `src/hooks/useCatalogAssignments.tsx` - Added CRUD mutations
- `src/utils/queryKeys.ts` - Added `catalogChildren` key
- `src/components/App.tsx` - Wired up navigation
- `src/components/BusinessEventDetails/*` - New components

---

### 2026-04-15: Collapsed Filter Summary Pattern
**By:** Dallas (Frontend Dev)  
**What:** Added visual filter summary to `CustomApiSelector.tsx` that appears when the filters section is collapsed, using Fluent UI Badge components.
**Implementation:**
- Created `filterSummary` computed value using `useMemo` that builds an array of Badge components
- Summary shows: selected solution, Custom API managed state (when not 'all'), PowerFx toggle (when enabled), Business Event toggle (when enabled)
- Badges use `appearance="outline"` for contextual filters and `appearance="filled"` with `color="informative"` for feature toggles
- Summary renders conditionally: `!filtersExpanded && filterSummary.length > 0`
- Reused existing `badgeContainer` style from `Styles.ts`
**Files Changed:**
- `src/components/CustomApiSelector.tsx`

---

### 2026-04-15: Collapsed Filter Summary Revision
**By:** Kane (Backend Dev), delegated by Ripley  
**What:** Fixed incomplete collapsed filter summary in `CustomApiSelector.tsx` to include Solution managed/unmanaged filter.
**Why:** Ripley identified that the Solution managed/unmanaged filter (`showSolutions`) was missing from both the badge summary AND the active-filter count, even though this control lives in the collapsed filter section and materially affects the solution list.
**Changes Made:**
1. **Filter Count** (lines 44-49): Added `(showSolutions !== 'all' ? 1 : 0)` to count calculation
2. **Filter Summary Badges** (lines 58-106): Added badge for `showSolutions !== 'all'` displaying "Managed Solutions" or "Unmanaged Solutions"; placed after selected solution
3. Added `showSolutions` to `useMemo` dependency array
**Rationale:** Collapsed filter summaries must enumerate the full active filter set. Partial summaries create misleading state. Count and summary must stay in sync.
**Files Changed:**
- `src/components/CustomApiSelector.tsx`
**Build Status:** ✅ `npm run build` passed

---

### 2026-04-15: Collapsed Filter Summary Pattern — Approved
**By:** Ripley (Lead)  
**What:** Re-reviewed and approved the `CustomApiSelector.tsx` collapsed filter summary implementation.
**Why:** Kane's revision restored the missing Solution managed/unmanaged filter to both the count and badge summary. All 5 active filter controls now reflected: selected solution, solution managed state, Custom API managed state, PowerFx, Business Event. Existing badge-based presentation preserved.
**Pattern Established:**
- Collapsed filter summaries are acceptable when they enumerate the full active filter set
- The active-filter count must stay in sync with the summarized filters
- Badges serve as the shared presentation pattern for compact collapsed-state overviews in selector cards
**Files Approved:**
- `src/components/CustomApiSelector.tsx`
**Build Status:** ✅ `npm run build` passed

---

### 2026-05-21: Solution Filter Count Scope — Selection-Scoped Toggle
**By:** Dallas (Frontend Dev)  
**What:** Revised `CustomApiSelector.tsx` so the Solution managed/unmanaged toggle (`showSolutions`) no longer counts as a standalone active filter.
**Why:** The toggle scopes the solution picker context, not applied record filters. Users read active-filter badges as filters that materially change the displayed record set. Collapsed badges should only show solution-related context when a solution is actually selected.
**Implementation:**
- Filter count excludes `(showSolutions !== 'all' ? 1 : 0)` calculation
- Collapsed filter badges conditionally show solution managed/unmanaged badge only when a specific solution is selected
- Custom API managed state, PowerFx, and Business Event filters remain as independent, always-visible badges
**Files Changed:**
- `src/components/CustomApiSelector.tsx`
**Build Status:** ✅ `npm run build` passed

---

### 2026-05-21: Solution Filter Scope — Approved
**By:** Ripley (Lead)  
**What:** Reviewed and approved Dallas's revision to treat Solution managed/unmanaged as a contextual picker-scope control rather than a standalone active filter.
**Why:** Parent-picker scope toggles should not inflate active-filter counts. The collapsed summary correctly now reflects only user-facing filters that materially change displayed records (selected solution, Custom API managed state, PowerFx, Business Event). Solution context is properly shown as conditional on an actual solution selection.
**Pattern / Guidance Established:**
- Parent-picker scope toggles are contextual controls, not standalone filters
- Collapsed filter summaries must enumerate only the active user-facing filter set
- Active-filter counts and visual summaries must stay in sync
- Badges serve as the shared presentation for compact collapsed-state overviews
**Files Approved:**
- `src/components/CustomApiSelector.tsx`
**Build Status:** ✅ `npm run build` passed

---

### 2026-05-24: React #185 Picker State Stability Fix
**By:** Dallas (Frontend Dev)  
**What:** Fixed React #185 (Maximum update depth exceeded) regression occurring when creating response properties after toggling tree view mode in Custom API Details.
**Root Cause:** Stale `responsePropertyQuery` cache state combined with validation cascades caused re-render loops. GenericTagPicker items instability compounded the issue during remounts.
**Solution Implemented:**
1. **GenericTagPicker.tsx** - Made stale-selection clearing callback idempotent with ref-backed guard to prevent duplicate parent state updates during remounts. Added logic to avoid clearing while option list is temporarily empty (important for modal remounts).
2. **RequestParameterCreate.tsx** - Memoized picker item arrays with `useMemo` to eliminate inline `map(...).sort(...)` arrays passed to picker.
3. **ResponsePropertyCreate.tsx** - Memoized picker item arrays with `useMemo` matching pattern in RequestParameterCreate.
**Why:** Unstable references cause picker effects to re-fire on every render, which during remounts after tree view toggles creates validation cascades and re-render loops. Memoization stabilizes references; idempotent clearing prevents duplicate state updates.
**Validation:**
- ✅ `npm run build` passed
- ✅ Focused Playwright create-form tests passed
- ✅ No material regressions found
**Files Changed:**
- `src/components/generic/GenericTagPicker.tsx`
- `src/components/requestParameterDetails/RequestParameterCreate.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyCreate.tsx`

---

### 2026-05-24: React #185 Fix — Approved
**By:** Ripley (Lead)  
**What:** Reviewed and approved Dallas's GenericTagPicker refactor and picker state stability fix for React #185 regression.
**Why:** The reported React #185 loop was caused by unstable picker item arrays plus stale-selection clearing that could re-fire parent updates during remounts. Dallas fixed both sides: form-level picker items are memoized, and GenericTagPicker now clears stale selections through a ref-backed callback with an idempotence guard. The picker also correctly avoids clearing while the option list is temporarily empty, which is important for tree view modal remount/loading gaps.
**Guidance for Future Work:**
- Do not pass inline `map(...).sort(...)` arrays into GenericTagPicker.
- Any picker effect that can call back into parent state must be idempotent across remounts.
**Files Approved:**
- `src/components/generic/GenericTagPicker.tsx`
- `src/components/requestParameterDetails/RequestParameterCreate.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyCreate.tsx`
**Build Status:** ✅ `npm run build` passed

---

### 2026-05-24: Response Property Tree-View Create State Reset (Follow-up)
**By:** Lambert (Tester)  
**What:** Validated and traced React #185 regression specific to response-property tree-view create/create-again scenarios (distinct from earlier GenericTagPicker fix).
**Root Causes Identified:**
1. Shared conditional render block for RequestParameterDetails and ResponsePropertyDetails causes simultaneous mount/unmount
2. TanStack Query cache with `staleTime: Infinity` persists across unmount/remount without invalidation
3. Component-level `lastHandledCreationRequestToken` ref resets on mount, creating race condition with dual component initialization
**Regression Scenarios:**
- Scenario 1: Create Request Parameter → Toggle Tree View → Create Response Property
- Scenario 2: Create Response Property → Toggle Tree View → Create Response Property Again
- Scenario 3: Rapid tree-view toggles during creation
**Deliverable:** Regression checklist with three scenarios and DevTools inspection points for Dallas implementation.

---

### 2026-05-24: Response Property Tree-View Create State Reset — Implementation
**By:** Dallas (Frontend Dev)  
**What:** Hardened response-property tree-view create flow against React #185 follow-up failures by resetting persisted frontend state at tree/form handoff.
**Implementation (Four-Part):**
1. Clear `selectedResponsePropertyId` before opening create mode from `CustomApiTreeView`
2. Clone response-property query data at details boundary into `ResponsePropertyList` to prevent mutation of React Query-backed data
3. Reset create-dialog solution selection when dialog closes (avoid stale solution across consecutive creates)
4. Make Zustand setters for `selectedResponsePropertyId` and `editingComponent` idempotent
**Why:** Tree-view toggles unmount form components, but Zustand selection state and TanStack Query cache survive remount. Consecutive create attempts were re-entering with stale selection/dialog state. Resetting handoff state and avoiding no-op store writes is the safest frontend-only fix.
**Validation:**
- ✅ `npm run build` passed
- ✅ Focused Playwright response-property suite: 7/7 tests passed (including remount regression scenario)
- ✅ No page errors or React #185 warnings

---

### 2026-05-24: Response Property Tree-View Fix — Approved
**By:** Ripley (Lead)  
**What:** Reviewed and approved Dallas's follow-up response-property fix for tree-view create/create-again React #185 regression.
**Reasoning:**
- Parent tree-view handoff now clears persisted response-property selection before detail panel remounts ✓
- Response-property list receives cloned array so in-render sorting cannot mutate React Query-backed data ✓
- Create dialog state resets on real open/close transitions, avoiding stale solution selection across consecutive creates ✓
- Store setters are idempotent, reducing no-op update churn during remount-heavy transitions ✓
**Validation:**
- Build: `npm run build` passed ✓
- Focused Playwright scenario: Create twice after tree-view remounts, no page errors ✓
- Regression checklist: All three scenarios covered and validated ✓
**Decision:** ✅ **APPROVED** — No material regression found. Ready for merge.
