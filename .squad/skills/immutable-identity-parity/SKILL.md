# Immutable Identity Parity

## When to use
- A create/edit modal manages records with an immutable identifier.
- The identifier is editable or assembled during create, but locked after save.
- Child records also need hierarchy context in edit mode.

## Pattern
1. Keep immutable identifiers visible in edit mode as read-only inputs instead of hiding them.
2. Reuse the same context cues across create and edit when they help the user orient themselves (for example, parent record display).
3. Derive edit-only context from the current record when create-only props are unavailable.
4. Keep duplicate validation on create paths when the identifier is immutable in edit.

## Example in this repo
- `src/components/BusinessEventDetails/CatalogModal.tsx` should show:
  - Unique Name as a locked, read-only field in edit
  - Parent Catalog in edit when `_parentcatalogid_value` exists
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx` clears `parentCatalogForCreate` on edit, so parent display for edit must come from the `catalog` record, not the create prop.
- `src/models/Catalog.ts` excludes `uniquename` from `CatalogUpdateable`, confirming the identifier is display-only in edit.

## Why it helps
- Prevents edit dialogs from hiding important identity data users need for confirmation.
- Avoids create/edit UX drift for hierarchical records.
- Reduces false QA failures where edit mistakenly reuses create-only context wiring.
