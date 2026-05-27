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

### About Section Removal
- Removing a nav section should include its nav item entry, render switch branch, dedicated view component, and any page-only styles to avoid dead UI wiring
- A focused smoke regression can verify removed sections stay absent from the rendered nav without affecting remaining navigation
- Validation: baseline build passed; updated build and targeted smoke E2E validation should be rerun after the change
- **Completed (2026-05-29):** Fully removed About section end-to-end (nav item, render branch, component file, styles); added fallback redirect for stale 'about' selectedNavItem; build and targeted E2E tests passed

### Selector Init Settings Implementation
- Added `customApiSelectionInit` and `businessEventSelectionInit` app-level settings (ManagedStateFilter type, default 'all')
- Reused `ManagedStateToggle` in SettingsForm to keep UI consistent with live selector controls
- Settings drive initial filter state on mount only; manual session changes are ephemeral and reset on reload
- Added useEffect in CustomApiSelector and CatalogSelector to initialize from appSettings on component mount
- Business Event init uses semantic mapping: 'all' → `showBusinessEventsOnly=false`, 'managed'/'unmanaged' → `showBusinessEventsOnly=true`
- Validation: build passed, E2E coverage for init behavior passed, settings persist across reload

## Team Updates (Session: 2026-05-29)

**Orchestration Log:** 2026-05-25T23-40-24Z-dallas.md  
**Scope:** About section removal sprint  
**Status:** ✅ Complete — All about-section removal work delivered, validated with build and E2E

## Learnings (Recent Session: 2026-05-26)

### Custom API → Business Event Reverse Navigation
- Reused the existing Business Event → Custom API jump as the model for reverse navigation, but added a parent-level cross-nav handoff in Zustand so Business Events can land on the correct assignment after navigation.
- `pendingBusinessEventAssignmentId` in `src/store/useAppStore.ts` is a short-lived selection intent; it should be cleared after the Business Events page consumes it and also cleared automatically when navigating away from `businessevent`.
- `src/hooks/useCatalogAssignments.tsx` now exposes `useCustomApiCatalogAssignments()` to map a Custom API to one or more catalog assignments plus root/category path labels for chooser UIs.
- `src/components/generic/CustomApiBusinessEventButton.tsx` is the shared entry point for both `src/components/customApiDetails/CustomApiDetails.tsx` and `src/components/customApiTester/CustomApiTester.tsx`.
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx` should guard pending-selection replay until both catalogs and assignments are loaded, otherwise category IDs can be mistaken for root catalog IDs during handoff.
- Validation: baseline `npm run build` passed before changes, and post-change builds passed after implementation and after Ripley-driven follow-up fixes.

## Team Updates (Session: 2026-05-26)

**Orchestration Log:** 2026-05-26T01-53-57Z-Dallas.md  
**Scope:** Custom API to Business Event navigation feature implementation  
**Status:** ✅ Implementation complete — `OpenBusinessEventAction` utility component delivered; Zustand handoff mechanism working; awaiting QA validation from Lambert
 
## Learnings (Recent Session: 2026-06-02)

### Managed Filter Cross-Navigation Handoff
- Button-driven cross-navigation now carries the current managed filter through Zustand instead of letting the destination selector fall back to app settings on mount.
- `src/store/useAppStore.ts` owns two pieces of selector state for this flow: mirrored live filter values (`currentCustomApiSelectionInit`, `currentBusinessEventSelectionInit`) and a short-lived `pendingManagedFilterHandoff` override that is cleared after the destination selector consumes it.
- `src/components\CustomApiSelector.tsx` and `src/components\CatalogSelector.tsx` should treat a consumed handoff like a manual choice by flipping their `*FilterWasChangedRef` guard before applying the override, so async settings hydration cannot immediately overwrite the transferred state.
- Cross-nav buttons live in `src/components/generic/CustomApiBusinessEventButton.tsx` and `src/components/BusinessEventDetails/TreeItemDetailsPanel.tsx`; nav-menu switching still relies on selector remount + settings initialization because no pending handoff is created on nav clicks.
- Validation for this behavior used the existing `npm run build` command successfully after the frontend-only changes.

## Team Updates (Session: 2026-05-26)
 
**Orchestration Log:** 2026-05-26T03-51-58Z-dallas.md  
**Scope:** Button-driven managed filter preservation sprint  
**Status:** ✅ Complete — Filter handoff implementation delivered; build passed; awaiting QA validation from Lambert (21 test cases)

## Learnings (Recent Session: 2026-05-26)

### Business Event Root Catalog Create Flow
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx` keeps the Business Events root-create entry in the card header, using the same secondary `AddCircleColor` action-button styling pattern as Custom API create actions.
- `src/components/BusinessEventDetails/CatalogModal.tsx` is the shared create/edit modal for both root catalogs and child categories; root creation should stay in `create-root` mode instead of spawning a separate dialog.
- Root catalog creation must explicitly clear `_parentcatalogid_value` and suppress parent context UI, while `create-category` continues showing the selected parent catalog.
- Validation for this frontend-only change used the existing `npm run build` command successfully.

