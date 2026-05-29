# Usage

This page follows the app's navigation structure so the docs match the product surface.

## Custom API Manager

Use this section when you are defining or maintaining API contracts.

- Browse Custom APIs from the active Dataverse environment
- Scope results by solution and managed state
- Create or edit the main Custom API definition
- Create request parameters and response properties with naming templates from settings
- Switch to a compact tree layout when reviewing larger APIs

This is the best place to prepare API metadata before testing or linking it to Business Events.

## Custom API Tester

Use the tester when you want to validate behavior against a real environment.

- Select a Custom API from the shared selector flow
- Fill generated inputs based on parameter types such as Boolean, DateTime, Entity Reference, and collections
- Supply a bound entity record when the API requires entity context
- Preview the outgoing request before execution
- Review parsed results, raw OData content, and execution timing after a run

When required inputs are missing, the app raises a global warning before execution.

## Business Event Manager

Use this section to organize Dataverse Catalogs and Catalog Assignments.

- Select a root catalog or create one if none exists yet
- Create categories beneath a root catalog
- Create assignments that connect catalog entries to Custom APIs
- Inspect tree items and linked records in the details panel
- Jump directly from an assignment to the related Custom API manager or tester screen

## Settings

The Settings screen controls app defaults and user preferences.

- Default publisher selection
- Request parameter naming template
- Response property naming template
- Initial managed-state filter for Custom APIs
- Initial managed-state filter for Business Events
- Debug tool visibility
- Default Custom API details tree view behavior

See [Settings](/settings) for the current values and what each one does.

## Logs

The Logs section keeps a rolling runtime history for the current app instance, including connection messages and operational feedback.

## Debug Mode

Debug Mode is optional and hidden unless enabled in settings.

- Inspect the live Zustand store as formatted JSON
- Open TanStack Query Devtools in production mode for cached server-state inspection

See [Debug Mode](/debug-mode) for the exact behavior.
