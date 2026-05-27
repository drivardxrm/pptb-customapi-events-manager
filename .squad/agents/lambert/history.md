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

## Learnings (Session: 2026-05-27)

### Unique Name Focus Review — Request Parameter / Response Property Create Mode

**Feature Request Under Review:** When entering create mode for a Request Parameter or Response Property, focus should land in the corresponding **Unique Name** field.

**Architecture / Pattern Findings:**
- `src/components/requestParameterDetails/RequestParameterDetails.tsx` and `src/components/responsePropertyDetails/ResponsePropertyDetails.tsx` each enter create mode in two ways: direct header-button create and tree-view handoff via `creationRequestToken`.
- The actual editable Unique Name inputs live in `RequestParameterCreate.tsx` and `ResponsePropertyCreate.tsx`; the `*CreateDialog.tsx` files are confirmation dialogs shown later on save and are not the requested create-entry surface.
- Both create components can initially render `Loading...` until app settings / Custom API data are ready, so a one-time `autoFocus` attached to the first mount path may miss the case where the input appears after async data resolves.
- Existing focus precedent already exists in `src/components/BusinessEventDetails/CatalogModal.tsx`, where create-mode focus is applied after the create UI opens rather than on a later confirmation step.

**Primary QA Risk / Likely Missed Surface:**
- If Dallas adds autofocus in only one place, the most likely miss is covering direct button create but not the tree-view `creationRequestToken` handoff, or adding focus to the confirmation dialog instead of the form input that appears when mode becomes `create`.
- A second likely miss is relying on simple `autoFocus` while the component first renders a loading placeholder; focus would then fail when the Unique Name input mounts after data becomes available.

**Regression Focus Areas:**
- Direct **New Request Parameter** entry focuses Request Parameter **Unique Name** immediately.
- Direct **New Response Property** entry focuses Response Property **Unique Name** immediately.
- Tree-view create handoff for both child types still lands focus in **Unique Name** after the form remounts.
- Re-enter create after cancel / save / tree-view return still refocuses correctly with no stale selection side effects.
- Edit mode and save confirmation dialogs do not steal this create-entry focus behavior.

**Key File Paths:**
- `src/components/requestParameterDetails/RequestParameterDetails.tsx`
- `src/components/requestParameterDetails/RequestParameterCreate.tsx`
- `src/components/requestParameterDetails/RequestParameterCreateDialog.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyDetails.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyCreate.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyCreateDialog.tsx`
- `src/components/customApiDetails/CustomApiDetails.tsx`
- `src/components/BusinessEventDetails/CatalogModal.tsx`

## Learnings (Session: 2026-06-04)

### Business Event Empty-State Parity Review

**Feature Request Under Review:** When the Business Event form is selected with no root catalog selected, show a top message: "No Root Catalog selected. Select a Root Catalog below or create a new one." with a **New Root Catalog** action matching Custom API behavior.

**Architecture / Pattern Findings:**
- `src/components/customApiDetails/CustomApiDetails.tsx` already uses the app-level message bar pattern for empty selection via `setGlobalMessage('no-customapi-selected', ...)`, non-dismissable info intent, and an action button wired to `handleCreate`.
- `src/components\BusinessEventDetails\BusinessEventDetails.tsx` currently only clears `businessevent-coming-soon`; it does **not** set a Business Event empty-selection global message.
- Business Event empty selection currently falls back to an in-card info box (`No Catalog selected / Select a Catalog above to view its hierarchy`), so message parity requires checking for duplicated or conflicting copy between the top message bar and card body.
- Business Event create-root already has a dedicated handler (`handleCreateRoot`) and header action using `AddCircleColor`, so the requested top action can and should reuse that exact root-create path.

**Key QA Surfaces:**
- Empty state copy should say **Root Catalog**, not generic **Catalog**, to match the selector concept and user wording.
- Global message should appear only in Business Event read state with no selected root catalog, then clear when a root catalog is selected, when create modal opens, and when leaving Business Events.
- The top action must launch `CatalogModal` in `create-root` mode and preserve existing post-create auto-selection via `pendingBusinessEventCatalogId`.
- Review whether the existing in-card info box stays, is updated to Root Catalog wording, or is removed to avoid duplicate empty-state messaging.

**Key File Paths:**
- `src/components/customApiDetails/CustomApiDetails.tsx`
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx`
- `src/components/AppMessages.tsx`
- `src/components/CatalogSelector.tsx`
- `src/components/BusinessEventDetails/CatalogModal.tsx`

## Learnings (Session: 2026-06-04)

### Catalog Edit Modal UX Parity Review

**Feature Request Under Review:** In Catalog edit mode, show the **Parent Catalog** section when the record is a category (2nd-level catalog), matching create-category UX, and always show **Unique Name** as a read-only textbox.

**Architecture / Pattern Findings:**
- `src/components/BusinessEventDetails/CatalogModal.tsx` currently shows parent context only for `create-category` (`isCreateCategory && parentCatalog`) and hides Unique Name entirely in edit mode (`!isEdit` gate).
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx` sets `parentCatalogForCreate` only for create-category and explicitly clears it for edit, so category edit cannot rely on the existing `parentCatalog` prop.
- `src/models/Catalog.ts` keeps `uniquename` out of `CatalogUpdateable`, confirming Unique Name is immutable in edit and should be displayed, not edited.
- `src/components/BusinessEventDetails/TreeItemDetailsPanel.tsx` already establishes the read-only parity target: Unique Name is always visible with a lock icon, and Parent Catalog is shown only when `_parentcatalogid_value` exists.

