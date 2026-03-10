
import { QueryKeyManager, defineKey } from "react-query-key-manager";

// Query keys follow a hierarchical structure for efficient cache management:
// [scope, instanceId, connectionId, ...specificParams]
// This enables partial invalidation by scope or connection when needed.

export const queryKeys = QueryKeyManager.create("keys", {
  // App-level settings
  appsettings: defineKey((connectionId: string, instanceId: string) => ['appsettings', instanceId, connectionId]),

  // Solution-scoped entities (include solutionId for proper isolation)
  customapis: defineKey((connectionId: string, instanceId: string, solutionId: string) => ['customapis', instanceId, connectionId, solutionId]),
  catalogs: defineKey((connectionId: string, instanceId: string, solutionId: string) => ['catalogs', instanceId, connectionId, solutionId]),

  // Custom API child entities (scoped by customApiId, not solution)
  requestparameters: defineKey((customApiId: string, connectionId: string, instanceId: string) => ['customapirequestparameters', instanceId, connectionId, customApiId]),
  responseproperties: defineKey((customApiId: string, connectionId: string, instanceId: string) => ['customapiresponseproperties', instanceId, connectionId, customApiId]),

  // Reference data (connection-scoped, not solution-scoped)
  plugintypes: defineKey((connectionId: string, instanceId: string) => ['plugintypes', instanceId, connectionId]),
  privileges: defineKey((connectionId: string, instanceId: string) => ['privileges', instanceId, connectionId]),
  publishers: defineKey((connectionId: string, instanceId: string) => ['publishers', instanceId, connectionId]),
  solutions: defineKey((connectionId: string, instanceId: string) => ['solutions', instanceId, connectionId]),
  solutioncomponents: defineKey((connectionId: string, instanceId: string) => ['solutioncomponents', instanceId, connectionId]),
  entities: defineKey((connectionId: string, instanceId: string) => ['entities', instanceId, connectionId]),
  fxexpressions: defineKey((connectionId: string, instanceId: string) => ['fxexpressions', instanceId, connectionId]),

  // Entity-specific queries
  metadata: defineKey((entityLogicalName: string, connectionId: string, instanceId: string) => ['metadata', instanceId, connectionId, entityLogicalName]),
  entityRecords: defineKey((entityLogicalName: string, connectionId: string, instanceId: string) => ['entityRecords', instanceId, connectionId, entityLogicalName]),
  entityAttributes: defineKey((entityLogicalName: string, connectionId: string, instanceId: string) => ['entityAttributes', instanceId, connectionId, entityLogicalName]),
  optionSetValues: defineKey((entityLogicalName: string, attributeLogicalName: string, connectionId: string, instanceId: string) => ['optionSetValues', instanceId, connectionId, entityLogicalName, attributeLogicalName]),
  fxexpression: defineKey((fxexpressionId: string, connectionId: string, instanceId: string) => ['fxexpression', instanceId, connectionId, fxexpressionId]),
});

// Debugging — list all registered keys
export const allQueryKeys = QueryKeyManager.getQueryKeys();