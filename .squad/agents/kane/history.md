# Kane — History

## Core Context
Joined the PPTB Dataverse Custom API Manager team as Backend Dev on 2026-02-28.

## Learnings
- Entity services use EntityService base class with abstract entityName, entityCollectionName
- CRUD via window.dataverseAPI
- FetchXML for complex queries (e.g., solution-filtered data)
- Diff utilities: buildCreatePayload() / buildUpdatePayload() handle OData binding automatically
- Query keys in `src/utils/queryKeys.ts` with solution-scoped caching (instanceId + connectionId + solutionId)
- TanStack Query with staleTime: Infinity (no auto-refetch)

### 2026-03-01: Cross-Agent Update from Ripley Review
- Service pattern validated across CustomApi, RequestParameter, ResponseProperty, Catalog
- Hook pattern: Query + mutation hooks in single file per entity
- Diff utility coverage: OData binding handled automatically for lookup fields
- Strong TypeScript coverage with strict typing throughout

### 2026-03-02: Query Key Optimization (#47)
- Query keys standardized to `[scope, instanceId, connectionId, ...specificParams]` structure
- Key categories: app-level (appsettings), solution-scoped (customapis, catalogs), child entities (requestparameters, responseproperties), reference data (plugintypes, privileges, etc.)
- Moving entity-specific params to end enables future partial invalidation by prefix
- `react-query-key-manager` used for typed key definitions

### 2026-03-08: Business Event (Catalog) Models & Services (#69)
- Enhanced `src/models/Catalog.ts`: Added `_publisherid_value` with lookup metadata, renamed template to `DEFAULT_CATALOG_CREATE_TEMPLATE`
- Enhanced `src/models/CatalogAssignment.ts`: Added `catalogassignmenttype` optionset (0=Table, 1=CustomAPI, 2=CustomProcessAction), `getCatalogAssignmentTypeOptions()` helper, icons, `DEFAULT_ASSIGNMENT_CREATE_TEMPLATE` defaulting to CustomAPI
- Created `src/services/PublisherService.ts` for Publisher entity lookup binding
- Enhanced `src/services/CatalogService.ts`: Added `fetchRootCatalogs()` and `fetchCategoryChildren()` methods, publisher lookup
- Enhanced `src/services/CatalogAssignmentService.ts`: Added `fetchSolutionAssignments()`, `fetchAssignmentsByCatalog()`, `createCatalogAssignment()` with polymorphic object binding, `updateCatalogAssignment()`
- Added `catalogassignmentsByCatalog` query key for catalog-scoped assignment queries
- Polymorphic lookups (like `_object_value`) require special handling — skip in buildCreatePayload and manually construct OData bind
- Catalog componenttype = 10017, CatalogAssignment componenttype = 10018

### 2025-01-XX: CatalogAssignment Model Correction
- Removed fabricated `catalogassignmenttype` optionset field — does not exist in Dataverse entity
- Assignment type is derived from `objectidtype` field (contains entity logical name: 'customapi', 'entity', 'workflow')
- Added helper functions: `getObjectTypeLabel()`, `getObjectTypeIcon()`, `ObjectIdTypeLabels`, `objectIdTypeIcons`
- Dataverse populates `objectidtype` automatically when the polymorphic `_object_value` lookup is bound
- UI components (`CatalogTreeView.tsx`, `CatalogAssignmentModal.tsx`) need updates by Dallas
