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
