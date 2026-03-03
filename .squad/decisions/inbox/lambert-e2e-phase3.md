# Decision: Nested Card Selector Pattern for E2E Tests

**Author:** Lambert (Tester)  
**Date:** 2026-03-02  
**Status:** Implemented

## Context

When implementing Phase 3 E2E tests for Request Parameters and Response Properties, encountered a challenge with Playwright's selector matching. The app UI uses nested Fluent UI Cards:
- Outer "Custom API Details" card
- Inner "Request Parameters (Input)" card
- Inner "Response Properties (Output)" card

## Problem

Standard Playwright locators like `hasText` or `has` with descendant selectors matched BOTH the parent and child cards, causing strict mode violations:

```typescript
// This matches 2 elements - the parent "Custom API Details" card AND the child card
page.locator('.fui-Card').filter({ hasText: 'Request Parameters (Input)' })
```

## Decision

Use CSS direct child selector (`:has(> ...)`) to only match cards that directly contain the specific header element:

```typescript
// This matches exactly 1 element - only the card with this direct header child
page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Request Parameters (Input)"))')
```

## Rationale

1. **Specificity**: The direct child combinator (`>`) ensures we only match cards where the `h3` header is a direct descendant of the CardHeader, not ancestor cards that also contain this text via nested children.

2. **Reliability**: This pattern is resilient to UI changes as long as the header structure remains consistent (Card → CardHeader → h3).

3. **Readability**: The selector clearly expresses the intent - "the card that has this specific heading".

## Alternatives Considered

1. **Using `.nth()`**: Could use `.nth(1)` to get the second match, but fragile if card order changes.

2. **Using test IDs**: Would require modifying source code to add `data-testid` attributes.

3. **Using `.locator()` chaining**: Parent-to-child chaining doesn't solve the strict mode violation since `filter()` still matches ancestors.

## Impact

- All 12 Phase 3 tests pass reliably
- Pattern documented in Lambert's history for future test authors
- No source code changes required
