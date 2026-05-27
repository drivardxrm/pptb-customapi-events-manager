### 2026-05-27: Catalog Assignment Custom API Picker Must Ignore Selected Solution
**By:** Dallas (Frontend Dev)  
**What:** Updated `src/components/BusinessEventDetails/CatalogAssignmentModal.tsx` so create-mode Custom API options come from `useAllCustomApis()` instead of the solution-scoped `useCustomApis()` query.  
**Why:** In this modal, selected solution context determines where the new catalog assignment record is added, not which Custom APIs are eligible to be assigned. Filtering the source picker by the active solution incorrectly hid valid Custom APIs and broke expected assignment UX.  
**Decision:** Keep the responsibilities split:
- **Source picker scope:** full assignable Custom API collection (current implementation still keeps the existing unmanaged-only filter)
- **Destination scope:** selected unmanaged solution still controls where the created assignment is added
**Implementation Notes:**
- Replaced `useCustomApis()` with `useAllCustomApis()`
- Updated both the picker items and the selected-object name lookup to use the full collection
- Memoized picker items to keep `GenericTagPicker` input stable
**Validation:**
- ✅ Baseline `npm run build` passed before the change
- ✅ Post-change `npm run build` passed
- ✅ Ripley code review found no material issues
