import { SelectableItem } from "../components/generic/GenericTagPicker";
import { CustomApiService } from "../services/CustomApiService";
import { EntityService } from "../services/EntityService";

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

  ismanaged: boolean;

  _ownerid_value: string;

  _solutionid_value: string;
  type: Customapiresponsepropertiestype;
  statecode: number;
  statuscode: number;
  uniquename: string;

}

// Record<keyof T, EntityService> for lookups
export const CustomApiResponsePropertyLookups: Partial<Record<keyof CustomApiResponseProperty, [string, EntityService]>> = {
  _customapiid_value: ['CustomAPIId', new CustomApiService()],
};

// A subset of CustomApiRequestParameter properties that used at creation time
export interface CustomApiResponsePropertyCreateable extends 
  Pick<CustomApiResponseProperty,  
  'uniquename' |
  'name' |   
  'displayname' | 
  'description' |
  'logicalentityname' |
  'type' |
  '_customapiid_value'
  > {}

// A subset of CustomApiRequestParameter properties that are updateable
export interface CustomApiResponsePropertyUpdateable extends 
  Pick<CustomApiResponseProperty,  
  'name' |   
  'displayname' | 
  'description' 
  > {}

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

// Helper to get options for Customapiresponsepropertiestype
export const getCustomApiResponsePropertiesTypeOptions = (): Array<SelectableItem> =>
  Object.entries(Customapiresponsepropertiestype).map(([key, value]) => ({
    id: Number(key).toString(),
    displayText: value,
    image: null,
  }));


  // TEMPLATE FOR CREATING NEW CustomApi Response Property
export const getResponsePropertyCreateTemplate = (customApiId: string) : CustomApiResponsePropertyCreateable => ({
      uniquename: '',
      name: '',
      displayname: '',
      description: '',
      logicalentityname: '',
      type: 10, // Default to 'String'
      _customapiid_value: customApiId,
  });