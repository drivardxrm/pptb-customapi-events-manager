---
name: "dataverse-polymorphic-lookup-binding"
description: "Building Dataverse create/update payloads for multi-table lookup columns"
domain: "dataverse-webapi"
confidence: "high"
source: "manual"
---

## Context
Use this pattern when a Dataverse lookup column can target more than one table and the model exposes annotations like `'_field_value@Microsoft.Dynamics.CRM.associatednavigationproperty'` and `'_field_value@Microsoft.Dynamics.CRM.lookuplogicalname'`. Generic lookup helpers that work for single-table lookups are not sufficient unless they can emit the exact navigation property name required by metadata.

## Patterns

### Bind polymorphic lookups with the navigation property, not the lookup property
For multi-table lookups, the payload key must be the single-valued navigation property name plus `@odata.bind`, not a display-style alias or the raw lookup property. Dataverse expects names like `<lookupfield>_<targetentity>@odata.bind` (for example `customerid_account@odata.bind`) or the exact value exposed by `associatednavigationproperty`.

### Use metadata/annotations as the source of truth
If the app already reads `@Microsoft.Dynamics.CRM.associatednavigationproperty`, reuse that value or derive the same pattern from metadata. This is safer than hardcoding friendly names such as `Object@odata.bind`, which may not exist in the entity schema.

### Polymorphic lookups still need the correct entity set
The right-hand side of the bind must target the correct Dataverse entity set, e.g. `/customapis(<guid>)`. Even if the GUID is correct, Dataverse will reject the payload if the left-hand navigation property name is not declared in metadata.

## Examples

```ts
// Wrong for a multi-table lookup when "Object" is not a declared nav property
payload['Object@odata.bind'] = `customapis(${id})`;

// Right pattern: use the actual navigation property name from metadata
payload['objectid_customapi@odata.bind'] = `customapis(${id})`;
```

## Anti-Patterns
- **Using friendly labels as OData property names** — names like `Object@odata.bind` can trigger `An undeclared property ... only has property annotations`.
- **Assuming the lookup property name equals the navigation property name** — that only reliably holds for non-polymorphic lookups.
