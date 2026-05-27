# Full Collection Validation Pattern

## When to use
- A create form enforces uniqueness.
- The visible list can be filtered by solution, parent selection, or UI toggles.
- A filtered query could hide duplicates that still exist in Dataverse.

## Pattern
1. Separate **display collection** from **validation collection**.
2. Keep the UI bound to the filtered list the user expects.
3. Run duplicate checks against an authoritative full collection for the entity scope that owns uniqueness.
4. Add explicit helper hooks for the unfiltered/global collection when the main hook is solution-scoped (`useAllCustomApis()`, `useAllCatalogs()` in this repo).
5. Keep per-parent validations on their parent-scoped hooks; do not rename them as "all" collections when they are intentionally scoped to the selected parent.
6. In edit flows, only apply duplicate logic when the unique field is editable; otherwise regression-test read-only behavior.

## Scope examples in this repo
- **Global uniqueness:** Custom API unique name, Catalog unique name
- **Per-parent uniqueness:** Request Parameters and Response Properties under the selected Custom API
- **Composite uniqueness:** Catalog Assignment uses `(catalog, object id, object type)`

## Example in this repo
- `src/hooks/useCustomApis.tsx` and `src/hooks/useCatalogs.tsx` are solution-filtered when `selectedSolutionId` is set, so their arrays are unsafe as the sole source for global uniqueness validation.
- `src/components/customApiDetails/CustomApiDetailsCreate.tsx` and `src/components/BusinessEventDetails/CatalogModal.tsx` now validate against `useAllCustomApis()` / `useAllCatalogs()` while still rendering filtered selector state elsewhere.
- `src/hooks/useCustomApiRequestParameters.ts` and `src/hooks/useCustomApiResponseProperties.ts` are keyed by `selectedCustomApiId`, so they remain appropriate for per-Custom-API duplicate validation.
- `src/components/BusinessEventDetails/CatalogAssignmentModal.tsx` validates duplicates against the all-assignment query using catalog id + object id + object type, because assignments do not have a standalone unique name.
- `src/components/BusinessEventDetails/CatalogAssignmentModal.tsx` also sources the Custom API create-picker from `useAllCustomApis()` because the selected solution controls where the new assignment is added, not which referenced Custom APIs are eligible to be assigned.

## Why it helps
- Prevents false negatives when a selected solution hides an existing duplicate.
- Preserves expected filtered browsing UX without weakening validation.
- Makes QA scope clearer: test filter behavior separately from uniqueness behavior.

## QA checklist
- [ ] With no solution selected, duplicate is blocked.
- [ ] With a solution selected, duplicate outside that solution is still blocked.
- [ ] A unique value inside the selected solution still saves successfully.
- [ ] Edit flows keep locked unique fields read-only.
- [ ] Per-parent validations do not accidentally become global after refactor.
- [ ] Catalog Assignment blocks re-adding the same object to the same catalog, but still allows the same object in a different catalog.
