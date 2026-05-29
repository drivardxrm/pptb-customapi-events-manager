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

## Decision: Catalog Assignment Custom API Picker Must Ignore Selected Solution

**Date:** 2026-05-27  
**By:** Dallas (Frontend Dev)  
**Status:** Implemented  
**Files:** `src/components/BusinessEventDetails/CatalogAssignmentModal.tsx`

### Context

In the Business Event Catalog Assignment modal, the Custom API object picker was filtering results based on the selected solution scope. This prevented users from assigning Custom APIs from outside the selected solution, even though the solution context should only control where the new assignment record is added, not which Custom APIs are available.

### Decision

Keep responsibilities split:
- **Source picker scope:** Full assignable Custom API collection (unmanaged-only filter remains)
- **Destination scope:** Selected unmanaged solution controls where the created assignment is added

### Implementation

- Replaced `useCustomApis()` with `useAllCustomApis()`
- Updated both picker items and selected-object name lookup to use the full collection
- Memoized picker items to keep `GenericTagPicker` input stable

### Validation

- ✅ `npm run build` passed before and after
- ✅ Ripley code review found no material issues

---

## Decision: Business Event Chooser Must Resolve Catalog Paths From Unfiltered Catalog Data

**Date:** 2026-05-27  
**By:** Dallas (Frontend Dev)  
**Status:** Implemented  
**Files:** `src/hooks/useCatalogAssignments.tsx`

### Context

The Business Event chooser builds assignment rows from the global catalog-assignment list. When using the solution-scoped catalog query for label resolution, valid assignments rendered as "Unknown Catalog" whenever the selected solution hid a referenced parent/category record.

### Decision

Keep responsibilities split:
- **Chooser assignment scope:** Global assignment rows remain unchanged
- **Catalog path resolution scope:** Use unfiltered catalog collection for root/category lookup
- **UI consumer scope:** Components render without modal-specific hardcoding

### Implementation

- Replaced `useCatalogs()` with `useAllCatalogs()` inside `useCustomApiCatalogAssignments()`
- Added memoized `Map` lookup by catalog ID
- Walked `_parentcatalogid_value` upward with visited-set guard to resolve the top ancestor

### Validation

- ✅ `npm run build` passed before and after
- ✅ Ripley code review found no material issues

---

## Decision: Business Event Empty State Should Mirror Custom API CTA Pattern

**Date:** 2026-05-27  
**By:** Dallas (Frontend Dev)  
**Status:** Implemented  
**Files:** `src/components/BusinessEventDetails/BusinessEventDetails.tsx`

### Context

User explicitly requested Business Event empty state to work "exactly like we do for custom apis" — a top-level global info message with inline action button rather than relying only on in-card placeholder text.

### Decision

Show empty state as top-of-page global info message with inline action when no root catalog selected. Reuse the established Custom API no-selection pattern for consistency.

### Implementation

- File: `src/components/BusinessEventDetails/BusinessEventDetails.tsx`
- Message: `No Root Catalog selected. Select a Root Catalog below or create a new one.`
- Action label: `New Root Catalog`
- Action opens root-catalog create modal without changing other Business Event flows

### Validation

- ✅ `npm run build` passed

---

## Decision: Catalog Edit Modal Should Preserve Parent Context And Readonly Identity

**Date:** 2026-05-27  
**By:** Dallas (Frontend Dev)  
**Status:** Implemented  
**Files:** `src/components/BusinessEventDetails/CatalogModal.tsx`

### Context

Catalog edit mode lacked parity with create-category flow. Parent Catalog section and editable Unique Name field were missing, making edit mode feel inconsistent.

### Decision

Bring edit mode to parity by keeping Parent Catalog visible for child catalogs and always showing Unique Name as a readonly textbox.

### Implementation

- Edit mode resolves parent display from `useAllCatalogs()` via `_parentcatalogid_value`
- Dataverse formatted-value used as fallback for display-only safety
- Edit mode renders `catalog.uniquename` in readonly filled-darker input

