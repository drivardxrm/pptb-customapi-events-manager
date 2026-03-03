# Lambert — History

## Core Context
Joined the PPTB Dataverse Custom API Manager team as Tester on 2026-02-28.

## Learnings
- No test framework currently configured
- Focus on manual verification and edge case documentation
- Project uses Vite with custom IIFE build plugin for PPTB iframe compatibility
- Build command: `npm run build` (TypeScript compile + Vite build)
- Dev server: `npm run dev` (with HMR)

### 2026-03-01: Cross-Agent Update from Ripley Review
- Architecture review complete: clean separation of concerns, consistent patterns
- Some commented-out code in App.tsx and models (cleanup opportunity identified)
- Business Events feature marked as "Coming Soon" - note for test planning
- No critical issues detected; codebase well-organized

### 2026-03-02: E2E Testing Foundation (Phase 1) Implemented
- Installed Playwright with Chromium browser for E2E testing
- Created mock implementations for PPTB APIs (`dataverseAPI`, `toolboxAPI`)
- Key insight: The `fixHtmlForPPTB` plugin must only apply during build (`apply: 'build'`), not dev mode - otherwise it removes `type="module"` from scripts and breaks Vite dev server
- Test entry point pattern: `test-main.tsx` imports mocks first, then imports main app
- Vite plugin swaps entry point in test mode via `transformIndexHtml`
- Created page object pattern for maintainable tests
- 4 smoke tests passing, PR #53 created
- Test commands: `npm run test:e2e`, `npm run test:e2e:ui`, `npm run dev:test`
- Mocks use test control methods prefixed with `__` (e.g., `__setConnection`, `__reset`)

### 2026-03-02: E2E Testing Phase 2 - Core Journey Tests
- Added comprehensive Custom API CRUD tests (18 tests passing, 3 skipped)
- **Critical discovery**: The app uses `GenericTagPicker` (combobox/dropdown) for Custom API selection, NOT a DataGrid - selectors had to be adjusted accordingly
- **Mock timing solution**: Implemented lazy initialization pattern for mocks
  - Mocks read from `window.__E2E_TEST_DATA__` on first method call, not at module load time
  - This avoids race conditions where ES modules load before `addInitScript` completes
  - Pattern: `setupTestData()` → `addInitScript` sets `window.__E2E_TEST_DATA__` → page loads → mock methods call `ensureInitialized()` → reads pre-configured data
- **Key mock additions**:
  - `queryData()` for OData queries (used by CustomApiService)
  - `getSolutions()` for solution queries (used by useSolutions hook)
  - Entity extraction from both OData query strings and FetchXML
- **UI selector patterns discovered**:
  - "New Custom API" button appears in TWO places (message bar + details card) - must be specific
  - "Test Environment" badge also appears twice - use `.first()` to avoid strict mode violations
  - Custom API picker: `.fui-Field` filtered by label text, then `[role="combobox"]`
- Files created:
  - `tests/e2e/fixtures/custom-api.fixture.ts` - Mock Custom API data with various binding types
  - `tests/e2e/specs/custom-api.spec.ts` - CRUD operation tests
- Extended `tests/e2e/pages/app.page.ts` with Custom API picker interactions
- Extended `tests/e2e/mocks/dataverseAPI.mock.ts` with `queryData`, `getSolutions`, lazy init

### 2026-03-02: E2E Testing Phase 3 - Request Parameters & Response Properties
- Added 12 tests for Request Parameters and Response Properties CRUD operations
- **Nested card selector challenge**: Cards are nested (Custom API Details contains Request Parameters and Response Properties cards)
  - Standard `hasText` filter matches BOTH parent and child cards → strict mode violation
  - Solution: Use CSS direct child selector with `:has(> ...)` to match only cards that directly contain the specific header
  - Pattern: `.fui-Card:has(> .fui-CardHeader h3:text("Request Parameters (Input)"))`
- **Mock data extension**:
  - Added `window.__E2E_REQUEST_PARAMETERS__` and `window.__E2E_RESPONSE_PROPERTIES__` globals
  - Extended `ensureInitialized()` to read these during lazy initialization
  - Entity names: `customapirequestparameter`, `customapiresponseproperty`
- **Files created**:
  - `tests/e2e/fixtures/request-parameter.fixture.ts` - Mock request parameters (String, EntityReference, Optional, Managed types)
  - `tests/e2e/fixtures/response-property.fixture.ts` - Mock response properties (String, EntityCollection, Integer, Managed types)
  - `tests/e2e/specs/request-parameter.spec.ts` - 6 tests for parameter CRUD
  - `tests/e2e/specs/response-property.spec.ts` - 6 tests for property CRUD
- **Test coverage summary**:
  - List loads when Custom API selected
  - Empty state display
  - New button visibility for unmanaged APIs
  - New button hidden for managed APIs
  - Create form opens on button click
  - Delete calls delete API
- Total E2E tests: 30 passing, 3 skipped (pre-existing)

### 2026-03-02: E2E Testing Phase 4 - GitHub Actions CI Workflow
- Created `.github/workflows/e2e-tests.yml` for automated E2E testing
- **Workflow triggers**: Push to `main`, PRs to `main`
- **CI configuration details**:
  - Uses `ubuntu-latest` runner with Node.js 20.x
  - npm caching enabled via `setup-node` action
  - Only installs Chromium browser (`--with-deps chromium`) to minimize CI time
  - 15-minute timeout to prevent hung jobs
  - Artifacts (playwright-report, test-results) uploaded only on failure with 7-day retention
- **Leverages existing Playwright config**:
  - `webServer` already configured to run `npm run dev:test` 
  - `reuseExistingServer: !process.env.CI` ensures fresh server on CI
  - `retries: 2` on CI for flakiness tolerance
  - Single worker on CI for stability
