---
name: "cross-nav-path-resolution-parity"
description: "Keep chooser labels, counts, and destination handoff on the same data scope when navigating to nested records"
domain: "frontend-ui"
confidence: "high"
source: "earned"
---

## Context
Use this when a source screen opens a chooser dialog for nested targets (for example assignment → category → root) and the destination screen must rebuild the same hierarchy after navigation.

## Pattern

### Resolve Display And Handoff From The Same Collection Scope
If the chooser shows targets from a global assignment list, the catalog/entity lookup used for labels must come from a collection that can resolve those same targets. If the feature is intentionally solution-scoped, filter the assignments/count first so the chooser never renders unresolved rows.

### Prefer Authoritative Lookup Data For Hierarchy Reconstruction
When the browsing UI is solution-scoped but the chooser rows are sourced globally, resolve labels from an authoritative unfiltered lookup collection (`useAllCatalogs()` in this repo) and reconstruct the path from ids instead of trusting the filtered tree state.

### Keep Count, Labels, And Click Targets In Sync
Do not let the action button count items from one scope while the row metadata comes from another. A row should only be offered if the app can both describe it and open it.

### Audit The Destination Replay Path Too
When navigation relies on a pending id, inspect the destination effect that reconstructs the hierarchy. Fixing only the chooser rendering is incomplete if the destination still derives parent/root context from a narrower dataset.

### Treat Fallback Labels As A Last Resort
`Unknown Catalog` is acceptable only for genuinely missing records, not for avoidable scope mismatches between queries.

## Example in this repo
- `src/hooks/useCatalogAssignments.tsx`
  - `useCustomApiCatalogAssignments()` filters assignments globally, resolves category/root labels through `useAllCatalogs()`, and walks `_parentcatalogid_value` to the top ancestor.
- `src/components/generic/CustomApiBusinessEventButton.tsx`
  - Uses those resolved labels in the **Choose Business Event** modal and to seed the root catalog selection before nav.
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx`
  - Repeats the category → root lookup when consuming `pendingBusinessEventAssignmentId`.

## Anti-Patterns
- Patching only the modal markup so labels look better while click-through navigation still relies on unresolved metadata
- Showing a chooser row for an assignment the destination cannot reopen
- Counting cross-scope assignments in the button label while hiding their real hierarchy behind fallback text
