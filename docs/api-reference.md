# API Reference

This project is a UI tool rather than a library, so its "API surface" is primarily the host integrations, Dataverse operations, and internal domain models that contributors work with.

## Host integrations

### `window.toolboxAPI`

The PPTB host supplies application-level services such as:

- active connection lookup
- settings persistence
- theme detection
- notifications and host events

### `window.dataverseAPI`

The Dataverse integration layer is used for:

- querying records
- creating records
- updating records
- deleting records
- executing Custom APIs

## Core entities

### Custom API

Represents the main Dataverse Custom API definition. The app supports create, edit, selection, solution scoping, and execution testing.

### Custom API Request Parameter

Represents an input parameter for a Custom API. The app stores and edits parameter metadata, generates create defaults from settings, and turns parameter definitions into tester input controls.

### Custom API Response Property

Represents a response contract field for a Custom API. The tester uses these definitions to help inspect outputs after execution.

### Catalog

Represents a Dataverse Business Event catalog or category. The Business Event Manager displays these in a tree and allows create/edit operations.

### Catalog Assignment

Represents the link between a catalog entry and its assigned object, including Custom APIs.

## Data-layer patterns

### Zustand store

The global store tracks:

- active connection
- selected solution and selected records
- navigation state
- editing locks
- global messages
- event logs

### TanStack Query

Server state is cached with query keys that include:

- `connectionId`
- `instanceId`
- `solutionId` where relevant

This keeps environment and solution state isolated.

### Entity services

Entity services extend a shared base service and centralize CRUD behavior against Dataverse entity collections.

## Reference commands

### Build the app

```bash
npm run build
```

### Run the app locally

```bash
npm run dev
```

### Build the docs site

```bash
npm run docs:build
```

### Run end-to-end tests

```bash
npm run test:e2e
```
