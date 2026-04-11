import { defineQueryKeys, key } from "react-query-key-manager";

// Query keys follow a hierarchical structure for efficient cache management:
// [scope, instanceId, connectionId, ...specificParams]
// This enables partial invalidation by scope or connection when needed.
// Define your query keys
export const queryKeys = defineQueryKeys("keys", {
  appsettings: key((connectionId: string, instanceId: string) => ['appsettings', instanceId, connectionId]),
  customapis: key((connectionId: string, instanceId: string, solutionId: string) => ['customapis', instanceId, connectionId, solutionId]),
  catalogs: key((connectionId: string, instanceId: string, solutionId: string) => ['catalogs', instanceId, connectionId, solutionId]),
  catalogChildren: key((parentCatalogId: string, connectionId: string, instanceId: string) => ['catalogchildren', instanceId, connectionId, parentCatalogId]),
  catalogassignments: key((connectionId: string, instanceId: string, solutionId: string) => ['catalogassignments', instanceId, connectionId, solutionId]),
  catalogassignmentsByCatalog: key((catalogId: string, connectionId: string, instanceId: string) => ['catalogassignmentsbycatalog', instanceId, connectionId, catalogId]),
  requestparameters: key((customApiId: string, connectionId: string, instanceId: string) => ['customapirequestparameters', instanceId, connectionId, customApiId]),
  responseproperties: key((customApiId: string, connectionId: string, instanceId: string) => ['customapiresponseproperties', instanceId, connectionId, customApiId]),
  plugintypes: key((connectionId: string, instanceId: string) => ['plugintypes', instanceId, connectionId]),
  privileges: key((connectionId: string, instanceId: string) => ['privileges', instanceId, connectionId]),
  publishers: key((connectionId: string, instanceId: string) => ['publishers', instanceId, connectionId]),
  solutions: key((connectionId: string, instanceId: string) => ['solutions', instanceId, connectionId]),
  solutioncomponents: key((connectionId: string, instanceId: string) => ['solutioncomponents', instanceId, connectionId]),
  entities: key((connectionId: string, instanceId: string) => ['entities', instanceId, connectionId]),
  fxexpressions: key((connectionId: string, instanceId: string) => ['fxexpressions', instanceId, connectionId]),
  
  // Entity-specific queries
  metadata: key((entityLogicalName: string, connectionId: string, instanceId: string) => ['metadata', instanceId, connectionId, entityLogicalName]),
  entityRecords: key((entityLogicalName: string, connectionId: string, instanceId: string) => ['entityRecords', instanceId, connectionId, entityLogicalName]),
  entityAttributes: key((entityLogicalName: string, connectionId: string, instanceId: string) => ['entityAttributes', instanceId, connectionId, entityLogicalName]),
  optionSetValues: key((entityLogicalName: string, attributeLogicalName: string, connectionId: string, instanceId: string) => ['optionSetValues', instanceId, connectionId, entityLogicalName, attributeLogicalName]),
  fxexpression: key((fxexpressionId: string, connectionId: string, instanceId: string) => ['fxexpression', instanceId, connectionId, fxexpressionId]),
  

});





