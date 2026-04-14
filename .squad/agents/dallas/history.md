# Dallas — History

## Core Context
Joined the PPTB Dataverse Custom API Manager team as Frontend Dev on 2026-02-28.

## Learnings
- UI built with Fluent UI v9 (@fluentui/react-components)
- Theme provider wraps app with webLightTheme/webDarkTheme
- Use makeStyles for component styling
- Component structure: `src/components/` with `generic/` for reusable components and detail views
- Icons from @fluentui/react-icons
- Styles in `src/styles/Styles.ts` (consider component-level styles as it grows)
- Custom API Tester: `src/components/customApiTester/CustomApiTester.tsx` (main), `RequestPanel.tsx` (request UI)
- Connection state in Zustand store includes `connection.url` for building OData URLs
- OData URL format for Custom APIs: Global vs Bound (Entity/EntityCollection), Action vs Function
- Utility functions placed in `src/utils/` - created `odataUrl.ts` for URL building logic

### 2026-03-01: Cross-Agent Update from Ripley Review
- Component structure validation complete
- Detail view pattern: `src/components/<feature>Details/` for entity edit views
- Current styles centralized - may benefit from component-level organization as project grows

### 2026-03-03: Issue #54 - OData URL Display
- Added OData URL display in Custom API Tester when OData toggle is enabled
- Created `buildCustomApiODataUrl` utility function in `src/utils/odataUrl.ts`
- URL appears above JSON payload with copy-to-clipboard button
- Supports all binding types (Global, Entity, EntityCollection) and parameter formatting
- URL updates reactively as parameters and bound record change
- Used memoization (useMemo) for efficient URL building

### 2026-03-03: Issue #56 - OData Card Consolidation
- Created dedicated `ODataCard.tsx` component in `src/components/customApiTester/`
- Consolidated OData info: Request URL, Request Body (for Actions), Response JSON
- Removed OData toggles from RequestPanel and ResponsePanel
- Moved single OData toggle to Test Custom API card header (action slot)
- OData Card visibility controlled by toggle state in CustomApiTester
- Card placed below Request/Response panels when visible
- Pattern: Use card-level actions for feature toggles, keep individual panels focused

### 2026-03-09: Issue #65 - Selector Redesign
- Redesigned `CustomApiSelector.tsx` and `CatalogSelector.tsx` with new layout
- Primary picker (Custom API / Catalog) now comes FIRST for better UX
- Solution picker moved to collapsible "Filters" section (collapsed by default)
- Single Managed/Unmanaged toggle in filters section applies to solution list filtering
- Filter badge shows count of active filters (e.g., "Filters (2)")
- Empty state messages shown when filters yield no results
- Collapse state is component-local (useState), not persisted
- Pattern: Collapsible sections use ChevronRightRegular / ChevronDownRegular icons with subtle Button
- Reusable `ManagedStateToggle` component from `src/components/generic/ManagedStateToggle.tsx`
- Fluent UI `flexColumnM` style used for vertical layout with medium spacing

### 2026-03-12: Issue #66 - Compact Tree View Toggle
- Created `src/components/customApiDetails/CustomApiTreeView.tsx` - tree view component for Custom API inspection
- Uses Fluent UI Tree component (`Tree`, `TreeItem`, `TreeItemLayout`) for expandable/collapsible structure
- Tree displays: Custom API details, Request Parameters (with count), Response Properties (with count)
- Boolean flags (Is Function, Is Private, Workflow Enabled) shown with checkmark/dismiss icons
- Parameter/property types displayed with type labels; optional params have "Optional" badge
- Toggle Switch added to CardHeader badge group, only visible in read mode when a Custom API is selected
- When tree view is active, hides RequestParameterDetails and ResponsePropertyDetails cards
- Component uses local `makeStyles` for tree-specific styling (component-level styles pattern)
- Key files: `CustomApiDetails.tsx` (toggle state + conditional rendering), `CustomApiTreeView.tsx` (tree component)

### 2026-04-11: Issue #69 - Business Event (Catalog) Management UI
- Implemented full UI layer for Business Events (Catalogs and CatalogAssignments)
- Created `src/components/BusinessEventDetails/` folder with:
  - `BusinessEventDetails.tsx` - Main container with CatalogSelector and tree view
  - `CatalogTreeView.tsx` - Hierarchical tree view (Root Catalog → Category → Assignment)
  - `CatalogModal.tsx` - Create/Edit modal for Catalogs (supports root + category modes)
  - `CatalogAssignmentModal.tsx` - Create/Edit modal for Assignments (Custom API selector)
  - `ConfirmDialog.tsx` - Reusable confirmation dialog for delete operations
- Enhanced `src/hooks/useCatalogs.tsx`:
  - Added `useRootCatalogs()` for solution-scoped root catalogs
  - Added `useCatalogChildren()` for fetching category children
  - Added notifications to all mutations
- Enhanced `src/hooks/useCatalogAssignments.tsx`:
  - Added `useCatalogAssignmentsByCatalog()` for catalog-scoped assignments
  - Added `useCreateCatalogAssignment()`, `useUpdateCatalogAssignment()`, `useDeleteCatalogAssignment()` mutations
  - Cache invalidation includes both solution-level and catalog-level queries
- Added `catalogChildren` query key to `src/utils/queryKeys.ts`
- Updated `src/components/App.tsx` to route 'businessevent' nav item to BusinessEventDetails
- Tree component uses local `makeStyles` for tree-specific styling (component-level pattern)
- CRUD operations only available for unmanaged records (ismanaged=false check)
- Managed records show lock badge and hide edit/delete buttons
- Pattern: Fluent UI Tree with nested TreeItem components for hierarchical data
- Pattern: Modal dialogs with validation, loading states, and notifications

### 2025-01-XX: CatalogAssignment Model Contract Update
- Updated UI components to use new API contract from Kane after removal of fake `catalogassignmenttype` field
- `CatalogTreeView.tsx`: Replaced switch statement on `catalogassignmenttype` with `getObjectTypeLabel(objectidtype)` and `getObjectTypeIcon(objectidtype)`
- `CatalogAssignmentModal.tsx`: Replaced `selectedType` (numeric optionset) state with `selectedObjectType` (entity logical name string like 'customapi')
- Type dropdown now uses `ObjectIdTypeLabels` mapping (entity logical name → display label)
- Create payload no longer includes `catalogassignmenttype` — Dataverse sets `objectidtype` automatically based on the bound object lookup
- Pattern: When Dataverse populates derived fields automatically, don't send them in create payload
- Pattern: Use entity logical names (strings) directly as type identifiers when that's what Dataverse stores

