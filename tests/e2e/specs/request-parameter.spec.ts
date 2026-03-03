/**
 * E2E tests for Custom API Request Parameter operations.
 * 
 * Tests the request parameter management within Custom APIs:
 * - Viewing request parameters list
 * - Adding new request parameters (for unmanaged APIs)
 * - Deleting request parameters
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
  mockRequestParametersForGlobalApi,
  mockStringParameter,
  emptyRequestParameters,
  mockManagedParameter,
} from '../fixtures/request-parameter.fixture';
import {
  emptyResponseProperties,
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
      
      console.log('[E2E Test] Pre-configured test data set for request parameter tests');
    },
    {
      connection: mockConnection,
      solutions: mockSolutions.value,
      customApis: apis,
      requestParameters: params,
      responseProperties: props,
    }
  );

  // Also set up entity-specific results via init script for request parameters
  await page.addInitScript(
    ({ requestParameters, responseProperties }) => {
      const waitForMocks = () => {
        if (window.dataverseAPI?.__setFetchXmlResultForEntity) {
          const dataverseAPI = window.dataverseAPI as unknown as {
            __setFetchXmlResultForEntity: (entity: string, result: { value: unknown[] }) => void;
          };
          dataverseAPI.__setFetchXmlResultForEntity('customapirequestparameter', requestParameters);
          dataverseAPI.__setFetchXmlResultForEntity('customapiresponseproperty', responseProperties);
          console.log('[E2E Test] Request parameters mock data set');
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

test.describe('Custom API Request Parameters', () => {
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

  test.describe('Request Parameters List', () => {
    test('parameters list loads when Custom API is selected', async ({ page }) => {
      await setupTestData(page, {
        requestParameters: mockRequestParametersForGlobalApi,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select the global Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Find the request parameters heading and get its closest Card ancestor (not the parent main card)
      // Use the last matching card since nested cards will match after their parent
      const requestParametersCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Request Parameters (Input)"))');
      await expect(requestParametersCard).toBeVisible({ timeout: 10000 });

      // Verify a parameter from the mock data appears in the DataGrid
      const parameterRow = requestParametersCard.locator('[role="row"]').filter({ hasText: mockStringParameter.uniquename });
      await expect(parameterRow).toBeVisible({ timeout: 5000 });
    });

    test('shows empty state when Custom API has no parameters', async ({ page }) => {
      await setupTestData(page, {
        requestParameters: emptyRequestParameters,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select the global Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Request parameters card should be visible
      const requestParametersCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Request Parameters (Input)"))');
      await expect(requestParametersCard).toBeVisible({ timeout: 10000 });

      // DataGrid should have no data rows (only header row or empty state)
      const dataRows = requestParametersCard.locator('[role="row"]').filter({ 
        hasNot: page.locator('[role="columnheader"]') 
      });
      const rowCount = await dataRows.count();
      // Either no rows or just the header
      expect(rowCount).toBeLessThanOrEqual(1);
    });
  });

  test.describe('Request Parameter Actions - Unmanaged API', () => {
    test('shows New Request Parameter button for unmanaged Custom APIs', async ({ page }) => {
      await setupTestData(page, {
        requestParameters: mockRequestParametersForGlobalApi,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select an unmanaged Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // New Request Parameter button should be visible
      const requestParametersCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Request Parameters (Input)"))');
      const newButton = requestParametersCard.getByRole('button', { name: /new request parameter/i });
      await expect(newButton).toBeVisible();
    });

    test('New Request Parameter button opens create form', async ({ page }) => {
      await setupTestData(page, {
        requestParameters: mockRequestParametersForGlobalApi,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select an unmanaged Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Click New Request Parameter
      const requestParametersCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Request Parameters (Input)"))');
      const newButton = requestParametersCard.getByRole('button', { name: /new request parameter/i });
      await newButton.click();

      // Should show Save and Cancel buttons
      const saveButton = requestParametersCard.getByRole('button', { name: /^save$/i });
      const cancelButton = requestParametersCard.getByRole('button', { name: /^cancel$/i });
      await expect(saveButton).toBeVisible({ timeout: 5000 });
      await expect(cancelButton).toBeVisible();
    });

    test('delete parameter calls delete API', async ({ page }) => {
      await setupTestData(page, {
        requestParameters: mockRequestParametersForGlobalApi,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select an unmanaged Custom API
      await appPage.selectCustomApiByUniqueName(mockGlobalCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // Select a parameter from the list
      const requestParametersCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Request Parameters (Input)"))');
      const parameterRow = requestParametersCard.locator('[role="row"]').filter({ hasText: mockStringParameter.uniquename });
      await parameterRow.click();
      await page.waitForTimeout(300);

      // Click Delete button (use first() to ensure we get the one in this card)
      const deleteButton = requestParametersCard.getByRole('button', { name: /^delete$/i }).first();
      await expect(deleteButton).toBeVisible({ timeout: 5000 });
      await deleteButton.click();

      // Confirm the delete dialog
      const deleteDialog = page.getByRole('dialog').filter({ hasText: /delete.*request parameter/i });
      await expect(deleteDialog).toBeVisible({ timeout: 5000 });
      
      const confirmButton = deleteDialog.getByRole('button', { name: /delete/i });
      await confirmButton.click();

      // Verify delete was called
      const deleteCalls = await appPage.getMockCalls('delete');
      expect(deleteCalls.length).toBeGreaterThan(0);
    });
  });

  test.describe('Request Parameter Actions - Managed API', () => {
    test('hides New Request Parameter button for managed Custom APIs', async ({ page }) => {
      // Set up with managed API's parameter
      const managedParams = {
        value: [mockManagedParameter],
      };
      
      await setupTestData(page, {
        requestParameters: managedParams,
      });
      await appPage.goto();
      await appPage.waitForCustomApiListLoad();

      // Select a managed Custom API
      await appPage.selectCustomApiByUniqueName(mockManagedCustomApi.uniquename);
      await appPage.waitForCustomApiDetails();

      // New Request Parameter button should NOT be visible
      const requestParametersCard = page.locator('.fui-Card:has(> .fui-CardHeader h3:text("Request Parameters (Input)"))');
      const newButton = requestParametersCard.getByRole('button', { name: /new request parameter/i });
      await expect(newButton).toBeHidden();
    });
  });
});
