# Ripley — History

## Core Context
Joined the PPTB Dataverse Custom API Manager team as Lead on 2026-02-28.

## Learnings
- Initial team formation with Dallas (Frontend), Kane (Backend), Lambert (Tester)
- **Project Architecture (2026-02-28 to 2026-03-01):** Reviewed and approved PPTB project structure including entity service patterns, TanStack Query hooks with solution-scoped caching, Zustand state management, Vite IIFE build for iframe compatibility. Key patterns: Model → Service → Hook → Component architecture. Identified 50 backlog items across testing, Business Events completion, and UX gaps. Approved minimal README strategy; recommended Playwright for E2E testing with window-level mock injection over MSW.
- **CustomApiSelector UX Analysis (2026-03-XX):** Documented architectural pattern and identified potential improvements for future iterations. Current implementation uses GenericTagPicker with independent managed/unmanaged toggles; CatalogSelector has identical pattern for future harmonization.

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
