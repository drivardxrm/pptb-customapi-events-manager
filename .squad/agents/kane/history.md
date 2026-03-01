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