### Validation

- ✅ `npm run build` passed

---

## Decision: Remove Managed Custom API Edit Action From Tree View

**Date:** 2026-05-27  
**By:** Dallas (Frontend Dev)  
**Status:** Implemented  
**Files:** `src/components/customApiDetails/CustomApiTreeView.tsx`, `src/components/customApiDetails/CustomApiDetails.tsx`

### Context

Tree view Edit action was visible and callable for managed Custom APIs, while the form/header view already treated managed Custom APIs as non-editable. This inconsistency created confusion.

### Decision

Enforce managed-record restriction consistently:
- Tree-view root edit visibility follows `!api.ismanaged`
- Edit handlers no-op for managed records as safety net
- Unmanaged edit behavior and all other tree actions unchanged

### Implementation

- Removed Edit action from tree view when `ismanaged` is true
- Added defensive guard in `handleEdit()` for managed records

### Validation

- ✅ Baseline `npm run build` passed before
- ✅ Post-change `npm run build` passed
- ✅ Ripley code review found no issues

---

## QA Review: Catalog Assignment Custom API Picker Scope

**Date:** 2026-05-27  
**By:** Lambert (Tester)  
**Status:** Reviewed  
**Related:** Catalog Assignment Custom API Picker Must Ignore Selected Solution

### Expected Behavior

1. Object picker scope: Custom API candidates stay global regardless of selected solution
2. Solution picker scope: Selected unmanaged solution controls where new assignment is added
3. Selection flow: Picking API outside selected solution hydrates assignment name correctly

### Regression Checks

- ✅ No solution selected: full expected Custom API set appears
- ✅ Solution selected: same Custom API set still appears
- ✅ Select API outside selected solution: name auto-fills and save succeeds
- ✅ Change selected solution after choosing API: object selection remains stable
- ✅ Duplicate assignment guard still blocks same catalog + object + type combination
- ✅ Entity and workflow pickers unchanged
- ✅ Edit mode unchanged

---

## QA Review: Business Event Chooser Catalog Resolution

**Date:** 2026-05-27  
**By:** Lambert (Tester)  
**Status:** Reviewed  
**Related:** Business Event Chooser Must Resolve Catalog Paths From Unfiltered Catalog Data

### Expected Behavior

1. Chooser consistency: Every visible assignment row resolves correctly; button count matches displayable assignments
2. Navigation consistency: Selecting any chooser row opens correct Business Event hierarchy
3. Cross-solution clarity: If assignments from outside selected solution are allowed, catalog metadata must be available

### Regression Checks

- ✅ Multi-assignment chooser: all visible rows show correct root → category path
- ✅ Button count equals number of rows that can be opened
- ✅ Clicking each row selects correct root catalog and assignment
- ✅ Single-assignment direct-open works across solution boundaries
- ✅ Unknown labels appear only for genuinely missing data
- ✅ Sort/order stable once paths are fully resolved

---

## QA Review: Business Event Empty-State Parity

**Date:** 2026-05-27  
**By:** Lambert (Tester)  
**Status:** Reviewed  
**Related:** Business Event Empty State Should Mirror Custom API CTA Pattern

### Expected UX

Business Events should mirror Custom API empty-selection pattern:
- Show top app message
- Use exact Root Catalog wording
- Provide `New Root Catalog` action wired to existing root-create flow

### Regression Checks

- ✅ No root catalog selected: global message + action appear
- ✅ Message clears on root selection
- ✅ Message clears on nav away from business event
- ✅ Create flow still allows `pendingBusinessEventCatalogId` auto-select after save
- ✅ In-card placeholder remains present (complementary, not replaced)

---

## QA Review: Catalog Edit Modal UX Parity

**Date:** 2026-05-27  
**By:** Lambert (Tester)  
**Status:** Reviewed  
**Related:** Catalog Edit Modal Should Preserve Parent Context And Readonly Identity

### Expected UX

