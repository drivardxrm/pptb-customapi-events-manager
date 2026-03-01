/**
 * Mock implementation of window.dataverseAPI for E2E testing.
 * Matches the structure of DataverseAPI.API from @pptb/types.
 * Provides test control methods prefixed with __ for setting up mock responses.
 */

interface FetchXmlResult {
  value: Record<string, unknown>[];
  '@odata.context'?: string;
  '@Microsoft.Dynamics.CRM.fetchxmlpagingcookie'?: string;
}

interface CreateResult {
  id: string;
  [key: string]: unknown;
}

interface MockCall {
  method: string;
  args: unknown[];
  timestamp: number;
}

export interface DataverseAPIMock {
  // Core CRUD methods matching DataverseAPI.API
  create: (entityLogicalName: string, record: Record<string, unknown>, connectionTarget?: string) => Promise<CreateResult>;
  retrieve: (entityLogicalName: string, id: string, columns?: string[], connectionTarget?: string) => Promise<Record<string, unknown>>;
  update: (entityLogicalName: string, id: string, record: Record<string, unknown>, connectionTarget?: string) => Promise<void>;
  delete: (entityLogicalName: string, id: string, connectionTarget?: string) => Promise<void>;
  
  // Query methods
  fetchXmlQuery: (fetchXml: string, connectionTarget?: string) => Promise<FetchXmlResult>;
  retrieveMultiple: (fetchXml: string, connectionTarget?: string) => Promise<FetchXmlResult>;
  
  // Execute method
  execute: (request: unknown, connectionTarget?: string) => Promise<unknown>;
  
  // Metadata methods (simplified mocks)
  getEntityMetadata: (entityLogicalName: string, attributes?: string[], connectionTarget?: string) => Promise<Record<string, unknown>>;
  getAllEntityMetadata: (connectionTarget?: string) => Promise<{ value: Record<string, unknown>[] }>;
  
  // Test control methods
  __setFetchXmlResult: (result: FetchXmlResult) => void;
  __setFetchXmlResultForEntity: (entityName: string, result: FetchXmlResult) => void;
  __setRetrieveResult: (entityLogicalName: string, id: string, result: Record<string, unknown>) => void;
  __setCreateResult: (result: CreateResult) => void;
  __setExecuteResult: (result: unknown) => void;
  __setEntityMetadata: (entityLogicalName: string, metadata: Record<string, unknown>) => void;
  __getCalls: () => MockCall[];
  __getCallsByMethod: (method: string) => MockCall[];
  __reset: () => void;
}

function createDataverseAPIMock(): DataverseAPIMock {
  let calls: MockCall[] = [];
  let fetchXmlResult: FetchXmlResult = { value: [] };
  let fetchXmlResultsByEntity: Map<string, FetchXmlResult> = new Map();
  let retrieveResults: Map<string, Record<string, unknown>> = new Map();
  let createResult: CreateResult = { id: 'mock-created-id' };
  let executeResult: unknown = {};
  let entityMetadata: Map<string, Record<string, unknown>> = new Map();

  const recordCall = (method: string, args: unknown[]) => {
    calls.push({ method, args, timestamp: Date.now() });
  };

  // Extract entity name from FetchXML for entity-specific results
  const extractEntityFromFetchXml = (fetchXml: string): string | null => {
    const match = fetchXml.match(/<entity\s+name=["']([^"']+)["']/i);
    return match ? match[1] : null;
  };

  return {
    // Core CRUD methods
    create: async (entityLogicalName: string, record: Record<string, unknown>, connectionTarget?: string): Promise<CreateResult> => {
      recordCall('create', [entityLogicalName, record, connectionTarget]);
      return createResult;
    },

    retrieve: async (entityLogicalName: string, id: string, columns?: string[], connectionTarget?: string): Promise<Record<string, unknown>> => {
      recordCall('retrieve', [entityLogicalName, id, columns, connectionTarget]);
      const key = `${entityLogicalName}:${id}`;
      return retrieveResults.get(key) || {};
    },

    update: async (entityLogicalName: string, id: string, record: Record<string, unknown>, connectionTarget?: string): Promise<void> => {
      recordCall('update', [entityLogicalName, id, record, connectionTarget]);
    },

    delete: async (entityLogicalName: string, id: string, connectionTarget?: string): Promise<void> => {
      recordCall('delete', [entityLogicalName, id, connectionTarget]);
    },

    // Query methods
    fetchXmlQuery: async (fetchXml: string, connectionTarget?: string): Promise<FetchXmlResult> => {
      recordCall('fetchXmlQuery', [fetchXml, connectionTarget]);
      const entityName = extractEntityFromFetchXml(fetchXml);
      if (entityName && fetchXmlResultsByEntity.has(entityName)) {
        return fetchXmlResultsByEntity.get(entityName)!;
      }
      return fetchXmlResult;
    },

    retrieveMultiple: async (fetchXml: string, connectionTarget?: string): Promise<FetchXmlResult> => {
      recordCall('retrieveMultiple', [fetchXml, connectionTarget]);
      const entityName = extractEntityFromFetchXml(fetchXml);
      if (entityName && fetchXmlResultsByEntity.has(entityName)) {
        return fetchXmlResultsByEntity.get(entityName)!;
      }
      return fetchXmlResult;
    },

    // Execute method
    execute: async (request: unknown, connectionTarget?: string): Promise<unknown> => {
      recordCall('execute', [request, connectionTarget]);
      return executeResult;
    },

    // Metadata methods
    getEntityMetadata: async (entityLogicalName: string, attributes?: string[], connectionTarget?: string): Promise<Record<string, unknown>> => {
      recordCall('getEntityMetadata', [entityLogicalName, attributes, connectionTarget]);
      return entityMetadata.get(entityLogicalName) || { LogicalName: entityLogicalName };
    },

    getAllEntityMetadata: async (connectionTarget?: string): Promise<{ value: Record<string, unknown>[] }> => {
      recordCall('getAllEntityMetadata', [connectionTarget]);
      return { value: Array.from(entityMetadata.values()) };
    },

    // Test control methods
    __setFetchXmlResult: (result: FetchXmlResult) => {
      fetchXmlResult = result;
    },

    __setFetchXmlResultForEntity: (entityName: string, result: FetchXmlResult) => {
      fetchXmlResultsByEntity.set(entityName, result);
    },

    __setRetrieveResult: (entityLogicalName: string, id: string, result: Record<string, unknown>) => {
      retrieveResults.set(`${entityLogicalName}:${id}`, result);
    },

    __setCreateResult: (result: CreateResult) => {
      createResult = result;
    },

    __setExecuteResult: (result: unknown) => {
      executeResult = result;
    },

    __setEntityMetadata: (entityLogicalName: string, metadata: Record<string, unknown>) => {
      entityMetadata.set(entityLogicalName, metadata);
    },

    __getCalls: () => [...calls],

    __getCallsByMethod: (method: string) => calls.filter(c => c.method === method),

    __reset: () => {
      calls = [];
      fetchXmlResult = { value: [] };
      fetchXmlResultsByEntity.clear();
      retrieveResults.clear();
      createResult = { id: 'mock-created-id' };
      executeResult = {};
      entityMetadata.clear();
    },
  };
}

export const dataverseAPIMock = createDataverseAPIMock();
