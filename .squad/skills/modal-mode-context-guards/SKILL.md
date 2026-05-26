# Modal Mode Context Guards

## When to use
- A single modal supports multiple create/edit modes.
- Some modes need shared fields but different contextual chrome or payload defaults.

## Pattern
1. Add an explicit mode discriminator (`create-root`, `create-category`, `edit`).
2. Derive booleans from that mode near the top of the component.
3. Use those booleans both for visible UI labels/sections and for hidden payload defaults.
4. For parent-child flows, clear parent identifiers in root-mode instead of assuming the prop is already null.

## Example in this repo
- `src/components/BusinessEventDetails/CatalogModal.tsx`
  - `create-root` → title `Create Root Catalog`, no parent section, `_parentcatalogid_value: ''`
  - `create-category` → title `Create Category`, parent section shown, `_parentcatalogid_value` bound to the selected parent

## Why it helps
- Prevents stale contextual props from leaking into the wrong create flow.
- Keeps one modal reusable without letting modes drift in behavior or copy.
