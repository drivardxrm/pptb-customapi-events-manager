### 2026-05-27: Business Event Chooser Must Resolve Catalog Paths From Unfiltered Catalog Data
**By:** Dallas (Frontend Dev)  
**What:** Updated `src/hooks/useCatalogAssignments.tsx` so `useCustomApiCatalogAssignments()` resolves chooser path metadata from `useAllCatalogs()` and walks parent catalog links to the true root.  
**Why:** The chooser builds rows from the global catalog-assignment list. Using the solution-scoped catalog query for label resolution caused valid assignments to render as `Unknown Catalog` whenever the selected solution hid a referenced parent/category record.  
**Decision:** Keep responsibilities split:
- **Chooser assignment scope:** global assignment rows remain unchanged
- **Catalog path resolution scope:** use the authoritative unfiltered catalog collection for root/category lookup
- **UI consumer scope:** `CustomApiBusinessEventButton.tsx` continues rendering and navigating from hook-provided path data without modal-specific hardcoding
**Implementation Notes:**
- Replaced `useCatalogs()` with `useAllCatalogs()` inside `useCustomApiCatalogAssignments()`
- Added a memoized `Map` lookup by `catalogid`
- Walked `_parentcatalogid_value` upward with a visited-set guard to resolve the top ancestor safely
**Validation:**
- ✅ Baseline `npm run build` passed before the change
- ✅ Post-change `npm run build` passed
- ✅ Ripley code review found no material issues
