---
name: "managed-root-action-parity"
description: "Keep tree-view root actions aligned with managed-record edit restrictions already enforced elsewhere in the UI"
domain: "frontend-ui"
confidence: "high"
source: "earned"
---

## Context
Use this pattern when a record has both a form/header action surface and a tree/list action surface. If managed records are non-editable in one surface, the equivalent action in the other surface should be hidden too.

## Patterns

### Mirror The Existing Managed Guard
Use the same `!entity.ismanaged` condition on the alternate action surface instead of inventing a second rule. This keeps the UI consistent and prevents managed-only regressions between views.

### Keep A Defensive Handler Guard
Even when the button is hidden, keep the edit handler itself guarded:

```tsx
const handleEdit = () => {
  if (!selectedEntity || selectedEntity.ismanaged) {
    return
  }

  // continue edit setup
}
```

This protects against future callback wiring changes or stale references triggering edit mode indirectly.

### Scope The Fix Tightly
Only gate the managed-sensitive action that is out of parity. Preserve unmanaged behavior and unrelated tree actions so the update remains surgical.

## Example

```tsx
actions={
  <>
    {!api.ismanaged && (
      <Button
        aria-label="Edit"
        appearance="subtle"
        icon={<Edit20Regular />}
        onClick={(event) => {
          event.stopPropagation()
          onEdit?.()
        }}
      />
    )}
  </>
}
```

## Anti-Patterns
- Hiding the button but leaving the handler callable without a managed guard
- Adding broader restrictions that also remove valid unmanaged actions
- Using different managed checks across tree view and form view for the same entity action
