# Debug Mode

Debug Mode is intentionally opt-in.

## How it is enabled

Set **Show Debug Tools** to enabled in the Settings screen. When this setting is off:

- the **Debug** navigation item is hidden
- the app redirects away from the debug surface if it is currently selected
- TanStack Query Devtools stay disabled

## What Debug Mode includes

### Zustand Store view

The debug page renders the live global store as formatted JSON. This helps contributors inspect:

- selected connection and navigation state
- current selections for Custom APIs, catalogs, request parameters, and response properties
- global messages
- recent runtime logs

### TanStack Query Devtools

When debug mode is on, the app mounts the production React Query Devtools so contributors can inspect cached server state and query keys during live sessions.

## When to use it

Debug Mode is useful when you are:

- tracing selector state handoffs between manager and tester flows
- checking connection-scoped settings behavior
- inspecting query cache invalidation after create, update, or delete operations
- validating why a surface is showing a particular record or message
