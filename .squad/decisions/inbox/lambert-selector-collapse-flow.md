---
title: "Custom API Selector Filter Collapse Flow — Regression Checklist"
date: 2026-02-28
author: Lambert
status: "Ready for Implementation"
reviewer_needed: "Dallas (Implementation) + Ripley (QA Review)"
---

# Custom API Selector Filter Collapse Flow

## Feature Requirement
"When a custom API is selected in the custom API selector, the filter section should collapse to allow more real estate"

## Trace Analysis

### Current State (CustomApiSelector.tsx)
- `filtersExpanded` local state initialized to `true` (line 30)
- Manual toggle button works: `onClick={() => setFiltersExpanded(!filtersExpanded)}` (line 165)
- **Missing:** Auto-collapse logic triggered by `selectedCustomApiId` change
- Global store contains `selectedCustomApiId` (useAppStore line 39)
- Selection callback updates store and logs event (lines 144-149)

### Expected Selection-to-Collapse Flow
```
1. User selects Custom API
   → setSelectedCustomApiId(id) fired
   → Trigger auto-collapse (implement: useEffect watching selectedCustomApiId)
   
2. Filter panel collapses
   → setFiltersExpanded(false)
   → Details card gains vertical space
   
3. Filter summary displays (if filters active)
   → Existing badge rendering logic (lines 58-101)
   → Shows Solution, PowerFx, Business Event, Managed state selections
   
4. User can override
   → Click Filters button to manually expand (existing toggle)
   → filtersExpanded = true overrides auto-collapse
```

### Integration Points
- **Store:** `selectedCustomApiId` from useAppStore (line 24)
- **UI State:** `filtersExpanded` local component state (line 30)
- **Dependencies:** Add `selectedCustomApiId` to useEffect if implemented
- **Logging:** Existing `addLog()` calls will track selection events

## Regression Checklist (16 Test Cases)

### Critical Priority (1 case) — **Must implement**
| ID | Test | Precondition | Action | Expected Result | Acceptance |
|----|------|--------------|--------|-----------------|-----------|
| RC-1.1 | Selecting Custom API auto-collapses filter section | Page loaded, filters expanded, API list available | Click Custom API in picker to select it | Filter section collapses automatically, Details card gains space | `filtersExpanded` becomes `false`, filter panel hidden, filter summary shows if `activeFilterCount > 0` |

### High Priority (6 cases) — **Implement + test**
| ID | Test | Precondition | Action | Expected Result | Acceptance |
|----|------|--------------|--------|-----------------|-----------|
| RC-1.2 | Filter summary displays when collapsed after selection | Page loaded, API selected, filters auto-collapsed | Observe filter panel in collapsed state | If any active filters (Solution, PowerFx, etc.), show badge summary | At least one badge visible if `activeFilterCount > 0`, matches collapsed-filter-summary-parity skill |
| RC-1.3 | User can manually expand filters after auto-collapse | Page loaded, API selected, filters auto-collapsed | Click Filters button to expand | Filter section expands showing all controls | All filter controls visible, `filtersExpanded = true`, override auto-collapse |
| RC-3.1 | Changing Custom API selection keeps filters collapsed | Page loaded, API A selected, filters auto-collapsed | Select different API B from picker | Filters remain collapsed, Details shows API B info | `filtersExpanded` stays `false`, no unexpected expand |
| RC-5.1 | Filter changes while API selected preserve collapse state | Page loaded, API selected, filters auto-collapsed | Toggle PowerFx filter on/off | API list re-filters, filters stay collapsed, Summary updates | `filtersExpanded = false`, filter summary badges update, Details card visible |
| RC-5.2 | Solution selection while API selected preserves collapse | Page loaded, API selected, filters auto-collapsed | Select a Solution in filter | API list filters by solution, filters stay collapsed | `filtersExpanded = false`, filtered list shown |

