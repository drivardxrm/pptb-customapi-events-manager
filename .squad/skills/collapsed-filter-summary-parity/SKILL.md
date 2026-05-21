---
name: "collapsed-filter-summary-parity"
description: "Keep collapsed filter summaries and counts aligned with all active controls"
domain: "frontend-ui"
confidence: "high"
source: "manual"
---

## Context
Use this pattern when a filter panel can collapse but still needs to communicate its active state. It applies to selector cards and other compact Fluent UI filter sections in this project.

## Patterns

### Summary Mirrors Controls
Build the collapsed summary from every active control contained in the collapsible section. If a control changes what the user can pick or see, it belongs in the summary.

### Count and Summary Share One Source
Derive the active-filter count from the same logical set used for the collapsed summary. This prevents counts that under-report or disagree with the badges/chips shown to the user.

### Preserve Low-Movement Presentation
Prefer compact badges or tags that reuse existing shared styles such as `badgeContainer`. Fix correctness gaps without redesigning the expanded layout unless the issue requires it.

## Examples

```tsx
// Include all active filter controls in one derived collection
const activeFilters = [
  selectedSolutionId && { key: 'solution', label: solutionName },
  showSolutions !== 'all' && { key: 'solution-managed', label: 'Managed solutions' },
  showCustomApis !== 'all' && { key: 'customapi-managed', label: 'Managed APIs' },
  showPowerFxOnly && { key: 'powerfx', label: 'PowerFx' },
].filter(Boolean)

const activeFilterCount = activeFilters.length
```

## Anti-Patterns
- Showing a collapsed summary for only some controls in the section
- Counting active filters differently than they are summarized
- Redesigning the expanded filter UI when only collapsed-state parity is needed
