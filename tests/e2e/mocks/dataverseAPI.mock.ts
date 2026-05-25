/**
 * Mock implementation of window.dataverseAPI for E2E testing.
 * Matches the structure of DataverseAPI.API from @pptb/types.
 * Provides test control methods prefixed with __ for setting up mock responses.
 */

// Check for pre-configured test data (set by E2E tests via addInitScript)
interface E2ETestDataConnection {
  id: string;
  name: string;
  url: string;
  environment?: string;
  createdAt?: string;
}

interface E2ETestData {
  solutions?: Record<string, unknown>[];
  customApis?: { value: Record<string, unknown>[] };
  createResult?: { id: string };
  connection?: E2ETestDataConnection;
  settings?: Record<string, unknown>;
}

declare global {
  interface Window {
    __E2E_TEST_DATA__?: E2ETestData;
    __E2E_REQUEST_PARAMETERS__?: { value: Record<string, unknown>[] };
    __E2E_RESPONSE_PROPERTIES__?: { value: Record<string, unknown>[] };
  }
}

interface FetchXmlResult {
  value: Record<string, unknown>[];
  '@odata.context'?: string;
  '@Microsoft.Dynamics.CRM.fetchxmlpagingcookie'?: string;
}

interface QueryDataResult {
  value: Record<string, unknown>[];
  '@odata.context'?: string;
  '@odata.nextLink'?: string;
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
  queryData: (odataQuery: string, connectionTarget?: string) => Promise<QueryDataResult>;
  fetchXmlQuery: (fetchXml: string, connectionTarget?: string) => Promise<FetchXmlResult>;
  retrieveMultiple: (fetchXml: string, connectionTarget?: string) => Promise<FetchXmlResult>;
  
  // Solution-specific method
  getSolutions: (columns?: string[], connectionTarget?: string) => Promise<{ value: Record<string, unknown>[] }>;
  
  // Execute method
  execute: (request: unknown, connectionTarget?: string) => Promise<unknown>;
  
  // Metadata methods (simplified mocks)
  getEntityMetadata: (entityLogicalName: string, attributes?: boolean | string[], connectionTarget?: string) => Promise<Record<string, unknown>>;
  getAllEntityMetadata: (connectionTarget?: string) => Promise<{ value: Record<string, unknown>[] }>;
  
  // Test control methods
  __setFetchXmlResult: (result: FetchXmlResult) => void;
  __setFetchXmlResultForEntity: (entityName: string, result: FetchXmlResult) => void;
  __setQueryDataResult: (entityCollectionName: string, result: QueryDataResult) => void;
  __setSolutions: (solutions: Record<string, unknown>[]) => void;
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
  let queryDataResultsByEntity: Map<string, QueryDataResult> = new Map();
  let solutionsResult: Record<string, unknown>[] = [];
  let retrieveResults: Map<string, Record<string, unknown>> = new Map();
  let createResult: CreateResult = { id: 'mock-created-id' };
  let executeResult: unknown = {};
  let entityMetadata: Map<string, Record<string, unknown>> = new Map();
  let initialized = false;

  // Lazy initialization - reads from window.__E2E_TEST_DATA__ on first method call
  const ensureInitialized = () => {
    if (initialized) return;
    initialized = true;
    
    if (typeof window !== 'undefined' && window.__E2E_TEST_DATA__) {
      const data = window.__E2E_TEST_DATA__;
      
      if (data.solutions) {
        solutionsResult = data.solutions;
      }
      if (data.customApis) {
        fetchXmlResultsByEntity.set('customapi', data.customApis);
        queryDataResultsByEntity.set('customapis', data.customApis);
      }
      if (data.createResult) {
        createResult = data.createResult;
      }
    }
    
    // Check for request parameters data
    if (typeof window !== 'undefined' && window.__E2E_REQUEST_PARAMETERS__) {
      fetchXmlResultsByEntity.set('customapirequestparameter', window.__E2E_REQUEST_PARAMETERS__);
      queryDataResultsByEntity.set('customapirequestparameters', window.__E2E_REQUEST_PARAMETERS__);
    }
    
    // Check for response properties data
    if (typeof window !== 'undefined' && window.__E2E_RESPONSE_PROPERTIES__) {
      fetchXmlResultsByEntity.set('customapiresponseproperty', window.__E2E_RESPONSE_PROPERTIES__);
      queryDataResultsByEntity.set('customapiresponseproperties', window.__E2E_RESPONSE_PROPERTIES__);
    }
  };

  const recordCall = (method: string, args: unknown[]) => {
    calls.push({ method, args, timestamp: Date.now() });
  };

