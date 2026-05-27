---
name: "cross-nav-selection-handoff"
description: "Carry a pending entity selection across navigation, then replay it safely in the destination screen after data loads"
domain: "frontend-ui"
confidence: "high"
source: "earned"
---

## Context
Use this when one feature needs to open another feature and preselect a nested item that only exists in the destination screen's local state.

## Pattern

### Store A Short-Lived Pending Selection In Shared State
Persist only the minimal identifier needed to rebuild the destination selection (for example an assignment id), not the full local UI object.

### Set Destination Context Before Navigation
If the destination also depends on a broader parent selection, set that parent id first (for example a root catalog id), then navigate to the destination view.

### Mirror Any User-Controlled Filter Needed By The Button
If the cross-nav button should preserve selector context like All/Unmanaged/Managed, mirror the currently visible filter into shared state while the source screen is active. Keep this mirrored value separate from the transient pending handoff so normal nav-menu entry can still fall back to settings defaults.

### Carry Transient Filter Overrides Separately
When button navigation must preserve selector context in the destination, store a short-lived override keyed to the destination selector. Apply it only on the matching destination screen, then clear it immediately after consumption.

### Replay Only After Required Data Loads
In the destination component, wait until the datasets needed to resolve the pending id are loaded. Then:
1. resolve the pending record
2. derive any parent selection needed by the destination
3. update local selection state
4. clear the pending id

If the destination selector also hydrates from async settings, treat the consumed override like a manual user change so late settings hydration does not overwrite the transferred filter state.

### Clear Abandoned Handoffs
If the user leaves the destination before the replay completes, clear the pending id so stale navigation intent does not fire later.

## Example

```tsx
setPendingBusinessEventAssignmentId(target.assignment.catalogassignmentid);
setPendingManagedFilterHandoff({ target: 'businessevent', value: currentCustomApiSelectionInit });
setSelectedCatalogId(target.rootCatalog?.catalogid || null);
setSelectedNavItem('businessevent');
```

```tsx
useEffect(() => {
  if (selectedNavItem !== 'businessevent' || !pendingBusinessEventAssignmentId) {
    return;
  }

  if (isFetchingCatalogs || isFetchingAssignments) {
    return;
  }

  const assignment = catalogAssignments.find(
    item => item.catalogassignmentid === pendingBusinessEventAssignmentId
  );
  const category = catalogs.find(item => item.catalogid === assignment?._catalogid_value);

  if (!assignment || !category) {
    return;
  }

  const rootCatalogId = category._parentcatalogid_value || category.catalogid;

  if (selectedCatalogId !== rootCatalogId) {
    setSelectedCatalogId(rootCatalogId);
    return;
  }

  setSelectedTreeItem({ type: 'assignment', item: assignment });
  setPendingBusinessEventAssignmentId(null);
}, [catalogAssignments, catalogs, isFetchingAssignments, isFetchingCatalogs, pendingBusinessEventAssignmentId, selectedCatalogId, selectedNavItem]);
```

```tsx
useEffect(() => {
  if (!pendingManagedFilterHandoff || pendingManagedFilterHandoff.target !== 'customapi') {
    return;
  }

  if (selectedNavItem !== 'customapi' && selectedNavItem !== 'customapitester') {
    return;
  }

  customApiFilterWasChangedRef.current = true;
  setShowCustomApis(pendingManagedFilterHandoff.value);
  setPendingManagedFilterHandoff(null);
}, [pendingManagedFilterHandoff, selectedNavItem, setPendingManagedFilterHandoff]);
```

## Anti-Patterns
- Storing whole destination view-model objects in shared state
- Replaying the pending selection before supporting query data is loaded
- Falling back to a child id when the destination actually requires a parent/root id
- Leaving pending handoff state uncleared when the user navigates elsewhere
