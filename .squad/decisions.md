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
