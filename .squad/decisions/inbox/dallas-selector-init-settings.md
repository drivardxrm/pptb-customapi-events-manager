# Dallas Decision: Selector init settings

- Added `customApiSelectionInit` and `businessEventSelectionInit` as app-level settings with default `all`.
- Reused `ManagedStateToggle` in `SettingsForm` so the settings UI matches the live selector control exactly.
- Applied each setting only as the initial non-solution managed-state filter value; once a user manually changes that filter in-session, settings no longer override it.
- Kept these settings global rather than connection-scoped because they represent user browsing preference, not environment data.
