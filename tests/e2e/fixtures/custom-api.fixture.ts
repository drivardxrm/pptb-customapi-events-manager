/**
 * Test fixtures for Custom API entity.
 * Matches the CustomApi interface from src/models/CustomApi.ts.
 */

import type {
  Customapisallowedcustomprocessingsteptype,
  Customapisbindingtype,
  Customapisstatecode,
  Customapisstatuscode,
} from '../../../src/models/CustomApi';

/**
 * Minimal Custom API structure for mocks.
 * Matches the CustomApi interface expected by the app.
 */
export interface MockCustomApi {
  customapiid: string;
  name: string;
  uniquename: string;
  displayname: string;
  description: string;
  allowedcustomprocessingsteptype: Customapisallowedcustomprocessingsteptype | null;
  bindingtype: Customapisbindingtype | null;
  boundentitylogicalname: string;
  isfunction: boolean;
  ismanaged: boolean;
  isprivate: boolean;
  workflowsdkstepenabled: boolean;
  executeprivilegename: string;
  ownerid: string;
  _fxexpressionid_value: string;
  _plugintypeid_value: string;
  '_plugintypeid_value@OData.Community.Display.V1.FormattedValue': string;
  '_plugintypeid_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  '_plugintypeid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  solutionid: string;
  statecode: Customapisstatecode;
  statuscode: Customapisstatuscode;
}

/**
 * Global binding type Custom API - the most common pattern.
 */
export const mockGlobalCustomApi: MockCustomApi = {
  customapiid: '11111111-1111-1111-1111-111111111111',
  name: 'GetAccountSummary',
  uniquename: 'test_GetAccountSummary',
  displayname: 'Get Account Summary',
  description: 'Retrieves a summary of account information including related contacts and opportunities.',
  allowedcustomprocessingsteptype: 2, // SyncandAsync
  bindingtype: 0, // Global
  boundentitylogicalname: '',
  isfunction: false,
  ismanaged: false,
  isprivate: false,
  workflowsdkstepenabled: false,
  executeprivilegename: '',
  ownerid: 'owner-guid-1',
  _fxexpressionid_value: '',
  _plugintypeid_value: 'plugin-type-guid-1',
  '_plugintypeid_value@OData.Community.Display.V1.FormattedValue': 'TestPlugin.GetAccountSummary',
  '_plugintypeid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'plugintype',
  '_plugintypeid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': 'PluginTypeId',
  solutionid: 'solution-1',
  statecode: 0, // Active
  statuscode: 1, // Active
};

/**
 * Entity-bound Custom API (e.g., bound to account).
 */
export const mockEntityBoundCustomApi: MockCustomApi = {
  customapiid: '22222222-2222-2222-2222-222222222222',
  name: 'CalculateAccountScore',
  uniquename: 'test_CalculateAccountScore',
  displayname: 'Calculate Account Score',
  description: 'Calculates a quality score for the specified account based on engagement metrics.',
  allowedcustomprocessingsteptype: 0, // None
  bindingtype: 1, // Entity
  boundentitylogicalname: 'account',
  isfunction: true,
  ismanaged: false,
  isprivate: false,
  workflowsdkstepenabled: false,
  executeprivilegename: 'prvReadAccount',
  ownerid: 'owner-guid-1',
  _fxexpressionid_value: '',
  _plugintypeid_value: 'plugin-type-guid-2',
  '_plugintypeid_value@OData.Community.Display.V1.FormattedValue': 'TestPlugin.CalculateAccountScore',
  '_plugintypeid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'plugintype',
  '_plugintypeid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': 'PluginTypeId',
  solutionid: 'solution-1',
  statecode: 0,
  statuscode: 1,
};

/**
 * EntityCollection-bound Custom API.
 */