  // Extract entity name from FetchXML for entity-specific results
  const extractEntityFromFetchXml = (fetchXml: string): string | null => {
    const match = fetchXml.match(/<entity\s+name=["']([^"']+)["']/i);
    return match ? match[1] : null;
  };

  // Extract entity collection name from OData query
  const extractEntityFromOData = (odataQuery: string): string | null => {
    // Handle queries like "customapis" or "customapis?$filter=..."
    const match = odataQuery.match(/^([a-zA-Z_]+)/);
    return match ? match[1] : null;
  };

  return {
    // Core CRUD methods
    create: async (entityLogicalName: string, record: Record<string, unknown>, connectionTarget?: string): Promise<CreateResult> => {
      ensureInitialized();
      recordCall('create', [entityLogicalName, record, connectionTarget]);
      return createResult;
    },

    retrieve: async (entityLogicalName: string, id: string, columns?: string[], connectionTarget?: string): Promise<Record<string, unknown>> => {
      ensureInitialized();
      recordCall('retrieve', [entityLogicalName, id, columns, connectionTarget]);
      const key = `${entityLogicalName}:${id}`;
      return retrieveResults.get(key) || {};
    },

    update: async (entityLogicalName: string, id: string, record: Record<string, unknown>, connectionTarget?: string): Promise<void> => {
      ensureInitialized();
      recordCall('update', [entityLogicalName, id, record, connectionTarget]);
    },

    delete: async (entityLogicalName: string, id: string, connectionTarget?: string): Promise<void> => {
      ensureInitialized();
      recordCall('delete', [entityLogicalName, id, connectionTarget]);
    },

    // Query methods
    queryData: async (odataQuery: string, connectionTarget?: string): Promise<QueryDataResult> => {
      ensureInitialized();
      recordCall('queryData', [odataQuery, connectionTarget]);
      const entityName = extractEntityFromOData(odataQuery);
      if (entityName && queryDataResultsByEntity.has(entityName)) {
        return queryDataResultsByEntity.get(entityName)!;
      }
      // Fall back to fetchXml results if queryData results not set
      if (entityName && fetchXmlResultsByEntity.has(entityName)) {
        return fetchXmlResultsByEntity.get(entityName)!;
      }
      return { value: [] };
    },

    fetchXmlQuery: async (fetchXml: string, connectionTarget?: string): Promise<FetchXmlResult> => {
      ensureInitialized();
      recordCall('fetchXmlQuery', [fetchXml, connectionTarget]);
      const entityName = extractEntityFromFetchXml(fetchXml);
      if (entityName && fetchXmlResultsByEntity.has(entityName)) {
        return fetchXmlResultsByEntity.get(entityName)!;
      }
      return fetchXmlResult;
    },

    retrieveMultiple: async (fetchXml: string, connectionTarget?: string): Promise<FetchXmlResult> => {
      ensureInitialized();
      recordCall('retrieveMultiple', [fetchXml, connectionTarget]);
      const entityName = extractEntityFromFetchXml(fetchXml);
      if (entityName && fetchXmlResultsByEntity.has(entityName)) {
        return fetchXmlResultsByEntity.get(entityName)!;
      }
      return fetchXmlResult;
    },

    // Solution-specific method
    getSolutions: async (columns?: string[], connectionTarget?: string): Promise<{ value: Record<string, unknown>[] }> => {
      ensureInitialized();
      recordCall('getSolutions', [columns, connectionTarget]);
      return { value: solutionsResult };
    },

    // Execute method
    execute: async (request: unknown, connectionTarget?: string): Promise<unknown> => {
      ensureInitialized();
      recordCall('execute', [request, connectionTarget]);
      return executeResult;
    },

    // Metadata methods
    getEntityMetadata: async (entityLogicalName: string, attributes?: boolean | string[], connectionTarget?: string): Promise<Record<string, unknown>> => {
      ensureInitialized();
      recordCall('getEntityMetadata', [entityLogicalName, attributes, connectionTarget]);
      return entityMetadata.get(entityLogicalName) || { 
        LogicalName: entityLogicalName,
        Attributes: { value: [] },
      };
    },

    getAllEntityMetadata: async (connectionTarget?: string): Promise<{ value: Record<string, unknown>[] }> => {
      ensureInitialized();
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

    __setQueryDataResult: (entityCollectionName: string, result: QueryDataResult) => {
      queryDataResultsByEntity.set(entityCollectionName, result);
    },

    __setSolutions: (solutions: Record<string, unknown>[]) => {
      solutionsResult = solutions;
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
      queryDataResultsByEntity.clear();
      solutionsResult = [];
      retrieveResults.clear();
      createResult = { id: 'mock-created-id' };
      executeResult = {};
      entityMetadata.clear();
    },
  };
}

export const dataverseAPIMock = createDataverseAPIMock();
