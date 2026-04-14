# Decisions Log

---

## Decision: E2E Mock Lazy Initialization Pattern

**Date:** 2026-03-02  
**By:** Lambert (Tester)  
**Status:** Implemented  
**Issue:** #20 — E2E Phase 2

### Context

When implementing E2E tests for Custom API CRUD operations, encountered a critical timing issue: ES modules load asynchronously, causing mock objects to initialize BEFORE `page.addInitScript()` could set up test data on `window.__E2E_TEST_DATA__`.

### Problem

The original approach of reading `window.__E2E_TEST_DATA__` at mock module load time failed because:
1. Playwright's `addInitScript` runs before page scripts, but ES modules load asynchronously
2. By the time React hooks made their first API calls, mocks had already initialized with empty data
3. TanStack Query cached the empty results, so setting data later didn't help

### Decision

Implemented **lazy initialization** pattern for both `dataverseAPI` and `toolboxAPI` mocks:

```typescript
let initialized = false;

const ensureInitialized = () => {
  if (initialized) return;
  initialized = true;
  
  if (window.__E2E_TEST_DATA__) {
    // Configure mock with test data
  }
};

// Called at the start of every mock method
create: async (...args) => {
  ensureInitialized();
  // ... method implementation
}
```

This ensures test data is read on the FIRST API call (after `addInitScript` has run), not at module import time.

### Alternatives Considered

1. **Polling approach**: Poll for `window.__E2E_TEST_DATA__` with `setTimeout` - flaky timing
2. **Reload approach**: Load page, set data via `page.evaluate`, reload - causes double-loading, slow
3. **Pre-configured mocks**: Hard-code test data in mocks - inflexible for different test scenarios

### Impact

- Tests can now reliably configure mock data before page loads
- Each test can set up different data scenarios independently
- Pattern is consistent across both mock APIs

### Files Modified

- `tests/e2e/mocks/dataverseAPI.mock.ts` - Added lazy init, `queryData()`, `getSolutions()`
- `tests/e2e/mocks/toolboxAPI.mock.ts` - Added lazy init for connection
- `tests/e2e/specs/custom-api.spec.ts` - Uses `setupTestData()` helper

### For Team Review

This pattern should be documented for future test authors. The key insight is that `window.__E2E_TEST_DATA__` is the contract between test setup and mock initialization.

---

## Decision: E2E Testing Architecture

**Date:** 2026-03-01  
**By:** Ripley (Lead)  
**Status:** Proposal  
**Issue:** #20 — B026: Add E2E Tests for Critical Paths

### Context

E2E testing for Custom API Studio presents a unique challenge: the app runs inside a PPTB iframe and depends on global APIs (`window.toolboxAPI` and `window.dataverseAPI`) provided by the host. These APIs don't exist in a testing environment.

### Recommendation

**Use Playwright + window-level mock injection via Vite test mode.**

This approach:
1. **Minimal refactoring** - No architectural changes to the app
2. **Complete control** - Mock both host APIs fully with test methods
3. **Realistic execution** - App runs exactly as in production, just with mocked globals
4. **Type-safe** - Mocks match `@pptb/types` definitions

### Architecture

#### Mock Implementation Strategy

Create mock implementations of `dataverseAPI` and `toolboxAPI` with test control methods:
- `__setQueryResult()` - Override data responses
- `__setCreateResult()` - Control create operations
- `__setExecuteResult()` - Handle API execution
- `__getCalls()` - Inspect operation history
- `__reset()` - Clear state between tests

#### Test Organization

```
tests/
├── e2e/
│   ├── mocks/              # API mock implementations
│   ├── fixtures/           # Test data factories
│   ├── pages/              # Page objects
│   ├── specs/              # Test specifications
│   └── playwright.config.ts
└── integration/
```

#### Vite Integration

- New test entry point: `src/test-main.tsx`
- Inject mocks before app initialization
- Vite mode configuration: `npm run dev:test`

### Critical Test Specifications

1. **Custom API CRUD** - Create, read, update, delete operations
2. **Request Parameters** - Add/modify/remove request parameters
3. **Response Properties** - Add/modify/remove response properties
4. **API Tester** - Execute APIs and display results (including error handling)
5. **Navigation & State** - Solution filtering, nav item accessibility, theme switching

### Implementation Phases

**Phase 1: Foundation (Lambert)**
- Install Playwright
- Create directory structure and mocks
- Write first smoke test

**Phase 2: Core Journeys (Lambert)**
- CRUD tests for Custom API, Request Parameters, Response Properties

**Phase 3: Advanced Scenarios (Lambert)**
- API Tester execution, solution filtering, error handling

**Phase 4: CI Integration**
- GitHub Actions workflow
- Test parallelization and reporting

### Alternative Approaches Evaluated