export const mockEntityCollectionCustomApi: MockCustomApi = {
  customapiid: '33333333-3333-3333-3333-333333333333',
  name: 'BulkProcessContacts',
  uniquename: 'test_BulkProcessContacts',
  displayname: 'Bulk Process Contacts',
  description: 'Performs bulk processing operations on a collection of contact records.',
  allowedcustomprocessingsteptype: 1, // AsyncOnly
  bindingtype: 2, // EntityCollection
  boundentitylogicalname: 'contact',
  isfunction: false,
  ismanaged: false,
  isprivate: true,
  workflowsdkstepenabled: true,
  executeprivilegename: '',
  ownerid: 'owner-guid-1',
  _fxexpressionid_value: '',
  _plugintypeid_value: '',
  '_plugintypeid_value@OData.Community.Display.V1.FormattedValue': '',
  '_plugintypeid_value@Microsoft.Dynamics.CRM.lookuplogicalname': '',
  '_plugintypeid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': '',
  solutionid: 'solution-1',
  statecode: 0,
  statuscode: 1,
};

/**
 * Managed Custom API (read-only, cannot be edited or deleted).
 */
export const mockManagedCustomApi: MockCustomApi = {
  customapiid: '44444444-4444-4444-4444-444444444444',
  name: 'ManagedApiAction',
  uniquename: 'managed_ManagedApiAction',
  displayname: 'Managed API Action',
  description: 'A managed Custom API from an imported solution - cannot be modified.',
  allowedcustomprocessingsteptype: 2,
  bindingtype: 0,
  boundentitylogicalname: '',
  isfunction: false,
  ismanaged: true,
  isprivate: false,
  workflowsdkstepenabled: false,
  executeprivilegename: '',
  ownerid: 'owner-guid-2',
  _fxexpressionid_value: '',
  _plugintypeid_value: 'plugin-type-guid-3',
  '_plugintypeid_value@OData.Community.Display.V1.FormattedValue': 'ManagedPlugin.Action',
  '_plugintypeid_value@Microsoft.Dynamics.CRM.lookuplogicalname': 'plugintype',
  '_plugintypeid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': 'PluginTypeId',
  solutionid: 'solution-2',
  statecode: 0,
  statuscode: 1,
};

/**
 * Power Fx Custom API (limited editing capabilities).
 */
export const mockPowerFxCustomApi: MockCustomApi = {
  customapiid: '55555555-5555-5555-5555-555555555555',
  name: 'PowerFxFunction',
  uniquename: 'test_PowerFxFunction',
  displayname: 'Power Fx Function',
  description: 'A Custom API backed by a Power Fx expression.',
  allowedcustomprocessingsteptype: 0,
  bindingtype: 0,
  boundentitylogicalname: '',
  isfunction: true,
  ismanaged: false,
  isprivate: false,
  workflowsdkstepenabled: false,
  executeprivilegename: '',
  ownerid: 'owner-guid-1',
  _fxexpressionid_value: 'fx-expression-guid-1',
  _plugintypeid_value: '',
  '_plugintypeid_value@OData.Community.Display.V1.FormattedValue': '',
  '_plugintypeid_value@Microsoft.Dynamics.CRM.lookuplogicalname': '',
  '_plugintypeid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': '',
  solutionid: 'solution-1',
  statecode: 0,
  statuscode: 1,
};

/**
 * All mock Custom APIs as FetchXML result format.
 */
export const mockCustomApis = {
  value: [
    mockGlobalCustomApi,
    mockEntityBoundCustomApi,
    mockEntityCollectionCustomApi,
    mockManagedCustomApi,
    mockPowerFxCustomApi,
  ],
};

/**
 * Empty Custom APIs result.
 */
export const emptyCustomApis = {
  value: [],
};

/**
 * Template for creating a new Custom API.
 */
export const createCustomApiTemplate = {
  uniquename: 'new_TestCustomApi',
  name: 'TestCustomApi',
  displayname: 'Test Custom API',
  description: 'A test Custom API created by E2E tests.',
  allowedcustomprocessingsteptype: 2,
  bindingtype: 0,
  boundentitylogicalname: '',
  workflowsdkstepenabled: false,
  isfunction: false,
  executeprivilegename: '',
  isprivate: false,
};

/**
 * Expected result when creating a new Custom API.
 */
export const createCustomApiResult = {
  id: '66666666-6666-6666-6666-666666666666',
};
