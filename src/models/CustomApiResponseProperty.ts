export interface CustomApiResponseProperty {
  customapiresponsepropertyid: string;
  name: string;
  logicalentityname: string;
  _customapiid_value: string;
  '_customapiid_value@Microsoft.Dynamics.CRM.associatednavigationproperty': string;
  '_customapiid_value@Microsoft.Dynamics.CRM.lookuplogicalname': string;
  '_customapiid_value@OData.Community.Display.V1.FormattedValue': string;
  description: string;
  displayname: string;
  entitylogicalname: string;
 
  iscustomizable: boolean;
  ismanaged: boolean;

  _ownerid_value: string;

  _solutionid_value: string;
  type: Customapiresponsepropertiestype;
  statecode: number;
  statuscode: number;
  uniquename: string;

}

// OPTIONSETS ENUMS
export const Customapiresponsepropertiestype = {
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
export type Customapiresponsepropertiestype = keyof typeof Customapiresponsepropertiestype;