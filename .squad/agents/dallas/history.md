# Dallas — History

## Core Context

Joined PPTB Dataverse Custom API Manager team as Frontend Dev on 2026-02-28.

**UI Architecture:** Fluent UI v9; component-scoped styling via makeStyles; webLightTheme/webDarkTheme provider.

**Selector Pattern:** Primary picker first; collapsible Filters section (Solution/Managed scoping); auto-collapse on selection; collapsed summary badges for active filters. Solution managed toggle is contextual (counts as filter only when solution selected).

**Data Layer:** TanStack Query (solution-scoped cache keys); Zustand store (connection/selection/editing state); EntityService base class (CRUD via window.dataverseAPI).

**Tree View:** Conditional rendering with hierarchical display; tree-to-form handoff requires two-phase state transitions. Entering tree view clears child selections. Edit actions use pending ID handoff pattern. Tree-originated flows return via completion callbacks; manual toggle clears return intent.

**Business Events UI:** Full CRUD for Catalog/CatalogAssignment; tree view for hierarchy; modals for create/edit; API integration.

**Key Pattern:** React max-depth errors in tree-view remounts prevent pre-selection during transitions. Safe pattern: exit tree → store pending ID → child mounts → detects pending → selects → enters edit.

**Consolidated Learnings Summary (Historical):**
- Tree-view handoff: Two-phase transitions with explicit cache invalidation and idempotent store setters required
- GenericTagPicker stability: Memoized arrays essential; stale selection resets must be dependency-tracked
- Dialog/modal state: Reset on entry/exit; memoization of option arrays prevents cascading re-renders
- Filter state preservation: Button-nav preserves transient filters; menu-nav applies settings defaults
- Selector auto-behavior: Expand on nav-entry (invite browsing), collapse on selection (reduce clutter); manual toggles always honored
- About section removal: End-to-end cleanup includes nav item, render branch, component file, page styles, settings fallback
- Unique Name focus: Must be in create-form components, not confirmation dialogs; async-safe via useEffect watching form readiness

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

## Team Updates (Session: 2026-05-27)

**Spawn:** Zustand doc removal + Catalog/Business Event UX polish

**Completed Work:**
- Removed standalone `ZUSTAND.md`; consolidated guidance into `.github/copilot-instructions.md`
- Fixed Catalog Assignment Custom API picker scope (uses `useAllCustomApis()` for source, solution context controls destination)
- Fixed Business Event chooser catalog resolution (uses `useAllCatalogs()` for path label resolution across solution boundaries)
- Added Business Event empty state with global message + inline "New Root Catalog" action (mirrors Custom API pattern)
- Brought Catalog edit modal to UX parity: Parent Catalog visible for categories, Unique Name always readonly
- Enforced managed-record restriction in tree-view Edit action; added defensive guard in handler

**QA Reviews:** 6 comprehensive regression checklists from Lambert covering all Dallas deliverables; all passed
**Code Review:** Ripley approved all changes; no material issues
**Build Status:** All changes validated with `npm run build` — passing

**Decisions Merged:** 13 inbox entries consolidated into decisions.md (6 Dallas decisions + 6 Lambert QA reviews + 1 Ripley cleanup decision)
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

## Learnings (Recent Session: 2026-05-26)

### Assignment Solution Selector Pattern
- Catalog assignments can now be assigned to an unmanaged solution at create time via the `CatalogAssignmentModal`.
- Reused the existing create-dialog pattern: unmanaged solutions only appear in the picker (managed solutions filtered out).
- The assignment modal preselects the currently active unmanaged solution when opened in create mode.
- Selected solution unique name is passed through the create mutation path via `solutionUniqueName` field.
- Edit mode behavior remains unchanged — solution selection only applies on creation, not on edit.
- Pattern consistency: mirrors the existing create-time solution context pattern used for Custom API and Catalog creation.
- Validation: ✅ `npm run build` passed; unmanaged-only filtering works; preselection and clear-to-default behavior stable; create mutation passes solution unique name correctly; edit flows unaffected.

## Team Updates (Session: 2026-05-26)

**Orchestration Log:** 20260526-201420-dallas.md  
**Session Log:** 20260526-201420-assignment-solution-selector.md  
**Scope:** Add unmanaged solution selector to CatalogAssignmentModal create mode  
**Requested by:** David Rivard  
**QA Validated by:** Lambert (Confirmed unmanaged-only selection, unmanaged preselection, clear-to-default behavior, stable in-modal selection; noted post-save visibility/selection consistency as watch item)  
**Status:** ✅ Complete — Unmanaged solution picker added to create mode; preselection on open; mutation integration; edit mode unchanged; build passed; decision merged

## Learnings (Recent Session: 2026-05-27)

