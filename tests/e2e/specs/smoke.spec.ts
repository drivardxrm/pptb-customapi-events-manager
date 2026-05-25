/**
 * Smoke tests for PPTB Custom API Manager.
 * 
 * These tests verify basic app functionality:
 * - App loads without errors
 * - Basic UI elements render
 * - Navigation is functional
 */

import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/app.page';
import { mockConnection, mockSolutions } from '../fixtures/connection.fixture';

test.describe('Smoke Tests', () => {
  let appPage: AppPage;

  test.beforeEach(async ({ page }) => {
    appPage = new AppPage(page);
    
    // Capture and log all console messages for debugging
    page.on('console', msg => {
      console.log(`[Browser ${msg.type()}]: ${msg.text()}`);
    });
    
    // Capture page errors
    page.on('pageerror', error => {
      console.log(`[Browser Error]: ${error.message}`);
    });
  });

  test('app loads and renders root element', async ({ page }) => {
    // Set up connection mock before navigation
    await page.addInitScript((conn) => {
      const waitForMocks = () => {
        if (window.toolboxAPI?.connections) {
          (window.toolboxAPI as unknown as { __setConnection: (c: unknown) => void }).__setConnection(conn);
        } else {
          setTimeout(waitForMocks, 10);
        }
      };
      waitForMocks();
    }, mockConnection);

    await appPage.goto();
    
    // Verify root element exists and is visible
    await expect(appPage.root).toBeVisible();
  });

  test('app displays without connection state', async ({ page }) => {
    // Don't set up connection - test disconnected state
    await appPage.goto();
    
    // Root should still render
    await expect(appPage.root).toBeVisible();
  });

  test('app renders with mock connection', async ({ page }) => {
    // Set up mocks before navigation
    await page.addInitScript(({ conn, solutions }) => {
      const waitForMocks = () => {
        if (window.toolboxAPI?.connections && window.dataverseAPI?.fetchXmlQuery) {
          (window.toolboxAPI as unknown as { __setConnection: (c: unknown) => void }).__setConnection(conn);
          (window.dataverseAPI as unknown as { __setFetchXmlResultForEntity: (e: string, r: unknown) => void }).__setFetchXmlResultForEntity('solution', solutions);
        } else {
          setTimeout(waitForMocks, 10);
        }
      };
      waitForMocks();
    }, { conn: mockConnection, solutions: mockSolutions });

    await appPage.goto();
    
    // Verify app renders
    await expect(appPage.root).toBeVisible();
  });

  test('app nav does not render removed About section', async ({ page }) => {
    await page.addInitScript((conn) => {
      const waitForMocks = () => {
        if (window.toolboxAPI?.connections) {
          (window.toolboxAPI as unknown as { __setConnection: (c: unknown) => void }).__setConnection(conn);
        } else {
          setTimeout(waitForMocks, 10);
        }
      };
      waitForMocks();
    }, mockConnection);

    await appPage.goto();

    await expect(page.getByRole('button', { name: 'About', exact: true })).toHaveCount(0);
  });

  test('FluentUI provider is active', async ({ page }) => {
    await page.addInitScript((conn) => {
      const waitForMocks = () => {
        if (window.toolboxAPI?.connections) {
          (window.toolboxAPI as unknown as { __setConnection: (c: unknown) => void }).__setConnection(conn);
        } else {
          setTimeout(waitForMocks, 10);
        }
      };
      waitForMocks();
    }, mockConnection);

    await appPage.goto();
    
    // FluentUI adds specific classes to the provider - use first() since there may be portals
    const fluentProvider = page.locator('.fui-FluentProvider').first();
    await expect(fluentProvider).toBeVisible();
  });
});
