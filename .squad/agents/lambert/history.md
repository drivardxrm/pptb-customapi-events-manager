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
- Test location: 	ests/e2e/specs/catalog-selector.spec.ts
- Acceptance criteria: All scenarios pass, no regressions, filter toggle responsive, badges accurate, state deterministic
- Status: ✅ Test specification complete and ready for QA validation
