# Modal Mode Context Guards

## When to use
- A single modal supports multiple create/edit modes.
- Some modes need shared fields but different contextual chrome or payload defaults.

## Pattern
1. Add an explicit mode discriminator (`create-root`, `create-category`, `edit`).
2. Derive booleans from that mode near the top of the component.
3. Use those booleans both for visible UI labels/sections and for hidden payload defaults.
4. In edit mode, keep immutable identity/context fields visible when they explain what is being edited (for example, readonly unique names and parent summaries).
5. For parent-child flows, clear parent identifiers in root-mode instead of assuming the prop is already null.

## Example in this repo
- `src/components/BusinessEventDetails/CatalogModal.tsx`
  - `create-root` → title `Create Root Catalog`, no parent section, `_parentcatalogid_value: ''`
  - `create-category` → title `Create Category`, parent section shown, `_parentcatalogid_value` bound to the selected parent
  - `edit` → keep `uniquename` visible as a readonly field; if `_parentcatalogid_value` exists, show Parent Catalog using the resolved parent record or the formatted Dataverse lookup value

## Why it helps
- Prevents stale contextual props from leaking into the wrong create flow.
- Keeps immutable identifiers visible so edit forms retain enough context without making those fields editable.
- Keeps one modal reusable without letting modes drift in behavior or copy.