**Edit Root Catalog:**
- No Parent Catalog section
- Unique Name visible, locked, read-only
- Name / Display Name / Description remain editable

**Edit Category:**
- Parent Catalog section visible with correct parent display name
- Unique Name visible, locked, read-only
- Name / Display Name / Description remain editable

### Regression Checks

- ✅ Edit root does **not** show Parent Catalog
- ✅ Edit category **does** show Parent Catalog with real parent name
- ✅ Unique Name appears and is read-only for both
- ✅ Saving edit with unchanged Unique Name succeeds
- ✅ Create root still shows editable Unique Name entry
- ✅ Create category still shows editable Unique Name + Parent Catalog
- ✅ Edit does not incorrectly run duplicate validation

---

## QA Review: Managed Custom API Tree Edit

**Date:** 2026-05-27  
**By:** Lambert (Tester)  
**Status:** Reviewed  
**Related:** Remove Managed Custom API Edit Action From Tree View

### Decision Position

Tree-view edit for root Custom API must follow same managed-state restriction as header/form: **managed Custom APIs must not be editable**.

### Findings

1. `CustomApiTreeView.tsx` shows root Edit action unconditionally
2. `CustomApiDetails.tsx` already hides header edit button when managed
3. Tree callback calls `handleEdit()` with no managed-state guard

### Regression Checks

- ✅ Managed Custom API in tree view: no Edit button, no edit-mode transition
- ✅ Unmanaged Custom API in tree view: Edit still works and preserves return-to-tree flow
- ✅ Managed/unmanaged parity between header and tree actions
- ✅ No regression to delete/add gating based on managed state

---

## QA Review: Unique Name Focus — Request Parameter / Response Property Create Mode

**Date:** 2026-05-27  
**By:** Lambert (Tester)  
**Status:** Reviewed

### Decision

Create-entry focus must be owned by actual create-form components (`RequestParameterCreate.tsx`, `ResponsePropertyCreate.tsx`) or their immediate create-mode containers, not by later save confirmation dialogs.

### Rationale

- User request is about **entering create mode**, which happens before confirmation dialogs open
- Each details panel has two create-entry paths: direct header-button create and tree-view handoff via `creationRequestToken`
- Forms may render `Loading...` before input exists, so one-shot `autoFocus` can miss async-ready renders

### QA Expectations

1. Direct create for Request Parameter focuses **Unique Name**
2. Direct create for Response Property focuses **Unique Name**
3. Tree-view create handoff for both child types also focuses **Unique Name**
4. Re-entering create after cancel/save still focuses correctly
5. Edit mode and confirmation dialogs remain unchanged

---

## Decision: Remove Test-Logic.ts

**Date:** 2026-05-27  
**By:** Ripley (Code Review)  
**Status:** Implemented

### Context

Stray root-level scratch file `test-logic.ts` had no imports, script entries, or build references.

### Decision

Surgical fix: delete only the orphaned file. Leave `package.json` unchanged.

### Validation

- ✅ Repository search confirmed no references
- ✅ Build passes after removal

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

## Decision: React 310 Crash Fix in Catalog Save

**Date:** 2026-06-04  
**By:** Dallas (Frontend Dev)  
**Status:** Implemented  
**Issue:** React error 310 when saving a new catalog  

### Context

Saving a newly created catalog triggered React error 310 (max renders / hook mismatch) in production. Error occurred when the `CatalogTreeView` component transitioned from initial render to rendering a newly created catalog.

### Root Cause

`CatalogTreeView.tsx` had a conditional hook usage pattern:
- Component had early return statements (`if (!catalogs) return null;`)
- `useMemo` for `allOpenItems` was called AFTER these early returns
- When tree selected a newly created catalog, the component execution path changed
- Different paths executed different hook counts, violating React's hook rules

### Problem

React requires hooks to execute in the same order and number every render. Conditional hook execution breaks this invariant.

### Decision

**Move `useMemo` to execute unconditionally before any early returns.**

