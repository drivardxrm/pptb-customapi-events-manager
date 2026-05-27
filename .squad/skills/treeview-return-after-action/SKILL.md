---
name: "treeview-return-after-action"
description: "Return to tree view after a tree-originated form action finishes without changing non-tree flows"
domain: "frontend-ui"
confidence: "high"
source: "earned"
---

## Context
Use this when a tree view launches a create or edit flow in a separate detail panel, and the app should return to the tree only if that action started from the tree.

## Pattern

### Keep Tree Return Intent in the Parent
Store a parent-level boolean per flow (for example request parameter, response property, custom API) that records whether the current action was launched from tree view. The component that owns `showTreeView` should also own this intent.

### Pass an Optional Completion Callback
Detail panels should receive something like `onActionFinished?: () => void`. Only supply it when the action originated from the tree; leave it undefined for ordinary form flows.

### Treat Only Save Success or Form Cancel as Completion
Call the callback after:
- successful edit save
- successful create confirmation/save
- form cancel

Do **not** call it when a confirmation dialog is merely dismissed; the user is still in the create flow.

### Reset the Intent Before Restoring Tree View
When the callback runs, clear the parent boolean first, then set `showTreeView(true)` so the next form-originated action does not inherit tree-return behavior.

## Example

```tsx
const [returnToTreeAfterRequestAction, setReturnToTreeAfterRequestAction] = useState(false);

const handleCreateRequestParameterFromTree = useCallback(() => {
  setReturnToTreeAfterRequestAction(true);
  setShowTreeView(false);
  setRequestParameterCreateTrigger((current) => current + 1);
}, []);

const handleRequestParameterTreeActionFinished = useCallback(() => {
  setReturnToTreeAfterRequestAction(false);
  setShowTreeView(true);
}, []);

<RequestParameterDetails
  onActionFinished={
    returnToTreeAfterRequestAction ? handleRequestParameterTreeActionFinished : undefined
  }
/>
```

## Anti-Patterns
- Letting child panels decide on their own whether the app should return to tree view
- Reusing the same “return to tree” flag for unrelated entity flows
- Treating create-dialog cancel as equivalent to cancelling the form
- Applying tree-return behavior to header/form actions that did not originate from the tree
