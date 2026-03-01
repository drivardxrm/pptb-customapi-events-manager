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
