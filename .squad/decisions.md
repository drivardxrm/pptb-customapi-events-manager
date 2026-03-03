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