### Business Event Empty State Action Parity
- `src/components/BusinessEventDetails/BusinessEventDetails.tsx` should mirror `src/components/customApiDetails/CustomApiDetails.tsx` for no-selection guidance by using a top-level `setGlobalMessage(...)` info message with an inline CTA, not just the card-body info box.

## Learnings (Recent Session: 2026-05-28)

### README Feature Documentation Strategy
- README should organize Features by main navigation sections (Custom API Manager, Custom API Tester, Business Event Manager) to match the actual UI navigation.
- Feature extraction scanned: `App.tsx` (nav structure), `CustomApiDetails.tsx` (CRUD, tree view, entity binding), `CustomApiTester.tsx` (execution, dynamic params, performance), `BusinessEventDetails.tsx` (catalog browsing, event subscriptions, tree nav), `DebugView.tsx` (store inspection), `SettingsForm.tsx` (all 7 settings with descriptions).
- Included actionable emojis for visual scanning; template syntax documented for parameter/response naming settings.
- Added explicit Debug Mode section with 4 capabilities (store inspector, state inspection, collapsible view, theme support).
- Added Settings & Configuration section documenting all 7 current settings with templates and scope (connection-scoped for defaultPublisherId).
- Design decision: Subsections promote discoverability and help users understand feature scope without searching code.
- Exact copy requested for the Business Event empty state: `No Root Catalog selected. Select a Root Catalog below or create a new one.` with CTA label `New Root Catalog` and `AddCircleColor`.
- Keep the existing Business Event header action/button behavior intact; the empty-state message is additive guidance and should not change the tree/details selection flow.
- Validation: `npm run build` passed after the frontend-only update.


## Learnings (Recent Session: 2026-05-27)

### Catalog Edit Modal Context Parity
- `src/components/BusinessEventDetails/CatalogModal.tsx` should keep immutable catalog identity/context visible in edit mode: always show `uniquename` as a readonly filled-darker input, and show the Parent Catalog section whenever the edited catalog is a category.
- When edit mode does not receive the parent catalog as a prop, resolve it from `useAllCatalogs()` with `_parentcatalogid_value`, then fall back to Dataverse's formatted lookup annotation `_parentcatalogid_value@OData.Community.Display.V1.FormattedValue` for display-only context.
- Preserve existing create-root and create-category behavior; this change is edit-mode parity, not a create-flow redesign.
- Validation: `npm run build` passed after the frontend-only update.

## Learnings (Recent Session: 2026-05-27)

### Managed Custom API Tree Action Parity
- `src/components/customApiDetails/CustomApiTreeView.tsx` should hide the root Custom API Edit action when `api.ismanaged`, matching the existing managed restrictions already applied to delete and child create actions in tree view.
- `src/components/customApiDetails/CustomApiDetails.tsx` should keep a defensive `handleEdit` guard for `selectedCustomApi.ismanaged` so tree/form callbacks cannot enter edit mode for managed records if a future caller bypasses button visibility.
- Preserve unmanaged edit entry and all other tree actions unchanged; this is a parity fix for managed-record restrictions, not a broader tree interaction redesign.
- Validation: baseline and post-change `npm run build` passed, and Ripley reviewed the diff with no issues.

## Learnings (Recent Session: 2026-05-27)

### Catalog Assignment Custom API Picker Scope
- `src/components/BusinessEventDetails/CatalogAssignmentModal.tsx` must source Custom API create-mode options from `useAllCustomApis()` instead of `useCustomApis()` so a selected solution does not hide assignable APIs outside that solution.
- Keep solution context split by responsibility: the Custom API picker chooses from the full assignable collection, while the modal's unmanaged solution picker still decides where the new assignment record is added.
- Preserve existing unmanaged-only assignment behavior for Custom API options; this fix is about removing solution scoping from the source picker, not changing create permissions or mutation contracts.
- Stabilizing the picker data with `useMemo` keeps the option array aligned with the GenericTagPicker stability guidance while making the scope change.
- Validation: baseline and post-change `npm run build` passed, and Ripley code review found no material issues.

## Learnings (Recent Session: 2026-05-27)

### Request/Response Create Unique Name Focus
- `src/components\requestParameterDetails\RequestParameterCreate.tsx` and `src/components\responsePropertyDetails\ResponsePropertyCreate.tsx` should own create-entry focus by attaching a ref to the Unique Name `Input` and focusing it once when required async data (`appsettings`, `customapis`) is ready.
- These create forms can mount through both the normal header-button path and the treeview handoff path, so the focus behavior must live in the create component itself rather than the later confirmation dialog.
- Guard the focus effect with a one-time ref so React Query updates do not steal focus again after the user starts typing.
- Preserve existing create/edit mode behavior and treeview return flow; this is a create-form usability improvement only.
- Validation: `npm run build` passed after the change, and Ripley reviewed the final diff with no material issues.

