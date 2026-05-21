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
