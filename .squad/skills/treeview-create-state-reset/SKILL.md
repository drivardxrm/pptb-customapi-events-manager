---
name: "treeview-create-state-reset"
description: "Reset persisted UI state when a tree view launches a create form that remounts detail panels"
domain: "frontend-ui"
confidence: "high"
source: "earned"
---

## Context
Use this skill when a compact/tree view hides a detail panel and launches a create flow by remounting the panel. In this app, the panel unmounts, but Zustand selection state and TanStack Query cache data survive the remount.

## Patterns

### Clear Shared Selection Before Handoff
If a tree-view action opens a create flow in another panel, clear any shared selection in the parent/store before toggling views. Do not rely on the remounted child to clean up persisted selection after it mounts.

### Treat Query Results as Immutable at the Boundary
If a child list component sorts or transforms query-backed arrays in render, pass it a cloned array from the parent so React Query cache data is never mutated in place.

### Reset Dialog-Local Defaults on Close
Optional create dialogs should reset local picker/selection state when `open` becomes false. Otherwise consecutive create attempts can reuse stale dialog state even after the form panel remounts.

### Re-Enter Create Mode from a Clean Local State
If a detail panel can re-enter create mode without a full page reload, reset transient create-only UI state such as validation banners and confirmation-dialog visibility before seeding new create data.

### Make Store Setters Idempotent
When remount-heavy flows call store setters from effects, make the setter return the existing state for no-op updates. This prevents unnecessary subscriber churn during create/read mode transitions.

## Examples

```tsx
const handleCreateResponsePropertyFromTree = useCallback(() => {
  setSelectedResponsePropertyId(null);
  setShowTreeView(false);
  setResponsePropertyCreateTrigger((current) => current + 1);
}, [setSelectedResponsePropertyId]);
```

```tsx
const responsePropertiesForList = useMemo(
  () => responseProperties.slice(),
  [responseProperties]
);
```

```tsx
useEffect(() => {
  if (open && !wasOpenRef.current) {
    setSelectedSolutionForCreate(defaultSolutionId);
  } else if (!open && wasOpenRef.current) {
    setSelectedSolutionForCreate(null);
  }

  wasOpenRef.current = open;
}, [open, defaultSolutionId]);
```

```tsx
const handleCreate = () => {
  setSelectedResponsePropertyId(null);
  setShowCreateConfirmation(false);
  setCreateValidation({ isValid: true });
  setCreateData(getResponsePropertyCreateTemplate(selectedCustomApiId!));
  setMode('create');
};
```

## Anti-Patterns
- Assuming a remounted child panel automatically resets Zustand or TanStack Query state
- Passing query-owned arrays directly into children that call `.sort()` in render
- Leaving dialog-local picker state intact after the dialog closes
- Re-entering create mode while stale validation or confirmation state is still mounted
- Writing the same store value repeatedly during create/read handoff effects
