/**
 * E2E tests for Custom API CRUD operations.
 * 
 * Tests the core user journeys:
 * - Viewing Custom API list
 * - Selecting and viewing Custom API details
 * - Creating a new Custom API
 * - Editing an existing Custom API
 * - Deleting a Custom API
 */

import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';
import { mockConnection, mockSolutions } from '../fixtures/connection.fixture';
import {
  mockCustomApis,
  mockGlobalCustomApi,
  mockEntityBoundCustomApi,
  mockManagedCustomApi,
  emptyCustomApis,
  createCustomApiResult,
} from '../fixtures/custom-api.fixture';

/**
 * Helper to set up test data BEFORE the mocks initialize.
 * Uses window.__E2E_TEST_DATA__ which the mocks read during creation.
 */
async function setupTestData(
  page: import('@playwright/test').Page,
  options: {
    customApis?: { value: unknown[] };
    createResult?: { id: string };
  } = {}
) {
  const apis = options.customApis ?? mockCustomApis;
  const createRes = options.createResult ?? createCustomApiResult;

  // Set up test data BEFORE the page loads - mocks will read this during initialization
  await page.addInitScript(
    ({ connection, solutions, customApis, createResult }) => {
      // This runs before any other scripts, including test-main.tsx
      window.__E2E_TEST_DATA__ = {
        connection: connection,
        solutions: solutions,
        customApis: customApis,
        createResult: createResult,
      };
      console.log('[E2E Test] Pre-configured test data set on window.__E2E_TEST_DATA__');
    },
    {
      connection: mockConnection,
      solutions: mockSolutions.value,
      customApis: apis,
      createResult: createRes,
    }
  );
}

