# Examples

## Create a new Custom API

1. Open **Custom APIs**.
2. Select the target solution.
3. Create a new Custom API.
4. Add request parameters and response properties.
5. Save the API definition.

If `defaultPublisherId` is configured, the creation flow starts with that publisher already selected.

## Test a bound Custom API

1. Open **Custom API Tester**.
2. Select an entity-bound Custom API.
3. Choose the bound record when prompted.
4. Fill any required request parameters.
5. Execute the API and review the response and OData panels.

Example request shape:

```json
{
  "operationName": "contoso_DoSomething",
  "operationType": "action",
  "entityName": "account",
  "entityId": "00000000-0000-0000-0000-000000000000",
  "parameters": {
    "contoso_InputValue": "example"
  }
}
```

## Organize a Business Event catalog

1. Open **Business Events**.
2. Create a root catalog if one does not exist yet.
3. Add categories beneath the root.
4. Create catalog assignments for the appropriate Custom APIs.
5. Use the details panel to jump back into the linked Custom API flows.

## Contribute docs content

1. Edit or add Markdown files under `docs/`.
2. Run the docs site locally.
3. Verify navigation, sidebar structure, and code block rendering.
4. Commit the Markdown change and let GitHub Pages publish it.

```bash
npm run docs:dev
```
