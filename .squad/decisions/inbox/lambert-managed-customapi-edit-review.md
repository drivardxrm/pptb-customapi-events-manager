# Managed Custom API Tree Edit Review

**By:** Lambert (Tester)  
**Date:** 2026-05-27  
**Scope:** `src/components/customApiDetails/CustomApiTreeView.tsx`, `src/components/customApiDetails/CustomApiDetails.tsx`, `src/models/CustomApi.ts`

## Decision / QA Position

Tree-view edit for the root Custom API must follow the same managed-state restriction as the header/form path: **managed Custom APIs must not be editable**.

## Findings

1. `CustomApiTreeView.tsx` currently shows the root **Edit** action unconditionally.
2. `CustomApiDetails.tsx` already hides the header edit button when `selectedCustomApi.ismanaged`, so tree view is the inconsistent surface.
3. The tree callback exits tree view and calls `handleEdit(true)`, but `handleEdit()` has no managed-state guard.

## QA Risk

If the implementation only hides the tree button visually, the callback path still exists. Any alternate trigger path (future keyboard shortcut, refactor, stale render, direct callback wiring) could still put a managed Custom API into edit mode.

## Regression Checks Required

- Managed Custom API in tree view: no Edit button, no edit-mode transition.
- Unmanaged Custom API in tree view: Edit still works and preserves the existing return-to-tree flow.
- Managed/unmanaged parity between header actions and tree actions.
- No regression to delete/add gating already based on managed state.
