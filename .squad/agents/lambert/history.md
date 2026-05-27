# Lambert — History

## Core Context

Joined PPTB Dataverse Custom API Manager team as Tester on 2026-02-28.

**E2E Foundation:** Playwright with Chromium browser; window-level mock injection via test-main.tsx entry point; lazy initialization via addInitScript reads window.__E2E_TEST_DATA__.

**Critical Setup Insight:** fixHtmlForPPTB plugin must only apply during build (pply: 'build'), not dev mode—otherwise removes type="module" from scripts and breaks Vite dev server.

**Mock Architecture:** Test control methods prefixed with __ (e.g., __setConnection, __reset); lazy initialization via nsureInitialized() avoids race conditions where ES modules load before setup completes; fixtures organized by entity type in 	ests/e2e/fixtures/.

**UI Testing Patterns:** CSS direct child selector :has(> ...) for Fluent UI Cards (avoids strict mode violations); page object pattern for selectors; nested card challenges solved via filtered locators.

**E2E Test Coverage:** Smoke tests (4+); CRUD journeys (30+); nested entity operations; CI via .github/workflows/e2e-tests.yml (15-min timeout, Chromium-only, artifacts on failure).

**React Lifecycle Insight:** Tree-view remounts combined with shared conditional render blocks + stale TanStack Query cache + validation cascades create React max-depth issues. Fix required: explicit cache invalidation, state reset on transition, idempotent store setters.

**Recent Discovery (2026-05-22 to 2026-05-25):**
- React #185 root causes: Simultaneous mount/unmount via shared conditional block; stale query cache; validation dependent on query state
- GenericTagPicker stability: Unstable picker arrays + stale-selection reset effects trigger max-depth loops. Fix: memoized picker items
- Tree-view edit handoff: Two-phase pattern (exit tree + store pending → child mounts → detects pending → selects → edit mode)
- Comprehensive regression checklists: 50+ test cases across tree-view, edit actions, state transitions (documented in .squad/decisions.md)

**Sessions (2026-05-25 to 2026-06-01) — Summary:**
- E2E regression specifications: Business Event selector expand/collapse (13 tests), selector init settings (80+ checks), about section removal (12 cases), catalog assignment binding (36 cases)
- Custom API to Business Event jump feature: 12-scenario QA spec with 5 design clarifications pending from David
- Filter state behavior clarification across 5 sessions; button-nav preservation vs. nav-menu reset patterns documented
- Key patterns established: two-phase tree-view handoff, ref-backed filter tracking, idempotent store setters for remount safety
- All learnings consolidated into .squad/decisions.md for team reference

## Team Updates (Session: 2026-05-29)

**Scope:** Multiple sprints: filter expand/collapse, selector init settings, business event jump feature  
**Status:** ✅ Regression checklists delivered across multiple features; referenced in .squad/decisions.md

## Learnings (Session: 2026-06-03)

### Filter State Handoff QA Checklist — Cross-View Navigation Behavior

**Feature Request:** Clarify and test how filter states (all/managed/unmanaged) transfer when switching between Custom API and Business Event views via **button navigation** vs. **nav menu**.

**Architecture Insights:**
- CustomApiSelector & CatalogSelector maintain independent `useState` for filter state + `useRef` tracking manual changes
- `customApiFilterWasChangedRef` & `catalogFilterWasChangedRef` control whether app settings override transient state on mount
- Nav menu click should reset refs and apply settings defaults; button-driven navigation should preserve transient state
- Zustand store (`setSelectedNavItem`) does NOT reset filter state—selectors handle it independently via effects

**Behavior Model Clarified:**
1. **Button-driven navigation** (CustomApiBusinessEventButton, Tester shortcuts) → preserve transient filter state across view boundary
2. **Nav menu navigation** → enforce app settings defaults; reset refs; ignore in-session changes
3. **Stale state isolation** → nav menu switch fully clears transient state; no cross-view contamination

**QA Coverage Delivered:**
- **Scenario 1:** Button nav Custom API → Business Event (preserves managed/unmanaged)
- **Scenario 2:** Button nav Tester → Business Event (same state handoff)
- **Scenario 3:** Button nav Business Event → Custom API (reverse handoff)
- **Scenario 4:** Button nav Business Event → Tester (bidirectional flow)
- **Scenario 5:** Nav menu switches reset to app settings defaults (4 test cases)
- **Scenario 6:** Stale transient state isolation (4 test cases for long chains + rapid transitions)
- **Scenario 7:** Edge cases—empty lists, missing settings, solution changes, settings form updates (4 test cases)
- **Total: 21 test cases** covering full state handoff matrix

**Critical Ambiguity Resolved:**
- "Main filter" = the three-state managed/unmanaged toggle (NOT solution toggle; solution remains contextual per 2026-05-21 decision)

