/**
 * Page object for the main application.
 * Encapsulates selectors and common interactions.
 */

import { type Page, type Locator, expect } from '@playwright/test';

export class AppPage {
  readonly page: Page;
  
  // Main layout elements
  readonly root: Locator;
  readonly navPanel: Locator;
  readonly mainContent: Locator;
  
  // Navigation items
  readonly customApisNavItem: Locator;
  readonly businessEventsNavItem: Locator;
  
  // Connection state
  readonly connectionStatus: Locator;
  readonly solutionPicker: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Main layout - use data-testid attributes where available
    this.root = page.locator('#root');
    this.navPanel = page.locator('[data-testid="nav-panel"]').or(page.locator('nav'));
    this.mainContent = page.locator('[data-testid="main-content"]').or(page.locator('main'));
    
    // Navigation items - use text content as fallback
    this.customApisNavItem = page.getByRole('button', { name: /custom api/i });
    this.businessEventsNavItem = page.getByRole('button', { name: /business event/i });
    
    // Connection elements
    this.connectionStatus = page.locator('[data-testid="connection-status"]');
    this.solutionPicker = page.locator('[data-testid="solution-picker"]').or(page.getByRole('combobox'));
  }

  /**
   * Navigate to the app and wait for it to load.
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForAppReady();
  }

  /**
   * Wait for the app to be fully loaded.
   */
  async waitForAppReady(): Promise<void> {
    // Wait for root to be visible
    await expect(this.root).toBeVisible({ timeout: 10000 });
    
    // Wait for any loading spinners to disappear
    const spinners = this.page.locator('[data-testid="loading"]').or(this.page.locator('.fui-Spinner'));
    await expect(spinners).toHaveCount(0, { timeout: 10000 }).catch(() => {
      // Spinners may not exist, which is fine
    });
  }

  /**
   * Set up the mocks with a connection before loading the app.
   */
  async setupWithConnection(connection: {
    id: string;
    instanceId: string;
    instanceUrl: string;
    environmentName: string;
    userName?: string;
  }): Promise<void> {
    // Set up connection in mock before navigation
    await this.page.addInitScript((conn) => {
      // Wait for mocks to be available
      const checkMocks = () => {
        if (window.toolboxAPI?.__setConnection) {
          window.toolboxAPI.__setConnection(conn);
        } else {
          setTimeout(checkMocks, 10);
        }
      };
      checkMocks();
    }, connection);
  }

  /**
   * Reset all mocks via the browser context.
   */
  async resetMocks(): Promise<void> {
    await this.page.evaluate(() => {
      window.dataverseAPI?.__reset?.();
      window.toolboxAPI?.__reset?.();
    });
  }

  /**
   * Set mock query results for a Dataverse entity.
   */
  async setQueryResult(entitySetName: string, entities: unknown[]): Promise<void> {
    await this.page.evaluate(({ entitySetName, entities }) => {
      window.dataverseAPI?.__setQueryResult?.(entitySetName, { entities });
    }, { entitySetName, entities });
  }

  /**
   * Check if the app shows the disconnected state.
   */
  async expectDisconnectedState(): Promise<void> {
    // Look for "No connection" or similar message
    const noConnection = this.page.getByText(/no connection|not connected|select.*connection/i);
    await expect(noConnection).toBeVisible({ timeout: 5000 });
  }

  /**
   * Check if the app shows the connected state.
   */
  async expectConnectedState(): Promise<void> {
    // When connected, we should see navigation options
    const hasNavigation = await this.navPanel.isVisible().catch(() => false);
    expect(hasNavigation).toBe(true);
  }
}
