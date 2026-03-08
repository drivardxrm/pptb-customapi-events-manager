# Copilot Instructions

## Build Commands

```bash
npm run build       # TypeScript compile + Vite build
npm run dev         # Development server with HMR
npm run preview     # Preview production build
```

No test framework is currently configured.

## Architecture Overview

This is a **Power Platform ToolBox (PPTB) tool** - a React SPA that runs inside the PPTB host application to manage Dataverse Custom APIs and Business Events.

### Host Integration

The app runs in an iframe within PPTB and communicates via global APIs:
- `window.toolboxAPI` - Host app interactions (connections, events, notifications, themes)
- `window.dataverseAPI` - Dataverse Web API operations (query, create, update, delete, execute)

Types come from `@pptb/types` (see `tsconfig.json`).

### Vite Configuration

The build outputs IIFE format (not ES modules) for iframe `srcdoc` compatibility:
- `format: 'iife'` with `inlineDynamicImports: true`
- Custom plugin moves scripts to body end and removes `type="module"`

### State Management

**Zustand** for global state (`src/store/useAppStore.ts`):
- Connection state (active Dataverse environment)
- UI selections (selected solution, Custom API, nav item)
- Editing lock state
- Event logs and global messages
- Theme (synced with PPTB host)

Access outside React: `useAppStore.getState().someAction()`

See `ZUSTAND.md` for detailed patterns.

### Data Layer

**TanStack Query** for server state with solution-scoped caching:
- Query keys include `connectionId`, `instanceId`, and `solutionId` for cache isolation
- Keys defined in `src/utils/queryKeys.ts` using `react-query-key-manager`
- `staleTime: Infinity` - data doesn't auto-refetch

### Service Pattern

Entity services extend `EntityService` base class (`src/services/EntityService.ts`):
- Abstract `entityName`, `entityCollectionName`, and optional `componenttype`
- CRUD operations via `window.dataverseAPI`
- `addToSolution()` for solution-aware operations
- FetchXML for complex queries (e.g., solution-filtered data)

### Model Pattern

Models in `src/models/` define:
- Full entity interface (e.g., `CustomApi`)
- `*Createable` interface - properties allowed at creation
- `*Updateable` interface - properties that can be modified
- `*Lookups` - maps lookup fields to `[ODataPropertyName, EntityService]` for relationship binding
- OptionSet constants with display labels and icons
- `DEFAULT_CREATE_TEMPLATE` for new record defaults

### Diff Utilities

`src/utils/diff.ts` builds Dataverse payloads:
- `buildCreatePayload()` - converts create interface to OData payload
- `buildUpdatePayload()` - only includes changed fields
- Handles lookup field `@odata.bind` formatting automatically

## Key Conventions

### Hook Organization

Custom hooks in `src/hooks/`:
- `use<Entity>s.tsx` - TanStack Query hooks for entity CRUD (query + mutations)
- `useConnectionSync.ts` - Subscribes to PPTB connection events, updates store
- `useToolBoxEvents.ts` - General PPTB event subscriptions

### Component Structure

- `src/components/` - Feature components
- `src/components/generic/` - Reusable UI components
- `src/components/<feature>Details/` - Detail/edit views for entities

### UI Framework

**Fluent UI React v9** (`@fluentui/react-components`):
- Theme provider wraps app with `webLightTheme`/`webDarkTheme`
- Use `makeStyles` for component styling (see `src/styles/`)
- **Always use `className` with Griffel `makeStyles` — never inline styles**
- Icons from `@fluentui/react-icons`

### Lookup Field Naming

Dataverse lookup fields use `_fieldname_value` pattern:
- `_plugintypeid_value` - the GUID
- `_plugintypeid_value@OData.Community.Display.V1.FormattedValue` - display name
- `_plugintypeid_value@Microsoft.Dynamics.CRM.lookuplogicalname` - target entity
