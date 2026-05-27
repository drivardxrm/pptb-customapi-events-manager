---
name: "treeview-edit-handoff"
description: "Hand off a tree item Edit action into a remounted form/details panel without losing selection or edit mode"
domain: "frontend-ui"
confidence: "high"
source: "earned"
---

## Context
Use this pattern when a compact/tree view and a form/details view are mutually exclusive. Clicking Edit in the tree should leave the tree, remount the form panel, select the right record, and open edit mode reliably.

## Patterns

### Store Pending Edit Intent In The Parent
Keep a parent-owned `edit<Request>Id` / `edit<Response>Id` state instead of trying to open edit mode directly inside the tree row action. The parent should set the pending id, clear any conflicting sibling selection, and switch back to form view.

### Complete Edit Entry In Two Stages
In the remounted detail panel:
1. First effect: push the requested id into shared selection state if needed.
2. Second effect: once the selected record matches that id, seed edited data, switch mode to `edit`, and mark the request handled.

This avoids assuming the selected entity is already present on the first render after remount.

### Mark Requests As Handled
Use a ref like `lastHandledEditRequestId` plus a parent callback that resets the pending id to `null`. That keeps the handoff idempotent across effect re-runs.

### Keep List Selection Sync Idempotent
If the details panel mounts a list/grid that mirrors shared selection, make its local selection updates return the previous `Set` for no-op selections. This reduces remount churn while the tree-to-form handoff settles.

### Gate Edit By Actual Editability
Do not rely on the tree button visibility alone. If an item is non-editable (for example managed, immutable-by-product-rule, or otherwise restricted), hide the Edit action **and** make the parent edit handler no-op when that state is reached. This prevents alternate callback paths from bypassing the visual guard.

## Example

```tsx
const handleEditRequestParameterFromTree = useCallback((requestParameterId: string) => {
  setSelectedResponsePropertyId(null);
  setRequestParameterEditId(requestParameterId);
  setShowTreeView(false);
}, [setSelectedResponsePropertyId]);
```

```tsx
useEffect(() => {
  if (!editRequestParameterId || selectedRequestParameterId === editRequestParameterId) {
    return;
  }

  setSelectedRequestParameterId(editRequestParameterId);
}, [editRequestParameterId, selectedRequestParameterId, setSelectedRequestParameterId]);

useEffect(() => {
  if (selectedRequestParameter?.customapirequestparameterid !== editRequestParameterId) {
    return;
  }

  lastHandledEditRequestId.current = editRequestParameterId;
  setEditedData(selectedRequestParameter);
  setMode('edit');
  setEditingComponent('requestparameter');
  onEditRequestHandled?.();
}, [editRequestParameterId, selectedRequestParameter, setEditingComponent, onEditRequestHandled]);
```

## Anti-Patterns
- Calling `setMode('edit')` from the tree row before the form/details panel exists
- Assuming persisted store selection alone is enough to reopen the correct editor after a remount
- Leaving pending edit ids uncleared after the details panel handles them
- Letting list/grid selection effects repeatedly write equivalent selection state during the handoff
- Hiding a tree Edit button for restricted records but leaving the parent `onEdit` / `handleEdit` path callable
