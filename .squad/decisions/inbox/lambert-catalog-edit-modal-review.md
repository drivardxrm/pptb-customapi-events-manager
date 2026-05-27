# Lambert QA Review — Catalog Edit Modal UX Parity

## Request
When editing a Catalog:
- show **Parent Catalog** when the record is a category (2nd level), matching create-category UX
- always show **Unique Name** as a read-only textbox

## Expected UX
1. **Edit Root Catalog**
   - No Parent Catalog section
   - Unique Name visible, locked, read-only
   - Name / Display Name / Description remain editable

2. **Edit Category**
   - Parent Catalog section visible with the correct parent display name
   - Unique Name visible, locked, read-only
   - Name / Display Name / Description remain editable

3. **Create Flows Stay As-Is**
   - Create root and create category keep current publisher + editable Unique Name behavior
   - Create category continues showing Parent Catalog context

## Likely Missed Surface
- `BusinessEventDetails.tsx` clears `parentCatalogForCreate` in `handleEditCatalog()`, so edit mode cannot depend on the existing `parentCatalog` prop.
- If the change only copies the current create-category render guard, category edit will still fail to show parent context.
- Safer edit source is the catalog record itself, especially `_parentcatalogid_value@OData.Community.Display.V1.FormattedValue`.

## Regression Checks
- Edit root catalog does **not** show Parent Catalog.
- Edit category **does** show Parent Catalog.
- Parent text is the real parent name, not blank / GUID / stale previous selection.
- Unique Name appears for both root and category edit.
- Unique Name is read-only in edit and not included in update payload behavior.
- Saving edit with unchanged Unique Name succeeds.
- Create root still shows editable Unique Name entry.
- Create category still shows editable Unique Name entry + Parent Catalog section.
- Create duplicate Unique Name is still blocked.
- Edit does not incorrectly run duplicate validation against the unchanged Unique Name.

## Relevant Files
- `src/components/BusinessEventDetails/CatalogModal.tsx`
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx`
- `src/components/BusinessEventDetails/TreeItemDetailsPanel.tsx`
- `src/models/Catalog.ts`