## Learnings (Recent Session: 2026-05-27)

### Business Event Chooser Catalog Path Resolution
- `src/hooks/useCatalogAssignments.tsx` should resolve Custom API chooser catalog paths from `useAllCatalogs()` rather than solution-filtered `useCatalogs()`, because assignment rows are global and filtered catalog collections can degrade valid rows to `Unknown Catalog`.
- Build a `Map` by `catalogid` and walk `_parentcatalogid_value` upward until the top ancestor so the chooser can consistently reconstruct the root/category path from any assigned category.
- Keep `src/components/generic/CustomApiBusinessEventButton.tsx` as a pure consumer of the hook output so the existing open-business-event pending-selection handoff stays intact.
- Validation: baseline `npm run build` passed, post-change `npm run build` passed, and Ripley code review found no material issues.

## Learnings (Recent Session: 2026-05-27)

### Zustand Guidance Consolidation
- `ZUSTAND.md` was removable because the durable app-state guidance already belongs in `.github/copilot-instructions.md` beside the rest of the project architecture notes.
- When removing a standalone reference doc, update the surviving architecture entry point immediately so future contributors do not inherit dead links or split guidance.
- For this repo, the key durable Zustand note worth keeping close to the architecture overview is selector-based `useAppStore(...)` subscriptions in components, while imperative access stays available through `useAppStore.getState()`.
- Validation: baseline and post-change `npm run build` passed, and Ripley code review found no material issues.

### Public Release Cleanup (2026-05-27)
- Executed first batch: removed .vscode/, .copilot/, .work-folder-info, .vfsmeta/, playwright-report/, 	est-results/
- Updated .gitignore with /.copilot/ and /.work-folder-info/ rules
- Deferred .squad/ removal — critical to active session team memory and routing; handle in post-session cleanup batch
- Confirmed 	est-logic.ts and ZUSTAND.md already absent (previously decided removals)
- Rationale: cleanup in batches minimizes mid-flight disruption while making incremental progress toward public-release readiness

## Team Updates (Session: 2026-05-27)

**README Marketplace Refresh Sprint**

**Orchestration Logs:** 2026-05-27T03-13-23Z-dallas.md  
**Session Log:** 2026-05-27T03-13-23Z-readme-marketplace-refresh.md  

**Sprint Summary:** Multi-agent iterative README refinement to marketplace-ready state.

**Dallas Role:** Authored initial marketplace-facing README revision with user value proposition, separate concern sections (What It Does, For Developers, Installation), expanded tech stack rationale, and removed GitHub-repo noise.

**Team Participation:**
- Lambert: Comprehensive marketplace readiness review; identified 8 critical gaps (feature overview, user persona, use cases, requirements clarity, tech context, support paths, installation clarity)
- Ripley: Finalized README addressing all gaps; added feature list, persona clarity, explicit requirements, live support paths; removed dead links and placeholders; improved from ⭐⭐ to ⭐⭐⭐⭐ marketplace readiness
- Ripley: Post-fix removed unsupported GitHub Discussions link per David Rivard's feedback

**Status:** ✅ Complete — README now marketplace-ready; all inbox decisions merged to decisions.md; orchestration and session logs written; Scribe tasks complete

## Team Updates (Session: 2026-05-27)

**Spawn:** Update README Features section to match main navigation structure

**Orchestration Log:** 2026-05-27T22-03-44Z-dallas.md  
**Session Log:** 2026-05-27T22-03-44Z-readme-features.md  
**Scope:** README Features documentation reorganization  
**Status:** ✅ Complete — README Features section reorganized with nav-aligned subsections, emojis, template documentation, debug mode section, and settings reference; decision merged to decisions.md

## Team Updates (Session: 2026-05-28)
**Spawn:** Add immer in the tech stack  
**Orchestration Log:** 2026-05-28T22-39-52Z-dallas.md  
**Session Log:** 2026-05-28T22-39-52Z-immer-readme.md  
**Request by:** David Rivard  
**Scope:** README.md tech stack update  
**Status:** ✅ Complete — Tech stack section updated to include Immer with purpose note describing immutable state management capability

## Team Updates (Session: 2026-05-28)
**Spawn:** Update TanStack Query tech stack description  
**Orchestration Log:** 2026-05-28T22-41-40Z-Dallas.md  
**Session Log:** 2026-05-28T22-41-40Z-tanstack-readme.md  
**Requested by:** David Rivard  
**Scope:** Clarify TanStack Query role in tech stack  
**Change:** Updated README.md line 70 to include data fetching and async state management context while preserving solution-scoped caching information  
**Status:** ✅ Complete — Tech stack description updated to emphasize data fetching and async state management alongside caching

