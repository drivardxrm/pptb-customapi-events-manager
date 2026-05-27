# 2026-05-27: Catalog Edit Modal Should Preserve Parent Context And Readonly Identity

**By:** Dallas (Frontend Dev)  
**Requested by:** David Rivard

## Decision
Bring catalog edit mode up to parity with the create-category flow by keeping the Parent Catalog section visible for child catalogs and always showing Unique Name as a readonly textbox.

## Why
- Editing a category without its parent context makes the modal feel inconsistent with create mode.
- Unique Name is an immutable identifier users still need for confirmation/copying during edits.
- This is a frontend-only parity fix and should not change service contracts or create-mode behavior.

## Implementation Notes
- File: `src/components/BusinessEventDetails/CatalogModal.tsx`
- Edit mode now resolves parent display from `useAllCatalogs()` via `_parentcatalogid_value`, with Dataverse formatted-value fallback for display-only safety.
- Edit mode renders `catalog.uniquename` in a readonly filled-darker input using the existing disabled-input styling.

## Validation
- ✅ `npm run build` passed
