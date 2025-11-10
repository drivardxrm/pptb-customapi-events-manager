import { SelectableItem } from "../components/GenericTagPicker";

export interface CustomApi {
  customapiid: string;
  name: string;
  allowedcustomprocessingsteptype: number;
  bindingtype: number;
  boundentitylogicalname: string;
  description: string;
  displayname: string;
  workflowsdkstepenabled: boolean;  
  executeprivilegename: string;
  fxexpressionid : string;
  iscustomizable: boolean;
  isfunction: boolean;
  ismanaged: boolean;
  isprivate: boolean;
  ownerid: string;
  plugintypeid: string;
  solutionid: string;
  statecode: number;
  statuscode: number;
  uniquename: string;

}

/**
 * Transforms a CustumApi into a SelectableItem for picker components.
 */
export function customapiToSelectableItem(customapi: CustomApi): SelectableItem {
  return {
    id: customapi.customapiid,
    displayText: customapi.name,
    image: null 
  };
}
