# Unique Name Focus Review — Request Parameter / Response Property Create Mode

## Decision
Create-entry focus must be owned by the actual create-form components (`RequestParameterCreate.tsx`, `ResponsePropertyCreate.tsx`) or by their immediate create-mode containers, not by the later save confirmation dialogs.

## Why
- The user request is about **entering create mode**, which happens before `RequestParameterCreateDialog` / `ResponsePropertyCreateDialog` ever open.
- Each details panel has two create-entry paths: direct header-button create and tree-view handoff via `creationRequestToken`.
- Both create forms may render `Loading...` before the Unique Name input exists, so a naive one-shot `autoFocus` can miss async-ready renders.

## QA Expectations
1. Direct create for Request Parameter focuses **Unique Name**.
2. Direct create for Response Property focuses **Unique Name**.
3. Tree-view create handoff for both child types also focuses **Unique Name**.
4. Re-entering create after cancel/save still focuses correctly.
5. Edit mode and save confirmation dialogs remain unchanged.

## Likely Missed Surface If Implemented Narrowly
- Focus added only to the button-driven path, but not the tree-view remount path.
- Focus added to confirmation dialogs instead of the actual create form.
- Focus implemented with plain `autoFocus` and missed when the form first shows a loading placeholder.