**Ref Tracking Insight:**
- Both selectors use a pattern: `filterWasChangedRef = false` on mount/connection-change; set `true` on manual toggle
- Effect logic: `if (filterWasChangedRef.current) return;` prevents app-settings override after manual change
- **Key Risk:** Refs persist across nav menu switches unless explicitly reset—need to verify cleanup in mount effects

**Document Location:** `.squad/decisions/inbox/lambert-filter-handoff-qa.md`  
**Status:** ✅ QA specification complete—21 test cases covering button navigation preservation + nav menu reset + stale state isolation; ready for implementation validation

**Skill Extraction Candidate:** `filter-state-handoff` pattern (useRef tracking + menu vs. button navigation distinction) — **recommend creating .squad/skills/filter-state-handoff/SKILL.md** once QA is validated. Pattern applicable to any React selector with ephemeral state that must preserve on button navigation but reset on menu navigation.

## Learnings (Session: 2026-06-03)

### Filter State Handoff QA Checklist — Cross-View Navigation Behavior

**Feature Request:** Clarify and test how filter states (all/managed/unmanaged) transfer when switching between Custom API and Business Event views via **button navigation** vs. **nav menu**.

**Architecture Insights:**
- CustomApiSelector & CatalogSelector maintain independent `useState` for filter state + `useRef` tracking manual changes
- `customApiFilterWasChangedRef` & `catalogFilterWasChangedRef` control whether app settings override transient state on mount
- Nav menu click should reset refs and apply settings defaults; button-driven navigation should preserve transient state
- Zustand store (`setSelectedNavItem`) does NOT reset filter state—selectors handle it independently via effects

**Behavior Model Clarified:**
1. **Button-driven navigation** (CustomApiBusinessEventButton, Tester shortcuts) → preserve transient filter state across view boundary
2. **Nav menu navigation** → enforce app settings defaults; reset refs; ignore in-session changes
3. **Stale state isolation** → nav menu switch fully clears transient state; no cross-view contamination

**QA Coverage Delivered:**
- **Scenario 1:** Button nav Custom API → Business Event (preserves managed/unmanaged)
- **Scenario 2:** Button nav Tester → Business Event (same state handoff)
- **Scenario 3:** Button nav Business Event → Custom API (reverse handoff)
- **Scenario 4:** Button nav Business Event → Tester (bidirectional flow)
- **Scenario 5:** Nav menu switches reset to app settings defaults (4 test cases)
- **Scenario 6:** Stale transient state isolation (4 test cases for long chains + rapid transitions)
- **Scenario 7:** Edge cases—empty lists, missing settings, solution changes, settings form updates (4 test cases)
- **Total: 21 test cases** covering full state handoff matrix

**Critical Ambiguity Resolved:**
- "Main filter" = the three-state managed/unmanaged toggle (NOT solution toggle; solution remains contextual per 2026-05-21 decision)

**Ref Tracking Insight:**
- Both selectors use a pattern: `filterWasChangedRef = false` on mount/connection-change; set `true` on manual toggle
- Effect logic: `if (filterWasChangedRef.current) return;` prevents app-settings override after manual change
- **Key Risk:** Refs persist across nav menu switches unless explicitly reset—need to verify cleanup in mount effects

**Status:** ✅ QA specification complete—21 test cases covering button navigation preservation + nav menu reset + stale state isolation; ready for implementation validation

## Team Updates (Session: 2026-05-26)

**Orchestration Log:** 2026-05-26T03-51-58Z-lambert.md  
**Scope:** Filter handoff QA specification sprint  
**Status:** ✅ Complete — 21-test-case QA spec delivered; build passed; ready for validation execution

## Learnings (Session: 2026-06-XX)

### New Root Catalog Button QA Checklist

**Feature Request:** Add a "New Root Catalog Button" in Business Events form, matching "New Custom API" button style; reuse CatalogModal with mode='create-root'; no parent catalog display for root creation.

**Implementation Status:** ✅ Already implemented in BusinessEventDetails.tsx (lines 189-196)
- Button exists with correct icon (`AddCircleColor`), appearance (`secondary`), and conditional visibility
- Handler `handleCreateRoot()` correctly sets mode to 'create-root' and passes null for parentCatalog
- CatalogModal already supports 'create-root' mode with correct title and conditional parent info display

**Key Observations:**
1. **Button Styling Parity:** BusinessEventDetails button matches CustomApiDetails "New Custom API" pattern—secondary appearance, AddCircleColor icon, headerActionButton class
2. **Modal Mode System:** CatalogModal uses discriminated union type `CatalogModalMode = 'create-root' | 'create-category' | 'edit'` with conditional rendering branches
3. **Parent Catalog Handling:** Parent info block renders only when `isCategory && parentCatalog` both true—ensuring no parent display for root creation mode
4. **Form Field Visibility:** Publisher and Unique Name fields are only shown for create modes (`!isEdit`), matching Dataverse root catalog requirements
5. **Handler Isolation:** Three separate handlers (`handleCreateRoot`, `handleCreateCategory`, `handleEditCatalog`) keep state transitions explicit and testable

