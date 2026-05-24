# Decisions

Team decisions are recorded here. Append-only.

For archived decisions (older than 30 days), see `decisions-archive.md`.

---

### 2026-05-21: Solution Filter Count Scope — Selection-Scoped Toggle
**By:** Dallas (Frontend Dev)  
**What:** Revised `CustomApiSelector.tsx` so the Solution managed/unmanaged toggle (`showSolutions`) no longer counts as a standalone active filter.
**Why:** The toggle scopes the solution picker context, not applied record filters. Users read active-filter badges as filters that materially change the displayed record set. Collapsed badges should only show solution-related context when a solution is actually selected.
**Implementation:**
- Filter count excludes `(showSolutions !== 'all' ? 1 : 0)` calculation
- Collapsed filter badges conditionally show solution managed/unmanaged badge only when a specific solution is selected
- Custom API managed state, PowerFx, and Business Event filters remain as independent, always-visible badges
**Files Changed:**
- `src/components/CustomApiSelector.tsx`
**Build Status:** ✅ `npm run build` passed

---

### 2026-05-21: Solution Filter Scope — Approved
**By:** Ripley (Lead)  
**What:** Reviewed and approved Dallas's revision to treat Solution managed/unmanaged as a contextual picker-scope control rather than a standalone active filter.
**Why:** Parent-picker scope toggles should not inflate active-filter counts. The collapsed summary correctly now reflects only user-facing filters that materially change displayed records (selected solution, Custom API managed state, PowerFx, Business Event). Solution context is properly shown as conditional on an actual solution selection.
**Pattern / Guidance Established:**
- Parent-picker scope toggles are contextual controls, not standalone filters
- Collapsed filter summaries must enumerate only the active user-facing filter set
- Active-filter counts and visual summaries must stay in sync
- Badges serve as the shared presentation for compact collapsed-state overviews
**Files Approved:**
- `src/components/CustomApiSelector.tsx`
**Build Status:** ✅ `npm run build` passed

---

### 2026-05-24: React #185 Picker State Stability Fix
**By:** Dallas (Frontend Dev)  
**What:** Fixed React #185 (Maximum update depth exceeded) regression occurring when creating response properties after toggling tree view mode in Custom API Details.
**Root Cause:** Stale `responsePropertyQuery` cache state combined with validation cascades caused re-render loops. GenericTagPicker items instability compounded the issue during remounts.
**Solution Implemented:**
1. **GenericTagPicker.tsx** - Made stale-selection clearing callback idempotent with ref-backed guard to prevent duplicate parent state updates during remounts. Added logic to avoid clearing while option list is temporarily empty (important for modal remounts).
2. **RequestParameterCreate.tsx** - Memoized picker item arrays with `useMemo` to eliminate inline `map(...).sort(...)` arrays passed to picker.
3. **ResponsePropertyCreate.tsx** - Memoized picker item arrays with `useMemo` matching pattern in RequestParameterCreate.
**Why:** Unstable references cause picker effects to re-fire on every render, which during remounts after tree view toggles creates validation cascades and re-render loops. Memoization stabilizes references; idempotent clearing prevents duplicate state updates.
**Validation:**
- ✅ `npm run build` passed
- ✅ Focused Playwright create-form tests passed
- ✅ No material regressions found
**Files Changed:**
- `src/components/generic/GenericTagPicker.tsx`
- `src/components/requestParameterDetails/RequestParameterCreate.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyCreate.tsx`

---

### 2026-05-24: React #185 Fix — Approved
**By:** Ripley (Lead)  
**What:** Reviewed and approved Dallas's GenericTagPicker refactor and picker state stability fix for React #185 regression.
**Why:** The reported React #185 loop was caused by unstable picker item arrays plus stale-selection clearing that could re-fire parent updates during remounts. Dallas fixed both sides: form-level picker items are memoized, and GenericTagPicker now clears stale selections through a ref-backed callback with an idempotence guard. The picker also correctly avoids clearing while the option list is temporarily empty, which is important for tree view modal remount/loading gaps.
**Guidance for Future Work:**
- Do not pass inline `map(...).sort(...)` arrays into GenericTagPicker.
- Any picker effect that can call back into parent state must be idempotent across remounts.
**Files Approved:**
- `src/components/generic/GenericTagPicker.tsx`
- `src/components/requestParameterDetails/RequestParameterCreate.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyCreate.tsx`
**Build Status:** ✅ `npm run build` passed

---