### Medium Priority (7 cases) — **Validate behavior, test coverage**
| ID | Test | Precondition | Action | Expected Result | Acceptance |
|----|------|--------------|--------|-----------------|-----------|
| RC-2.1 | Clearing selection restores previous filter state | Page loaded, API selected, filters auto-collapsed | Clear selection via tag remove | Filters state returns to user's manual preference (spec TBD) | If manually collapsed before selection: stay collapsed. Else: TBD |
| RC-2.2 | Clearing selection returns to initial state | Page loaded, API selected (filters auto-collapsed) | Programmatically clear selection | Filters return to initial expanded state OR stay collapsed (designer intent) | Behavior must be deterministic |
| RC-4.1 | PowerFx toggle (no API selected) does not collapse | Page loaded, filters expanded, no API selected | Click PowerFx toggle button | API list updates, filters remain expanded | `filtersExpanded = true`, picker still visible |
| RC-4.2 | Solution selection (no API selected) does not collapse | Page loaded, filters expanded, no API selected | Select a Solution | API list filters, filters stay expanded | `filtersExpanded = true`, filtered list shown |
| RC-4.3 | Managed toggle (no API selected) does not collapse | Page loaded, filters expanded, no API selected | Click Managed/Unmanaged toggle | Filter applies, API list updates, filters stay expanded | `filtersExpanded = true`, filter badge count updates |
| RC-5.3 | Manual expand, filter change, select API: collapse on selection | Page loaded, filters auto-collapsed by prior selection | Manually expand, toggle PowerFx, select new API | New API triggers auto-collapse, PowerFx badge shows in summary | `filtersExpanded = false` after selection, PowerFx badge visible |
| RC-6.1 | Editing lock does not prevent collapse | Page loaded, Editing Lock active (`editingComponent != 'none'`) | Select Custom API | Filters auto-collapse (lock affects styling but not collapse) | Editing lock doesn't override auto-collapse logic |

### Low Priority (2 cases) — **Edge cases & stress**
| ID | Test | Precondition | Action | Expected Result | Acceptance |
|----|------|--------------|--------|-----------------|-----------|
| RC-3.2 | Selection changes produce correct logs | Page loaded, API A selected | Select API B | Console logs show: "Custom API selected: [GUID B]" | Log message reflects new API ID |
| RC-6.2 | Empty list remains stable | Page loaded, no APIs available | Filters expanded, try filter operations | UI stable, empty state message shown | "No Custom APIs match filters" visible |

## Design Decisions to Clarify

### 1. Clear Selection Behavior
**Question:** Should filters auto-expand when user clears/removes selection?  
**Options:**
- A: Always expand (restore natural read state)
- B: Keep collapsed (user intent preserved)
- C: Remember prior state (track manual collapse separately)

**Current Recommended:** Option B (keep collapsed) — user's manual toggle choice is preserved  
**Rationale:** Matches CatalogSelector pattern; avoids surprise expand on clear

### 2. Filter Change During Collapse
**Question:** If user toggles filter (e.g., PowerFx) while API selected & filters collapsed, should filters expand?  
**Options:**
- A: Auto-expand (show filter changed)
- B: Stay collapsed (filter summary badges update)

**Current Recommended:** Option B (stay collapsed)  
**Rationale:** User chose to collapse; filter summary badges communicate active filters; avoids UI thrashing

### 3. Managed State Toggle During Selection
**Question:** Does toggling Managed/Unmanaged while API selected trigger expand?  
**Options:**
- A: Auto-expand (show filter changed)
- B: Stay collapsed

**Current Recommended:** Option B (stay collapsed)  
**Rationale:** Consistent with filter-change behavior; not collapse-triggering

## Implementation Guidance

### Required Changes
1. **Add useEffect to monitor `selectedCustomApiId`**
   - Dependency array: `[selectedCustomApiId]`
   - When `selectedCustomApiId` changes from null to non-null: call `setFiltersExpanded(false)`
   - When `selectedCustomApiId` changes from non-null to null: (design decision — TBD auto-expand or keep state)

2. **Location:** Lines 140-160 in CustomApiSelector.tsx (after `setSelectedCustomApiId()` or in separate effect)

3. **Guard condition:** Only auto-collapse if selection changed to non-null; preserve manual toggle state

### No Changes Needed
- Filter summary logic (already works)
- Manual toggle button (already works)
- Store integration (already works)
- Logging (already works)

## Files to Test (E2E)
- `tests/e2e/specs/custom-api.spec.ts` — Add new test suite "Custom API Selector Collapse"
- `tests/e2e/pages/app.page.ts` — Add helpers: `getFilterSection()`, `assertFiltersCollapsed()`, `assertFiltersExpanded()`

## Known Patterns
- **collapsed-filter-summary-parity** skill documents filter badge alignment
- **CatalogSelector** shows working manual collapse pattern (can reference)
- **Zustand store** integration already established in CustomApiSelector

## Approval Checklist
- [ ] Dallas: Implement useEffect for auto-collapse
- [ ] Lambert: Create & execute regression tests
- [ ] Ripley: Code review & test validation
- [ ] PR merge: Feature complete

---

**Status:** Ready for Dallas to begin implementation. Regression checklist can be used to validate manually or expanded into E2E test suite.