## Learnings (Recent Session: 2026-05-29)

### Pre-release UI Readability Pass — Safe First Batch
- In `src/components/BusinessEventDetails/`, keep runtime component/state terminology aligned with Fluent UI by using `Dialog` names (`CatalogDialog`, `CatalogAssignmentDialog`, `catalogDialogOpen`, `assignmentDialogOpen`) even when file names stay stable to avoid noisy file churn.
- Low-risk readability fixes in the UI layer can safely bundle obvious typo cleanup with terminology cleanup, such as log-message spacing in mutation hooks and sourcing shared types like `LogEntry` from the actual store module that owns the data.
- `src/hooks/useToolboxEvents.ts` had dead duplicate `refreshConnection()` lines after the connection-event cases; removing that unreachable block is a safe mechanical cleanup that preserves behavior while making the event flow easier to read.
- Validation: `npm run build` passed after the readability batch, and Ripley re-review found no material issues.

---

## Pre-Release Readability Pass (2026-05-28)

### Dallas UI Layer Cleanup
Completed Phase 1 UI-layer readability cleanup focusing on Dialog terminology standardization:
- **Dialog Terminology:** CatalogModal → CatalogDialog, CatalogAssignmentModal → CatalogAssignmentDialog, CatalogModalMode → CatalogDialogMode
- **State Variables:** catalogModalOpen → catalogDialogOpen, assignmentModalOpen → assignmentDialogOpen
- **Handler Functions:** handleCatalogModalClose() → handleCatalogDialogClose()
- **Files Modified:** BusinessEventDetails.tsx (58 lines of mechanical rewiring), Dialog component renames, index.ts exports
- **Validation:** npm run build ✅; npm run test:e2e (44 passed, 3 skipped) ✅
- **Risk Assessment:** VERY LOW — pure renaming, no behavioral changes
- **Branch:** refactor/pre-release-readability-pass
- **Guardrails Established:** Use Dialog nomenclature exclusively for all new modular content overlays; Modal terminology deprecated

## Learnings (Recent Session: 2026-05-29)

### Fluent Icons Build Repair
- This app imports `@fluentui/react-icons` directly across `src/components/` and `src/models/`, so the package must be declared explicitly in `package.json` instead of relying on it arriving transitively through `@fluentui/react-components`.
- A broken local install can leave `node_modules\@fluentui\react-icons\lib\icons\chunk-*.js` and `lib\sizedIcons\chunk-*.js` missing even though the published tarball includes them; reinstalling the package restores the missing runtime files and clears Vite's `Could not resolve './icons/chunk-0'` failure.
- Validation for this failure mode is `npm run build`; once the icon chunks are present again, the build completes and only the existing Vite bundle-size and `import.meta` warnings remain.

## Team Updates (Session: 2026-05-29)

**Spawn:** Resolve @fluentui/react-icons build failure  
**Orchestration Log:** 2026-05-29T04-01-58Z-Dallas.md  
**Session Log:** 2026-05-29T04-01-58Z-fluent-build-fix.md  
**Issue:** Vite build failed with `[UNRESOLVED_IMPORT]` error: `./icons/chunk-0` not found  
**Root Cause:** Package imported directly but not declared as manifest dependency; corrupted local install missing chunk files  
**Solution:** Declared `@fluentui/react-icons@^2.0.328` explicitly in package.json and reinstalled  
**Validation:** ✅ `npm run build` now passes  
**Status:** ✅ Complete — Dependency ownership claim implemented; build restored

## Learnings (Recent Session: 2026-06-04)

### PPTB Package Entry Should Target Built HTML
- PPTB package publishing should point `package.json` `main` at `dist/index.html`, not the repo-root Vite source `index.html`, because npm auto-includes the declared main file even when it sits outside the `files` whitelist.
- In this repo, keeping `"files": ["dist", "npm-shrinkwrap.json"]` while switching `main` to `dist/index.html` preserves the intended package entry behavior and prevents the extra root `index.html` from shipping.
- Validation for this packaging-only change is `npm pack --dry-run`; no frontend build rerun is needed when the already-built `dist/index.html` remains the entry artifact.
- Key files: `package.json`, `.npmignore`, `dist/index.html`.

## Team Updates (Session: 2026-05-29)

**Orchestration Log:** 2026-05-29T16-39-58Z-Dallas.md  
**Session Log:** 2026-05-29T16-39-58Z-package-entry-fix.md  
**Scope:** Remove unintended root index.html from published npm package  
**Requested by:** Scribe (End-of-session wrap-up)  
**Status:** ✅ Complete — Package entry point corrected to dist/index.html; npm tarball no longer includes root HTML file; dev server unaffected