### 2026-05-24: Response Property Tree-View Create State Reset (Follow-up)
**By:** Lambert (Tester)  
**What:** Validated and traced React #185 regression specific to response-property tree-view create/create-again scenarios (distinct from earlier GenericTagPicker fix).
**Root Causes Identified:**
1. Shared conditional render block for RequestParameterDetails and ResponsePropertyDetails causes simultaneous mount/unmount
2. TanStack Query cache with `staleTime: Infinity` persists across unmount/remount without invalidation
3. Component-level `lastHandledCreationRequestToken` ref resets on mount, creating race condition with dual component initialization
**Regression Scenarios:**
- Scenario 1: Create Request Parameter → Toggle Tree View → Create Response Property
- Scenario 2: Create Response Property → Toggle Tree View → Create Response Property Again
- Scenario 3: Rapid tree-view toggles during creation
**Deliverable:** Regression checklist with three scenarios and DevTools inspection points for Dallas implementation.

---

### 2026-05-24: Response Property Tree-View Create State Reset — Implementation
**By:** Dallas (Frontend Dev)  
**What:** Hardened response-property tree-view create flow against React #185 follow-up failures by resetting persisted frontend state at tree/form handoff.
**Implementation (Four-Part):**
1. Clear `selectedResponsePropertyId` before opening create mode from `CustomApiTreeView`
2. Clone response-property query data at details boundary into `ResponsePropertyList` to prevent mutation of React Query-backed data
3. Reset create-dialog solution selection when dialog closes (avoid stale solution across consecutive creates)
4. Make Zustand setters for `selectedResponsePropertyId` and `editingComponent` idempotent
**Why:** Tree-view toggles unmount form components, but Zustand selection state and TanStack Query cache survive remount. Consecutive create attempts were re-entering with stale selection/dialog state. Resetting handoff state and avoiding no-op store writes is the safest frontend-only fix.
**Validation:**
- ✅ `npm run build` passed
- ✅ Focused Playwright response-property suite: 7/7 tests passed (including remount regression scenario)
- ✅ No page errors or React #185 warnings

---

### 2026-05-24: Response Property Tree-View Fix — Approved
**By:** Ripley (Lead)  
**What:** Reviewed and approved Dallas's follow-up response-property fix for tree-view create/create-again React #185 regression.
**Reasoning:**
- Parent tree-view handoff now clears persisted response-property selection before detail panel remounts ✓
- Response-property list receives cloned array so in-render sorting cannot mutate React Query-backed data ✓
- Create dialog state resets on real open/close transitions, avoiding stale solution selection across consecutive creates ✓
- Store setters are idempotent, reducing no-op update churn during remount-heavy transitions ✓
**Validation:**
- Build: `npm run build` passed ✓
- Focused Playwright scenario: Create twice after tree-view remounts, no page errors ✓
- Regression checklist: All three scenarios covered and validated ✓
**Decision:** ✅ **APPROVED** — No material regression found. Ready for merge.

---

### 2026-05-24: Tree View Entry Clears Child Selections
**By:** Dallas (Frontend Dev) + Ripley (Lead approval)
**What:** Added directive to clear persisted child selections when entering tree view: both `selectedRequestParameterId` and `selectedResponsePropertyId` are cleared by `useEffect` in `CustomApiDetails.tsx` when `showTreeView` becomes true.
**Directive Source:** User request captured 2026-05-24T17:03:44.617-04:00
**Why:** Tree view hides request-parameter and response-property detail panes; retaining child selections creates stale UI state with no visible owner. Clearing selections keeps tree/form transitions consistent.
**Implementation:**
- Single `useEffect` in `CustomApiDetails.tsx` watches `showTreeView` flag
- Clears both store IDs when entering tree view
- No impact on form-view flows or create/edit logic beyond requested store cleanup
**Validation:**
- Build: `npm run build` passed ✓
- Focused regression: Response-property remount scenario passed ✓
**Decision:** ✅ **APPROVED** by Ripley — Safe and complete for requested scope.

---

### 2026-05-24: TreeView Edit Action Regression Checklist — Documented
**By:** Lambert (Tester)  
**What:** Analyzed required state transitions and documented comprehensive regression checklist for Dallas's TreeView Edit handoff implementation.
**Scope:** Edit actions on unmanaged request parameters and response properties in CustomApiTreeView component.
**Key Findings:**
- Expected handoff flow: Edit button click → tree view exits + pending ID stored → form component mounts → detects pending ID → selects item → enters edit mode
- Critical handoff points: tree view toggle, selection set, form auto-enter edit, editing lock, data binding
- 58+ validation checkpoints across 9 test phases (component changes, form integration, edge cases, regression)
- DevTools validation steps for Zustand state, React Query, Profiler, network inspection
- Known behavioral baselines and regression risk assessment
**Decision:** ✅ **DOCUMENTED** — Checklist ready for implementation validation.

---

