# Ripley — History

## Core Context
Joined the PPTB Dataverse Custom API Manager team as Lead on 2026-02-28.

## Learnings
- Initial team formation with Dallas (Frontend), Kane (Backend), Lambert (Tester)

### 2026-02-28: Project Structure Review

**Directory Layout:**
- `src/components/` - Feature components + `generic/` for reusable UI + detail views (`customApiDetails/`, etc.)
- `src/models/` - Entity interfaces (Full/Createable/Updateable patterns) + OptionSets + Lookups
- `src/services/` - Entity services extending `EntityService` base class
- `src/hooks/` - TanStack Query hooks (`use<Entity>s.tsx`) + PPTB integration hooks
- `src/store/` - Zustand store (`useAppStore.ts`)
- `src/utils/` - diff.ts, queryKeys.ts, notify.ts, validation.ts, string.ts
- `src/styles/` - Shared Fluent UI styles (Styles.ts)
- `src/assets/` - Static images (logos, icons)

**Key Architectural Patterns:**
1. **Model Pattern**: Full interface → Createable/Updateable picks → Lookups mapping → OptionSets → DEFAULT_CREATE_TEMPLATE
2. **Service Pattern**: Abstract `EntityService` base with `entityName`, `entityCollectionName`, `componenttype`; FetchXML for complex queries
3. **Hook Pattern**: Query + mutation hooks in single file per entity, solution-scoped cache keys
4. **Diff Utilities**: `buildCreatePayload()` / `buildUpdatePayload()` handle OData binding automatically
5. **IIFE Build**: Custom Vite plugin for PPTB iframe compatibility (no ES modules)

**Key Files:**
- Entry: `src/main.tsx` → `src/components/App.tsx`
- Store: `src/store/useAppStore.ts` (connection, selections, editing lock, logs, theme)
- Query Keys: `src/utils/queryKeys.ts` (solution-scoped caching)
- Base Service: `src/services/EntityService.ts`

**Strengths:**
- Clean separation of concerns (models/services/hooks/components)
- Consistent entity patterns across CustomApi, RequestParameter, ResponseProperty, Catalog
- Solution-aware caching with `instanceId` + `connectionId` + `solutionId`
- Immutable state updates with Immer
- Good TypeScript coverage with strict typing

**Areas for Attention:**
- No test framework configured (noted in build commands)
- Business Events feature marked as "Coming Soon"
- Some commented-out code in App.tsx and models (cleanup opportunity)
- Single Styles.ts file may grow large - consider component-level styles

### 2026-03-01: Backlog Creation from Codebase Analysis

**Comprehensive Analysis Completed:**
- Analyzed 50+ files across components, models, services, hooks
- Identified 3 TODO comments in active code
- Found "Coming Soon" Business Events feature stub
- Discovered no test files (*.test.*, *.spec.*) exist
- Reviewed validation patterns, error handling, and data flow

**Backlog Categories Created:**
- 50 backlog items across 11 categories
- Prioritized by impact: High (13), Medium (18), Low (19)
- Key findings: Testing infrastructure completely missing, Business Events incomplete, several UX gaps

**High Priority Items Identified:**
1. **B002**: Add Unit Test Framework - No testing infrastructure exists
2. **B003**: Integration tests for TanStack Query hooks
3. **B001**: Complete Business Events feature (currently stubbed)
4. **B007**: Error boundaries for major components
5. **B024**: Validation test suite
6. **B005**: Connection state validation (existing TODO)

**Architectural Observations:**
- Strong entity service pattern consistency (CustomApi, RequestParameter, ResponseProperty, Catalog all follow same model)
- TanStack Query hooks well-structured with solution-scoped caching
- Zustand store properly manages global state with Immer for immutability
- Diff utilities (buildCreatePayload/buildUpdatePayload) handle OData binding correctly
- Missing: Test coverage, Business Events UI, some error boundaries

**Key File Paths for Team:**
- Backlog: `.squad/backlog.md`
- Models pattern: `src/models/CustomApi.ts` (Full/Createable/Updateable/Lookups)
- Service pattern: `src/services/CustomApiService.ts` (extends EntityService)
- Hook pattern: `src/hooks/useCustomApis.tsx` (query + mutations)
- Diff utils: `src/utils/diff.ts` (payload builders)
