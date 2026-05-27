## Business Event Empty-State Parity Review

**Author:** Lambert (Tester)  
**Date:** 2026-06-04

### Summary
Business Events should mirror the Custom API empty-selection UX pattern when the screen is in read mode and no root catalog is selected:

- show a top app message
- use exact Root Catalog wording
- provide a `New Root Catalog` action wired to the existing root-create flow

### Current State
- `src/components/customApiDetails/CustomApiDetails.tsx` already sets a non-dismissable global info message with action for the empty selection state.
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx` does not set a comparable Business Event global message today.
- Business Events currently shows only the in-card info box: `No Catalog selected / Select a Catalog above to view its hierarchy`.

### QA Guidance / Decision Request
For parity and clarity, the Business Event screen should use:

`No Root Catalog selected. Select a Root Catalog below or create a new one.`

with a `New Root Catalog` action that reuses `handleCreateRoot`.

### Likely Missed Surfaces
1. **Duplicate messaging risk:** If Dallas adds the top message but leaves the card-body info box unchanged, users may see mismatched copy (`Root Catalog` vs `Catalog`) or redundant empty-state messaging.
2. **Lifecycle cleanup:** The new message must clear on root selection, on nav away from `businessevent`, and when entering create mode to avoid stale banner carryover.
3. **Create-flow parity:** The action should open `CatalogModal` in `create-root` mode and still allow the existing `pendingBusinessEventCatalogId` auto-select behavior after save.
4. **Selector wording parity:** `CatalogSelector.tsx` still labels the picker as `Selected Catalog`; decide whether that wording remains intentional or should also move to `Root Catalog` for consistency.
