# Ripley — History

## Core Context
Joined the PPTB Dataverse Custom API Manager team as Lead on 2026-02-28.

## Learnings
- Initial team formation with Dallas (Frontend), Kane (Backend), Lambert (Tester)
- **Project Architecture (2026-02-28 to 2026-03-01):** Reviewed and approved PPTB project structure including entity service patterns, TanStack Query hooks with solution-scoped caching, Zustand state management, Vite IIFE build for iframe compatibility. Key patterns: Model → Service → Hook → Component architecture. Identified 50 backlog items across testing, Business Events completion, and UX gaps. Approved minimal README strategy; recommended Playwright for E2E testing with window-level mock injection over MSW.
- **CustomApiSelector UX Analysis (2026-03-XX):** Documented architectural pattern and identified potential improvements for future iterations. Current implementation uses GenericTagPicker with independent managed/unmanaged toggles; CatalogSelector has identical pattern for future harmonization.
- **2026-05-24 Prior-Fix Audit:** With tree-view entry now clearing both child selection IDs, the extra `setSelectedResponsePropertyId(null)` inside `CustomApiDetails.handleCreateResponsePropertyFromTree` is redundant. The earlier response-property hardening in `ResponsePropertyDetails`, `ResponsePropertyCreateDialog`, and the cloned list boundary still protects independent correctness concerns and should remain.

### 2026-05-24: Tree View Entry Clears Child Selections — Reviewed & Approved

**Review Scope:** Dallas's `CustomApiDetails.tsx` change to clear persisted request/response selection IDs when entering tree view mode.

**Key Findings:**
- `showTreeView` now drives a dedicated effect that clears both `selectedRequestParameterId` and `selectedResponsePropertyId` whenever tree view becomes active.
- The reset is narrowly scoped to tree-view entry, matching the request without broadening behavior in unrelated form-view flows.
- The change is compile-safe and does not alter create/edit logic beyond the requested store cleanup.

**Validation:**
- ✅ `npm run build` passed

**Decision:** ✅ **APPROVED** — Safe and complete relative to the user request.

### 2026-05-24: Tree View Edit Handoff Review — Approved

**Review Outcome:** Approved Dallas's tree-view Edit handoff for existing request parameters and response properties.

**Key Findings:**
- `CustomApiTreeView.tsx` adds scoped Edit actions only for unmanaged child items, matching existing form-view edit affordances.
- `CustomApiDetails.tsx` hands tree-view edit requests into the form view through explicit pending edit IDs, clears the opposite child selection, exits tree view, and lets the remounted details panel finish selection + mode entry.
- `RequestParameterDetails.tsx` and `ResponsePropertyDetails.tsx` use two-stage effects to select the requested item after remount and enter edit mode only once the matching record is present.
- Updated Playwright specs cover both request-parameter and response-property tree-view Edit actions end-to-end.

**Validation:**
- ✅ `npm run build` passed
- ✅ Focused Playwright specs passed: request-parameter + response-property suites (15/15)

**Decision:** ✅ **APPROVED** — Safe, complete, and validated for the requested tree-view Edit behavior.

### 2026-05-24: Tree View Response Property Review — Approved

**Review Outcome:** Approved Dallas's response-property tree view follow-up fix as safe and complete enough for the reported create-twice loop.

**Key Findings:**
- `src/components/customApiDetails/CustomApiDetails.tsx` now clears `selectedResponsePropertyId` before tree-view create handoff, preventing stale selection from surviving the remount.
- `src/components/responsePropertyDetails/ResponsePropertyDetails.tsx` now resets create-mode confirmation/validation state and passes a cloned array into `ResponsePropertyList`, isolating React Query data from in-place list sorting.
- `src/components/responsePropertyDetails/ResponsePropertyCreateDialog.tsx` now resets dialog-local solution selection only on open/close transitions, preventing stale carryover between consecutive create attempts.
- `src/store/useAppStore.ts` now makes `setSelectedResponsePropertyId` and `setEditingComponent` idempotent, reducing no-op subscriber churn during remount-heavy mode switches.

**Validation:**
- ✅ `npm run build` passed
- ✅ Focused Playwright test passed: `response-property.spec.ts` tree-view create-twice scenario

**Key Files:**
- `src/components/customApiDetails/CustomApiDetails.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyDetails.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyCreate.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyCreateDialog.tsx`
- `src/store/useAppStore.ts`
- `tests/e2e/specs/response-property.spec.ts`

### 2026-05-24: Tree View Create Flow React #185 Fix Review — Approved

**Review Outcome:** Approved Dallas's picker-stability fix for the tree view create-flow React #185 regression.

**Architecture / Pattern:**
- GenericTagPicker should treat stale-selection cleanup as idempotent and dispatch parent callbacks through a ref-backed handler.
- Query-backed picker `items` must be memoized in create/edit forms; inline `map(...).sort(...)` arrays are unsafe around remount-heavy tree view flows.
- Picker state should not be force-cleared while option data is temporarily empty during remount/loading; clear only once the option set is present and the selected id is actually absent.

