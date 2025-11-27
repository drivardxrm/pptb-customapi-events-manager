import { EntityService } from "../services/EntityService";
import { PluginTypeService } from "../services/PluginTypeService";



export interface CustomApi  {
  customapiid: string;
  name: string;
  allowedcustomprocessingsteptype: Customapisallowedcustomprocessingsteptype;
  bindingtype: Customapisbindingtype;
  boundentitylogicalname: string;
  description: string;
  displayname: string;
  workflowsdkstepenabled: boolean;  
  executeprivilegename: string;
  iscustomizable: boolean;
  isfunction: boolean;
  ismanaged: boolean;
  isprivate: boolean;
  ownerid: string;
  _fxexpressionid_value: string;
  _plugintypeid_value: string;
  '_plugintypeid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  '_plugintypeid_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  '_plugintypeid_value@OData.Community.Display.V1.FormattedValue': string;
  solutionid: string;
  statecode: Customapisstatecode;
  statuscode: Customapisstatuscode;
  uniquename: string;

}


// A subset of CustomApi properties that used at creation time
export interface CustomApiCreateable  extends 
  Pick<CustomApi,  
  'name' |   
  'allowedcustomprocessingsteptype' | 
  'bindingtype' | 
  'boundentitylogicalname' |
  'workflowsdkstepenabled' |
  'isfunction' |
  'displayname' | 
  'description' |
  '_plugintypeid_value'| 
  'executeprivilegename' |
  'isprivate' |
  'iscustomizable' 
  > {}



// A subset of CustomApi properties that are updateable
export interface CustomApiUpdateable extends 
  Pick<CustomApi,  
  'name' |   
  'displayname' | 
  'description' |
  '_plugintypeid_value'| 
  'executeprivilegename' |
  'isprivate' |
  'iscustomizable' 
  > {}

// Record<keyof T, EntityService> for lookups
export const CustomApiLookups: Partial<Record<keyof CustomApiUpdateable, [string, EntityService]>> = {
  _plugintypeid_value: ['PluginTypeId', new PluginTypeService()],
};


// OPTIONSETS
export const Customapisallowedcustomprocessingsteptype = {
  0: 'None',
  1: 'AsyncOnly',
  2: 'SyncandAsync'
} as const;
export type Customapisallowedcustomprocessingsteptype = keyof typeof Customapisallowedcustomprocessingsteptype;

export const Customapisbindingtype = {
  0: 'Global',
  1: 'Entity',
  2: 'EntityCollection'
} as const;
export type Customapisbindingtype = keyof typeof Customapisbindingtype;

// export const Customapiscomponentstate = {
//   0: 'Published',
//   1: 'Unpublished',
//   2: 'Deleted',
//   3: 'DeletedUnpublished'
// } as const;
// export type Customapiscomponentstate = keyof typeof Customapiscomponentstate;



export const Customapisstatecode = {
  0: 'Active',
  1: 'Inactive'
} as const;
export type Customapisstatecode = keyof typeof Customapisstatecode;

export const Customapisstatuscode = {
  1: 'Active',
  2: 'Inactive'
} as const;
export type Customapisstatuscode = keyof typeof Customapisstatuscode;


