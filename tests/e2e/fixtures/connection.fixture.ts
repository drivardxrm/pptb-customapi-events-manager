/**
 * Test fixtures for connection state.
 * Uses DataverseConnection structure from @pptb/types.
 */

export interface TestConnection {
  id: string;
  name: string;
  url: string;
  environment: 'Dev' | 'Test' | 'UAT' | 'Production';
  createdAt: string;
  lastUsedAt?: string;
}

/**
 * Standard test connection for most E2E tests.
 */
export const mockConnection: TestConnection = {
  id: 'test-connection-id',
  name: 'Test Environment',
  url: 'https://test-org.crm.dynamics.com',
  environment: 'Dev',
  createdAt: new Date().toISOString(),
  lastUsedAt: new Date().toISOString(),
};

/**
 * Connection with minimal data.
 */
export const minimalConnection: TestConnection = {
  id: 'minimal-connection-id',
  name: 'Minimal Environment',
  url: 'https://minimal-org.crm.dynamics.com',
  environment: 'Test',
  createdAt: new Date().toISOString(),
};

/**
 * Standard test solutions for solution picker.
 */
export const mockSolutions = {
  value: [
    {
      solutionid: 'solution-1',
      uniquename: 'TestSolution',
      friendlyname: 'Test Solution',
      version: '1.0.0.0',
      ismanaged: false,
      publisherid: {
        customizationprefix: 'test',
      },
    },
    {
      solutionid: 'solution-2',
      uniquename: 'AnotherSolution',
      friendlyname: 'Another Solution',
      version: '2.0.0.0',
      ismanaged: false,
      publisherid: {
        customizationprefix: 'other',
      },
    },
  ],
};
