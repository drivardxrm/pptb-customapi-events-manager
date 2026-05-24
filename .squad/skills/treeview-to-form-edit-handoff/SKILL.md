# Skill: TreeView-to-Form Edit Handoff Pattern

**Category:** Architecture Pattern  
**Applies To:** Multi-view components with tree and form view modes  
**Confidence:** High (validated by request parameter & response property E2E coverage)  

---

## Pattern Summary

When a user clicks "Edit" on a nested item in a TreeView, the UI must transition from **tree view** (compact, hierarchical) to **form view** (detailed, editable). The safe pattern is a **two-phase handoff**: parent requests the edit target and hides the tree, then the details component selects the item after mount and only then enters edit mode.

### The Handoff Chain

```
1. User clicks Edit button on TreeView item
2. TreeView calls parent callback: onEdit(itemId)
3. Parent (Container) handler:
  a) clear sibling selection (optional but recommended)
  b) setPendingEditItemId(itemId)        // Store handoff request locally
  c) setShowTreeView(false)              // Hide tree, show form
4. Form component mounts
5. Form component sees pending edit request and sets selectedItemId(itemId)
6. After selectedItem resolves, form component enters edit mode
7. Form clears pending edit request via callback
8. Edit UI renders with selected data
```

---

## Implementation Checklist

### Parent Container Setup

- [ ] Accept `onEdit(itemId)` callback prop in TreeView component
- [ ] Define handler in parent:
  ```typescript
  const handleEditItem = (itemId: string) => {
    setPendingEditItemId(itemId);
    setShowTreeView(false);
  };
  ```
- [ ] Pass handler to TreeView: `<TreeView onEdit={handleEditItem} ... />`
- [ ] Pass pending edit props to details component:
  ```typescript
  <ItemDetails
    editRequestItemId={pendingEditItemId}
    onEditRequestHandled={() => setPendingEditItemId(null)}
  />
  ```

### TreeView Component

- [ ] Add callback prop: `onEdit?: (itemId: string) => void`
- [ ] Add Edit button to TreeItemLayout actions:
  ```typescript
  !item.ismanaged && (
    <Button
      aria-label="Edit"
      appearance="subtle"
      icon={<Edit20Regular />}
      onClick={(event) => {
        event.stopPropagation();
        onEdit?.(itemId);
      }}
    />
  )
  ```
- [ ] Only show Edit button for unmanaged items
- [ ] Call `event.stopPropagation()` to prevent tree item expansion

### Form Component (Details Panel)

- [ ] Add one effect to apply the pending selection after mount:
  ```typescript
  useEffect(() => {
    if (editRequestItemId && selectedItemId !== editRequestItemId) {
      setSelectedItemId(editRequestItemId);
    }
  }, [editRequestItemId, selectedItemId]);
  ```
- [ ] Add a second effect to enter edit mode only after the selected item is available:
  ```typescript
  useEffect(() => {
    if (editRequestItemId && selectedItem?.id === editRequestItemId) {
      setEditedData(selectedItem);
      setMode('edit');
      setEditingComponent('item');
      onEditRequestHandled?.();
    }
  }, [editRequestItemId, selectedItem]);
  ```
- [ ] Keep selection setters and controlled list-selection handlers idempotent

### State Management (Zustand)

- [ ] Store has selection field: `setSelectedItemId: (id: string | null) => void`
- [ ] Store has view toggle: `setShowTreeView: (show: boolean) => void`
- [ ] Store has editing lock: `setEditingComponent: (component: string) => void`

---

## Critical Safety Considerations

### 1. State Transition Order
**DO:**
```typescript
setPendingEditItemId(newId);       // First: request handoff
setShowTreeView(false);            // Second: hide tree
```

**DON'T:**
```typescript
setSelectedItemId(newId);          // Pre-selecting before mount can loop controlled lists
setMode('edit');                   // Parent should not own child mode
setShowTreeView(false);
```

**Why:** Pre-selecting before the details/list components mount can create React max-depth loops with controlled grids and selection effects.

### 2. Enter Edit Mode Only After Selection Resolves

**DO:** Let form component enter edit mode in a second-stage effect
```typescript
useEffect(() => {
  if (editRequestItemId && selectedItem?.id === editRequestItemId) {
    setEditedData(selectedItem);
    setMode('edit');
  }
}, [editRequestItemId, selectedItem]);
```

**Why:** This gives child lists and selected-item lookup one render to stabilize before edit-mode components mount.

### 3. Prevent React #185 (Max Update Depth)

**Risk Factors:**
- Tree and form rendering simultaneously during transition
- Shared validation cascades (e.g., picker state updates)
- Stale TanStack Query cache with `staleTime: Infinity`

