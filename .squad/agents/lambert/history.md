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

## Learnings (Recent Session: 2026-05-25)

### Business Event Selector Filter Expand/Collapse Behavior — Test Planning & Regression Checklist
- Produced comprehensive UX specification with 5 scenarios, 13 test cases
- Scenario 1: Filter Auto-Expand on Business Events Nav Entry (3 tests)
- Scenario 2: Filter Auto-Collapse on Catalog Selection (3 tests)
- Scenario 3: Filter State Changes Preserve Collapse (3 tests)
- Scenario 4: Unrelated Selector Interactions Don't Regress (3 tests)
- Scenario 5: Edge Cases (3 tests)
- Test location: tests/e2e/specs/catalog-selector.spec.ts
- Acceptance criteria: All scenarios pass, no regressions, filter toggle responsive, badges accurate, state deterministic
- Status: ✅ Test specification complete and ready for QA validation

### Selector Init Settings — UX/State Behavior Analysis & Regression Checklist
- Traced two new app settings: `customapiSelectionInit` and `businessEventSelectionInit` (both all/unmanaged/managed, defaults 'all')
- Key architectural insight: Settings drive INITIAL filter state on mount; manual session changes are ephemeral (don't persist to settings)
- Identified initialization chain: AppSettings query → CustomApiSelector mount → useEffect applies init setting to useState
- Critical design question answered: Business Event filter semantic mapping options (A: 'all'/'managed'/'unmanaged', B: boolean, C: reuse toggle + conditional)
- Comprehensive regression checklist: 10 phases, 80+ checkpoints covering defaults, form behavior, initialization, manual changes, persistence, edge cases, integration
- State flow validation: First load defaults → settings form saves value → next load applies setting → manual change resets on reload
- Cross-selector impact analysis: Solution toggle remains contextual (per 2026-05-21 decision); Business Event and Custom API filters independent
- Document location: .squad/decisions/inbox/lambert-selector-init-settings.md
- Status: ✅ Analysis complete, 80+ checkpoints ready for implementation validation

## Learnings (Session: 2026-05-29)

### About Section Removal — UX Regression Checklist & Removal Scope Analysis
- Traced About section across 3 files: App.tsx (import + NavSection type + navItems + renderContent), About.tsx (component), Styles.ts (6 style classes)
- No e2e tests reference About section; no integration dependencies found
- Expected UX after removal: 6 nav items (Custom APIs, Tester, Events, Settings, Logs, Debug); About icon/label absent
- Key risk identified: State fallback if user's selectedNavItem='about' persists in store; handled by useEffect redirect to 'customapi'
- Comprehensive regression checklist: 4 scenarios, 12 test cases covering nav rendering, selection behavior, content rendering, edge cases
- Removal scope: NavSection type union update, navItems filter, renderContent switch case removal, import deletion, 6 style definitions cleanup
- Document location: .squad/decisions/inbox/lambert-about-removal-regression.md
- Status: ✅ UX impact traced, regression checklist complete and ready for implementation validation

### Selector Init Settings — UX/State Behavior Analysis & Regression Checklist (Session: 2026-05-29)
- Selector init settings feature completed with validation (customApiSelectionInit, businessEventSelectionInit)
- Settings-driven initialization confirmed working: AppSettings loads → CustomApiSelector/CatalogSelector mount → init effect applies persisted setting
- Session-level manual changes confirmed ephemeral: Users can change filters in-session, but reload resets to settings default
- Cross-selector integration verified: Business Event filter init independent from Custom API filter init
- Solution toggle confirmed remaining contextual (per 2026-05-21 decision): doesn't count toward active filter badge
- 80+ regression checkpoints documented across 10 phases: defaults, form behavior, persistence, manual changes, edge cases, cross-selector integration
- Test acceptance criteria: All phases pass, no console errors, existing E2E tests pass, settings persist
- Status: ✅ Regression checklist complete and ready for implementation validation

## Team Updates (Session: 2026-05-29)

**Orchestration Log:** 2026-05-25T23-40-24Z-lambert.md  
**Scope:** About section removal sprint + selector init settings test planning  
**Status:** ✅ Complete — Regression checklists delivered for both About removal (12 test cases) and selector init settings (80+ checkpoints)

## Learnings (Session: 2026-05-30)

### Business Event Jump Feature — QA Specification & Ambiguity Analysis

**Feature Request:** Add a button near Custom API name in Details (and optionally Tester) that navigates to the Business Event (Catalog) when the Custom API is registered as a business event via CatalogAssignment.

**Architecture Insights:**
- CatalogAssignment model with polymorphic object binding: `_object_value` stores target entity GUID; `_object_value@Microsoft.Dynamics.CRM.lookuplogicalname` indicates entity type (e.g., 'customapi')
- useCatalogAssignments() hook fetches all assignments; filtering by object type required in button logic
- Navigation: `setSelectedCatalogId()` + `setSelectedNavItem('businessevent')` triggers Business Event view; both actions stored in Zustand
- CatalogSelector has auto-expand behavior on Business Event nav entry (per 2026-05-25 decision); auto-collapse on catalog selection
- Custom API selection persists via `selectedCustomApiId` across view navigation if not explicitly cleared

**QA Coverage Designed:**
- **Scenario 1:** No assignment — button hidden ✓
- **Scenario 2:** Single assignment — direct jump (no dialog) ✓
- **Scenario 3:** Multiple assignments — dialog picker for catalog selection ✓
- **Scenario 4:** Managed/Unmanaged mix — visual distinction in picker ✓
- **Scenario 5:** Selection preservation — Custom API remains selected after jump + return ✓
- **Scenario 6:** Tester integration — button consistency if present in Tester nav ✓
- **Scenario 7:** Solution context — assignments scoped to selected solution ✓
- **Scenario 8:** Object type awareness — only 'customapi' assignments trigger button ✓
- **Scenario 9:** Loading/error states — graceful async handling ✓
- **Scenario 10:** Accessibility — Fluent UI v9 conventions, keyboard nav, theme support ✓
- **Scenario 11:** Dialog UX (detailed) — title, scrolling, hover states, escape key ✓
- **Scenario 12:** Regression — no breakage of existing Custom API/Business Event flows ✓

**Critical Ambiguities Identified (5 Questions for David):**
1. Button placement: Details card header, inline near name, or separate action? Tester too?
2. Multiple assignment UX: Dialog picker, dropdown menu, or auto-select first?
3. State preservation: One-way jump acceptable, or restore Custom API selection on return?
4. Managed/Unmanaged: Show lock icons in picker? Disable jump if managed/unmanaged mismatch?
5. Edge cases: Cross-solution assignments? Unsaved edit prevention?

**Test Data Needed:**
- Custom API with 0, 1, and 2+ assignments
- Mixed managed/unmanaged catalogs
- Solution-scoped isolation (if applicable)

**Document Location:** `.squad/decisions/inbox/lambert-business-event-jump-qa-checklist.md`  
**Status:** ✅ QA specification complete; awaiting design clarification from David before implementation validation

## Team Updates (Session: 2026-05-26)

**Orchestration Log:** 2026-05-26T01-53-57Z-Lambert.md  
**Scope:** Custom API to Business Event navigation feature QA specification  
**Status:** ✅ QA specification complete — 12-scenario coverage plan delivered; 5 design clarifications submitted to David; ready to execute validation once answers received

## Learnings (Session: 2026-06-01)

### Catalog Assignment Polymorphic Object Binding — Regression QA Checklist

**Issue:** Catalog Assignment create flow uses polymorphic `_object_value` field that must bind to different entity collection names (customapis/workflows/entities) based on assignment type. Risk: wrong collection name → binding fails; objectidtype not auto-populated → data integrity loss.

**QA Coverage Delivered:**
- **Scenario 1 (Custom API):** 5 test cases covering payload, objectidtype, solution assignment
- **Scenario 2 (Workflow):** 4 test cases covering type dropdown persistence, binding format
- **Scenario 3 (Entity):** 3 test cases covering table assignment + logical name display
- **Scenario 4 (Binding Validation):** 5 test cases covering getCollectionName() mapping exactness + fallback behavior
- **Scenario 5 (Failure Modes):** 5 test cases covering GUID validation, type mismatch detection
- **Scenario 6 (Metadata Annotations):** 5 test cases covering OData annotation fetch + helper functions
- **Scenario 7 (Payload Structure):** 4 test cases covering skipKeys, Object@odata.bind format, required field presence
- **Scenario 8 (Modal/UI State):** 5 test cases covering type selection persistence, object picker reset on type change

**Implementation Assumptions Identified (Critical for Kane):**
- Collection names: 'customapi'→'customapis', 'workflow'→'workflows', 'entity'→'entities' (hardcoded, no fallback for unknown types recommended)
- OData binding field: **Object@odata.bind** (not _object_value@odata.bind) — binding format: `collection(guid)`
- objectidtype auto-population: Assuming Dataverse sets automatically; if not, fix must set explicitly
- Modal validation sufficient: Service doesn't re-validate GUID; assumes modal ensures non-empty _object_value
- Solution assignment optional: Missing solutionUniqueName doesn't fail record create; potential for orphaned assignments

**Risk Areas:**
- Type ↔ Object GUID mismatch (data integrity risk if not validated end-to-end)
- Collection name fallback masking errors (recommendation: throw error for unknown types)
- Solution context orphan if addToSolution() fails (consider rollback pattern)

**Document Location:** `.squad/decisions/inbox/lambert-catalog-assignment-regression-qa.md`  
**Status:** ✅ 36-test-case regression checklist complete; 8 pre-fix assumptions validated; ready for Kane implementation + manual QA execution

