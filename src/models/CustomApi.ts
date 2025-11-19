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

// A subset of CustomApi properties that are updateable
export interface CustomApiUpdateable extends 
  Pick<CustomApi,  
  'name' |   
  'displayname' | 
  'description' |
  'plugintypeid'| 
  'executeprivilegename' |
  'isprivate' |
  'iscustomizable' 
  > {}


