# Lambert QA Review — Catalog Assignment Custom API Picker Scope

## Request
When creating a catalog assignment of type **Custom API**, selecting a solution must **not** filter the available Custom APIs in the object picker. The solution picker should only decide which solution receives the new assignment record.

## Expected Behavior
1. **Object picker scope**
   - Custom API candidates stay global regardless of selected solution.
   - If unmanaged-only is the intended business rule, that rule stays intact.
   - Selected solution does not hide assignable Custom APIs that live outside that solution.

2. **Solution picker scope**
   - The selected unmanaged solution still controls where the new assignment is added.
   - Clearing the solution still falls back to default-solution create behavior.

3. **Selection flow**
   - Picking an API outside the selected solution still hydrates the assignment name correctly.
   - The chosen API remains selected if the solution picker changes and the API is still valid.

## Likely Missed Surface
- `CatalogAssignmentModal.tsx` currently uses the solution-scoped `customapis` array not only for rendering picker options, but also inside `handleObjectSelect()` to derive the selected API display/name.
- If Dallas only swaps the rendered list to a global collection and leaves selection lookup on the filtered array, choosing an out-of-solution API can fail to auto-fill the assignment name or produce stale selection behavior.

## Regression Checks
- No solution selected: full expected Custom API set appears.
- Solution selected: same Custom API set still appears.
- Select API outside selected solution: name auto-fills and save succeeds.
- Change selected solution after choosing API: object selection remains stable.
- Duplicate assignment guard still blocks the same catalog + object + type combination.
- Entity and workflow pickers are unchanged.
- Edit mode is unchanged.

## Relevant Files
- `src/components/BusinessEventDetails/CatalogAssignmentModal.tsx`
- `src/hooks/useCustomApis.tsx`
- `src/hooks/useCatalogAssignments.tsx`
- `src/models/CustomApi.ts`
