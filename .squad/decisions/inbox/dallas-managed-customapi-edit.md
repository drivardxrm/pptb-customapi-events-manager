# Dallas Decision Inbox — Managed Custom API Tree Edit

## What
- Removed the root Custom API Edit action from `src/components/customApiDetails/CustomApiTreeView.tsx` when the selected Custom API is managed.
- Added a matching defensive guard in `src/components/customApiDetails/CustomApiDetails.tsx` so `handleEdit()` exits early for managed Custom APIs.

## Why
- The form/header view already treats managed Custom APIs as non-editable.
- Tree view should enforce the same managed-record restriction so users do not see an edit affordance that the rest of the UI disallows.

## Decision
- Tree-view root edit visibility should follow `!api.ismanaged`.
- Edit handlers should also no-op for managed records as a safety net, even when the UI already hides the action.
- Unmanaged edit behavior and all other tree actions stay unchanged.

## Validation
- Baseline `npm run build` passed before the change.
- Post-change `npm run build` passed after implementation.
- Ripley code review completed with no issues found.
