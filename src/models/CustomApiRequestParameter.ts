import { SelectableItem } from "../components/generic/GenericTagPicker";
import { CustomApiService } from "../services/CustomApiService";
import { EntityService } from "../services/EntityService";

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

 

  isoptional: boolean;
  ismanaged: boolean;

  _ownerid_value: string;

  _solutionid_value: string;
  type: Customapirequestparameterstype;
  statecode: number;
  statuscode: number;
  uniquename: string;

}

// Record<keyof T, EntityService> for lookups
export const CustomApiRequestParameterLookups: Partial<Record<keyof CustomApiRequestParameter, [string, EntityService]>> = {
  _customapiid_value: ['CustomAPIId', new CustomApiService()],
};

// A subset of CustomApiRequestParameter properties that used at creation time
export interface CustomApiRequestParameterCreateable extends 
  Pick<CustomApiRequestParameter,  
  'uniquename' |
  'name' |   
  'displayname' | 
  'description' |
  'logicalentityname' |
  'isoptional' |
  'type' |
  '_customapiid_value'
  > {}

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

// Helper to get options for Customapirequestparameterstype
export const getCustomApiRequestParametersTypeOptions = (): Array<SelectableItem> =>
  Object.entries(Customapirequestparameterstype).map(([key, value]) => ({
    id: Number(key).toString(),
    displayText: value,
    image: null,
  }));


  // TEMPLATE FOR CREATING NEW CustomApi Request Parameter
export const getRequestParameterCreateTemplate = (customApiId: string) : CustomApiRequestParameterCreateable => ({
      uniquename: '',
      name: '',
      displayname: '',
      description: '',
      logicalentityname: '',
      isoptional: false,
      type: 10, // Default to 'String'
      _customapiid_value: customApiId,
  });