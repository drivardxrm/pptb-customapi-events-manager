---
name: "generic-tag-picker-stability"
description: "Keep GenericTagPicker state stable when query-backed item lists re-render"
domain: "frontend-ui"
confidence: "high"
source: "earned"
---

## Context
Use this skill when a Fluent UI tag picker is fed from TanStack Query data or any other array that may be rebuilt during renders. It applies especially to create/edit forms where picker state can outlive one render but the option list may change shape or identity.

## Patterns

### Memoize Picker Items
Build picker `items` with `useMemo` before passing them to `GenericTagPicker`. Inline `map(...).sort(...)` expressions create a fresh array every render and can retrigger selection-reset effects.

### Make Stale-Selection Clears Idempotent
When a picker clears a selection because the option disappeared, guard that clear with a ref so the parent callback only fires once for the same stale value. This avoids React max-depth loops when the parent update immediately rebuilds the picker props.

### Use Stable Callback Dispatch
If a parent passes inline callbacks, store the callback in a ref before invoking it from picker effects or handlers. This lets the picker react to state changes without coupling effect execution to callback identity churn.

### Preserve Selection Through Loading Gaps
When a remount temporarily empties the option list, do not immediately clear the picker. Treat `items.length === 0` as a loading/remount gap and only clear once options are present and the selected id is still missing.

## Examples

```tsx
const entityItems = useMemo(
  () => entities
    .map(entity => ({ id: entity.entityid, displayText: entity.logicalname ?? '', image: null }))
    .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || '')),
  [entities]
)

<GenericTagPicker items={entityItems} onSelect={handleSelect} />
```

```tsx
if (lastClearedSelectionRef.current !== selectedOption) {
  lastClearedSelectionRef.current = selectedOption
  setSelectedOption(undefined)
  onSelectRef.current?.(null, undefined)
}
```

```tsx
if (items.length === 0 || itemsById.has(selectedOption)) {
  lastClearedSelectionRef.current = null
  return
}
```

## Anti-Patterns
- Passing `items={query.data.map(...).sort(...)}` directly into `GenericTagPicker`
- Clearing stale selections on every render without remembering the last cleared value
- Clearing the current selection just because a remount temporarily produced an empty option list
- Calling parent callbacks from picker effects using unstable inline references
