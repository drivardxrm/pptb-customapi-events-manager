# Skill: TreeView Create/Edit Return-to-Tree Flow Pattern

**Category:** Architecture Pattern  
**Applies To:** Multi-view components with tree and form view modes where create/edit should return to tree on completion  
**Confidence:** High (documented pattern, not yet implemented; ready for Dallas implementation)  

---

## Pattern Summary

When a user initiates **create** or **edit** from a TreeView, the form should automatically **return to tree view** after save or cancel. This is a complement to the edit handoff pattern — the key difference is that after form exit (not during form entry), the tree view toggle should re-enable.

### The Return-to-Tree Flow

```
1. User clicks "Create" or "Edit" in TreeView
2. Parent handler:
   a) setShowTreeView(false)        // Hide tree, show form
   b) setCreationRequestToken++ or setPendingEditId(id)
3. Form component mounts and detects trigger
4. Form enters create or edit mode
5. User fills form and clicks "Save"
6. Confirmation dialog shows (create only)
7. API mutation completes successfully
8. Form exits mode (setMode('read'), setEditingComponent('none'))
9. ✅ CRITICAL: Parent automatically re-enables tree view
   a) setShowTreeView(true)        // Show tree, hide form
   b) RequestParameterDetails/ResponsePropertyDetails unmount
   c) CustomApiTreeView remounts
10. User sees tree view again with updated data (if created)
```

### Exception: Custom API Edit Does NOT Return to Tree

```
User clicks "Edit" on Custom API in TreeView
  ↓
Tree hides, form shows with editable data
  ↓
User saves
  ↓
Form exits edit mode → Read view displays (NOT tree)
  ↓
User must manually toggle tree view switch to return to tree

Rationale:
- Tree view toggle controls visibility of CHILD details (request/response)
- Custom API is the parent; toggling tree would hide just-edited parent data
- Users expect to see what they just edited before viewing tree
```

---

## Implementation Approaches

### Approach A: Explicit Return Callback (Minimal Coupling)

**Parent Container:**
```typescript
const handleCreationComplete = () => {
  setShowTreeView(true);
};

return (
  <>
    {showTreeView ? (
      <CustomApiTreeView 
        onCreateRequestParameter={handleCreateRequestParameterFromTree}
      />
    ) : (
      <RequestParameterDetails 
        creationRequestToken={trigger}
        onCreationComplete={handleCreationComplete}
      />
    )}
  </>
);
```

**Child Component:**
```typescript
useEffect(() => {
  if (mode === 'read') {
    onCreationComplete?.();
  }
}, [mode, onCreationComplete]);
```

**Pros:** Explicit, easy to trace  
**Cons:** Requires prop drilling; child must know about parent's tree view toggle

---

### Approach B: Parent Effect Watching editingComponent (Most Robust)

**Parent Container:**
```typescript
const { editingComponent } = useAppStore();

// Return to tree when editing lock clears and we're not in tree view
useEffect(() => {
  if (
    editingComponent === 'none' && 
    !showTreeView && 
    selectedCustomApi &&
    mode === 'read'
  ) {
    setShowTreeView(true);
  }
}, [editingComponent, showTreeView, selectedCustomApi, mode]);
```

**Why This Works:**
- `editingComponent === 'none'` fires AFTER save completes and mode reverts to 'read'
- No need for explicit child callback
- Automatic for all child create/edit flows
- Reuses existing Zustand state (no new props)
- Handles both create and edit uniformly

**Pros:** Minimal coupling; automatic for all flows; handles race conditions  
**Cons:** Effect dependency chains; must ensure proper state sequencing in save handler

---

## Critical Implementation Details

### 1. State Transition Sequencing

**In child `performSave()` or after `mutateAsync()` completes:**

```typescript
setMode('read');                    // 1st: Revert mode
setEditingComponent('none');        // 2nd: Clear editing lock
// DON'T set showTreeView here!
```

**In parent effect:**
```typescript
useEffect(() => {
  if (editingComponent === 'none' && !showTreeView && mode === 'read') {
    // Safe to toggle tree view now; no child is editing
    setShowTreeView(true);
  }
}, [editingComponent, showTreeView, mode]);
```

**Why Order Matters:**
1. `editingComponent = 'none'` last ensures lock is clear before parent re-toggles
2. Parent effect fires AFTER child settles into read mode
3. No race between form exit and tree remount

### 2. Custom API Edit Exception

**In Custom API save handler:**
```typescript
await performSave(/* ... */);
setMode('read');
setEditingComponent('none');
// Do NOT set showTreeView(true) — leave it false
// User must manually toggle if they want tree view
```

**Conditional parent effect:**
```typescript
useEffect(() => {
  if (
    editingComponent === 'none' && 
    !showTreeView && 
    selectedCustomApi &&
    mode === 'read' &&
    editingComponent !== 'customapi'  // ← Exclude Custom API
  ) {
    setShowTreeView(true);
  }
}, [editingComponent, showTreeView, selectedCustomApi, mode]);
```

### 3. Guard Against Premature Tree Return

**Problem:** If user presses "Cancel" before form fully initializes, tree could re-toggle too early.

**Solution:** Ensure `editingComponent` is properly set before user can interact:

