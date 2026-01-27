import React, { createElement } from "react";
import { SelectableItem } from "../components/generic/GenericTagPicker";
import { EntityService } from "../services/EntityService";
import { PluginTypeService } from "../services/PluginTypeService";
import { ArrowRepeatAllRegular, ArrowForwardDownLightningRegular, DismissSquareRegular } from "@fluentui/react-icons";



export interface CustomApi  {
  customapiid: string;
  name: string;
  allowedcustomprocessingsteptype: Customapisallowedcustomprocessingsteptype | null;
  bindingtype: Customapisbindingtype | null;
  boundentitylogicalname: string;
  description: string;
  displayname: string;
  workflowsdkstepenabled: boolean;  
  executeprivilegename: string;
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
  'uniquename' |
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
  'isprivate' 
  > {}



// A subset of CustomApi properties that are updateable
export interface CustomApiUpdateable extends 
  Pick<CustomApi,  
  'name' |   
  'displayname' | 
  'description' |
  '_plugintypeid_value'| 
  'executeprivilegename' |
  'isprivate' 
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


// Icon mapping for AllowedCustomProcessingStepType
export const allowedCustomProcessingStepTypeIcons: Record<string, React.JSX.Element> = {
  '0': createElement(DismissSquareRegular),        // None
  '1': createElement(ArrowForwardDownLightningRegular), // AsyncOnly
  '2': createElement(ArrowRepeatAllRegular),      // SyncandAsync
};

// Helper to get options for AllowedCustomProcessingStepType
export const getAllowedCustomProcessingStepTypeOptions = (): Array<SelectableItem> =>
  Object.entries(Customapisallowedcustomprocessingsteptype).map(([key, value]) => ({
    id: Number(key).toString(),
    displayText: value,
    image: allowedCustomProcessingStepTypeIcons[key] ?? null,
  }));



export const Customapisbindingtype = {
  0: 'Global',
  1: 'Entity',
  2: 'EntityCollection'
} as const;
export type Customapisbindingtype = keyof typeof Customapisbindingtype;

// Helper to get options for BindingType
export const getBindingTypeOptions = (): Array<SelectableItem> =>
  Object.entries(Customapisbindingtype).map(([key, value]) => ({
    id: Number(key).toString(),
    displayText: value,
    image: null,
  }));

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


// TEMPLATE FOR CREATING NEW CustomApi
export const DEFAULT_CREATE_TEMPLATE: CustomApiCreateable = {
    uniquename: '',
    name: '',
    displayname: '',
    description: '',
    allowedcustomprocessingsteptype: 0 as Customapisallowedcustomprocessingsteptype,
    bindingtype: 0 as Customapisbindingtype,
    boundentitylogicalname: '',
    workflowsdkstepenabled: false,
    isfunction: false,
    executeprivilegename: '',
    _plugintypeid_value: '',
    isprivate: false
};

// export const DEFAULT_CREATE_TEMPLATE_BUSINESSEVENT: CustomApiCreateable = {
//     uniquename: '',
//     name: '',
//     displayname: '',
//     description: '',
//     allowedcustomprocessingsteptype: 1 as Customapisallowedcustomprocessingsteptype, // AsyncOnly
//     bindingtype: 0 as Customapisbindingtype,
//     boundentitylogicalname: '',
//     workflowsdkstepenabled: false,
//     isfunction: false,
//     executeprivilegename: '',
//     _plugintypeid_value: '',
//     isprivate: false
// };