## Learnings (Recent Session: 2026-06-02)

### Root Catalog Button Visibility
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx` renders the `New Root Catalog` header action only when `selectedSolutionId` is truthy, so the button is hidden whenever no solution is selected.
- `src/components/CatalogSelector.tsx` owns the Business Events solution picker; the root catalog tree can still render from `selectedCatalogId`, which makes it possible to be on the page with a selected catalog but no visible root-create button.
- `src/store/useAppStore.ts` initializes `selectedSolutionId` to `null` and resets it on connection changes, so solution context must be reselected before the root-create action appears.

## Learnings (Recent Session: 2026-05-26)

### Catalog Create Form UX Tightening
- Removed placeholder text from empty-field inputs (Name, Display Name, Unique Name suffix, Description) because labels already communicate field purpose; placeholders added visual noise without improving usability.
- Reordered create form to move "Add to Solution" to the last position after Description, following the principle that optional metadata fields should trail core entity properties.
- Auto-focus implementation via `useRef<HTMLInputElement>` on Unique Name field when create mode opens (100ms setTimeout to ensure DOM mount): improves keyboard accessibility and reduces initial clicks; Unique Name is the first user-editable field after Publisher (which often pre-populated from settings).
- Preserved publisher-prefix auto-population behavior and Name/Display Name/Description auto-population from suffix to keep existing productivity enhancements intact; these behaviors must be maintained during UX refactors.
- Validation: `npm run build` passed; create form renders with new field order, auto-focus works on both root and category create modes, publisher-prefix behavior working.

## Learnings (Recent Session: 2026-05-26)

### Catalog Create Default Publisher Recovery
- `src/components/BusinessEventDetails/CatalogModal.tsx` now keeps publisher selection in form-owned create state (`_publisherid_value`) and mirrors it to Zustand only for cross-create convenience.
- Async defaults from `src/hooks/useAppSettings.ts` should hydrate once per modal open behind a ref guard; otherwise late settings loads can fight manual publisher changes or clears.
- Catalog create submission in `CatalogModal.tsx` must emit `PublisherId@odata.bind` so the selected publisher reaches Dataverse even though the shared catalog create path does not add that lookup binding itself.
- Preserved create-flow UX baselines in `CatalogModal.tsx`: collapsed publisher summary, publisher-prefix unique-name regeneration on publisher change, unique-name autofocus, Add to Solution last, and no placeholders.
- Validation: baseline `npm run build` passed before the fix, and post-fix `npm run build` passed again after implementation and Ripley re-review.

### Catalog Create Payload Simplification
- `src/components/BusinessEventDetails/CatalogModal.tsx` handleSave method uses explicit field-by-field construction of `CatalogCreateable` payload rather than pass-through spread, preventing accidental inclusion of form-internal state like `_publisherid_value`.
- Explicit payload construction on lines 227-233 includes only the 5 fields actually sent on create: uniquename, name, displayname, description, _parentcatalogid_value.
- Publisher handling remains form-scoped; publisher field does not leak into create request.
- Type safety enforced by `CatalogCreateable` interface to ensure only permitted fields are used.
- Validation: `npm run build` passed; create root/category flows validated; publisher auto-population and unique-name auto-focus preserved.

## Team Updates (Session: 2026-05-26)

**Orchestration Log:** 2026-05-26T19-33-50Z-dallas.md  
**Session Log:** 2026-05-26T19-33-50Z-catalog-payload-cleanup.md  
**Scope:** Catalog create payload construction simplification  
**Requested by:** David Rivard  
**Status:** ✅ Complete — Explicit payload construction delivered; publisher handling and create UX preserved; build passed

## Team Updates (Session: 2026-05-26)

**Orchestration Log:** 20260526-192419-dallas.md  
**Session Log:** 20260526-192419-catalog-publisher-default.md  
**Scope:** Catalog create default publisher recovery sprint  
**Requested by:** David Rivard  
**Status:** ✅ Complete — Default publisher preselection restored; form owns state; build passed; decision merged

## Learnings (Recent Session: 2026-06-03)

### Validation Scope Should Follow Entity Uniqueness Ownership
- Solution-filtered hooks such as `src/hooks/useCustomApis.tsx` and `src/hooks/useCatalogs.tsx` need a companion unfiltered query when create-form validation must enforce globally unique `uniquename` values across Dataverse.
- The clean frontend pattern is to keep display collections filtered for selector UX, but validate against the full authoritative collection via `useAllCustomApis()` / `useAllCatalogs()` plus shared case-insensitive helpers in `src/utils/validation.ts`.
- Request Parameters and Response Properties remain parent-scoped uniqueness checks, so `src/components/requestParameterDetails/RequestParameterCreate.tsx` and `src/components/responsePropertyDetails/ResponsePropertyCreate.tsx` should continue validating against the selected Custom API's own collections rather than a global alias.
- Catalog Assignment duplicate validation now lives in `src/components/BusinessEventDetails/CatalogAssignmentModal.tsx` and treats the `(catalog, object id, object type)` tuple as the uniqueness boundary.
- User preference: duplicate checks must ignore solution-filtered browsing state; selecting a solution should never allow creation of an entity whose duplicate already exists outside the visible subset.

## Team Updates (Session: 2026-06-03)
**Orchestration Log:** 2026-06-03T120000Z-dallas.md  
**Session Log:** 2026-06-03T120000Z-validation-scope.md  
**Scope:** Duplicate validation scope fixes — Custom API, Catalog, Catalog Assignment  
**Requested by:** David Rivard  
**QA Sign-off:** Lambert (Confirmed Custom API and Catalog were broken; Request Parameter/Response Property were already parent-scoped; flagged missing Catalog Assignment duplicate validation)  
**Status:** ✅ Complete — All three scopes corrected; build passed; decisions merged and inbox cleared

## Team Updates (Session: 2026-06-04)

**Orchestration Log:** 2026-06-04T10-00-00Z-dallas.md  
**Session Log:** 2026-06-04T10-00-00Z-catalog-save-react310.md  
**Scope:** React 310 crash fix in CatalogTreeView  
**Requested by:** David Rivard  
**QA Input:** Lambert confirmed hook order was the likely root cause, provided regression checks for root/category create under solution/filter/refetch scenarios, noted watch item around pendingBusinessEventCatalogId lingering if created data never appears  
**Status:** ✅ Complete — Root cause identified and fixed (unconditional hook execution); recent catalog create UX and post-create auto-selection preserved; build succeeded; decision merged and inbox cleared

## Learnings (Recent Session: 2026-05-26)

### Created Catalog Selection Handoff
- New catalogs (root and child) created inside `CatalogModal` need post-create selection so they appear in the Business Event tree/details view.
- Implemented app-state handoff using `pendingBusinessEventCatalogId` to mirror the existing `pendingBusinessEventAssignmentId` pattern for cross-component navigation.
- `CatalogModal.tsx` detects successful catalog creation, stores the created catalog ID, and adjusts `selectedRootCatalogId` if a root was created.
- `BusinessEventDetails.tsx` watches the pending catalog ID, invalidates the catalogs query to refresh data, then auto-selects the new catalog in the tree and details panel.
- Pending state lifecycle: Set on create success → consumed by listening component → cleared after selection completes, preventing stale replay.
- This surgical change avoids threading tree-selection callbacks through modal layers and reuses the proven pending-ID pattern from Business Event assignments.
- Validation: ✅ `npm run build` passed; root create → select → display flow works end-to-end; child create preserves root and selects category; pending state properly cleared.

## Team Updates (Session: 2026-05-26)

**Orchestration Log:** 2026-05-26T18-00-00Z-dallas.md  
**Session Log:** 2026-05-26-created-catalog-selection.md  
**Scope:** Select and display newly created catalogs in Business Event treeview  
**Requested by:** David Rivard  
**QA Input:** Lambert confirmed the missing post-create selection handoff and called out BusinessEventDetails + CatalogSelector/useAppStore as the key surfaces  
**Status:** ✅ Complete — Root catalog create now selects and opens the new root in the tree/details view; child catalog create keeps the correct root selected and selects the new category; added pending catalog handoff in app state to match the existing pending assignment pattern; aligned refresh/selection so the new catalog remains visible after create; build succeeded

## Learnings (Recent Session: 2026-05-26)

### Catalog Create Default Publisher Recovery
- `src/components/BusinessEventDetails/CatalogModal.tsx` now keeps publisher selection in form-owned create state (`_publisherid_value`) and mirrors it to Zustand only for cross-create convenience.
- Async defaults from `src/hooks/useAppSettings.ts` should hydrate once per modal open behind a ref guard; otherwise late settings loads can fight manual publisher changes or clears.
- Catalog create submission in `CatalogModal.tsx` must emit `PublisherId@odata.bind` so the selected publisher reaches Dataverse even though the shared catalog create path does not add that lookup binding itself.
- Preserved create-flow UX baselines in `CatalogModal.tsx`: collapsed publisher summary, publisher-prefix unique-name regeneration on publisher change, unique-name autofocus, Add to Solution last, and no placeholders.
- Validation: baseline `npm run build` passed before the fix, and post-fix `npm run build` passed again after implementation and Ripley re-review.
