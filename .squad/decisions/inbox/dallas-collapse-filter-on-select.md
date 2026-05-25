# Dallas — Collapse Filters on Custom API Selection

## Decision
- Auto-collapse the `CustomApiSelector` Filters section whenever `selectedCustomApiId` becomes truthy.

## Why
- The selected Custom API becomes the primary focus after pick time, so collapsing the secondary filter panel returns space to the details workflow.
- Limiting the behavior to selection events preserves existing non-selection behavior, including manual filter expansion when no API is selected.

## Implementation Notes
- Added a small `useEffect` in `src/components/CustomApiSelector.tsx` that sets `filtersExpanded` to `false` when a Custom API is selected.
- Added focused Playwright coverage in `tests/e2e/specs/custom-api.spec.ts` that asserts the selector card combobox count drops from 2 to 1 after selection.

## Validation
- `npm run build`
- `npx playwright test tests/e2e/specs/custom-api.spec.ts --config=tests/e2e/playwright.config.ts`
