export interface CustomApiDto {
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
  isfunctional: boolean;
  ismanaged: boolean;
  isprivate: boolean;
  ownerid: string;
  plugintypeid: string;
  solutionid: string;
  statecode: number;
  statuscode: number;
  uniquename: string;

}