**Mitigations:**
- Ensure tree hides BEFORE form renders (conditional rendering on `showTreeView`)
- Memoize picker item arrays to prevent effect re-triggers
- Clone query data at form boundary to prevent mutation of React Query state
- Use idempotent state setters in callbacks
- Guard controlled-grid `onSelectionChange` handlers so equivalent selections return previous state

---

## Testing Checklist

| Scenario | Success Criteria |
|----------|------------------|
| Click Edit on unmanaged item | Tree hides, form shows, item is selected, edit mode opens |
| Click Edit on managed item | No Edit button visible |
| Edit while another form editing | Global message shown; editing lock prevents save |
| Rapid Edit clicks | State updates batched; only one selection persists |
| Tree toggle while in edit | Edit mode exits gracefully; selection cleared (per design) |
| Save after Edit | Returns to read mode; editingComponent cleared |
| React Profiler | No excessive re-renders; Zustand updates batched |

---

## Related Patterns

- **treeview-create-state-reset** — Similar handoff but for Create (tree stays visible)
- **generic-tag-picker-stability** — Prevents picker cascade issues during form transitions
- **collapsed-filter-summary-parity** — Parallel state transitions in selectors

---

## Code Examples

### Parent Container
```typescript
const [showTreeView, setShowTreeView] = useState(false);
const [pendingEditItemId, setPendingEditItemId] = useState<string | null>(null);

const handleEditItem = (itemId: string) => {
  setPendingEditItemId(itemId);
  setShowTreeView(false);
};

return (
  <>
    {selectedItem && showTreeView && (
      <CustomTreeView 
        items={items}
        onEdit={handleEditItem}
      />
    )}
    
    {selectedItem && !showTreeView && (
      <ItemDetails 
        editRequestItemId={pendingEditItemId}
        onEditRequestHandled={() => setPendingEditItemId(null)}
        onClose={() => {
          setShowTreeView(true);
          setPendingEditItemId(null);
        }}
      />
    )}
  </>
);
```

### TreeView Component
```typescript
interface ItemTreeProps {
  items: Item[];
  onEdit?: (itemId: string) => void;
}

export const ItemTreeView: React.FC<ItemTreeProps> = ({ items, onEdit }) => {
  return (
    <Tree>
      {items.map((item) => (
        <TreeItem key={item.id} value={item.id}>
          <TreeItemLayout
            actions={
              !item.ismanaged && (
                <Button
                  aria-label="Edit"
                  appearance="subtle"
                  icon={<Edit20Regular />}
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit?.(item.id);
                  }}
                />
              )
            }
          >
            {item.name}
          </TreeItemLayout>
        </TreeItem>
      ))}
    </Tree>
  );
};
```

### Form Component
```typescript
export const ItemDetails: React.FC<{
  editRequestItemId: string | null;
  onEditRequestHandled?: () => void;
}> = ({ editRequestItemId, onEditRequestHandled }) => {
  const { selectedItemId, setSelectedItemId } = useAppStore();
  const { items } = useItems();
  const [mode, setMode] = useState<'read' | 'edit'>('read');
  const [editedData, setEditedData] = useState<ItemUpdateable | null>(null);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  useEffect(() => {
    if (editRequestItemId && selectedItemId !== editRequestItemId) {
      setSelectedItemId(editRequestItemId);
    }
  }, [editRequestItemId, selectedItemId, setSelectedItemId]);

  useEffect(() => {
    if (editRequestItemId && selectedItem?.id === editRequestItemId) {
      setEditedData(selectedItem);
      setMode('edit');
      onEditRequestHandled?.();
    }
  }, [editRequestItemId, onEditRequestHandled, selectedItem]);

  return (
    <Card>
      {mode === 'edit' && editedData && (
        <ItemEdit data={editedData} />
      )}
    </Card>
  );
};
```

---

## Lessons Learned

1. **UI Visibility ≠ State Consistency:** Just because form mounts doesn't mean it has correct data. Queue the edit request first, then resolve selection after mount.

2. **Effects Race Conditions:** Multiple useEffect hooks depending on the same state can create validation cascades. Order matters; batch state updates carefully.

3. **TanStack Query `staleTime: Infinity`:** Cache persists across unmount/remount. Clone data at form boundary to prevent mutations.

4. **Editing Locks Are Essential:** When `editingComponent !== 'none'`, other components must not enter edit mode. Lock prevents corruption and conflicting saves.

5. **Event Propagation Matters:** Always `event.stopPropagation()` on action buttons inside tree items to prevent collapsing the branch.
