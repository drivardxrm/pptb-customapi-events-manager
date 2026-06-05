---
name: "runtime-componenttype-resolution"
description: "Resolving Dataverse AddSolutionComponent ComponentType from entity metadata at runtime"
domain: "dataverse-webapi"
confidence: "high"
source: "manual"
---

## Context
Use this pattern when a Dataverse record is created and then added to a solution with `AddSolutionComponent`. If the service hardcodes `ComponentType`, the value can drift from metadata and break portability or future schema changes.

## Patterns

### Use `objecttypecode` from entity metadata as the source of truth
Fetch entity metadata from the `entities` table and read `objecttypecode` for the target logical name. In this repo, `src\hooks\useEntities.tsx` is the shared metadata source for this lookup.

### Keep services runtime-driven
`EntityService.addToSolution()` should accept a runtime `componentType` argument rather than storing hardcoded constants on each service. This keeps entity services aligned with Dataverse metadata and makes the solution-add contract explicit.

### Guard against metadata loading races
When a create mutation depends on entity metadata, do not rely only on whatever is already in hook state. Centralize the lookup behind a shared helper on `useEntities()` that first checks the loaded cache and then awaits the shared entities query via TanStack Query `queryClient.fetchQuery(...)` before resolving `objecttypecode`, so create-in-solution flows still work immediately after app load or reconnect.

## Examples

```ts
const componentType = await ensureEntityObjectTypeCode(customApiService.entityName);
await customApiService.createCustomApi(next, solutionUniqueName, componentType);
```

## Anti-Patterns
- **Hardcoding `componenttype` on services** — these values can drift from Dataverse metadata.
- **Reading metadata from hook state without fallback** — fresh-load create flows can fail before the entities query finishes.
- **Duplicating per-hook metadata fallback blocks** — it is easier to miss a cold-start edge case when each create hook hand-rolls its own component-type lookup.
- **Calling `AddSolutionComponent` without validating the resolved type** — fail fast with a clear error if metadata cannot be resolved.