```typescript
// Calculate open items BEFORE early returns
const allOpenItems = useMemo(() => {
  // open item calculation
}, [catalogs, selectedCatalogId, selectedTreeItemId]);

// Now safe to early return
if (!catalogs || catalogs.length === 0) return null;
```

### Alternatives Considered

1. **Refactor to conditional memoization**: Add multiple useMemo calls with different conditions → Still violates hook rules
2. **Move early return to parent**: Would require parent-level filtering → Adds complexity, breaks component encapsulation
3. **Unroll memoization**: Calculate inline instead → Loses optimization benefits

### Implementation

**File Modified:** `src/components/BusinessEventDetails/CatalogTreeView.tsx`
- Moved `allOpenItems` useMemo before early return guards
- No logic changes, only execution order
- Preserves all optimization benefits and behavior

### Validation

- ✅ Build: `npm run build` passed
- ✅ UX: New catalog create → select → display works end-to-end
- ✅ Selection: Post-create auto-selection behavior preserved
- ✅ Regressions: Tree navigation and filtering remain functional

### QA Context

**Lambert (Tester) Provided:**
- Confirmed hook order was the likely root cause
- Regression check scenarios: root/category create under solution/filter/refetch combinations
- Watch item: `pendingBusinessEventCatalogId` may linger if created data never appears (monitor for stale state)

### Related Changes

This fix complements the earlier "Created Catalog Selection Handoff" decision (2026-05-26) which implemented post-create auto-selection. Hook order fix ensures the selection transition doesn't crash the component.

### Impact

- **Frontend:** Unblocks new catalog save workflow in Business Events
- **Production:** Resolves React 310 crash for users creating catalogs
- **QA:** Ready for end-to-end regression validation

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

---

## Decision: Public Release Cleanup Batch

**Date:** 2026-05-27  
**By:** Dallas (Frontend Dev)  
**Status:** Completed  
**Batch:** First public-release cleanup pass

### Context

Executed first batch of public-release cleanup to remove local development artifacts and build outputs from the repository before public release.

### Removed
- `.vscode/` — IDE configuration (local-only)
- `.copilot/` — Copilot session artifacts  
- `.work-folder-info` — Local development metadata
- `.vfsmeta/` — Virtual filesystem metadata
- `playwright-report/` — E2E test report outputs
- `test-results/` — Test execution result directories

### Confirmed Already Absent
- `test-logic.ts` — Previously identified for removal, already gone
- `ZUSTAND.md` — Previously decided removal, already gone

### Gitignore Updated
- Added `.copilot/` and `.work-folder-info` ignore rules
- Kept existing rules for `.vscode/`, `.vfsmeta/`, `playwright-report/`, `test-results/`

### Deferred to Post-Session Cleanup
- `.squad/` directory — Remains a public-release concern; deferred during active Squad session to preserve team memory, routing, decision inbox, and history tracking. To be removed in a dedicated cleanup batch after this session ends.

### Validation
- ✅ Build passed before cleanup
- ✅ Build passed after cleanup
- ✅ No code changes required

### Next Steps
- Post-session cleanup batch to handle `.squad/`, `.squad-templates/`, Squad workflows, and stale GitHub configuration

---

## Audit: Public Release Cleanup Batch

**Date:** 2026-05-27  
**By:** Lambert (Tester)  
**Status:** Completed  
**Related:** Decision: Public Release Cleanup Batch

### Audit Scope

Reviewed Dallas's cleanup batch and assessed remaining public-release items for future phases.

### Dallas's Current Batch — Verified ✅
- `.copilot/` and `.work-folder-info` removed and ignored
- `.gitignore` properly updated with new rules
- Local-only artifacts confirmed absent
- Build verified before and after cleanup
- No regressions

### Remaining Public-Release Cleanup Items (Catalogued for Post-Session)

