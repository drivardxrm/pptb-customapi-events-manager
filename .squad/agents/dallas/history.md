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

