# Decision: Compact Tree View Toggle Pattern (Issue #66)

**By:** Dallas (Frontend Dev)
**Date:** 2026-03-12
**Status:** Implemented

## Context
Added a compact tree view toggle for Custom API Details to allow quick inspection of API structure including parameters and response properties in a collapsible tree format.

## Decision

### Toggle Placement
- Switch placed in the CardHeader badge group (next to ModeBadge, ComponentStateBadge, PowerFxBadge)
- Only visible in read mode when a Custom API is selected
- Uses `TreeDeciduousFilled` icon as the switch label

### Tree Structure
Uses Fluent UI Tree component with nested structure:
- Custom API root (expanded by default)
  - Details branch (Unique Name, Binding, Plugin, Flags)
  - Request Parameters branch (with count, shows each param's type and optional status)
  - Response Properties branch (with count, shows each property's type)

### Component Architecture
- Created new `CustomApiTreeView.tsx` with component-local `makeStyles` (following the pattern noted in history for component-level styles)
- Tree view replaces the form view content when toggle is active
- RequestParameterDetails and ResponsePropertyDetails cards are hidden when tree view is active (data already shown in tree)

### Icons Used
- `ArrowDownloadFilled` for Request Parameters (input)
- `ArrowUploadFilled` for Response Properties (output)
- `CheckmarkCircleFilled` / `DismissCircleFilled` for boolean flags
- Standard binding type icons (Globe, Square, SquareMultiple)

## Rationale
- Toggle in header badge group keeps UI clean and consistent with other status indicators
- Hiding detail cards when in tree view prevents redundant information display
- Component-local styles keep tree-specific styling isolated from main Styles.ts

## Files Changed
- `src/components/customApiDetails/CustomApiDetails.tsx` - Added toggle state, Switch component, conditional rendering
- `src/components/customApiDetails/CustomApiTreeView.tsx` - New tree view component
