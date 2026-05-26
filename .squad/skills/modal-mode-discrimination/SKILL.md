# Modal Mode Discrimination Pattern

**Tag:** Modal Design | State Management | TypeScript  
**Applicability:** React modals with multiple create/edit/view modes using same component  
**Status:** 🔄 Pattern Identified (ready for future use)

---

## Problem

Modal components that handle both **create** and **edit** operations often need:
- Different titles ("Create Root Catalog" vs "Edit Catalog" vs "Create Category")
- Different form fields visible (Publisher only on create, Unique Name only on root)
- Different validation rules
- Different success behaviors (e.g., add to solution)
- Different API calls (create vs update mutations)

Without careful design, this creates nested ternaries and fragile condition logic across the component.

---

## Solution: Type-Safe Mode Discrimination

### 1. Define a Discriminated Union Type

```typescript
export type CatalogModalMode = 'create-root' | 'create-category' | 'edit';
```

This ensures:
- Only valid modes are used
- TypeScript catches invalid mode assignments at compile time
- Each mode is explicit (no boolean flag ambiguity)

### 2. Design Mode-Specific Handlers

In the parent component (e.g., `BusinessEventDetails`), create separate handlers that **set all required state atoms** for each mode:

```typescript
// Create Root
const handleCreateRoot = () => {
  setCatalogModalMode('create-root');
  setEditingCatalog(null);              // ← explicit state
  setParentCatalogForCreate(null);      // ← explicit state
  setCatalogModalOpen(true);
};

// Create Category (needs parent)
const handleCreateCategory = (parentCatalog: Catalog) => {
  setCatalogModalMode('create-category');
  setEditingCatalog(null);              // ← explicit state
  setParentCatalogForCreate(parentCatalog);  // ← passed context
  setCatalogModalOpen(true);
};

// Edit
const handleEditCatalog = (catalog: Catalog) => {
  setCatalogModalMode('edit');
  setEditingCatalog(catalog);           // ← explicit state
  setParentCatalogForCreate(null);      // ← explicit state
  setCatalogModalOpen(true);
};
```

**Key principle:** Each handler is a "state snapshot" — it sets all state atoms needed for that mode. This prevents partial state updates and makes the expected state clear to readers.

### 3. Use Computed Flags Inside Modal

Derive boolean flags from the mode to simplify conditional logic:

```typescript
const isEdit = mode === 'edit';
const isCategory = mode === 'create-category';
```

Then use these flags consistently:

```typescript
// Conditional form reset
useEffect(() => {
  if (open) {
    if (isEdit && catalog) {
      setEditData({ name: catalog.name || '', ... });
    } else {
      setFormData({
        ...DEFAULT_CREATE_TEMPLATE,
        _parentcatalogid_value: parentCatalog?.catalogid || '',
      });
    }
  }
}, [open, isEdit, catalog, parentCatalog, ...]);

// Conditional field visibility
{!isEdit && <PublisherSelector />}
{!isEdit && <UniqueNameField />}
{isCategory && parentCatalog && <ParentInfoBlock />}

// Conditional title
getTitle(): string {
  if (isEdit) return 'Edit Catalog';
  if (isCategory) return 'Create Category';
  return 'Create Root Catalog';
}
```

### 4. Decouple Validation by Mode

```typescript
const validation = useMemo(() => {
  if (isEdit) {
    // Edit validation
    if (!editData.name?.trim() || !editData.displayname?.trim()) {
      return { isValid: false, message: 'Name and Display Name required.' };
    }
  } else {
    // Create validation (both root and category)
    if (!formData.name?.trim() || !formData.displayname?.trim()) {
      return { isValid: false, message: 'Name and Display Name required.' };
    }
    // Root-specific validation
    if (!formData.uniquename?.trim()) {
      return { isValid: false, message: 'Unique Name required for root.' };
    }
    if (!formData._publisherid_value) {
      return { isValid: false, message: 'Publisher required.' };
    }
  }
  return { isValid: true, message: '' };
}, [isEdit, formData, editData, ...]);
```

### 5. Implement Save with Mode-Aware Logic

```typescript
const handleSave = async () => {
  try {
    if (isEdit && catalog) {
      await updateCatalog.mutateAsync({
        current: catalog,
        next: editData,  // Only editable fields
      });
    } else {
      await createCatalog.mutateAsync({
        next: formData,  // Full create payload
        solutionUniqueName: selectedSolution?.uniquename,
      });
      // Remember publisher for future creates
      if (formData._publisherid_value) {
        setSelectedPublisherId(formData._publisherid_value);
      }
    }
    onClose();
  } catch (error) {
    console.error('Error saving catalog:', error);
  }
};
```

---

## Benefits

1. **Type Safety:** Mode mistakes caught at compile time
2. **Clarity:** Each handler explicitly sets the expected state
3. **Testability:** Each mode can be tested independently by mocking handlers
4. **Maintainability:** Adding a new mode (e.g., 'duplicate') only requires:
   - Add mode to discriminator: `'create-root' | 'create-category' | 'edit' | 'duplicate'`
   - Add handler with state snapshot
   - Add conditional rendering block
   - Add validation rule
5. **No Boolean Flag Hell:** Avoids `isEdit && isCategory` combinations that become unmaintainable
6. **Flexibility:** Parent and child state can be passed contextually (e.g., `parentCatalog` only for categories)

---

## Anti-Patterns to Avoid

❌ **No:** `const isCreateMode = !isEdit && !isCategory;` — Hidden derived state  
✅ **Yes:** Keep mode as single source of truth

❌ **No:** Partial state updates in different places — `handleCreate()` sets mode but not parent  
✅ **Yes:** Each handler sets all state atoms for that mode

❌ **No:** Boolean flags like `isEditModal`, `isCreateRoot`, `isCreateCategory` — Too many permutations  
✅ **Yes:** Single discriminated mode with derived flags `isEdit`, `isCategory`

---

## Example: CatalogModal in PPTB

**File:** `src/components/BusinessEventDetails/CatalogModal.tsx`  
**Parent Handlers:** `src/components/BusinessEventDetails/BusinessEventDetails.tsx` (lines 139–158)

The pattern is fully implemented with:
- Mode discriminator at line 24
- Three handlers (createRoot, createCategory, editCatalog) with explicit state
- Computed flags (isEdit, isCategory) at lines 49–50
- Mode-aware form reset effect at lines 60–76
- Conditional field visibility at lines 138–162
- Mode-specific validation at lines 79–97
- Title generation by mode at lines 123–127
- Save logic branching on mode at lines 101–115

---

## References

**Codebase Examples:**
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx` — Parent handlers
- `src/components/BusinessEventDetails/CatalogModal.tsx` — Modal implementation
- `src/models/Catalog.ts` — Mode-aware payload types (CatalogCreateable, CatalogUpdateable)

**Related Patterns:**
- Discriminated unions (TypeScript handbook)
- State snapshot pattern (Redux architecture)
- Conditional rendering in React

---

**Status:** ✅ Verified in use (CatalogModal, 2026-06-XX)  
**Next Steps:** Consider applying to other modals (e.g., CatalogAssignmentModal, CustomApiCreateDialog)