**Root Cause Confirmed (from Lambert's analysis):**
- Stale `responsePropertyQuery` cache state combined with validation cascades caused re-render loops
- Unstable picker item arrays compounded issue during remounts

**Implementation Details:**
- `GenericTagPicker.tsx`: Made stale-selection clearing idempotent with ref-backed guard; prevents duplicate parent updates
- `RequestParameterCreate.tsx` & `ResponsePropertyCreate.tsx`: Memoized picker item arrays with `useMemo`

**Validation:**
- ✅ `npm run build` passed
- ✅ Focused Playwright create-form tests passed
- ✅ No material regressions found

**Key Files:**
- `src/components/generic/GenericTagPicker.tsx`
- `src/components/requestParameterDetails/RequestParameterCreate.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyCreate.tsx`

### 2026-04-15: Solution Filter Count Review

**Review Outcome:** Approved the latest `CustomApiSelector` filter-summary revision for solution-scoped behavior.

**Architecture / Pattern:**
- In collapsed filter summaries, solution managed/unmanaged is a picker-scoping control, not a standalone active filter.
- Active filter count should include the selected solution itself, but should not count `showSolutions` on its own.
- Solution-related collapsed badges should only appear when a specific solution is selected; Custom API filters remain independently badgeable.

**User Preference Captured:**
- David wants Solution-related filter context treated as conditional on an actual solution selection, and does not want managed/unmanaged Solution scope surfaced as its own active filter.

**Key Files:**
- `src/components/CustomApiSelector.tsx`
- `src/styles/Styles.ts`
- `.squad/skills/collapsed-filter-summary-parity/SKILL.md`

### 2026-05-21: Solution Filter Scope Refinement — Approved

**Review Outcome:** Approved Dallas's refinement to treat Solution managed/unmanaged toggle as a contextual picker-scope control.

**Key Findings:**
- Filter count now correctly excludes `showSolutions` from active-filter count calculation
- Collapsed badges conditionally show solution context only when a solution is actually selected
- Custom API managed state, PowerFx, and Business Event filters remain independently badgeable
- Pattern correctly implements: parent-picker scope toggles are contextual, not standalone filters

**Pattern / Guidance Confirmed:**
- Parent-picker scope toggles should not inflate active-filter counts
- Collapsed filter summaries enumerate only user-facing filters that materially change displayed records
- Active-filter counts and visual summaries must remain in sync
- Badges serve as shared presentation for compact collapsed-state overviews

**Files Approved:**
- `src/components/CustomApiSelector.tsx`

### 2026-04-15: Solution Filter Count Review

**Review Outcome:** Rejected Dallas's `CustomApiSelector` collapsed summary change for incompleteness.

**Key Findings:**
- `src/components/CustomApiSelector.tsx` now renders badge-based collapsed summaries for selected solution, Custom API managed-state, PowerFx, and Business Event filters.
- The collapsed summary omits the Solution managed/unmanaged filter (`showSolutions`), even though that control lives in the same collapsed filter section and materially changes the available solution list.
- The filter count also still excludes the Solution managed/unmanaged filter, so the collapsed affordance can under-report active filters.
- `npm run build` passed after the change, so the blocking issue is UX correctness/completeness rather than a compile regression.

**Pattern / Guidance:**
- Collapsed filter summaries must mirror every active control inside the collapsed section; partial summaries create misleading state.
- If a filter section shows an active-filter count, the count and the visual summary should be derived from the same source of truth.

**Key Files:**
- `src/components/CustomApiSelector.tsx`
- `src/styles/Styles.ts`
- `.squad/decisions/inbox/dallas-collapsed-filter-summary.md`

### 2026-04-15: Collapsed Filter Summary Re-Review

**Review Outcome:** Approved Kane's revision to the `CustomApiSelector` collapsed filter summary.

**Key Findings:**
- `src/components/CustomApiSelector.tsx` now includes the Solution managed/unmanaged toggle (`showSolutions`) in both the collapsed badge summary and the active-filter count.
- The collapsed state now reflects every active control in the filter section: selected solution, solution managed state, Custom API managed state, PowerFx, and Business Event.
- `npm run build` passed after the revision, so the UI correction is compile-safe.

**Pattern / Guidance:**
- Collapsed filter summaries are acceptable when they enumerate the full active filter set and the count is kept in sync with the same set.
- `styles.badgeContainer` remains the shared presentation pattern for compact collapsed-state overviews in selector cards.

**Key Files:**
- `src/components/CustomApiSelector.tsx`
- `src/styles/Styles.ts`
- `.squad/decisions/inbox/kane-collapsed-filter-revision.md`

### 2026-05-24: Response Property Tree-View Create State Follow-up — Reviewed & Approved

**Review Scope:** Dallas's follow-up response-property fix for tree-view create/create-again React #185 regression (distinct from earlier GenericTagPicker fix).

**Implementation Validation:**
- \u2705 `selectedResponsePropertyId` cleared before tree-view create handoff prevents stale selection from surviving remount
- \u2705 Response-property list receives cloned array isolates React Query cache from in-render sorting mutations
- \u2705 Create-dialog solution selection resets on real open/close transitions prevents stale carryover between creates
- \u2705 Zustand setters for `selectedResponsePropertyId` and `editingComponent` are idempotent reduces no-op subscriber churn during remount-heavy mode switches

**Validation Data:**
- \u2705 Build: `npm run build` passed
- \u2705 Focused Playwright scenario passed: Tree-view create-twice with no page errors

**Decision:** ✅ **APPROVED** — No material regression found. Fix is well-scoped, idempotent, and validated. Ready for merge.

### 2026-05-24T22:11:53Z: TreeView Edit Action Implementation — Final Review & Approval

**Review Scope:** Dallas's complete TreeView Edit action implementation for request parameters and response properties, plus Lambert's regression analysis and prior-fix audit.

**Scope Reviewed:**
1. `src/components/customApiDetails/CustomApiTreeView.tsx` - Edit button callbacks for unmanaged items
2. `src/components/customApiDetails/CustomApiDetails.tsx` - Parent-level two-phase handoff logic
3. `src/components/requestParameterDetails/RequestParameterDetails.tsx` - Detect pending ID, auto-enter edit
4. `src/components/requestParameterDetails/RequestParametersList.tsx` - Guard selection updates
5. `src/components/responsePropertyDetails/ResponsePropertyDetails.tsx` - Detect pending ID, auto-enter edit
6. `src/components/responsePropertyDetails/ResponsePropertyList.tsx` - Guard selection updates
7. `src/store/useAppStore.ts` - Idempotent setters
8. `tests/e2e/specs/request-parameter.spec.ts` + `response-property.spec.ts` - Edit action coverage

**Validation Analysis (from Lambert):**
- 58+ regression checkpoints across 9 test phases (T1–T9) verified through E2E and code inspection
- Expected handoff flow documented and validated: Edit button → tree exit + pending ID → form mount → select → edit mode
- Critical handoff points identified and confirmed working: tree toggle, selection set, form auto-enter, editing lock, data binding
- Prior React #185 fixes audited and rationale confirmed (keep all hardening pieces; only mark redundant clear for future cleanup)

**Implementation Validation:**
- ✅ Edit actions scoped to unmanaged items only (consistent with form-view edit constraints)
- ✅ Parent-level handoff bridges tree-view-to-form remount cleanly (no remount race conditions)
- ✅ Child components only enter edit mode after record selected and available (avoids React #185 racing)
- ✅ Two-phase handoff prevents direct pre-selection from causing max-depth errors
- ✅ Selection logic hardened with guards (prevents controlled-selection loops)
- ✅ Store setters made idempotent (reduces no-op subscriber churn)

**Test Coverage Validation:**
- ✅ `npm run build` passed (TypeScript compile + Vite build)
- ✅ `npm run test:e2e` passed: 33 passed, 3 skipped (no new failures)
- ✅ Focused request-parameter edit specs: Full coverage of tree item Edit action, form auto-entry, save/cancel
- ✅ Focused response-property edit specs: Full coverage of tree item Edit action, form auto-entry, save/cancel
- ✅ No page errors or React #185 warnings in E2E logs
- ✅ Managed/unmanaged visibility constraints correctly applied

**Prior Fix Assessment (from Lambert audit):**
- Root cause confirmed: Stale persisted child selection surviving transition into tree view
- Keep decision: Tree-view entry cleanup (clears both child IDs) — still essential
- Keep decision: Response-property list cloning (prevents React Query cache mutation)
- Keep decision: Create-dialog solution reset (prevents stale carryover between creates)
- Keep decision: Store setter idempotence (reduces no-op churn during remounts)
- Future cleanup: Redundant `setSelectedResponsePropertyId(null)` in create handoff marked for removal once other validations complete

**Decision:** ✅ **APPROVED** — Safe, complete, and fully validated. TreeView Edit actions ready for production.

**Key Files Approved:**
- `src/components/customApiDetails/CustomApiTreeView.tsx` ✅
- `src/components/customApiDetails/CustomApiDetails.tsx` ✅
- `src/components/requestParameterDetails/RequestParameterDetails.tsx` ✅
- `src/components/requestParameterDetails/RequestParametersList.tsx` ✅
- `src/components/responsePropertyDetails/ResponsePropertyDetails.tsx` ✅
- `src/components/responsePropertyDetails/ResponsePropertyList.tsx` ✅
- `src/store/useAppStore.ts` ✅
- `tests/e2e/specs/request-parameter.spec.ts` ✅
- `tests/e2e/specs/response-property.spec.ts` ✅
