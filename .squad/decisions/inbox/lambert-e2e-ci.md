# Decision: E2E CI Workflow Configuration

**Date:** 2026-03-02  
**Agent:** Lambert (Tester)  
**Status:** Implemented

## Context
Phase 4 of Issue #20 required adding GitHub Actions CI for automated E2E test execution.

## Decision
Created `.github/workflows/e2e-tests.yml` with these key choices:

1. **Chromium-only installation** - Uses `npx playwright install --with-deps chromium` instead of all browsers. The Playwright config already only runs Chromium tests, so this saves ~2 minutes of CI time.

2. **15-minute timeout** - Balances test runtime (~5 min expected) with buffer for flaky runs (retries configured).

3. **Artifacts on failure only** - Uploads playwright-report and test-results directories only when tests fail. Saves storage and reduces noise on green builds.

4. **7-day artifact retention** - Short retention for debugging recent failures; old reports aren't typically needed.

5. **Relied on existing Playwright config** - Did not duplicate webServer or retry logic in the workflow. The `playwright.config.ts` already handles:
   - Starting Vite dev server in test mode
   - 2 retries on CI
   - Single worker for stability
   - Screenshot/trace on failure

## Alternatives Considered
- **Multi-browser testing**: Could add Firefox/WebKit but would triple CI time. Can be added later if cross-browser issues emerge.
- **Sharding**: Could shard tests across multiple jobs, but 30 tests don't warrant the complexity yet.

## Impact
E2E tests will now run automatically on all PRs to `main`, catching regressions before merge.