**QA Checklist Delivered:**
- **Button Visibility:** Conditional on solution selection, correct styling parity
- **Modal Behavior:** Title, labels, and parent display for create-root vs. create-category modes
- **Form Fields:** Publisher, Unique Name visibility; required field validation
- **Unchanged Behaviors:** Category creation, edit flows, tree view integration
- **Integration:** State lifecycle, query cache refresh, user journeys
- **Regression Coverage:** Custom API button, CatalogSelector, tree view, assignments
- **Total: 85+ test cases** across visibility, styling, modal behavior, form validation, user flows, edge cases, accessibility, and regressions

**Pattern Identified for Future Use:**
Modal mode discrimination with conditional field visibility is a reusable pattern. When different create/edit modes share a modal, use:
1. Type-safe mode discriminator (CatalogModalMode)
2. Mode-specific handlers that set all required state atoms
3. Conditional rendering blocks keyed on `isEdit`, `isCategory` flags
4. Form reset effects that respect mode and passed context (parent, catalog)

**Document Location:** `.squad/decisions/inbox/lambert-root-catalog-button-qa.md`  
**Status:** ✅ QA specification complete—85+ test cases covering button visibility, modal behavior, form validation, unchanged features, user journeys, edge cases, accessibility, and regressions; ready for implementation validation

## Learnings (Session: 2026-06-03)

### Full-Collection Duplicate Validation Review

**User Preference / QA Expectation:** When a solution is selected, duplicate checks for globally unique records must still validate against the full entity collection, not the solution-filtered subset.

**Architecture Findings:**
- `src/hooks/useCustomApis.tsx` and `src/hooks/useCatalogs.tsx` are solution-scoped via `selectedSolutionId`, so any uniqueness check that reads their returned arrays is filter-sensitive.
- `src/components/customApiDetails/CustomApiDetailsCreate.tsx` currently validates `createData.uniquename` against `useCustomApis().customapis`, so Custom API create is vulnerable when a duplicate exists outside the selected solution.
- `src/components/BusinessEventDetails/CatalogModal.tsx` currently validates `formData.uniquename` against `useCatalogs().catalogs`, so both root-catalog and category create flows are vulnerable when a duplicate exists outside the selected solution.
- `src/hooks/useCustomApiRequestParameters.ts` and `src/hooks/useCustomApiResponseProperties.ts` are scoped by `selectedCustomApiId`, not `selectedSolutionId`; request/response duplicate checks are already using full per-parent collections for the selected Custom API.
- `src/components/BusinessEventDetails/CatalogAssignmentModal.tsx` has required-field validation only; no duplicate-prevention logic exists there yet, so assignment validation is a missed surface if David expects parity.

**Create/Edit Flow Impact:**
- **Must validate against full collection:** Custom API create; Catalog create-root; Catalog create-category.
- **Already safe for this specific solution-filter issue:** Request Parameter create; Response Property create.
- **Not currently applicable because unique key is read-only in edit:** Custom API edit; Request Parameter edit; Response Property edit; Catalog edit.
- **Missed surface to confirm with implementation owner:** Catalog Assignment create/edit if duplicate rules are expected for name/object combinations.

**Key File Paths:**
- `src/hooks/useCustomApis.tsx`
- `src/hooks/useCatalogs.tsx`
- `src/components/customApiDetails/CustomApiDetailsCreate.tsx`
- `src/components/BusinessEventDetails/CatalogModal.tsx`
- `src/components/BusinessEventDetails/CatalogAssignmentModal.tsx`
- `src/hooks/useCustomApiRequestParameters.ts`
- `src/hooks/useCustomApiResponseProperties.ts`

## Team Updates (Session: 2026-06-03)
**Scope:** Duplicate validation scope — QA review and implementation sign-off  
**Status:** ✅ Complete — Confirmed Custom API and Catalog create were broken (solution-filter vulnerability); Request Parameter/Response Property were already parent-scoped (no fix needed); flagged missing Catalog Assignment duplicate guard (catalog + object-id + object-type tuple); Dallas implemented all three scopes; build passed; decisions merged into main decisions.md

## Team Updates (Session: 2026-06-04)

**Scope:** React 310 crash root cause identification and QA regression checklist  
**Related Agent Work:** Dallas (Frontend Dev) — `2026-06-04T10-00-00Z-dallas.md`  
**Status:** ✅ Complete — Confirmed hook-order violation in CatalogTreeView as root cause; provided regression check scenarios for root/category create under solution/filter/refetch combinations; flagged watch item: `pendingBusinessEventCatalogId` may linger if created data never appears; Dallas implemented fix (unconditional hook execution); build passed; decision merged; ready for implementation validation
