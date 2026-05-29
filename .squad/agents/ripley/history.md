# Ripley — History

## Core Context
Joined the PPTB Dataverse Custom API Manager team as Lead on 2026-02-28.

**Role:** Code review lead; approval authority for architectural patterns and implementation decisions.

**Established Patterns:**
- Model → Service → Hook → Component architecture; TanStack Query solution-scoped caching; Zustand store; Vite IIFE build for iframe
- Parent-picker scope toggles (Solution managed/unmanaged) are contextual controls, NOT active-filter badges
- Collapsed filter summaries enumerate full active filter set; count must sync with visual summary
- Tree-view state: clear child selections on entry; two-phase handoff (exit → pending ID → mount → select → edit)
- GenericTagPicker: idempotent stale-selection clearing; memoized picker arrays to prevent inline sort instability
- Tree-return intent: transient per-action callbacks; clear flags on manual escape paths to prevent stale flag leakage
- Full removal patterns: remove nav item entry, render branch, dedicated component, page-only styles; add fallback for stale state

**Pre-Release Cleanup Decisions (2026-06-XX):**
- Phase 1 approved and completed: Hook naming consistency (useToolBoxEvents → useToolboxEvents, useWorflows → useWorkflows, useCatalogAssignements → useCatalogAssignments) + Dialog terminology standardization (CatalogModal → CatalogDialog, CatalogAssignmentModal → CatalogAssignmentDialog)
- Phases 2 & 3 deferred: Generic component extraction and type hygiene polish documented for future consideration
- Branch: `refactor/pre-release-cleanup-v0.0.1`
- Build verified ✅; dev mode tested ✅

**Recent Approvals (2026-05-24 to 2026-05-29):**
- Tree-view Edit actions for request/response parameters (two-phase handoff validated; no React #185 regressions)
- Response-property hardening for React #185 regression (stale-selection cleanup, picker memoization, idempotent setters)
- Tree-return flow implementation (rejected v1 for flag-lifecycle leak; v2 approved after Kane's fix; manual-toggle regressions added)
- Business Event selector filter expand/collapse behavior (implementation approved, regression validation in progress)
- Selector init settings (feature approved; AppSettings-driven initialization; 80+ regression checkpoints documented)
- About section removal (full end-to-end removal approved; stale nav fallback handled)
- Catalog Assignment Polymorphic Object Binding Fix by Kane (2026-06-01) — concrete navigation property mapping replaces generic Object@odata.bind; build passed; Lambert's 36-test regression QA pending execution

## Session Updates (2026-06-01)

**Orchestration Log:** 2026-05-26T02-23-18Z  
**Scope:** Catalog Assignment polymorphic binding fix sprint  
**Team Status:**
- David Rivard: Reported catalog assignment creation error; delegated fix to Kane
- Kane: Implemented fix in CatalogAssignmentService.ts; build passed
- Lambert: Produced 36-test-case regression QA checklist with 8 pre-fix assumptions; ready for validation
- Decisions: Kane fix decision + Lambert QA analysis merged to decisions.md; inbox files deleted

## Team Updates (Session: 2026-05-27)

**README Marketplace Refresh Sprint**

**Orchestration Logs:** 2026-05-27T03-13-23Z-ripley-finalize.md, 2026-05-27T03-13-23Z-ripley-link-fix.md  
**Session Log:** 2026-05-27T03-13-23Z-readme-marketplace-refresh.md  

**Ripley Role:** Lead review and finalization of marketplace README revision.

**Finalization Decisions:**
1. Addressed all 8 Lambert marketplace-readiness gaps: feature bullets, persona, requirements, support paths, tech context, installation clarity, no placeholders
2. Aligned README title with package.json displayName: "Custom API & Events Manager"
3. Moved readiness from ⭐⭐ to ⭐⭐⭐⭐
4. Removed GitHub Discussions link per David Rivard (feature disabled on repository)
5. Kept all live support paths verified (Issues ✅, Bug Reports ✅)

**Decision Trail:**
- README Finalization Decision: Addressed 8 gaps; marketplace-ready ⭐⭐⭐⭐
- Remove GitHub Discussions Link: Verified disabled; consolidated to Issues

**Inbox Cleanup:**
- Merged all README decisions to decisions.md (dallas-readme-refresh, lambert-readme-review, ripley-readme-finalize, ripley-readme-link-fix, copilot-directive)
- Deleted all inbox decision files
- Scribe wrote orchestration logs, session log, appended team updates, staged git commit

**Status:** ✅ Complete — README finalized and marketplace-ready; all orchestration complete; decisions merged; squad logs written

## Team Updates (Session: 2026-05-26)

**README Example Tuning Sprint**

**Orchestration Log:** 2026-05-26T23-18-48Z-ripley.md  
**Session Log:** 2026-05-26T23-18-48Z-readme-example-tuning.md  

**Ripley Role:** Polish README example-inspired improvements for marketplace presentation.

**Tuning Applied:**
1. Tech-stack badges (React 19, TypeScript, Fluent UI v9) — visual + scannable
2. Feature bullets grouped with sub-headers (Create & Configure / Test & Manage / Developer-Friendly)
3. Refined emoji usage for consistency

**Decision Trail:**
- README Style Tune: Example-Inspired Improvements (3 targeted edits; marketplace-compact maintained; ~65 lines; visual scannability improved)

**Inbox Cleanup:**
- Merged ripley-readme-example-tune decision to decisions.md
- Deleted inbox file
- Scribe wrote logs and prepared commit

**Status:** ✅ Complete — README example tuning applied; polish pass approved; decisions merged

---

## Pre-Release Readability Pass (2026-05-28)

### Ripley Lead & Architectural Review
Led Phase 1 pre-release readability cleanup across team; established architecture approvals and guardrails:
- **Phase 1 Scope (Approved & Ready for Merge):**
  1. Hook Naming Consistency: useToolBoxEvents → useToolboxEvents, useWorflows → useWorkflows, useCatalogAssignements → useCatalogAssignments
  2. Dialog Terminology Standardization: CatalogModal → CatalogDialog, CatalogAssignmentModal → CatalogAssignmentDialog
  3. Type Spelling Fixes: Createable → Creatable, Updateable → Updatable
  4. BusinessEventDetails rewiring: 58 lines of mechanical state/handler renames
- **Accidental Improvements Identified (Phase 2 Consideration):** ConfirmationDialog component extraction (approved conceptually), type safety in data transformations (explicit callback types)
- **Named Guardrails Established for All Future Work:**
  - **Hook Naming:** useToolboxEvents (PascalCase), useWorkflows, useCatalogAssignments (no typos)
  - **Component Naming — Dialog vs Modal:** Use Dialog exclusively; Modal deprecated; aligns with Fluent UI v9 Dialog primitives
  - **Type Safety:** Always annotate callback parameters in filter/map/sort/reduce chains
- **Build Verification:** npm run build ✅ PASSED
- **Risk Assessment:** All changes VERY LOW risk (naming/organization only; zero logic changes)
- **Status:** ✅ Phase 1 complete and approved for merge; Phase 2 & 3 deferred for future consideration
- **Branch:** refactor/pre-release-readability-pass