**Primary QA Risk / Likely Missed Surface:**
- If Dallas only reuses the current create-category parent block, category edit will still miss parent context because `handleEditCatalog()` passes `parentCatalogForCreate = null`. Edit must derive parent display from the catalog record itself (for example the formatted-value annotation) or pass parent context separately.

**Regression Focus Areas:**
- **Edit root catalog:** no Parent Catalog section; Unique Name visible and read-only; save only updates editable fields.
- **Edit category:** Parent Catalog section visible with correct parent display text; Unique Name visible and read-only; parent/unique remain unchanged after save.
- **Create root / create category:** existing create-time editable Unique Name flow, publisher picker, and create-category parent section stay unchanged.
- **Uniqueness behavior:** duplicate validation remains create-only; edit should not block save because of the unchanged immutable Unique Name.

**Key File Paths:**
- `src/components/BusinessEventDetails/CatalogModal.tsx`
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx`
- `src/components/BusinessEventDetails/TreeItemDetailsPanel.tsx`
- `src/models/Catalog.ts`

## Learnings (Session: 2026-05-27)

### Managed Custom API Tree Edit Review

**Feature Under Review:** In `CustomApiTreeView`, the root Custom API edit action must not be possible for managed Custom APIs.

**Architecture / QA Findings:**
- `src/components/customApiDetails/CustomApiTreeView.tsx` currently renders the root **Edit** action unconditionally, while sibling destructive/create tree actions already gate on `!api.ismanaged` (and for some actions `!api._fxexpressionid_value`).
- `src/components/customApiDetails/CustomApiDetails.tsx` already hides the header-level edit button for managed Custom APIs in form view, so tree view is currently the parity break.
- The tree root `onEdit` callback exits tree view and calls `handleEdit(true)`, but `handleEdit()` only checks that a Custom API is selected; it does **not** defensively reject managed records.
- `src/models/CustomApi.ts` keeps immutable identity fields out of `CustomApiUpdateable`, but managed records would still enter edit mode for mutable fields if the callback path remains reachable.

**QA Expectation / Risk Callout:**
- **Required behavior:** Managed Custom API in tree view = no functional edit entry.
- **Likely missed surface if Dallas only hides the button visually:** any alternate callback path, keyboard wiring, stale action render, or future refactor that still invokes `onEdit`/`handleEdit` could reopen edit mode for a managed record because the parent handler is not state-guarded.

**Regression Focus:**
- Managed Custom API in tree view shows no edit affordance and cannot transition into edit mode.
- Unmanaged Custom API tree edit still performs the normal tree → form → edit handoff and returns to tree correctly on save/cancel.
- Existing managed gating for tree delete and child add/edit actions remains unchanged.
- Header edit parity stays consistent: managed blocked, unmanaged allowed.

**Key File Paths:**
- `src/components/customApiDetails/CustomApiTreeView.tsx`
- `src/components/customApiDetails/CustomApiDetails.tsx`
- `src/models/CustomApi.ts`

## Learnings (Session: 2026-05-27)

### Catalog Assignment Custom API Picker Scope Review

**Feature Under Review:** In `CatalogAssignmentModal` create mode, the **Custom API** picker should not narrow its options to the currently selected solution. The solution picker controls where the new assignment is added, not which Custom API records may be assigned.

**Architecture / QA Findings:**
- `src/hooks/useCustomApis.tsx` is solution-scoped through `selectedSolutionId`, while `useAllCustomApis()` already exists for global access.
- `src/components/BusinessEventDetails/CatalogAssignmentModal.tsx` currently builds Custom API picker options from `useCustomApis().customapis`, so selecting a solution incorrectly reduces the available assignment targets.
- The same modal keeps create-time solution selection in separate local state (`selectedSolutionForCreate`), confirming display scope and assignment-target solution are distinct concerns.
- `handleObjectSelect()` currently resolves the chosen API back through the solution-scoped `customapis` array to auto-fill the assignment name, so a display-only fix would still break name hydration for APIs outside the selected solution.
- `src/models/CustomApi.ts` includes both `solutionid` and `ismanaged`; QA should confirm the requested fix removes **solution** filtering only, unless product direction explicitly changes the existing unmanaged-only rule.

**QA Expectation / Risk Callout:**
- **Required behavior:** With or without a selected solution, create-mode Custom API assignment should offer the same full available Custom API set.
- **Likely missed surface if Dallas only changes the visible list:** selecting an API outside the active solution can still leave the assignment name blank or stale because selection lookup / auto-fill may still read from the filtered collection.

**Regression Focus:**
- No solution selected vs. solution selected shows the same Custom API candidate set.
- Selecting a Custom API outside the chosen solution still fills the assignment name correctly and saves.
- Changing the solution picker after choosing a Custom API does not clear a still-valid selection.
- Duplicate assignment validation still blocks the same `(catalog, object, object type)` tuple.
- Entity and workflow assignment pickers remain unchanged.
- Edit mode remains unchanged.

**Key File Paths:**
- `src/components/BusinessEventDetails/CatalogAssignmentModal.tsx`
- `src/hooks/useCustomApis.tsx`
- `src/hooks/useCatalogAssignments.tsx`
- `src/models/CustomApi.ts`
