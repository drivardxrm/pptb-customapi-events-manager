
import { QueryKeyManager, defineKey } from "react-query-key-manager";

export const queryKeys = QueryKeyManager.create("keys", {
  appsettings: defineKey((connectionid: string, instanceId:string) => ['appsettings', instanceId, connectionid]),
  customapis: defineKey((connectionid: string, instanceId:string, solutionid:string) => ['customapis', instanceId, connectionid, solutionid]),
  requestparameters : defineKey((customapiid: string, connectionid: string, instanceId:string) => ['customapirequestparameters', customapiid, instanceId, connectionid]),
  responseproperties: defineKey((customapiid: string, connectionid: string, instanceId:string) => ['customapiresponseproperties', customapiid, instanceId, connectionid]),
  plugintypes : defineKey((connectionid: string, instanceId:string) => ['plugintypes', instanceId, connectionid]),
  privileges : defineKey((connectionid: string, instanceId:string) => ['privileges', instanceId, connectionid]),
  publishers : defineKey((connectionid: string, instanceId:string) => ['publishers', instanceId, connectionid]), 
  solutions : defineKey((connectionid: string, instanceId:string) => ['solutions', instanceId, connectionid]), 
  solutioncomponentss : defineKey((connectionid: string, instanceId:string) => ['solutioncomponents', instanceId, connectionid]), 
});

// Debugging — list all registered keys
export const allQueryKeys = QueryKeyManager.getQueryKeys();