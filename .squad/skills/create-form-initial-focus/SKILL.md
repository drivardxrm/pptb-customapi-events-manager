---
name: "create-form-initial-focus"
description: "Focus the primary create-field when entering create mode, including remount and async-loading paths"
domain: "frontend-ui"
confidence: "high"
source: "earned"
---

## Context
Use this pattern when a React details panel enters `create` mode and the first meaningful field (often an immutable identity like **Unique Name**) should receive focus automatically.

## Patterns

### Focus The Actual Create Surface
Put the focus behavior on the component that renders the editable input, or on the immediate create-mode container. Do **not** attach it to a later confirmation dialog if the user request is about entering create mode.

### Cover Every Create Entry Path
If create mode can open from both a direct button and a tree-view or parent-trigger handoff, verify the same focus behavior after both entry paths. The parent trigger may remount the details panel instead of simply toggling local state.

### Handle Async-Loaded Forms
If the create component can first render a loading placeholder before the input exists, do not rely only on a naive one-time `autoFocus`. Ensure focus also happens when the real input mounts after required data becomes available.

### Focus Only Once Per Create Entry
If the form depends on TanStack Query or other async state that may update again after initial render, keep a ref that prevents the focus effect from re-running and stealing focus after the user starts typing.

### Re-Entry Must Refocus
Create mode should refocus the primary field on repeated entry after cancel, save, or view toggles. Do not assume the browser will preserve the desired focus target across remounts.

### Keep Scope Tight
Create-entry focus should not change edit-mode focus or move focus to summary/confirmation UI that appears later in the save flow.

## Examples

```tsx
// Direct create path
const handleCreate = () => {
  setCreateData(getCreateTemplate(parentId));
  setMode('create');
};
```

```tsx
// Tree-view / parent-trigger create path
useEffect(() => {
  if (!creationRequestToken || creationRequestToken === lastHandled.current) {
    return;
  }

  lastHandled.current = creationRequestToken;
  handleCreate();
  onCreationRequestHandled?.();
}, [creationRequestToken, handleCreate, onCreationRequestHandled]);
```

```tsx
// Focus must belong to the create form, not the later confirmation dialog
if (mode === 'create') {
  return <CreateForm createData={createData} />;
}
```

```tsx
const uniqueNameInputRef = useRef<HTMLInputElement | null>(null);
const hasFocusedUniqueNameRef = useRef(false);

useEffect(() => {
  if (hasFocusedUniqueNameRef.current || !appsettings || !customapis) {
    return;
  }

  const focusTimeout = window.setTimeout(() => {
    uniqueNameInputRef.current?.focus();
    hasFocusedUniqueNameRef.current = true;
  }, 0);

  return () => window.clearTimeout(focusTimeout);
}, [appsettings, customapis]);
```

## Anti-Patterns
- Adding focus only to a save confirmation dialog
- Verifying focus only for the header-button create path
- Using plain `autoFocus` when the first render is a loading placeholder
- Re-focusing on every query refresh because the effect is not guarded after the first successful focus
- Assuming focus will remain correct after tree-view remounts or repeated create entry
