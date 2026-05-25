# Dallas — History

## Core Context

Joined PPTB Dataverse Custom API Manager team as Frontend Dev on 2026-02-28.

**UI Architecture:** Fluent UI v9; component-scoped styling via makeStyles; webLightTheme/webDarkTheme provider.

**Selector Pattern:** Primary picker first; collapsible Filters section (Solution/Managed scoping); auto-collapse on selection; collapsed summary badges for active filters. Solution managed toggle is contextual (counts as filter only when solution selected).

**Data Layer:** TanStack Query (solution-scoped cache keys); Zustand store (connection/selection/editing state); EntityService base class (CRUD via window.dataverseAPI).

**Tree View:** Conditional rendering with hierarchical display; tree-to-form handoff requires two-phase state transitions. Entering tree view clears child selections. Edit actions use pending ID handoff pattern. Tree-originated flows return via completion callbacks; manual toggle clears return intent.

**Business Events UI:** Full CRUD for Catalog/CatalogAssignment; tree view for hierarchy; modals for create/edit; API integration.

**Key Pattern:** React max-depth errors in tree-view remounts prevent pre-selection during transitions. Safe pattern: exit tree → store pending ID → child mounts → detects pending → selects → enters edit.

**Recent Work (2026-05-24 to 2026-05-25):**
- Hardened response-property tree-view create flow (React #185 fix): Cleared stale selections, memoized picker arrays, reset dialog state, made store setters idempotent
- Implemented tree-view edit actions for request parameters and response properties
- Fixed tree-return-intent flag lifecycle (cleared on tree-view re-entry to prevent state leakage)
- Implemented Business Event selector auto-expand on nav entry, auto-collapse on catalog selection
- Extended Custom API selector collapse to cover create-flow entry

## Learnings (Recent Session: 2026-05-25)

### Business Event Selector Filter Expand/Collapse Behavior Implementation
- Auto-expand filters when Business Events nav item becomes active to invite browsing/filtering
- Auto-collapse filters only when catalogId changes to a new non-null value
- Preserves manual filter toggle behavior after both auto-expand and auto-collapse
- Added E2E coverage for nav-entry expansion, managed filtering, selection-collapse
- Validation: ✅ build passed, ✅ targeted E2E tests passed

### Selector Init Settings
- Managed-state filters can hydrate from app settings after async settings load, but should stop auto-syncing once the user manually changes that filter
- Reusing `ManagedStateToggle` in SettingsForm keeps selector behavior and labels aligned with the live filter controls
- Added focused E2E coverage proving settings-driven initial managed filters for both Custom APIs and Business Events
