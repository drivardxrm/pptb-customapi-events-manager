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
  readonly customApiPicker: Locator;

  // Custom API list (uses combobox picker, not DataGrid)
  readonly customApiDataGrid: Locator;
  readonly loadingSpinner: Locator;
  readonly loadingText: Locator;

  // Custom API details card
  readonly customApiDetailsCard: Locator;
  readonly noSelectionMessage: Locator;

  // Custom API action buttons
  readonly newCustomApiButton: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Custom API form fields
  readonly uniqueNameInput: Locator;
  readonly nameInput: Locator;
  readonly displayNameInput: Locator;
  readonly descriptionTextarea: Locator;

  // Create/Delete dialogs
  readonly createDialog: Locator;
  readonly deleteDialog: Locator;
  readonly dialogConfirmButton: Locator;
  readonly dialogCancelButton: Locator;

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

    // Custom API list - Uses GenericTagPicker (combobox), not DataGrid
    this.customApiDataGrid = page.locator('[role="grid"]'); // Keep for backward compat but won't exist
    // Get the Custom API selector section (second formSection in the CustomApiSelector component)
    const customApiSelectorCard = page.locator('.fui-Card').filter({ hasText: 'Selected Custom API' });
    this.customApiPicker = customApiSelectorCard.locator('.fui-Field').filter({ hasText: 'Selected Custom API' }).locator('[role="combobox"]');
    this.solutionPicker = customApiSelectorCard.locator('.fui-Field').filter({ hasText: 'Selected Solution' }).locator('[role="combobox"]');
    this.loadingSpinner = page.locator('.fui-Spinner');
    this.loadingText = page.getByText(/loading custom apis/i);

    // Custom API details - the separate details card
    this.customApiDetailsCard = page.locator('.fui-Card').filter({ hasText: 'Custom API Details' });
    this.noSelectionMessage = this.customApiDetailsCard.getByText(/no custom api selected/i);

    // Action buttons (these appear in the card header)
    // Use the New Custom API button in the details card (not the message bar)
    this.newCustomApiButton = this.customApiDetailsCard.getByRole('button', { name: /new custom api/i });
    this.editButton = this.customApiDetailsCard.getByRole('button', { name: /^edit$/i });
    this.deleteButton = this.customApiDetailsCard.getByRole('button', { name: /^delete$/i });
    this.saveButton = page.getByRole('button', { name: /^save$/i });
    this.cancelButton = page.getByRole('button', { name: /^cancel$/i });

    // Form inputs - locate within the form context
    this.uniqueNameInput = page.locator('input').filter({ has: page.locator('[aria-label*="Unique Name"], label:has-text("Unique Name")') }).first();
    this.nameInput = page.locator('input').filter({ has: page.locator('[aria-label*="Name"]:not([aria-label*="Unique"]):not([aria-label*="Display"])') }).first();
    this.displayNameInput = page.locator('input').filter({ has: page.locator('[aria-label*="Display Name"]') }).first();
    this.descriptionTextarea = page.locator('textarea');

    // Dialogs
    this.createDialog = page.getByRole('dialog').filter({ hasText: /confirm custom api creation/i });
    this.deleteDialog = page.getByRole('dialog').filter({ hasText: /delete custom api/i });
    this.dialogConfirmButton = page.getByRole('dialog').getByRole('button', { name: /confirm|delete/i });
    this.dialogCancelButton = page.getByRole('dialog').getByRole('button', { name: /cancel/i });
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

  // ============================================
  // Custom API List Methods
  // ============================================

  /**
   * Wait for the Custom API list to load.
   */
  async waitForCustomApiListLoad(): Promise<void> {
    // Wait for loading indicator to disappear
    await this.loadingText.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      // May not have shown loading state at all
    });
    
    // Wait for either the Custom API picker OR the no-selection message
    // Using race approach to avoid strict mode issues
    await Promise.race([
      this.customApiPicker.waitFor({ state: 'visible', timeout: 10000 }),
      this.noSelectionMessage.waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {
      // One of them should be visible
    });
  }

  /**
   * Get all Custom API rows in the data grid (legacy - not used with picker UI).
   */
  getCustomApiRows(): Locator {
    return this.customApiDataGrid.locator('[role="row"]').filter({ hasNot: this.page.locator('[role="columnheader"]') });
  }

  /**
   * Get a specific Custom API row by unique name (legacy - not used with picker UI).
   */
  getCustomApiRowByUniqueName(uniqueName: string): Locator {
    return this.customApiDataGrid.locator('[role="row"]').filter({ hasText: uniqueName });
  }

  /**
   * Select a Custom API from the picker by unique name.
   */
  async selectCustomApiByUniqueName(uniqueName: string): Promise<void> {
    // Click the Custom API picker to open it
    await this.customApiPicker.click();
    
    // Wait for dropdown options to appear
    await this.page.waitForTimeout(300);
    
    // Find and click the option containing the unique name
    const option = this.page.locator('[role="option"], [role="listbox"] [role="option"]').filter({ hasText: uniqueName });
    await option.click();
    
    // Wait for selection to register
    await this.page.waitForTimeout(200);
  }

  /**
   * Get the count of Custom APIs in the list (from picker options).
   */
  async getCustomApiCount(): Promise<number> {
    // Open picker to count options
    await this.customApiPicker.click();
    await this.page.waitForTimeout(300);
    const options = this.page.locator('[role="option"]');
    const count = await options.count();
    // Press Escape to close the picker
    await this.page.keyboard.press('Escape');
    return count;
  }

  // ============================================
  // Custom API Details Methods
  // ============================================

  /**
   * Wait for Custom API details to load after selection.
   */
  async waitForCustomApiDetails(): Promise<void> {
    // Wait for the details card to show something other than "no selection"
    await expect(this.noSelectionMessage).toBeHidden({ timeout: 5000 }).catch(() => {
      // May still show no selection - that's valid
    });
  }

  /**
   * Get the currently displayed unique name in details view.
   */
  async getDisplayedUniqueName(): Promise<string> {
    // In read mode, find the input with "Unique Name" label
    const input = this.page.getByRole('textbox').filter({ 
      has: this.page.locator('xpath=./preceding::*[contains(text(), "Unique Name")]')
    }).first();
    
    // Fallback: find any input containing the unique name pattern
    const allInputs = this.page.locator('input[readonly]');
    const count = await allInputs.count();
    for (let i = 0; i < count; i++) {
      const value = await allInputs.nth(i).inputValue();
      if (value && value.includes('_')) {
        return value;
      }
    }
    return '';
  }

  /**
   * Click the New Custom API button to enter create mode.
   */
  async clickNewCustomApi(): Promise<void> {
    await this.newCustomApiButton.click();
    // Wait for create form to appear
    await this.page.waitForTimeout(300);
  }

  /**
   * Click the Edit button to enter edit mode.
   */
  async clickEdit(): Promise<void> {
    await this.editButton.click();
    await this.page.waitForTimeout(200);
  }

  /**
   * Click the Delete button to open delete confirmation.
   */
  async clickDelete(): Promise<void> {
    await this.deleteButton.click();
    await expect(this.deleteDialog).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click Save button.
   */
  async clickSave(): Promise<void> {
    await this.saveButton.click();
  }

  /**
   * Click Cancel button.
   */
  async clickCancel(): Promise<void> {
    await this.cancelButton.click();
  }

  // ============================================
  // Form Interaction Methods
  // ============================================

  /**
   * Fill in the create/edit form fields.
   */
  async fillCustomApiForm(data: {
    uniqueName?: string;
    name?: string;
    displayName?: string;
    description?: string;
  }): Promise<void> {
    // Fill fields that are provided
    if (data.uniqueName !== undefined) {
      const uniqueNameField = this.page.getByLabel(/unique name/i);
      await uniqueNameField.fill(data.uniqueName);
    }
    if (data.name !== undefined) {
      // Get the Name field (not Unique Name, not Display Name)
      const nameFields = this.page.locator('.fui-Field').filter({ hasText: /^Name$/i }).locator('input');
      if (await nameFields.count() > 0) {
        await nameFields.first().fill(data.name);
      }
    }
    if (data.displayName !== undefined) {
      const displayNameField = this.page.getByLabel(/display name/i);
      await displayNameField.fill(data.displayName);
    }
    if (data.description !== undefined) {
      await this.descriptionTextarea.fill(data.description);
    }
  }

  /**
   * Get the value of a form field.
   */
  async getFormFieldValue(fieldLabel: string): Promise<string> {
    const field = this.page.getByLabel(new RegExp(fieldLabel, 'i'));
    return await field.inputValue();
  }

  // ============================================
  // Dialog Interaction Methods
  // ============================================

  /**
   * Confirm the create dialog.
   */
  async confirmCreateDialog(): Promise<void> {
    await expect(this.createDialog).toBeVisible({ timeout: 5000 });
    const confirmBtn = this.createDialog.getByRole('button', { name: /confirm/i });
    await confirmBtn.click();
  }

  /**
   * Cancel the create dialog.
   */
  async cancelCreateDialog(): Promise<void> {
    await expect(this.createDialog).toBeVisible({ timeout: 5000 });
    const cancelBtn = this.createDialog.getByRole('button', { name: /cancel/i });
    await cancelBtn.click();
    await expect(this.createDialog).toBeHidden({ timeout: 5000 });
  }

  /**
   * Confirm the delete dialog.
   */
  async confirmDeleteDialog(): Promise<void> {
    await expect(this.deleteDialog).toBeVisible({ timeout: 5000 });
    const confirmBtn = this.deleteDialog.getByRole('button', { name: /delete/i });
    await confirmBtn.click();
  }

  /**
   * Cancel the delete dialog.
   */
  async cancelDeleteDialog(): Promise<void> {
    await expect(this.deleteDialog).toBeVisible({ timeout: 5000 });
    const cancelBtn = this.deleteDialog.getByRole('button', { name: /cancel/i });
    await cancelBtn.click();
    await expect(this.deleteDialog).toBeHidden({ timeout: 5000 });
  }

  // ============================================
  // Mock Setup Helpers
  // ============================================

  /**
   * Set mock Custom API data before navigation.
   */
  async setupCustomApiMocks(customApis: { value: unknown[] }): Promise<void> {
    await this.page.addInitScript((apis) => {
      const waitForMocks = () => {
        if (window.dataverseAPI?.__setFetchXmlResultForEntity) {
          (window.dataverseAPI as unknown as { __setFetchXmlResultForEntity: (e: string, r: unknown) => void }).__setFetchXmlResultForEntity('customapi', apis);
        } else {
          setTimeout(waitForMocks, 10);
        }
      };
      waitForMocks();
    }, customApis);
  }

  /**
   * Set mock create result.
   */
  async setupCreateMock(result: { id: string }): Promise<void> {
    await this.page.addInitScript((res) => {
      const waitForMocks = () => {
        if (window.dataverseAPI?.__setCreateResult) {
          (window.dataverseAPI as unknown as { __setCreateResult: (r: unknown) => void }).__setCreateResult(res);
        } else {
          setTimeout(waitForMocks, 10);
        }
      };
      waitForMocks();
    }, result);
  }

  /**
   * Get mock calls for verification.
   */
  async getMockCalls(method: string): Promise<unknown[]> {
    return await this.page.evaluate((m) => {
      return (window.dataverseAPI as unknown as { __getCallsByMethod: (method: string) => unknown[] }).__getCallsByMethod?.(m) ?? [];
    }, method);
  }
}
