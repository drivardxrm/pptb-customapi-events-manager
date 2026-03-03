/**
 * Setup utilities for E2E test mocks.
 * Injects mocks onto window object and provides reset functionality.
 */

import { dataverseAPIMock } from './dataverseAPI.mock';
import { toolboxAPIMock } from './toolboxAPI.mock';

/**
 * Install mocks onto the window object.
 * Call this before the app initializes.
 * 
 * Note: We use 'any' casts here because the mocks are simplified versions
 * of the real APIs, designed for testing purposes only.
 */
export function setupMocks(): void {
  if ((window as unknown as { __e2eMocksInstalled?: boolean }).__e2eMocksInstalled) {
    return;
  }

  // Cast to any to allow mock assignment without type conflicts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).dataverseAPI = dataverseAPIMock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).toolboxAPI = toolboxAPIMock;
  (window as unknown as { __e2eMocksInstalled?: boolean }).__e2eMocksInstalled = true;

  console.log('[E2E] Mocks installed');
}

/**
 * Reset all mocks to their initial state.
 * Call this between tests to ensure clean state.
 */
export function resetMocks(): void {
  dataverseAPIMock.__reset();
  toolboxAPIMock.__reset();
  console.log('[E2E] Mocks reset');
}

export { dataverseAPIMock, toolboxAPIMock };
export type { DataverseAPIMock } from './dataverseAPI.mock';
export type { ToolboxAPIMock } from './toolboxAPI.mock';
