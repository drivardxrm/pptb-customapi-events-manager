# 2026-05-27: Business Event Empty State Should Mirror Custom API CTA Pattern

**By:** Dallas (Frontend Dev)  
**Requested by:** David Rivard

## Decision
When the Business Events page is active and no root catalog is selected, show the empty state as a top-level global info message with an inline action button, matching the established Custom API no-selection pattern.

## Why
- The user explicitly asked for the Business Event state to work "exactly like we do for custom apis."
- The top-of-page message is more discoverable than relying only on the in-card placeholder text.
- Reusing the same CTA pattern keeps create-entry behavior consistent across the two main entity-detail experiences.

## Implementation Notes
- File: `src/components/BusinessEventDetails/BusinessEventDetails.tsx`
- Message copy: `No Root Catalog selected. Select a Root Catalog below or create a new one.`
- CTA label: `New Root Catalog`
- CTA action opens the existing root-catalog create modal (`create-root`) without changing other Business Event flows.

## Validation
- ✅ `npm run build` passed
