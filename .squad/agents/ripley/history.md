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

**Recent Approvals (2026-05-24 to 2026-05-29):**
- Tree-view Edit actions for request/response parameters (two-phase handoff validated; no React #185 regressions)
- Response-property hardening for React #185 regression (stale-selection cleanup, picker memoization, idempotent setters)
- Tree-return flow implementation (rejected v1 for flag-lifecycle leak; v2 approved after Kane's fix; manual-toggle regressions added)
- Business Event selector filter expand/collapse behavior (implementation approved, regression validation in progress)
- Selector init settings (feature approved; AppSettings-driven initialization; 80+ regression checkpoints documented)
- About section removal (full end-to-end removal approved; stale nav fallback handled)

## Session Updates (2026-05-29)

**Orchestration Log:** 2026-05-25T23-40-24Z  
**Scope:** About section removal sprint  
**Team Status:**
- Dallas: About removal + selector init settings implementation complete
- Lambert: Regression checklists (About 12 tests + Selector init 80+ checkpoints) ready for QA
- Decisions: 4 inbox items merged to decisions.md; all tests and no material regressions reported