| Approach | Pros | Cons | Rating |
|----------|------|------|--------|
| MSW (Mock Service Worker) | Industry standard | Only for HTTP; our APIs are JS calls | ❌ Not suitable |
| Dependency Injection | Clean, testable | Requires app refactoring | ⚠️ High friction |
| Test doubles module swap | No runtime overhead | Build complexity | ⚠️ Complex setup |
| **Window-level injection** | **Minimal friction, full control, realistic** | **Requires mock methods** | **✅ Recommended** |

### Implementation Rationale

The window-level injection approach leverages Playwright's `page.evaluate()` to directly inject mock implementations before the app initializes. This provides:
- Complete API coverage without app changes
- Realistic test execution (app code unchanged)
- Type safety with `@pptb/types`
- Per-test fixture control via mock test methods

### Deliverables

Complete proposal with:
- Mock interface definitions and implementations
- Base test fixtures for Playwright
- 5 comprehensive test specifications
- package.json script updates
- 4-phase implementation roadmap

### Next Steps

1. Team review and approval
2. Begin Phase 1 implementation (Lambert as lead)
3. Establish test data strategy for fixtures

---

## Decision: Backlog Creation Strategy

**Date:** 2026-03-01  
**By:** Ripley (Lead)  
**Status:** Completed

### Context

User requested creation of a comprehensive project backlog by analyzing the codebase for missing features, technical debt, quality improvements, and architecture enhancements.

### Analysis Approach

Analyzed the following areas:
1. **TODO/FIXME Comments**: Searched entire codebase for inline developer notes
2. **Test Coverage**: Checked for existence of test files (found none)
3. **Feature Completeness**: Reviewed component implementations for stubs or incomplete features
4. **Pattern Consistency**: Examined entity patterns (models, services, hooks) for gaps
5. **Error Handling**: Evaluated error boundaries, validation, retry logic
6. **User Experience**: Assessed loading states, error messages, keyboard support

### Key Findings

#### Critical Gaps
- **Zero test coverage**: No test files exist, no test framework configured
- **Business Events incomplete**: UI shows "Coming Soon", basic hooks/services exist but no detail views
- **Missing error boundaries**: Components lack error boundary protection
- **Validation gaps**: Field-level validation not implemented

#### Technical Debt
- 3 active TODO comments in production code
- Commented-out code in App.tsx and other files
- Single monolithic Styles.ts file
- Missing connection validation (noted in useSolutions.ts)

#### Pattern Strengths
- Entity service pattern is consistent and well-architected
- TanStack Query hooks follow best practices
- Zustand store properly structured
- Diff utilities cleanly handle OData binding

### Decision

Created 50-item backlog organized by:
- **Priority**: High (13), Medium (18), Low (19)
- **Category**: Feature, Testing, Enhancement, UX, Quality, Maintenance, etc.
- **Assignment**: Distributed to Dallas (Frontend), Kane (Backend), Lambert (Tester)

#### Prioritization Logic

**High Priority** = Critical functionality, blocking issues, or foundational gaps
- Testing infrastructure (no tests exist)
- Business Events completion (major feature gap)
- Error boundaries (reliability)
- Connection validation (existing TODO)

**Medium Priority** = Important improvements that enhance quality or user experience
- Error handling enhancements
- Search/filter capabilities
- Loading state consistency
- Field-level validation

**Low Priority** = Nice-to-have features and optimizations
- Keyboard shortcuts
- Bulk operations
- Template libraries
- Performance optimizations

### Team Assignments

**Dallas (Frontend)**: 23 items
- UI components, forms, styling
- Business Events UI
- Error boundaries
- UX improvements (loading states, search, keyboard shortcuts)

**Kane (Backend)**: 19 items
- Testing infrastructure setup
- Service layer improvements
- Error handling and retry logic
- Data validation and security

**Lambert (Tester)**: 8 items
- Unit test suites
- Integration tests
- E2E tests
- Accessibility audit

### Backlog Location

Written to: `.squad/backlog.md`

### Next Steps

1. Team should review backlog and provide feedback
2. High-priority items should be tackled first (testing, Business Events)
3. Backlog is living document - update as priorities shift
4. Consider sprint planning sessions to group related items

### Rationale

This backlog provides:
- Clear visibility into project gaps and opportunities
- Actionable items with specific assignments
- Balanced coverage across features, quality, and UX
- Foundation for sprint planning and milestone tracking

---

## User Directive: Test Before Merge to Main

**Date:** 2026-03-29  
**By:** David Rivard (via Copilot)  
**Type:** Process Guideline  

Always ask before merging to main — user needs to test first.

---

## User Directive: Managed Records Are Read-Only

**Date:** 2026-04-11  
**By:** David Rivard (via Copilot)  
**Type:** Business Rule  

