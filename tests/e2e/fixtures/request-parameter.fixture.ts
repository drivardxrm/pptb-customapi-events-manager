/**
 * Test fixtures for CustomApiRequestParameter entity.
 * Matches the CustomApiRequestParameter interface from src/models/CustomApiRequestParameter.ts.
 */

import type { Customapirequestparameterstype } from '../../../src/models/CustomApiRequestParameter';

/**
 * Minimal Custom API Request Parameter structure for mocks.
 * Matches the CustomApiRequestParameter interface expected by the app.
 */
export interface MockCustomApiRequestParameter {
  customapirequestparameterid: string;
  name: string;
  uniquename: string;
  displayname: string;
  description: string;
  type: Customapirequestparameterstype;
  isoptional: boolean;
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
 * String type parameter - the most common pattern.
 */
export const mockStringParameter: MockCustomApiRequestParameter = {
  customapirequestparameterid: 'param-11111111-1111-1111-1111-111111111111',
  name: 'AccountId',
  uniquename: 'test_AccountId',
  displayname: 'Account ID',
  description: 'The unique identifier of the account to retrieve.',
  type: 10, // String
  isoptional: false,
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
 * Entity reference parameter - for lookups.
 */
export const mockEntityReferenceParameter: MockCustomApiRequestParameter = {
  customapirequestparameterid: 'param-22222222-2222-2222-2222-222222222222',
  name: 'TargetAccount',
  uniquename: 'test_TargetAccount',
  displayname: 'Target Account',
  description: 'A reference to the target account entity.',
  type: 5, // EntityReference
  isoptional: false,
  ismanaged: false,
  logicalentityname: 'account',
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
 * Optional parameter - can be omitted when calling the API.
 */
export const mockOptionalParameter: MockCustomApiRequestParameter = {
  customapirequestparameterid: 'param-33333333-3333-3333-3333-333333333333',
  name: 'IncludeInactive',
  uniquename: 'test_IncludeInactive',
  displayname: 'Include Inactive',
  description: 'Optional flag to include inactive records in the results.',
  type: 0, // Boolean
  isoptional: true,
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
 * Managed parameter - read-only, cannot be edited or deleted.
 */
export const mockManagedParameter: MockCustomApiRequestParameter = {
  customapirequestparameterid: 'param-44444444-4444-4444-4444-444444444444',
  name: 'ManagedInput',
  uniquename: 'managed_ManagedInput',
  displayname: 'Managed Input',
  description: 'A managed request parameter from an imported solution.',
  type: 10, // String
  isoptional: false,
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
 * All mock request parameters for the global Custom API.
 */
export const mockRequestParametersForGlobalApi = {
  value: [
    mockStringParameter,
    mockEntityReferenceParameter,
    mockOptionalParameter,
  ],
};

/**
 * All mock request parameters for the managed Custom API.
 */
export const mockRequestParametersForManagedApi = {
  value: [mockManagedParameter],
};

/**
 * All mock request parameters combined.
 */
export const mockRequestParameters = {
  value: [
    mockStringParameter,
    mockEntityReferenceParameter,
    mockOptionalParameter,
    mockManagedParameter,
  ],
};

/**
 * Empty request parameters result.
 */
export const emptyRequestParameters = {
  value: [],
};

/**
 * Template for creating a new request parameter.
 */
export const createRequestParameterTemplate = {
  uniquename: 'test_NewParameter',
  name: 'NewParameter',
  displayname: 'New Parameter',
  description: 'A test request parameter created by E2E tests.',
  type: 10, // String
  isoptional: false,
  logicalentityname: '',
  _customapiid_value: '11111111-1111-1111-1111-111111111111',
};

/**
 * Expected result when creating a new request parameter.
 */
export const createRequestParameterResult = {
  id: 'param-66666666-6666-6666-6666-666666666666',
};
