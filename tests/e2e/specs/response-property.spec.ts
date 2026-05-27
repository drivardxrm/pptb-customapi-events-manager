/**
 * E2E tests for Custom API Response Property operations.
 * 
 * Tests the response property management within Custom APIs:
 * - Viewing response properties list
 * - Adding new response properties (for unmanaged APIs)
 * - Deleting response properties
 * - Verifying managed API restrictions
 */

import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';
import { mockConnection, mockSolutions } from '../fixtures/connection.fixture';
import {
  mockCustomApis,
  mockGlobalCustomApi,
  mockManagedCustomApi,
} from '../fixtures/custom-api.fixture';
import {
  emptyRequestParameters,
} from '../fixtures/request-parameter.fixture';
import {
  mockResponsePropertiesForGlobalApi,
  mockStringResponseProperty,
  emptyResponseProperties,
  mockManagedResponseProperty,
} from '../fixtures/response-property.fixture';

/**
 * Helper to set up test data BEFORE the mocks initialize.
 * Uses window.__E2E_TEST_DATA__ which the mocks read during creation.
 */
async function setupTestData(
  page: import('@playwright/test').Page,
  options: {
    customApis?: { value: unknown[] };
    requestParameters?: { value: unknown[] };
    responseProperties?: { value: unknown[] };
  } = {}
) {
  const apis = options.customApis ?? mockCustomApis;
  const params = options.requestParameters ?? emptyRequestParameters;
  const props = options.responseProperties ?? emptyResponseProperties;

  // Set up test data BEFORE the page loads - mocks will read this during initialization
  await page.addInitScript(
    ({ connection, solutions, customApis, requestParameters, responseProperties }) => {
      // This runs before any other scripts, including test-main.tsx
      window.__E2E_TEST_DATA__ = {
        connection: connection,
        solutions: solutions,
        customApis: customApis,
        createResult: { id: 'mock-created-id' },
      };
      
      // Store additional entity data for the mock to pick up
      (window as unknown as { __E2E_REQUEST_PARAMETERS__?: { value: unknown[] } }).__E2E_REQUEST_PARAMETERS__ = requestParameters;
      (window as unknown as { __E2E_RESPONSE_PROPERTIES__?: { value: unknown[] } }).__E2E_RESPONSE_PROPERTIES__ = responseProperties;
      
      console.log('[E2E Test] Pre-configured test data set for response property tests');
    },
    {
      connection: mockConnection,
      solutions: mockSolutions.value,
      customApis: apis,
      requestParameters: params,
      responseProperties: props,
    }
  );

  // Also set up entity-specific results via init script for response properties
  await page.addInitScript(
    ({ requestParameters, responseProperties }) => {
      const waitForMocks = () => {
        if (window.dataverseAPI?.__setFetchXmlResultForEntity) {
          const dataverseAPI = window.dataverseAPI as unknown as {
            __setFetchXmlResultForEntity: (entity: string, result: { value: unknown[] }) => void;
          };
          dataverseAPI.__setFetchXmlResultForEntity('customapirequestparameter', requestParameters);
          dataverseAPI.__setFetchXmlResultForEntity('customapiresponseproperty', responseProperties);
          console.log('[E2E Test] Response properties mock data set');
        } else {
          setTimeout(waitForMocks, 10);
        }
      };
      waitForMocks();
    },
    {
      requestParameters: params,
      responseProperties: props,
    }
  );
}

async function setTreeViewToggle(page: import('@playwright/test').Page, checked: boolean) {
  const treeViewToggle = page.getByRole('switch', { name: /toggle compact tree view/i });
  const isChecked = await treeViewToggle.isChecked();

  if (isChecked !== checked) {
    await treeViewToggle.focus();
    await page.keyboard.press('Space');
  }

  if (checked) {
    await expect(treeViewToggle).toBeChecked();
    return;
  }

  await expect(treeViewToggle).not.toBeChecked();
}