CRUD operations only available for unmanaged records (ismanaged = false). Managed records are read-only.

---

## Decision: Compact Tree View Toggle Pattern

**Date:** 2026-03-12  
**By:** Dallas (Frontend Dev)  
**Status:** Implemented  
**Issue:** #66  

### Context

Added a compact tree view toggle for Custom API Details to allow quick inspection of API structure including parameters and response properties in a collapsible tree format.

### Decision

#### Toggle Placement
- Switch placed in the CardHeader badge group (next to ModeBadge, ComponentStateBadge, PowerFxBadge)
- Only visible in read mode when a Custom API is selected
- Uses `TreeDeciduousFilled` icon as the switch label

#### Tree Structure
Uses Fluent UI Tree component with nested structure:
- Custom API root (expanded by default)
  - Details branch (Unique Name, Binding, Plugin, Flags)
  - Request Parameters branch (with count, shows each param's type and optional status)
  - Response Properties branch (with count, shows each property's type)

#### Component Architecture
- Created new `CustomApiTreeView.tsx` with component-local `makeStyles` (following the pattern noted in history for component-level styles)
- Tree view replaces the form view content when toggle is active
- RequestParameterDetails and ResponsePropertyDetails cards are hidden when tree view is active (data already shown in tree)

#### Icons Used
- `ArrowDownloadFilled` for Request Parameters (input)
- `ArrowUploadFilled` for Response Properties (output)
- `CheckmarkCircleFilled` / `DismissCircleFilled` for boolean flags
- Standard binding type icons (Globe, Square, SquareMultiple)

### Rationale

- Toggle in header badge group keeps UI clean and consistent with other status indicators
- Hiding detail cards when in tree view prevents redundant information display
- Component-local styles keep tree-specific styling isolated from main Styles.ts

### Files Changed

- `src/components/customApiDetails/CustomApiDetails.tsx` - Added toggle state, Switch component, conditional rendering
- `src/components/customApiDetails/CustomApiTreeView.tsx` - New tree view component

---

## Issue: Compact Tree View Feature

**Date:** 2026-03-XX  
**By:** Ripley (Lead)  
**Type:** Issue Created  
**Issue:** #67  

Created GitHub issue #67 for Compact Tree View feature in CustomApiDetails.

### Key Choices

- Assigned to Dallas (Frontend) via `squad:dallas` label — this is a UI component feature
- Set `priority:medium` — useful enhancement but not blocking
- Set `release:backlog` — not yet targeted for a specific release
- Phase 1 is read-only; Phase 2 (inline editing) deferred to future scope

### Rationale

David requested this feature issue with detailed requirements. Dallas is the appropriate owner for a new UI component in the Custom API details section.

---

## Decision: CatalogAssignment Model Refactor

**Date:** 2026-04-14  
**By:** Kane (Backend Dev)  
**Status:** Implemented  
**Issue:** Model fix for catalogassignment entity

### Context

The `CatalogAssignment` model contained a fabricated `catalogassignmenttype` optionset field that does not exist in the actual Dataverse `catalogassignment` entity. This field needed to be removed and replaced with proper helpers for the actual `objectidtype` field.

### Problem

- Model defined a non-existent optionset field
- UI components built around incorrect field structure
- Type information is actually derived from `objectidtype` field (polymorphic lookup indicator)

### Decision

Removed `catalogassignmenttype` field and implemented type-safe helpers for `objectidtype`:

**New Exports from `src/models/CatalogAssignment.ts`:**
- `ObjectIdTypeLabels` — Maps entity logical names to display labels
- `objectIdTypeIcons` — Maps entity logical names to icon components
- `getObjectTypeLabel(objectidtype)` — Returns display label
- `getObjectTypeIcon(objectidtype)` — Returns icon element

### API Contract

```typescript
import { getObjectTypeLabel, getObjectTypeIcon } from '../../models/CatalogAssignment';

const label = getObjectTypeLabel(assignment.objectidtype); // "Custom API"
const icon = getObjectTypeIcon(assignment.objectidtype);   // Icon element
```

### Implementation

**Backend (Kane):**
- Removed `catalogassignmenttype` type, constants, and helpers from model
- Added `objectIdTypeLabels`, `objectIdTypeIcons`, helper functions
- Updated model interfaces to remove the fake field

**Frontend (Dallas):**
- Updated `CatalogTreeView.tsx` to use new objectidtype API
- Updated `CatalogAssignmentModal.tsx` to use `ObjectIdTypeLabels` for type selection
- Removed all references to `catalogassignmenttype`
- Build passes with no errors

### Impact

- Models now accurately reflect Dataverse entity structure
- Type information correctly sourced from polymorphic `objectidtype` field
- UI components have clean, type-safe API for type display and selection
- Build passes cleanly with no errors