```typescript
const handleCreate = () => {
  setSelectedRequestParameterId(null);
  setCreateData(getRequestParameterCreateTemplate(selectedCustomApiId!));
  setMode('create');
  setEditingComponent('requestparameter');  // Lock immediately
};

useEffect(() => {
  if (!creationRequestToken || !selectedCustomApiId) return;
  lastHandledCreationRequestToken.current = creationRequestToken;
  handleCreate();
  onCreationRequestHandled?.();
}, [creationRequestToken]);
```

**Result:** Even if user cancels immediately, `editingComponent` is set; parent effect won't fire until lock clears.

### 4. Solution Dialog State Reset

**Problem:** When returning to tree → clicking "Create" again, solution selector retains previous choice.

**Solution:** Reset solution selection on dialog open/close:

```typescript
const handleShowCreateConfirmation = () => {
  // Reset any previous solution selection
  setShowCreateConfirmation(true);
  // (Dialog handles default solution in its own state)
};
```

---

## Regression Testing Checklist

### Basic Flows
- [ ] Create Request Parameter → Save → Tree returns
- [ ] Create Request Parameter → Cancel → Tree returns
- [ ] Create Response Property → Save → Tree returns
- [ ] Create Response Property → Cancel → Tree returns
- [ ] Edit Request Parameter → Save → Tree returns
- [ ] Edit Request Parameter → Cancel → Tree returns
- [ ] Edit Response Property → Save → Tree returns
- [ ] Edit Response Property → Cancel → Tree returns

### Exception: Custom API
- [ ] Edit Custom API → Save → Form view (NOT tree)
- [ ] Edit Custom API → Cancel → Form view (NOT tree)
- [ ] User manually toggles tree view switch to return to tree (expected workflow)

### Rapid Cycles
- [ ] Create param → Return to tree → Create property → Return to tree
- [ ] Create param → Return to tree → Create param again → No stale data
- [ ] Create property → Return to tree → Create property again → Validation state cleared

### Edge Cases
- [ ] Rapid "Create" clicks → Only one form opens (debounce/guard active)
- [ ] Create during async network call → Button disabled, can't create again
- [ ] Tree toggle switch disabled while form editing (can't manually exit mid-edit)
- [ ] Solution selection cleared between consecutive creates

### React #185 Regression Safety
- [ ] No "Maximum update depth exceeded" errors in create/return flow
- [ ] Dual component mount (RequestParameterDetails + ResponsePropertyDetails) doesn't cause loops
- [ ] Stale TanStack Query cache doesn't trigger validation cascades
- [ ] Rapid tree toggle during create doesn't race form mount

### State Consistency
- [ ] Zustand `showTreeView` toggles at correct time
- [ ] Zustand `editingComponent` clears before tree returns
- [ ] Zustand `selectedRequest/ResponsePropertyId` cleared on tree entry
- [ ] Zustand `mode` properly sequenced (create → read before return)

### Network Sequencing
- [ ] Single POST/PATCH call (no duplicates)
- [ ] GET refresh follows mutation (list updates before tree remounts)
- [ ] No stale data in response bodies

---

## Implementation Notes for Dallas

1. **Choose approach:** Prefer Approach B (parent effect watching `editingComponent`) for robustness.

2. **Preserve existing hardening:**
   - Do NOT remove tree-entry selection clearing (lines 89-96 in CustomApiDetails)
   - Do NOT remove GenericTagPicker idempotent clearing
   - Do NOT remove picker item array memoization
   - Do NOT remove response property list array cloning
   - These prevent React #185 regressions

3. **Test in sequence:**
   - Verify save completes (mutation succeeds, API responds)
   - Verify `setMode('read')` fires
   - Verify `setEditingComponent('none')` fires
   - Verify parent effect triggers
   - Verify `setShowTreeView(true)` fires
   - Verify tree remounts with updated list

4. **DevTools validation steps:**
   - Zustand DevTools: Watch state transitions in order
   - React Query DevTools: Verify list refresh after mutation
   - React Profiler: Check component mounts/unmounts (form exit, tree re-entry)
   - Network tab: Verify single mutation + GET refresh

5. **Handle Custom API separately:**
   - Custom API edit is exception: stays in form view after save
   - Add conditional check to prevent tree re-toggle for Custom API edits
   - Document this exception in UI (no tooltip or message needed; users expect to see what they edited)

---

## Related Patterns

- **treeview-to-form-edit-handoff** — Edit entry pattern (complementary)
- **treeview-create-state-reset** — State cleanup on tree entry
- **generic-tag-picker-stability** — Prevents cascade issues during transitions

---

## Lessons Learned

1. **Mode Reverts Before UI Returns:** Child must reach `mode === 'read'` AND `editingComponent === 'none'` before parent re-toggles tree. Race conditions otherwise.

2. **Effects Layer Well:** Parent effect watching Zustand provides clean decoupling vs. explicit callbacks.

3. **Custom API is Special:** Parent entity edit should not auto-hide itself. Different pattern from child edits.

4. **Solution State is Sticky:** Dialog solution selection persists in component state across multiple create attempts. Reset on new creates.

5. **Dual Component Mount is a Fragility Point:** RequestParameterDetails + ResponsePropertyDetails in same conditional block can simultaneous mount/unmount. Mitigate with tree-entry selection clearing.

