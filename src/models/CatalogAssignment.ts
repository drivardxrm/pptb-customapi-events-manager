export interface CatalogAssignment  {
  catalogassignmentid: string;
  name: string;
  objectidtype: string;
  objectname: string;
  ismanaged: boolean;
  ownerid: string;
  _catalogid_value: string;
  '_catalogid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  '_catalogid_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  '_catalogid_value@OData.Community.Display.V1.FormattedValue': string;
    _object_value: string;
  '_object_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  '_object_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  '_object_value@OData.Community.Display.V1.FormattedValue': string;
  solutionid: string;
  statecode: CatalogAssignmentstatecode;
  statuscode: CatalogAssignmentstatuscode;

}


// A subset of Catalog properties that used at creation time
export interface CatalogAssignmentCreateable  extends 
  Pick<CatalogAssignment,   |
  'name' |   
  '_catalogid_value' | 
  '_object_value' 
  > {}



// A subset of CustomApi properties that are updateable
export interface CatalogAssignmentUpdateable extends 
  Pick<CatalogAssignment,  
  'name'    
  > {}




export const CatalogAssignmentstatecode = {
  0: 'Active',
  1: 'Inactive'
} as const;
export type CatalogAssignmentstatecode = keyof typeof CatalogAssignmentstatecode;

export const CatalogAssignmentstatuscode = {
  1: 'Active',
  2: 'Inactive'
} as const;
export type CatalogAssignmentstatuscode = keyof typeof CatalogAssignmentstatuscode;


// TEMPLATE FOR CREATING NEW CustomApi
// export const DEFAULT_CREATE_TEMPLATE: CatalogAssignmentCreateable = {
//     uniquename: '',
//     name: '',
//     displayname: '',
//     description: '',
   
//     _parentcatalogid_value: '',
// };