### 2026-05-24: Prior React #185 Fix Attempts — Audit Complete
**By:** Ripley (Lead) + Lambert (Tester)  
**What:** Audited response-property hardening decisions and confirmed root cause of React #185 regression.
**Root Cause Confirmed:** Stale persisted child selection surviving transition into tree view caused remount-time reconciliation failures and validation cascades.
**Keep Decisions:**
- Tree-view entry cleanup that clears both child IDs (prevents stale selection persistence)
- Response-property list array cloning (prevents React Query data mutation via in-render sort)
- Create-dialog solution reset on open/close (prevents stale carryover between consecutive creates)
- Store setter idempotence (reduces no-op subscriber churn during remounts)
**Future Cleanup:**
- Redundant `setSelectedResponsePropertyId(null)` inside `handleCreateResponsePropertyFromTree` can be removed once verified
**Rationale:** Each kept piece of hardening protects independent correctness concerns beyond the initial fix. Removing would reintroduce edge-case failures in specific remount sequences.
**Decision:** ✅ **APPROVED** — Confirmed safety and completeness of prior fixes.

---

### 2026-05-24: TreeView Edit Handoff Implementation — Approved
**By:** Ripley (Lead) + Dallas (Frontend Dev)  
**What:** Implemented TreeView Edit actions for existing request parameters and response properties with two-phase handoff and full Playwright coverage.
**Scope Reviewed:**
- `src/components/customApiDetails/CustomApiTreeView.tsx` - Added Edit button callbacks for unmanaged items
- `src/components/customApiDetails/CustomApiDetails.tsx` - Parent-level handoff logic (exit tree, store pending ID, trigger form select)
- `src/components/requestParameterDetails/RequestParameterDetails.tsx` - Detect pending ID, auto-enter edit after mount
- `src/components/requestParameterDetails/RequestParametersList.tsx` - Guard selection updates for consistency
- `src/components/responsePropertyDetails/ResponsePropertyDetails.tsx` - Detect pending ID, auto-enter edit after mount
- `src/components/responsePropertyDetails/ResponsePropertyList.tsx` - Guard selection updates for consistency
- `src/store/useAppStore.ts` - Idempotent setters for selected*Id and editingComponent
- `tests/e2e/specs/request-parameter.spec.ts` + `response-property.spec.ts` - Edit action coverage
**Why Approved:**
- Edit actions limited to unmanaged items (consistent with existing form-view edit constraints)
- Parent-level handoff state cleanly bridges tree-view-to-form remount boundary without forcing tree to own form mode
- Child detail panels only enter edit mode after requested record is selected and available (avoids React #185 racing)
- Focused Playwright coverage proves both request-parameter and response-property edit entry paths
- No material regression against prior fixes (React #185, GenericTagPicker, response-property create)
**Validation:**
- ✅ `npm run build` passed
- ✅ `npm run test:e2e` passed: 33 passed, 3 skipped
- ✅ Focused request-parameter and response-property edit specs passing
**Decision:** ✅ **APPROVED** — Safe, complete, and validated for requested TreeView Edit behavior.

---

### 2026-05-24: TreeView Return Flow — Architecture Decision
**By:** Dallas (Frontend Dev)  
**What:** Established the parent-owned return-to-tree intent pattern. When a create/edit action is launched from `CustomApiTreeView`, the parent container (CustomApiDetails) owns a completion callback that returns to tree view after the action finishes. Child detail panels receive an optional callback and invoke it only on **successful save** or **form cancel**.
**Why:** The parent already owns `showTreeView`, making it the safest place to preserve tree-vs-form intent. Tree-originated flows need different exit behavior than standard form flows; an optional callback keeps non-tree paths unchanged. Treating create-dialog cancel as "still editing" avoids accidentally dismissing the form before the user has cancelled the actual create action.
**Scope:**
- `src/components/customApiDetails/CustomApiDetails.tsx` - Parent handoff logic
- `src/components/customApiDetails/CustomApiTreeView.tsx` - Tree action initiators
- `src/components/requestParameterDetails/RequestParameterDetails.tsx` - Optional callback invocation
- `src/components/responsePropertyDetails/ResponsePropertyDetails.tsx` - Optional callback invocation
**Pattern:** Tree-originated request/response create/edit actions set intent flags before toggling tree view OFF, then invoke completion callbacks only on save/cancel from the child. Non-tree flows unaffected (no callback passed).
**Decision:** ✅ **APPROVED** (architectural pattern established).

---

### 2026-05-24: TreeView Return Flow — Implementation Review V1 (Rejected)
**By:** Ripley (Lead)  
**What:** Reviewed Dallas's initial implementation of parent-owned return-to-tree intent and identified critical flag-lifecycle gap.
**Rejection Reason:** `returnToTreeViewAfterRequestParameterAction` and `returnToTreeViewAfterResponsePropertyAction` flags are set when tree-originated child actions begin but cleared only from child `onActionFinished` callbacks. The Tree/Form switch remains usable while those child forms are active. If the user manually toggles back to tree view before saving/canceling, the child component unmounts and the flag survives unchanged. On a later non-tree request/response action, that stale flag still injects the completion callback, causing save/cancel to unexpectedly bounce the user back to tree view.
**Scope Reviewed:**
- `src/components/customApiDetails/CustomApiDetails.tsx`
- `src/components/customApiDetails/CustomApiTreeView.tsx`
- `src/components/requestParameterDetails/RequestParameterDetails.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyDetails.tsx`
- Related test files
**Required Revision:**
1. Clear tree-return flags on every path that exits child form mode without invoking the child save/cancel callback.
2. Ensure manual Tree/Form toggling cannot leak tree-origin intent into later non-tree actions.
3. Add Playwright regression proving: tree-origin action starts → user toggles back to tree view before finishing → user returns to form view and starts a non-tree action → save/cancel does **not** bounce to tree view.
**Validation Performed:** `npm run build` ✅, focused Playwright suites ✅
**Decision:** 🔴 **REJECTED FOR REVISION** — Close but not safe enough; designated Kane as revision owner.

---

### 2026-05-24: TreeView Return Intent Reset — Revision Decision
**By:** Kane (Backend/Backend-Revision Owner)  
**Decision:** When `CustomApiDetails` re-enters tree view, it must clear request/response tree-return intent and any pending child handoff state before later form actions begin.
**Why:** Tree-origin return behavior is a one-action intent, not durable UI state. If a user abandons a tree-launched child form by manually toggling back to tree view, the child unmounts without calling its normal save/cancel completion callback. Leaving the parent flags or pending handoff ids in place causes later form-originated request/response actions to inherit stale `onActionFinished` behavior or replay abandoned handoffs.
**Implementation Guidance:**
- Keep return-intent booleans owned by `CustomApiDetails`
- On every transition into tree view, clear:
  - `returnToTreeViewAfterRequestParameterAction`
  - `returnToTreeViewAfterResponsePropertyAction`
  - `requestParameterCreateTrigger`
  - `responsePropertyCreateTrigger`
  - `requestParameterEditId`
  - `responsePropertyEditId`
- Continue clearing child selections on tree entry
- Preserve save/cancel return-to-tree behavior only when the active action genuinely originated from the tree
**Validation:** `npm run build` ✅, focused Playwright regression for request-parameter and response-property manual-toggle leak scenarios ✅
**Decision:** ✅ **DECISION RECORDED** — Ready for implementation.

---

### 2026-05-24: TreeView Return Flow — Implementation Review V2 (Approved)
**By:** Ripley (Lead)  
**What:** Reviewed Kane's revised implementation of tree-return-to-tree intent reset and approved for merge.
**Why Approved:** Kane fixed the specific rejection gap cleanly at the parent boundary in `CustomApiDetails.tsx`: entering tree view now clears both child return-to-tree flags and the queued request/response create-edit handoff state together before a later form action can reuse them. The child detail panels still return to tree only on successful save or explicit cancel, so ordinary form-originated flows remain unchanged.
**Regression Coverage:** The focused Playwright regressions in request-parameter and response-property suites cover the previously missing manual-toggle path: start from tree, abandon the child form by toggling back to tree, return to form view, then start a normal header action and confirm cancel/save stays in form view. Existing custom API tree-edit coverage remains sufficient because the Tree/Form switch is only rendered in `mode === 'read'`, so that specific manual-toggle leak path is not reachable while the parent edit form is active.
**Scope Reviewed:**
- `src/components/customApiDetails/CustomApiDetails.tsx`
- `src/components/customApiDetails/CustomApiTreeView.tsx`
- `src/components/requestParameterDetails/RequestParameterDetails.tsx`
- `src/components/responsePropertyDetails/ResponsePropertyDetails.tsx`
- `tests/e2e/specs/request-parameter.spec.ts` + `response-property.spec.ts` (new regressions)
- `tests/e2e/specs/custom-api.spec.ts`
**Validation Performed:**
- ✅ `npm run build` passed
- ✅ Focused Playwright tree-return regressions (`request-parameter.spec.ts` + `response-property.spec.ts`) passed
- ✅ Existing custom API tree-edit return test passed
- ⚠️ Unrelated baseline e2e failures remain in `tests/e2e/specs/custom-api.spec.ts`
**Decision:** ✅ **APPROVED FOR MERGE** — Kane resolved the rejected flag-lifecycle gap without introducing new material issues in reviewed flows. Tree-origin return intent is now properly transient, scoped per action, not durable state.
