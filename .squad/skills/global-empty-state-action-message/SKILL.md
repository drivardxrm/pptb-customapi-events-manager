---
name: "global-empty-state-action-message"
description: "Surface an empty-selection state in the shared app message bar with a direct action button, while keeping lifecycle cleanup explicit"
domain: "frontend-ui"
confidence: "high"
source: "earned"
---

## Context
Use this when a top-level feature screen has no current selection and needs a prominent, actionable empty state that should appear above the page content.

## Pattern

### Use The Shared App Message Bar For Top-Level Empty States
If the empty state should appear at the top of the screen, use the shared `globalMessages` store instead of only rendering local placeholder text inside the card body.

### Gate The Message To The Exact Screen And View State
Show the message only when the correct nav item is active and the required selection is absent. If the screen has an explicit read/view mode, include that guard; if it uses modal-based create flows instead, the nav-item + missing-selection guard is enough.

### Wire The Action To The Existing Create Entry Point
The message action button should call the same create handler already used by the header action so both launch paths stay behaviorally identical.

### Clear The Message On All Exit Paths
Clear the message when:
1. a valid selection appears
2. the user leaves the screen
3. the screen leaves the empty read/view state

### Keep Local Empty-State Copy In Sync
If the screen also renders a local empty-state panel, update or remove it so the top message and in-card message do not contradict each other.

## Example

```tsx
useEffect(() => {
  if (selectedNavItem === 'customapi' && mode === 'read' && !selectedCustomApi) {
    setGlobalMessage('no-customapi-selected', {
      intent: 'info',
      title: 'No Custom API selected. Select a Custom API below or create a new one.',
      dismissable: false,
      action: {
        label: 'New Custom API',
        icon: <AddCircleColor />,
        onClick: handleCreate,
      },
    });
  } else {
    clearGlobalMessage('no-customapi-selected');
  }
}, [selectedNavItem, mode, selectedCustomApi, setGlobalMessage, clearGlobalMessage]);
```

```tsx
useEffect(() => {
  if (selectedNavItem === 'businessevent' && !selectedCatalogId) {
    setGlobalMessage('no-root-catalog-selected', {
      intent: 'info',
      title: 'No Root Catalog selected. Select a Root Catalog below or create a new one.',
      dismissable: false,
      action: {
        label: 'New Root Catalog',
        icon: <AddCircleColor />,
        onClick: handleCreateRoot,
      },
    });
  } else {
    clearGlobalMessage('no-root-catalog-selected');
  }
}, [selectedNavItem, selectedCatalogId, setGlobalMessage, clearGlobalMessage]);
```

```tsx
return () => {
  clearGlobalMessage('no-customapi-selected');
};
```

## Anti-Patterns
- Showing only a local card-body placeholder when the UX calls for a top-page alert
- Adding a new create action that bypasses the existing create handler
- Leaving stale global messages active after navigation or selection changes
- Mixing different domain terms in paired empty-state messages (for example `Catalog` vs `Root Catalog`)
