# Lambert QA Review — Business Event Chooser Catalog Resolution

## Request
In the **Choose Business Event** modal, when a Custom API is assigned to multiple catalogs, all visible choices should show the correct catalog hierarchy. The reported behavior shows 3 assignments, but only 1 resolves a real root/category path while 2 fall back to **Unknown Catalog**.

## Expected Behavior
1. **Chooser consistency**
   - Every visible assignment row resolves its Business Event/catalog context correctly.
   - The button count matches the number of assignments the chooser can meaningfully display and open.
   - If solution scoping is intentional, the chooser, count, and navigation must all use that same scope.

2. **Navigation consistency**
   - Selecting any chooser row opens the correct Business Event hierarchy.
   - The destination screen can still resolve the chosen assignment back to its root catalog and highlight the assignment.

3. **Cross-solution clarity**
   - If assignments from outside the selected solution are allowed in the chooser, their catalog metadata must also be available for label resolution and handoff.
   - If they are not allowed, they should be filtered out before count, rendering, and click handling.

## Likely Missed Surface
- `useCustomApiCatalogAssignments()` currently builds the chooser rows from all matching catalog assignments but resolves category/root labels through `useCatalogs()`, which is solution-scoped.
- `BusinessEventDetails.tsx` repeats the same category → root lookup when consuming `pendingBusinessEventAssignmentId`.
- If Dallas only patches the modal text/rendering, the destination handoff can still fail for those unresolved assignments because the underlying path resolution remains inconsistent.

## Regression Checks
- Multi-assignment chooser: all visible rows show the correct root → category path.
- Button count equals the number of rows that can actually be opened.
- Clicking each row selects the correct root catalog and assignment in Business Events.
- Single-assignment direct-open still works when the assignment's catalog is outside the currently selected solution scope.
- Unknown/fallback labels appear only for genuinely missing data, not for scope mismatches.
- Sorting/order remains stable once path labels are fully resolved.

## Relevant Files
- `src/components/generic/CustomApiBusinessEventButton.tsx`
- `src/hooks/useCatalogAssignments.tsx`
- `src/hooks/useCatalogs.tsx`
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx`
