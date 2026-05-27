export interface Catalog  {
  catalogid: string;
  uniquename: string;
  name: string;
  displayname: string;
  description: string;
  ismanaged: boolean;
  ownerid: string;
  _parentcatalogid_value: string;
  '_parentcatalogid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  '_parentcatalogid_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  '_parentcatalogid_value@OData.Community.Display.V1.FormattedValue': string;
  // _publisherid_value: string;
  // '_publisherid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  // '_publisherid_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  // '_publisherid_value@OData.Community.Display.V1.FormattedValue': string;
  solutionid: string;
  statecode: Catalogstatecode;
  statuscode: Catalogstatuscode;
}


// Properties needed at creation time
export interface CatalogCreateable  extends 
  Pick<Catalog,  
  'uniquename' |
  'name' |   
  'displayname' | 
  'description' |
  '_parentcatalogid_value'
  > {}



// Properties that can be modified after creation
export interface CatalogUpdateable extends 
  Pick<Catalog,  
  'name' |   
  'displayname' | 
  'description' 
  > {}


// OPTIONSETS
export const Catalogstatecode = {
  0: 'Active',
  1: 'Inactive'
} as const;
export type Catalogstatecode = keyof typeof Catalogstatecode;

export const Catalogstatuscode = {
  1: 'Active',
  2: 'Inactive'
} as const;
export type Catalogstatuscode = keyof typeof Catalogstatuscode;


// TEMPLATE FOR CREATING NEW Catalog
export const DEFAULT_CATALOG_CREATE_TEMPLATE: CatalogCreateable = {
  uniquename: '',
  name: '',
  displayname: '',
  description: '',
  _parentcatalogid_value: ''
};
