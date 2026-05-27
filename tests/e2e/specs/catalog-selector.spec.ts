import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';
import { mockConnection, mockSolutions } from '../fixtures/connection.fixture';

const mockCatalogs = {
  value: [
    {
      catalogid: 'catalog-unmanaged-root',
      uniquename: 'test_UnmanagedRootCatalog',
      name: 'Unmanaged Root Catalog',
      displayname: 'Unmanaged Root Catalog',
      description: 'Unmanaged root catalog',
      ismanaged: false,
      ownerid: 'owner-1',
      _parentcatalogid_value: '',
      _publisherid_value: 'publisher-1',
      solutionid: 'solution-1',
      statecode: 0,
      statuscode: 1,
    },
    {
      catalogid: 'catalog-managed-root',
      uniquename: 'test_ManagedRootCatalog',
      name: 'Managed Root Catalog',
      displayname: 'Managed Root Catalog',
      description: 'Managed root catalog',
      ismanaged: true,
      ownerid: 'owner-1',
      _parentcatalogid_value: '',
      _publisherid_value: 'publisher-1',
      solutionid: 'solution-2',
      statecode: 0,
      statuscode: 1,
    },
  ],
};

async function setupCatalogTestData(page: import('@playwright/test').Page) {
  await setupCatalogTestDataWithOptions(page, {});
}

async function setupCatalogTestDataWithOptions(
  page: import('@playwright/test').Page,
  options: {
    settings?: Record<string, unknown>;
  }
) {
  await page.addInitScript(
    ({ connection, solutions, catalogs, settings }) => {
      window.__E2E_TEST_DATA__ = {
        connection,
        solutions,
        settings,
      };

      const waitForMocks = () => {
        if (window.dataverseAPI?.__setFetchXmlResultForEntity && window.dataverseAPI?.__setQueryDataResult) {
          (window.dataverseAPI as unknown as {
            __setFetchXmlResultForEntity: (entityName: string, result: unknown) => void;
            __setQueryDataResult: (entityCollectionName: string, result: unknown) => void;
          }).__setFetchXmlResultForEntity('catalog', catalogs);
          (window.dataverseAPI as unknown as {
            __setQueryDataResult: (entityCollectionName: string, result: unknown) => void;
          }).__setQueryDataResult('catalogs', catalogs);
        } else {
          setTimeout(waitForMocks, 10);
        }
      };

      waitForMocks();
    },
    {
      connection: mockConnection,
      solutions: mockSolutions.value,
      catalogs: mockCatalogs,
      settings: options.settings ?? {},
    }
  );
}

test.describe('Catalog Selector Filters', () => {
  test('expands filters on nav entry, then collapses them after selecting a business event', async ({ page }) => {
    const appPage = new AppPage(page);

    await setupCatalogTestData(page);
    await appPage.goto();

    await page.getByRole('button', { name: 'Business Events', exact: true }).click();

    const catalogSelectorCard = page.locator('.fui-Card').filter({ hasText: 'Selected Catalog' });
    const filtersToggle = catalogSelectorCard.getByRole('button', { name: /^Filters/ });
    const catalogPicker = catalogSelectorCard.locator('.fui-Field').filter({ hasText: 'Selected Catalog' }).locator('[role="combobox"]');
    const comboboxes = catalogSelectorCard.locator('[role="combobox"]');
    await expect(catalogSelectorCard).toBeVisible();
    await expect(comboboxes).toHaveCount(2);

    await catalogSelectorCard.getByRole('button', { name: 'Managed' }).last().click();

    await catalogPicker.click();

    const managedOption = page.locator('[role="option"]').filter({ hasText: 'test_ManagedRootCatalog' });
    const unmanagedOption = page.locator('[role="option"]').filter({ hasText: 'test_UnmanagedRootCatalog' });

    await expect(managedOption).toBeVisible();
    await expect(unmanagedOption).toHaveCount(0);

    await managedOption.click();

    await expect(comboboxes).toHaveCount(1);
    await expect(filtersToggle).toHaveText(/Filters \(1\)/);
    await expect(catalogSelectorCard.getByText('Managed Catalogs')).toBeVisible();
  });

  test('uses the Business Event selection init setting for the initial managed-state filter', async ({ page }) => {
    const appPage = new AppPage(page);

    await setupCatalogTestDataWithOptions(page, {
      settings: {
        businessEventSelectionInit: 'managed',
      },
    });
    await appPage.goto();

    await page.getByRole('button', { name: 'Business Events', exact: true }).click();

    const catalogSelectorCard = page.locator('.fui-Card').filter({ hasText: 'Selected Catalog' });
    const filtersToggle = catalogSelectorCard.getByRole('button', { name: /^Filters/ });
    const catalogPicker = catalogSelectorCard.locator('.fui-Field').filter({ hasText: 'Selected Catalog' }).locator('[role="combobox"]');

    await expect(filtersToggle).toHaveText(/Filters \(1\)/);

    await catalogPicker.click();

    const managedOption = page.locator('[role="option"]').filter({ hasText: 'test_ManagedRootCatalog' });
    const unmanagedOption = page.locator('[role="option"]').filter({ hasText: 'test_UnmanagedRootCatalog' });

    await expect(managedOption).toBeVisible();
    await expect(unmanagedOption).toHaveCount(0);
  });
});
