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
