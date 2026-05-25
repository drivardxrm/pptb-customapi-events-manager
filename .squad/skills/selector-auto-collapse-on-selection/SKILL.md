---
name: "selector-auto-collapse-on-selection"
description: "Auto-collapse filter panels when a parent selector item is selected"
domain: "frontend-ui"
confidence: "high"
source: "custom-api-selector-feature"
---

## Context
When a filter panel contains both a picker (for selection) and multiple filter controls (for refinement), the panel can consume significant vertical space. Auto-collapse on selection improves UX by freeing space for downstream details cards.

This pattern applies to CustomApiSelector and similar selector cards that transition from filter/browsing mode to details-viewing mode upon selection.

## Patterns

### Selection Triggers Collapse
Use a `useEffect` hook to monitor the selected item state from the parent Zustand store. When selection changes from null to non-null, automatically collapse the filter panel.

```tsx
// CustomApiSelector.tsx
const { selectedCustomApiId } = useAppStore()
const [filtersExpanded, setFiltersExpanded] = useState(true)

useEffect(() => {
  // Auto-collapse when selection made
  if (selectedCustomApiId) {
    setFiltersExpanded(false)
  }
}, [selectedCustomApiId])
```

### Manual Override Preserved
Even after auto-collapse, the user can manually re-expand the filters via the existing toggle button. The auto-collapse should NOT prevent manual interaction—it should be a default convenience, not a lock.

### Filter State Changes Do NOT Re-Collapse
When the filter panel is already collapsed and a user later modifies a filter (e.g., toggles PowerFx), the panel should remain collapsed. Only the filter summary badges update to reflect the change.

```tsx
// ANTI-PATTERN: Re-collapsing on every filter change
useEffect(() => {
  if (selectedCustomApiId) {
    setFiltersExpanded(false)  // DON'T do this for every filter toggle
  }
}, [selectedCustomApiId, showPowerFxOnly])  // DON'T add filter state here

// CORRECT: Only react to selection changes
useEffect(() => {
  if (selectedCustomApiId) {
    setFiltersExpanded(false)  // Collapse only on selection
  }
}, [selectedCustomApiId])  // Dependency array is JUST selectedCustomApiId
```

### Clear Selection Behavior
When a user clears their selection (removes the tag), the collapse state should be deterministic:
- **Option A (Recommended):** Keep filters in their current state (collapsed or expanded). User's manual preference is preserved.
- **Option B (Alternative):** Auto-expand to help user re-browse. Useful if you want to encourage new searches.

Choose Option A to preserve user intent; choose Option B to encourage continued filtering.

```tsx
// Option A: Preserve state (no special handling needed)
useEffect(() => {
  if (selectedCustomApiId) {
    setFiltersExpanded(false)
  }
  // No 'else' clause — when selectedCustomApiId becomes null, state stays unchanged
}, [selectedCustomApiId])

// Option B: Auto-expand on clear
useEffect(() => {
  if (selectedCustomApiId) {
    setFiltersExpanded(false)
  } else {
    setFiltersExpanded(true)
  }
}, [selectedCustomApiId])
```

### Filter Summary Integration
Pair auto-collapse with the **collapsed-filter-summary-parity** skill:
- When collapsed with active filters, show badge summary (Solution, PowerFx, Business Event, etc.)
- Filter summary communicates active filtering context without needing expanded UI

## Examples

### CustomApiSelector (Recommended)
```tsx
export const CustomApiSelector: React.FC = () => {
  const { selectedCustomApiId } = useAppStore()
  const [filtersExpanded, setFiltersExpanded] = useState(true)

  // Auto-collapse when API selected
  useEffect(() => {
    if (selectedCustomApiId) {
      setFiltersExpanded(false)
    }
  }, [selectedCustomApiId])

  return (
    <Card>
      <div>
        {/* Left: Custom API Picker */}
        <CustomApiPicker />
        
        {/* Right: Collapsible Filters */}
        <Button onClick={() => setFiltersExpanded(!filtersExpanded)}>
          Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
        </Button>
        
        {!filtersExpanded && filterSummary.length > 0 && (
          <div>{filterSummary}</div>
        )}
        
        {filtersExpanded && (
          <div>
            {/* Full filter controls */}
          </div>
        )}
      </div>
    </Card>
  )
}
```

## Anti-Patterns

**❌ Coupling filter changes to collapse state**
```tsx
useEffect(() => {
  // DON'T: This re-collapses every time a filter changes
  if (selectedCustomApiId) {
    setFiltersExpanded(false)
  }
}, [selectedCustomApiId, showPowerFxOnly, showManagedOnly])  // Too many dependencies!
```

**❌ Forcing collapse state to never change**
```tsx
// DON'T: Disable manual toggle
<Button disabled>{/* Toggle disabled */}</Button>
```

**❌ Clearing selection to auto-expand without user consent**
```tsx
// DON'T: Unexpected UI thrashing on clear
useEffect(() => {
  if (!selectedCustomApiId) {
    setFiltersExpanded(true)  // Surprise expand violates user expectation
  }
}, [selectedCustomApiId])
```

## Testing

### E2E Regression Tests
1. **Selection triggers collapse:** Select API → verify `filtersExpanded = false`
2. **Filter summary displays:** Select API with active filters → verify badges shown
3. **Manual override works:** Select API (collapsed) → click Filters → verify `filtersExpanded = true`
4. **Filter changes preserve collapse:** Select API, collapse, toggle filter → verify stays collapsed, summary updates
5. **Clear selection state preserved:** Select API, collapse, clear selection → verify collapse state unchanged (or auto-expand per design decision)

### Regression Against Auto-Collapse
- ✅ Component still mounts/renders without auto-collapse logic (graceful fallback)
- ✅ Manual toggle always works
- ✅ Filter selection still updates correctly
- ✅ Selection logging still occurs

## Files
- `src/components/CustomApiSelector.tsx` — Implementation example
- `tests/e2e/specs/custom-api.spec.ts` — Test suite for collapse behavior
