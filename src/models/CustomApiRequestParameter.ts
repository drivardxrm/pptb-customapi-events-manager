export interface CustomApiRequestParameter {
  customapirequestparameterid: string;
  name: string;
  logicalentityname: string;
  _customapiid_value: string;
  '_customapiid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  '_customapiid_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  '_customapiid_value@OData.Community.Display.V1.FormattedValue': string;
  description: string;
  displayname: string;
  entitylogicalname: string;
 

  isoptional: boolean;
  ismanaged: boolean;

  _ownerid_value: string;

  _solutionid_value: string;
  type: Customapirequestparameterstype;
  statecode: number;
  statuscode: number;
  uniquename: string;

}

// A subset of CustomApiRequestParameter properties that are updateable
export interface CustomApiRequestParameterUpdateable extends 
  Pick<CustomApiRequestParameter,  
  'name' |   
  'displayname' | 
  'description' 
  > {}


// OPTIONSETS ENUMS
export const Customapirequestparameterstype = {
  0: 'Boolean',
  1: 'DateTime',
  2: 'Decimal',
  3: 'Entity',
  4: 'EntityCollection',
  5: 'EntityReference',
  6: 'Float',
  7: 'Integer',
  8: 'Money',
  9: 'Picklist',
  10: 'String',
  11: 'StringArray',
  12: 'Guid'
} as const;
export type Customapirequestparameterstype = keyof typeof Customapirequestparameterstype;
