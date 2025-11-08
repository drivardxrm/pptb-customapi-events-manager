export interface CustomApiRequestParameterDto {
  customapirequestparameterid: string;
  name: string;
  logicalentityname: string;
  customapiid: string;
  description: string;
  displayname: string;
  entitylogicalname: string;
 
  iscustomizable: boolean;
  isoptional: boolean;
  ismanaged: boolean;

  ownerid: string;

  solutionid: string;
  type: number;
  statecode: number;
  statuscode: number;
  uniquename: string;

}