test.describe('Custom API CRUD Operations', () => {
  let appPage: AppPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);

    // Debug logging for errors only
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`[Browser Error]: ${msg.text()}`);
      }
    });
    page.on('pageerror', error => {
      console.log(`[Page Error]: ${error.message}`);
    });
  });

  test.describe('Custom API List', () => {
    test('displays Custom APIs in the picker', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Verify the Custom API picker is visible
      await expect(appPage.customApiPicker).toBeVisible();

      // Click the picker to open it and verify options contain our mock data
      await appPage.customApiPicker.click();
      await page.waitForTimeout(300);
      
      // Verify we can see the mock Custom API in the dropdown
      const option = page.locator('[role="option"]').filter({ hasText: mockGlobalCustomApi.uniquename });
      await expect(option).toBeVisible();
      
      // Close the picker
      await page.keyboard.press('Escape');
    });

    test('shows empty state when no Custom APIs exist', async ({ page }) => {
      await setupTestData(page, { customApis: emptyCustomApis });
      await appPage.goto();
      
      // Should show "No Custom API selected" message in the card when list is empty
      await expect(appPage.noSelectionMessage).toBeVisible({ timeout: 10000 });
    });

    test('app loads without connection errors', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      
      // App should load and show the connected state
      await expect(appPage.root).toBeVisible();
      
      // Connection indicator should show - use first() to avoid strict mode violation
      const connectionBadge = page.getByText('Test Environment').first();
      await expect(connectionBadge).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Custom API Selection', () => {
    test('selecting a Custom API shows its details', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select the global Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);

      // Wait for details to load
      await appPage.waitForCustomApiDetails();

      // Verify the display name appears in the details section
      const displayNameText = page.getByText(mockGlobalCustomApi.displayname);
      await expect(displayNameText).toBeVisible({ timeout: 5000 });
    });

    test('shows Edit and Delete buttons for unmanaged Custom APIs', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select an unmanaged Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Edit and Delete should be visible for unmanaged APIs
      await expect(appPage.editButton).toBeVisible();
      await expect(appPage.deleteButton).toBeVisible();
    });

    test('hides Edit and Delete buttons for managed Custom APIs', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select a managed Custom API
      await appPage.selectCustomApiByUniqueName(mockManagedCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Edit and Delete should NOT be visible for managed APIs
      await expect(appPage.editButton).toBeHidden();
      await expect(appPage.deleteButton).toBeHidden();
    });

    test.skip('displays correct binding type for entity-bound API', async ({ page }) => {
      // TODO: Fix - binding type display depends on details card layout being loaded
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select the entity-bound Custom API
      await appPage.selectCustomApiByUniqueName(mockEntityBoundCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Should show "Entity" binding type
      const bindingTypeText = page.getByText('Entity', { exact: true });
      await expect(bindingTypeText).toBeVisible();

      // Should show the bound entity logical name
      const boundEntityText = page.getByText(mockEntityBoundCustomApi.boundentitylogicalname);
      await expect(boundEntityText).toBeVisible();
    });
  });

  test.describe('Custom API Create', () => {
    test('New Custom API button enters create mode', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Click New Custom API
      await appPage.clickNewCustomApi();

      // Should show Save and Cancel buttons
      await expect(appPage.saveButton).toBeVisible();
      await expect(appPage.cancelButton).toBeVisible();

      // Should show create mode indicator
      const createTitle = page.getByText('Create Custom API');
      await expect(createTitle).toBeVisible();
    });

    test('Cancel button exits create mode without saving', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Enter create mode
      await appPage.clickNewCustomApi();
      await expect(appPage.saveButton).toBeVisible();

      // Click Cancel
      await appPage.clickCancel();

      // Should exit create mode - Save button should be gone
      await expect(appPage.saveButton).toBeHidden();
    });

    test.skip('Save button opens confirmation dialog', async ({ page }) => {
      // TODO: Fix form field selectors - requires more specific locators for Fluent UI form fields
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Enter create mode
      await appPage.clickNewCustomApi();

      // Fill in required fields
      const uniqueNameField = page.getByLabel(/unique name/i);
      const displayNameField = page.getByLabel(/display name/i);
      
      if (await uniqueNameField.isVisible()) {
        await uniqueNameField.fill('test_NewApi');
      }
      if (await displayNameField.isVisible()) {
        await displayNameField.fill('Test New API');
      }

      // Click Save
      await appPage.clickSave();

      // Should open confirmation dialog
      await expect(appPage.createDialog).toBeVisible({ timeout: 5000 });
    });

    test.skip('canceling confirmation dialog keeps form data', async ({ page }) => {
      // TODO: Fix form field selectors - requires more specific locators for Fluent UI form fields
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Enter create mode and fill form
      await appPage.clickNewCustomApi();
      
      const uniqueNameField = page.getByLabel(/unique name/i);
      if (await uniqueNameField.isVisible()) {
        await uniqueNameField.fill('test_KeepThisValue');
      }

      // Open and cancel confirmation dialog
      await appPage.clickSave();
      await appPage.cancelCreateDialog();

      // Form should still be in create mode with data preserved
      await expect(appPage.saveButton).toBeVisible();
    });
  });

  test.describe('Custom API Edit', () => {
    test('Edit button enters edit mode', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select an unmanaged Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Click Edit
      await appPage.clickEdit();

      // Should show Save and Cancel buttons
      await expect(appPage.saveButton).toBeVisible();
      await expect(appPage.cancelButton).toBeVisible();
    });

    test('Cancel button reverts changes and exits edit mode', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select and edit
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();
      await appPage.clickEdit();

      // Modify description
      const descriptionField = page.getByLabel(/description/i);
      if (await descriptionField.isVisible()) {
        await descriptionField.fill('Modified description that should be reverted');
      }

      // Cancel
      await appPage.clickCancel();

      // Should exit edit mode
      await expect(appPage.saveButton).toBeHidden();
    });

    test('Save button calls update API', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select and edit
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();
      await appPage.clickEdit();

      // Modify a field
      const descriptionField = page.getByLabel(/description/i);
      if (await descriptionField.isVisible()) {
        await descriptionField.fill('Updated description via E2E test');
      }

      // Save
      await appPage.clickSave();

      // Verify update was called
      const updateCalls = await appPage.getMockCalls('update');
      expect(updateCalls.length).toBeGreaterThan(0);
    });

    test('tree view edit returns to tree view after cancel and save', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      const treeViewToggle = page.getByRole('switch', { name: /toggle compact tree view/i });
      await treeViewToggle.click();

      const tree = page.getByRole('tree', { name: /custom api tree view/i });
      await expect(tree).toBeVisible();

      await page.getByText(`Custom API: ${mockGlobalCustomApi.displayname}`, { exact: true }).hover();
      await page.locator('button[aria-label="Edit"]').first().click({ force: true });
      await expect(appPage.saveButton).toBeVisible({ timeout: 5000 });

      await appPage.clickCancel();
      await expect(tree).toBeVisible({ timeout: 5000 });
      await expect(appPage.saveButton).toBeHidden();

      await page.getByText(`Custom API: ${mockGlobalCustomApi.displayname}`, { exact: true }).hover();
      await page.locator('button[aria-label="Edit"]').first().click({ force: true });
      await expect(appPage.saveButton).toBeVisible({ timeout: 5000 });

      const descriptionField = page.getByLabel(/description/i);
      if (await descriptionField.isVisible()) {
        await descriptionField.fill('Updated from tree view edit');
      }

      await appPage.clickSave();

      const updateCalls = await appPage.getMockCalls('update');
      expect(updateCalls.length).toBeGreaterThan(0);
      await expect(tree).toBeVisible({ timeout: 5000 });
      await expect(appPage.saveButton).toBeHidden();
    });
  });

  test.describe('Custom API Delete', () => {
    test('Delete button opens confirmation dialog', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select an unmanaged Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Click Delete
      await appPage.clickDelete();

      // Should show delete confirmation dialog
      await expect(appPage.deleteDialog).toBeVisible();
    });

    test('canceling delete dialog keeps Custom API selected', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select and try to delete
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();
      await appPage.clickDelete();

      // Cancel the dialog
      await appPage.cancelDeleteDialog();

      // Custom API should still be visible in details
      const displayNameText = page.getByText(mockGlobalCustomApi.displayname);
      await expect(displayNameText).toBeVisible();
    });

    test('confirming delete calls delete API', async ({ page }) => {
      await setupTestData(page);
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select and delete
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();
      await appPage.clickDelete();

      // Confirm deletion
      await appPage.confirmDeleteDialog();

      // Verify delete was called
      const deleteCalls = await appPage.getMockCalls('delete');
      expect(deleteCalls.length).toBeGreaterThan(0);
    });
  });
});