test.describe('Custom API Response Properties', () => {
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

  test.describe('Response Properties List', () => {
    test('properties list loads when Custom API is selected', async ({ page }) => {
      await setupTestData(page, {
        responseProperties: mockResponsePropertiesForGlobalApi,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select the global Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Find the response properties card using direct child selector for the header
      const responsePropertiesCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Response Properties (Output)"))');
      await expect(responsePropertiesCard).toBeVisible({ timeout: 10000 });

      // Verify a property from the mock data appears in the DataGrid
      const propertyRow = responsePropertiesCard.locator('[role="row"]').filter({ hasText: mockStringResponseProperty.uniquename });
      await expect(propertyRow).toBeVisible({ timeout: 5000 });
    });

    test('shows empty state when Custom API has no properties', async ({ page }) => {
      await setupTestData(page, {
        responseProperties: emptyResponseProperties,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select the global Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Response properties card should be visible
      const responsePropertiesCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Response Properties (Output)"))');
      await expect(responsePropertiesCard).toBeVisible({ timeout: 10000 });

      // DataGrid should have no data rows (only header row or empty state)
      const dataRows = responsePropertiesCard.locator('[role="row"]').filter({ 
        hasNot: page.locator('[role="columnheader"]') 
      });
      const rowCount = await dataRows.count();
      // Either no rows or just the header
      expect(rowCount).toBeLessThanOrEqual(1);
    });
  });

  test.describe('Response Property Actions - Unmanaged API', () => {
    test('shows New Response Property button for unmanaged Custom APIs', async ({ page }) => {
      await setupTestData(page, {
        responseProperties: mockResponsePropertiesForGlobalApi,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select an unmanaged Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // New Response Property button should be visible
      const responsePropertiesCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Response Properties (Output)"))');
      const newButton = responsePropertiesCard.getByRole('button', { name: /new response property/i });
      await expect(newButton).toBeVisible();
    });

    test('New Response Property button opens create form', async ({ page }) => {
      await setupTestData(page, {
        responseProperties: mockResponsePropertiesForGlobalApi,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select an unmanaged Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Click New Response Property
      const responsePropertiesCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Response Properties (Output)"))');
      const newButton = responsePropertiesCard.getByRole('button', { name: /new response property/i });
      await newButton.click();

      // Should show Save and Cancel buttons
      const saveButton = responsePropertiesCard.getByRole('button', { name: /^save$/i });
      const cancelButton = responsePropertiesCard.getByRole('button', { name: /^cancel$/i });
      await expect(saveButton).toBeVisible({ timeout: 5000 });
      await expect(cancelButton).toBeVisible();
    });

    test('tree view Edit action opens selected response property in form edit mode', async ({ page }) => {
      await setupTestData(page, {
        responseProperties: mockResponsePropertiesForGlobalApi,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      const treeViewToggle = page.getByRole('switch', { name: /toggle compact tree view/i });
      await treeViewToggle.click();

      await page.getByText(mockStringResponseProperty.displayname, { exact: true }).hover();
      const treeEditButton = page.locator(`button[aria-label="Edit Response Property ${mockStringResponseProperty.displayname}"]`);
      await expect(treeEditButton).toHaveCount(1);
      await treeEditButton.click({ force: true });

      const responsePropertiesCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Response Properties (Output)"))');
      await expect(responsePropertiesCard.getByRole('button', { name: /^save$/i })).toBeVisible({ timeout: 5000 });
      await expect(responsePropertiesCard.getByRole('button', { name: /^cancel$/i })).toBeVisible();
      await expect(responsePropertiesCard.getByLabel(/unique name/i)).toHaveValue(mockStringResponseProperty.uniquename);
    });

    test('tree view create and edit return to tree view after save and cancel', async ({ page }) => {
      await setupTestData(page, {
        responseProperties: mockResponsePropertiesForGlobalApi,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      const treeViewToggle = page.getByRole('switch', { name: /toggle compact tree view/i });
      await treeViewToggle.click();

      const tree = page.getByRole('tree', { name: /custom api tree view/i });
      await expect(tree).toBeVisible();

      await page.getByText(/response properties \(\d+\)/i).hover();
      await page.locator('button[aria-label="Add Response Property"]').click({ force: true });

      const responsePropertiesCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Response Properties (Output)"))');
      await expect(responsePropertiesCard.getByRole('button', { name: /^save$/i })).toBeVisible({ timeout: 5000 });

      await responsePropertiesCard.getByLabel(/unique name/i).fill('treeViewReturnProperty');
      await responsePropertiesCard.getByRole('button', { name: /^save$/i }).click();

      const createDialog = page.getByRole('dialog').filter({ hasText: /confirm response property creation/i });
      await expect(createDialog).toBeVisible({ timeout: 5000 });
      await createDialog.getByRole('button', { name: /^confirm$/i }).click();

      const createCalls = await appPage.getMockCalls('create');
      expect(createCalls.length).toBeGreaterThan(0);
      await expect(tree).toBeVisible({ timeout: 5000 });
      await expect(responsePropertiesCard.getByRole('button', { name: /^save$/i })).toBeHidden();

      await page.getByText(mockStringResponseProperty.displayname, { exact: true }).hover();
      const treeEditButton = page.locator(`button[aria-label="Edit Response Property ${mockStringResponseProperty.displayname}"]`);
      await treeEditButton.click({ force: true });

      await expect(responsePropertiesCard.getByRole('button', { name: /^save$/i })).toBeVisible({ timeout: 5000 });
      await responsePropertiesCard.getByRole('button', { name: /^cancel$/i }).click();

      await expect(tree).toBeVisible({ timeout: 5000 });
      await expect(responsePropertiesCard.getByRole('button', { name: /^save$/i })).toBeHidden();
    });

    test('manual tree toggle clears response-property tree return intent before a normal form action', async ({ page }) => {
      await setupTestData(page, {
        responseProperties: mockResponsePropertiesForGlobalApi,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      const tree = page.getByRole('tree', { name: /custom api tree view/i });
      const responsePropertiesCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Response Properties (Output)"))');

      await setTreeViewToggle(page, true);
      await expect(tree).toBeVisible({ timeout: 5000 });

      await page.getByText(/response properties \(\d+\)/i).hover();
      await page.locator('button[aria-label="Add Response Property"]').click({ force: true });
      await expect(responsePropertiesCard.getByRole('button', { name: /^save$/i })).toBeVisible({ timeout: 5000 });

      await setTreeViewToggle(page, true);
      await expect(tree).toBeVisible({ timeout: 5000 });

      await setTreeViewToggle(page, false);
      await expect(tree).toBeHidden({ timeout: 5000 });

      await responsePropertiesCard.getByRole('button', { name: /new response property/i }).click();
      await expect(responsePropertiesCard.getByRole('button', { name: /^save$/i })).toBeVisible({ timeout: 5000 });
      await responsePropertiesCard.getByRole('button', { name: /^cancel$/i }).click();

      await expect(tree).toBeHidden({ timeout: 5000 });
      await expect(responsePropertiesCard).toBeVisible();
      await expect(responsePropertiesCard.getByRole('button', { name: /^save$/i })).toBeHidden();
    });

    test('can create twice after tree view remounts without page errors', async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', error => {
        pageErrors.push(error.message);
      });

      await setupTestData(page, {
        responseProperties: emptyResponseProperties,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      const treeViewToggle = page.getByRole('switch', { name: /toggle compact tree view/i });
      await treeViewToggle.click();

      const responsePropertiesCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Response Properties (Output)"))');
      await treeViewToggle.click();

      const newButton = responsePropertiesCard.getByRole('button', { name: /new response property/i });
      await expect(newButton).toBeVisible({ timeout: 5000 });
      await newButton.click();
      await expect(responsePropertiesCard.getByRole('button', { name: /^save$/i })).toBeVisible({ timeout: 5000 });

      await responsePropertiesCard.locator('input').first().fill('treeViewCreateOne');
      await responsePropertiesCard.getByRole('button', { name: /^save$/i }).click();

      const createDialog = page.getByRole('dialog').filter({ hasText: /confirm response property creation/i });
      await expect(createDialog).toBeVisible({ timeout: 5000 });
      await createDialog.getByRole('button', { name: /^confirm$/i }).click();

      await expect(responsePropertiesCard.getByRole('button', { name: /^save$/i })).toHaveCount(0, { timeout: 5000 });
      await treeViewToggle.click();
      await treeViewToggle.click();
      await expect(newButton).toBeVisible({ timeout: 5000 });
      await newButton.click();
      await expect(responsePropertiesCard.getByRole('button', { name: /^save$/i })).toBeVisible({ timeout: 5000 });
      await expect(pageErrors).toEqual([]);
    });

    test('delete property calls delete API', async ({ page }) => {
      await setupTestData(page, {
        responseProperties: mockResponsePropertiesForGlobalApi,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select an unmanaged Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Select a property from the list
      const responsePropertiesCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Response Properties (Output)"))');
      const propertyRow = responsePropertiesCard.locator('[role="row"]').filter({ hasText: mockStringResponseProperty.uniquename });
      await propertyRow.click();
      await page.waitForTimeout(300);

      // Click Delete button
      const deleteButton = responsePropertiesCard.getByRole('button', { name: /^delete$/i }).first();
      await expect(deleteButton).toBeVisible({ timeout: 5000 });
      await deleteButton.click();

      // Confirm the delete dialog - look for dialog with delete content
      const deleteDialog = page.getByRole('dialog');
      await expect(deleteDialog).toBeVisible({ timeout: 5000 });
      
      const confirmButton = deleteDialog.getByRole('button', { name: /delete/i });
      await confirmButton.click();

      // Verify delete was called
      const deleteCalls = await appPage.getMockCalls('delete');
      expect(deleteCalls.length).toBeGreaterThan(0);
    });
  });

  test.describe('Response Property Actions - Managed API', () => {
    test('hides New Response Property button for managed Custom APIs', async ({ page }) => {
      // Set up with managed API's property
      const managedProps = {
        value: [mockManagedResponseProperty],
      };
      
      await setupTestData(page, {
        responseProperties: managedProps,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select a managed Custom API
      await appPage.selectCustomApiByUniqueName(mockManagedCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // New Response Property button should NOT be visible
      const responsePropertiesCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Response Properties (Output)"))');
      const newButton = responsePropertiesCard.getByRole('button', { name: /new response property/i });
      await expect(newButton).toBeHidden();
    });
  });
});
