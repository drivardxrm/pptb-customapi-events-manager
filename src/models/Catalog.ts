
import { CatalogService } from "../services/CatalogService";
import { EntityService } from "../services/EntityService";




export interface Catalog  {
  catalogid: string;
  name: string;
  description: string;
  displayname: string;
  ismanaged: boolean;
  ownerid: string;
  _parentcatalogid_value: string;
  '_parentcatalogid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  '_parentcatalogid_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  '_parentcatalogid_value@OData.Community.Display.V1.FormattedValue': string;
  solutionid: string;
  statecode: Catalogstatecode;
  statuscode: Catalogstatuscode;
  uniquename: string;

}


// A subset of Catalog properties that used at creation time
export interface CatalogCreateable  extends 
  Pick<Catalog,  
  'uniquename' |
  'name' |   
  'displayname' | 
  'description' |
  '_parentcatalogid_value'
  > {}



// A subset of CustomApi properties that are updateable
export interface CatalogUpdateable extends 
  Pick<Catalog,  
  'name' |   
  'displayname' | 
  'description' 
  > {}

// Record<keyof T, EntityService> for lookups
export const CatalogLookups: Partial<Record<keyof CatalogCreateable, [string, EntityService]>> = {
  _parentcatalogid_value: ['ParentCatalogId', new CatalogService()],
};




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


// TEMPLATE FOR CREATING NEW CustomApi
export const DEFAULT_CREATE_TEMPLATE: CatalogCreateable = {
    uniquename: '',
    name: '',
    displayname: '',
    description: '',
   
    _parentcatalogid_value: '',
};


