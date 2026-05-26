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

### Replay Only After Required Data Loads
In the destination component, wait until the datasets needed to resolve the pending id are loaded. Then:
1. resolve the pending record
2. derive any parent selection needed by the destination
3. update local selection state
4. clear the pending id

### Clear Abandoned Handoffs
If the user leaves the destination before the replay completes, clear the pending id so stale navigation intent does not fire later.

## Example

```tsx
setPendingBusinessEventAssignmentId(target.assignment.catalogassignmentid);
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

## Anti-Patterns
- Storing whole destination view-model objects in shared state
- Replaying the pending selection before supporting query data is loaded
- Falling back to a child id when the destination actually requires a parent/root id
- Leaving pending handoff state uncleared when the user navigates elsewhere
