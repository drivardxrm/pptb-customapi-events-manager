# Decision: OData URL Display Pattern

**Date:** 2026-03-03  
**By:** Dallas (Frontend Dev)  
**Context:** Issue #54 - Display Custom API URL in tester when OData is selected

## What We Decided

When OData mode is toggled in the Custom API Tester, display:
1. The full OData URL for the Custom API (above JSON payload)
2. A copy-to-clipboard button for easy access
3. The JSON parameters below the URL (existing behavior)

## Implementation Details

- Created `src/utils/odataUrl.ts` with `buildCustomApiODataUrl()` function
- URL building logic supports:
  - Global vs Entity-bound vs EntityCollection-bound APIs
  - Action vs Function (functions include parameters in URL)
  - Parameter type formatting (String, Boolean, Integer, DateTime, etc.)
- Used `useMemo` to rebuild URL reactively when parameters or bound record change
- Styled URL display with monospace font and theme-aware background
- Copy button uses `navigator.clipboard.writeText()`

## Why

- Users need to see the actual OData endpoint for testing outside the tool
- URL format varies significantly based on binding type and operation type
- Reactive display helps users understand how parameter changes affect the URL
- Copy-to-clipboard reduces friction for external testing (Postman, curl, etc.)

## Pattern for Future Use

When displaying technical URLs/endpoints:
- Use monospace font for readability
- Theme-aware background (`#1e1e1e` dark, `#f5f5f5` light)
- Include copy button for easy access
- Use `wordBreak: 'break-all'` to prevent overflow
- Wrap in Field component for consistent spacing
