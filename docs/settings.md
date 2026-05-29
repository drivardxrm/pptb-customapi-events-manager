# Settings

The app currently exposes seven persisted settings through the Settings screen.

## Current settings and meaning

| Setting | Default | Scope | Meaning |
| --- | --- | --- | --- |
| `defaultPublisherId` | `null` | Connection-scoped | Preselects the publisher used when creating new Custom APIs and Catalogs. |
| `requestParameterDefaultName` | `{customapiname}-In-{uniquename}` | Global | Template applied when creating new request parameters. |
| `responsePropertyDefaultName` | `{customapiname}-Out-{uniquename}` | Global | Template applied when creating new response properties. |
| `customApiSelectionInit` | `all` | Global | Controls the initial managed-state filter for the Custom API selector. |
| `businessEventSelectionInit` | `all` | Global | Controls the initial managed-state filter for the Business Event selector. |
| `showDebug` | `false` | Global | Enables the Debug navigation item and the debug tooling surface. |
| `showCustomApiDetailsTreeView` | `false` | Global | Opens Custom API details in compact tree view by default. |

## Selection initialization values

Both selector initialization settings use the same value set:

| Value | Meaning |
| --- | --- |
| `all` | Show all records regardless of managed state |
| `managed` | Start filtered to managed records |
| `unmanaged` | Start filtered to unmanaged records |

## Naming template placeholders

The default request and response naming templates are string templates that can include placeholders such as:

- `{customapiname}`
- `{uniquename}`

Example:

```text
contoso_OrderSubmit-In-customerid
contoso_OrderSubmit-Out-resultcode
```

## Operational notes

- `defaultPublisherId` is stored per connection, so different Dataverse environments can use different defaults.
- The two selector initialization settings are read when the app syncs to the active connection.
- `showCustomApiDetailsTreeView` affects the default Custom API presentation, not the Business Event tree.
