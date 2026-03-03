/**
 * Test fixtures for CustomApiResponseProperty entity.
 * Matches the CustomApiResponseProperty interface from src/models/CustomApiResponseProperty.ts.
 */

import type { Customapiresponsepropertiestype } from '../../../src/models/CustomApiResponseProperty';

/**
 * Minimal Custom API Response Property structure for mocks.
 * Matches the CustomApiResponseProperty interface expected by the app.
 */
export interface MockCustomApiResponseProperty {
  customapiresponsepropertyid: string;
  name: string;
  uniquename: string;
  displayname: string;
  description: string;
  type: Customapiresponsepropertiestype;
  ismanaged: boolean;
  logicalentityname: string;
  _customapiid_value: string;
  '_customapiid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  '_customapiid_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  '_customapiid_value@OData.Community.Display.V1.FormattedValue': string;
  _ownerid_value: string;
  _solutionid_value: string;
  statecode: number;
  statuscode: number;
}

/**
 * String type response property - the most common pattern.
 */
export const mockStringResponseProperty: MockCustomApiResponseProperty = {
  customapiresponsepropertyid: 'resp-11111111-1111-1111-1111-111111111111',
  name: 'Summary',
  uniquename: 'test_Summary',
  displayname: 'Summary',
  description: 'A summary of the account information.',
  type: 10, // String
  ismanaged: false,
  logicalentityname: '',
  _customapiid_value: '11111111-1111-1111-1111-111111111111', // Links to mockGlobalCustomApi
  '_customapiid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': 'CustomAPIId',
  '_customapiid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'customapi',
  '_customapiid_value@OData.Community.Display.V1.FormattedValue': 'GetAccountSummary',
  _ownerid_value: 'owner-guid-1',
  _solutionid_value: 'solution-1',
  statecode: 0,
  statuscode: 1,
};

/**
 * EntityCollection type response property - for returning multiple entities.
 */
export const mockEntityCollectionResponseProperty: MockCustomApiResponseProperty = {
  customapiresponsepropertyid: 'resp-22222222-2222-2222-2222-222222222222',
  name: 'Contacts',
  uniquename: 'test_Contacts',
  displayname: 'Related Contacts',
  description: 'A collection of contacts related to the account.',
  type: 4, // EntityCollection
  ismanaged: false,
  logicalentityname: 'contact',
  _customapiid_value: '11111111-1111-1111-1111-111111111111', // Links to mockGlobalCustomApi
  '_customapiid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': 'CustomAPIId',
  '_customapiid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'customapi',
  '_customapiid_value@OData.Community.Display.V1.FormattedValue': 'GetAccountSummary',
  _ownerid_value: 'owner-guid-1',
  _solutionid_value: 'solution-1',
  statecode: 0,
  statuscode: 1,
};

/**
 * Integer type response property.
 */
export const mockIntegerResponseProperty: MockCustomApiResponseProperty = {
  customapiresponsepropertyid: 'resp-33333333-3333-3333-3333-333333333333',
  name: 'ContactCount',
  uniquename: 'test_ContactCount',
  displayname: 'Contact Count',
  description: 'The number of contacts associated with the account.',
  type: 7, // Integer
  ismanaged: false,
  logicalentityname: '',
  _customapiid_value: '11111111-1111-1111-1111-111111111111', // Links to mockGlobalCustomApi
  '_customapiid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': 'CustomAPIId',
  '_customapiid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'customapi',
  '_customapiid_value@OData.Community.Display.V1.FormattedValue': 'GetAccountSummary',
  _ownerid_value: 'owner-guid-1',
  _solutionid_value: 'solution-1',
  statecode: 0,
  statuscode: 1,
};

/**
 * Managed response property - read-only, cannot be edited or deleted.
 */
export const mockManagedResponseProperty: MockCustomApiResponseProperty = {
  customapiresponsepropertyid: 'resp-44444444-4444-4444-4444-444444444444',
  name: 'ManagedOutput',
  uniquename: 'managed_ManagedOutput',
  displayname: 'Managed Output',
  description: 'A managed response property from an imported solution.',
  type: 10, // String
  ismanaged: true,
  logicalentityname: '',
  _customapiid_value: '44444444-4444-4444-4444-444444444444', // Links to mockManagedCustomApi
  '_customapiid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': 'CustomAPIId',
  '_customapiid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'customapi',
  '_customapiid_value@OData.Community.Display.V1.FormattedValue': 'ManagedApiAction',
  _ownerid_value: 'owner-guid-2',
  _solutionid_value: 'solution-2',
  statecode: 0,
  statuscode: 1,
};

/**
 * All mock response properties for the global Custom API.
 */
export const mockResponsePropertiesForGlobalApi = {
  value: [
    mockStringResponseProperty,
    mockEntityCollectionResponseProperty,
    mockIntegerResponseProperty,
  ],
};

/**
 * All mock response properties for the managed Custom API.
 */
export const mockResponsePropertiesForManagedApi = {
  value: [mockManagedResponseProperty],
};

/**
 * All mock response properties combined.
 */
export const mockResponseProperties = {
  value: [
    mockStringResponseProperty,
    mockEntityCollectionResponseProperty,
    mockIntegerResponseProperty,
    mockManagedResponseProperty,
  ],
};

/**
 * Empty response properties result.
 */
export const emptyResponseProperties = {
  value: [],
};

/**
 * Template for creating a new response property.
 */
export const createResponsePropertyTemplate = {
  uniquename: 'test_NewProperty',
  name: 'NewProperty',
  displayname: 'New Property',
  description: 'A test response property created by E2E tests.',
  type: 10, // String
  logicalentityname: '',
  _customapiid_value: '11111111-1111-1111-1111-111111111111',
};

/**
 * Expected result when creating a new response property.
 */
export const createResponsePropertyResult = {
  id: 'resp-66666666-6666-6666-6666-666666666666',
};
