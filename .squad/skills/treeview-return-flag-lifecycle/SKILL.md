# TreeView Return Flag Lifecycle

## When to Use
Use this pattern when a tree or compact navigator can launch a form flow that should return to the navigator after save/cancel.

## Rule
Treat "return to tree after action" as a short-lived intent for one specific launched action, not as sticky UI state.

## Required Lifecycle
1. Set the return flag only when the action is launched from tree view.
2. Clear the flag on successful completion.
3. Clear the flag on explicit cancel.
4. Clear the flag on any alternate escape path that unmounts or dismisses the launched form without using the normal callback path (for example toggling back to tree view, changing parent selection, or otherwise remounting the child boundary).
5. Clear any queued create token or pending edit id for that abandoned tree-launched child flow at the same time, so returning to form view cannot replay the stale handoff.

## Testing Guidance
Cover both:
- happy path: tree-originated action returns to tree after save/cancel
- leak prevention: abandon a tree-originated form through another navigation path, then verify a later non-tree action does not inherit tree-return behavior
- toggle-away/toggle-back regression: start from tree, abandon the child form through the Tree/Form switch, return to form view, launch a normal header action, and confirm cancel/save stays in form view

## Review Heuristic
- Only require the manual Tree/Form toggle regression for flows where that switch remains reachable while the launched form is active. If the parent edit flow leaves read mode and the switch is not rendered, that particular leak path is not reachable and separate cleanup for it is unnecessary.
