import { EntityService } from "../services/EntityService";
import { PluginTypeService } from "../services/PluginTypeService";



export interface CustomApi  {
  customapiid: string;
  name: string;
  allowedcustomprocessingsteptype: number;
  bindingtype: number;
  boundentitylogicalname: string;
  description: string;
  displayname: string;
  workflowsdkstepenabled: boolean;  
  executeprivilegename: string;
  _fxexpressionid_value : string;
  iscustomizable: boolean;
  isfunction: boolean;
  ismanaged: boolean;
  isprivate: boolean;
  ownerid: string;
  _plugintypeid_value: string;
  solutionid: string;
  statecode: number;
  statuscode: number;
  uniquename: string;

}






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