**Directory/File Removals:**
- `.squad/` — Team Squad configuration and state
- `.squad-templates/` — Squad template definitions
- `.github/agents/squad.agent.md` — Squad agent documentation
- `.github/workflows/squad-*.yml` — Squad-specific workflow automations
- `.github/workflows/sync-squad-labels.yml` — Squad-specific GitHub automation
- `.gitattributes` entries for `.squad/*` — Union-merge rules tied to Squad

**Configuration & Documentation Issues:**
- `.github/copilot-instructions.md` — Mismatch: claims no test framework; project has E2E structure
- Stale workflow references in documentation
- README potentially stale references to removed directories

### Decision Rationale

**Keep `.squad/` During Active Session:** The Squad directory is critical to active session operations:
- **decisions.md** — Decision history and audit trail
- **orchestration-log/** — Agent execution records
- **agents/{name}/history.md** — Team member learnings and context
- **routing.md** — Navigation and dispatch logic
- **backlog.md** — Project priorities

Removing these mid-flight would disrupt active workflows and lose session context.

**Future Ignore Rules:** Once `.squad/` and `.squad-templates/` are removed from git in the post-session batch, add corresponding `.gitignore` rules if the team continues to use Squad locally. This prevents accidental re-commits.

### Validation
- ✅ Current batch targets are clean and correct
- ✅ All removed items verified as local/temporary
- ✅ Remaining items identified and categorized
- ✅ Risk assessment: no blockers to current session

### Next Steps
1. Schedule dedicated post-session cleanup batch
2. Coordinate with Ripley for public-repo readiness verification
3. Update documentation stale references (if applicable) during post-session pass

---

## Decision: Pin npm Major Version For Docs Workflow

**Date:** 2026-05-29  
**By:** Kane (Backend Dev)  
**Status:** Implemented  
**Issue:** Docs Site - Build & Deploy failure on main  

### Context

`Docs Site - Build & Deploy` workflow failed at `npm ci` on main branch even though the committed `package-lock.json` was current. Investigation revealed this was not a lockfile-staleness issue.

### Problem

Node 22 bundled npm 10, but the lockfile was created with npm 11. Attempting to re-resolve the lockfile with npm 10 failed on React 18-era packages, while npm 11 succeeded cleanly.

### Decision

**Treat docs workflow failure as npm major-version drift, not ordinary lockfile drift.** Pin the workflow to npm 11 and declare npm version in package.json.

### Implementation

**Files Modified:**
- `.github/workflows/docs.yml` — Upgraded `npm ci` step to npm 11
- `package.json` — Added `"packageManager": "npm@11.10.0"`
- `package-lock.json` — Refreshed with npm 11

### Validation

- ✅ Reproduced locally: npm 10.9.2 failed with identical React 18 / scheduler missing-package error
- ✅ npm 11.10.0 successfully ran `npm ci` and `npm run docs:build`
- ✅ Contributors and CI now resolve the same lockfile shape

### Guardrail

`.github/workflows/e2e-tests.yml` remains a parallel blind spot because it also runs `npm ci`. Apply same npm 11 pin to that workflow in future work.

---

## QA Review: npm Major-Version Lockfile Alignment

**Date:** 2026-05-29  
**By:** Lambert (Tester)  
**Status:** Verified  
**Related:** Decision: Pin npm Major Version For Docs Workflow  

### Evidence

- GitHub run `26615967345` on commit `5ad36e8` failed at `npm ci` in `.github/workflows/docs.yml`
- Clean local worktree at same commit: `npm@10.9.2 ci` reproduced the failure exactly
- Same worktree with `npm@11.10.0 ci` succeeded, followed by successful `npm run docs:build`

### Validation Checklist

- ✅ Lockfile sync confirmed under npm 11 (package-lock matches npm ci output)
- ✅ Failure reproducible under npm 10
- ✅ Success confirmed under npm 11
- ✅ packageManager field present and correct in package.json
- ✅ Workflow pinned to npm 11

### Recommendation

Extend same pin to `.github/workflows/e2e-tests.yml` to prevent parallel regression.
