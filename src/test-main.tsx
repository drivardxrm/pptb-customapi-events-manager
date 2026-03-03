/**
 * Test entry point for E2E tests.
 * 
 * This module sets up mocks BEFORE importing the main app,
 * ensuring that window.dataverseAPI and window.toolboxAPI
 * are available when the app initializes.
 */

// Install mocks first - this MUST happen before importing main
import { setupMocks } from '../tests/e2e/mocks/setup';
setupMocks();

// Now import the main app
import './main';
