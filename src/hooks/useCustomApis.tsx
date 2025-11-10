import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApi } from '../models/CustomApi';


export const useCustomApis = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);
  const selectedSolutionId = useAppStore((state) => state.selectedSolutionId);


  const { data, status, error, isFetching } =
    useQuery<{ value: CustomApi[] }, Error>(
      {
        queryKey: ['customapi', instanceId, connection?.id, selectedSolutionId], // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = selectedSolutionId == null ? 
            await window.dataverseAPI.retrieveMultiple(fetchXmlAllCutomApis) :
            await window.dataverseAPI.retrieveMultiple(fetchXmlCutomApisForSolution(selectedSolutionId));
          return result as unknown as { value: CustomApi[] };
        },
        enabled: !!connection && !isLoading,
        staleTime: Infinity
      }
    )

  return {
    customapis: data?.value || [],
    status, error, isFetching
  }
}

// todo would be nice to apply filter afterwards as well

const fetchXmlAllCutomApis = 
  `<fetch>
    <entity name='customapi'>
      <attribute name='createdonbehalfbyyominame' />
      <attribute name='owninguser' />
      <attribute name='statecode' />
      <attribute name='owneridname' />
      <attribute name='description' />
      <attribute name='statecodename' />
      <attribute name='ismanagedname' />
      <attribute name='createdonbehalfby' />
      <attribute name='isfunctionname' />
      <attribute name='sdkmessageidname' />
      <attribute name='name' />
      <attribute name='componentidunique' />
      <attribute name='iscustomizable' />
      <attribute name='isprivate' />
      <attribute name='customapiid' />
      <attribute name='importsequencenumber' />
      <attribute name='bindingtypename' />
      <attribute name='modifiedbyyominame' />
      <attribute name='allowedcustomprocessingsteptype' />
      <attribute name='componentstate' />
      <attribute name='allowedcustomprocessingsteptypename' />
      <attribute name='utcconversiontimezonecode' />
      <attribute name='createdbyyominame' />
      <attribute name='owningbusinessunit' />
      <attribute name='modifiedbyname' />
      <attribute name='owningteam' />
      <attribute name='isfunction' />
      <attribute name='workflowsdkstepenabled' />
      <attribute name='modifiedby' />
      <attribute name='createdby' />
      <attribute name='timezoneruleversionnumber' />
      <attribute name='sdkmessageid' />
      <attribute name='plugintypeid' />
      <attribute name='owneridtype' />
      <attribute name='statuscodename' />
      <attribute name='overwritetime' />
      <attribute name='uniquename' />
      <attribute name='solutionid' />
      <attribute name='owneridyominame' />
      <attribute name='modifiedon' />
      <attribute name='displayname' />
      <attribute name='bindingtype' />
      <attribute name='ismanaged' />
      <attribute name='statuscode' />
      <attribute name='createdbyname' />
      <attribute name='createdon' />
      <attribute name='plugintypeidname' />
      <attribute name='componentstatename' />
      <attribute name='boundentitylogicalname' />
      <attribute name='executeprivilegename' />
      <attribute name='isprivatename' />
      <attribute name='ownerid' />
      <attribute name='fxexpressionid' />
      <attribute name='fxexpressionidname' />
      <order attribute='name' />
    </entity>
  </fetch>";`;

const fetchXmlCutomApisForSolution = (solutionid:string) => `
 <fetch>
   <entity name='customapi'>
     <attribute name='createdonbehalfbyyominame' />
     <attribute name='owninguser' />
     <attribute name='statecode' />
     <attribute name='owneridname' />
     <attribute name='description' />
     <attribute name='statecodename' />
     <attribute name='ismanagedname' />
     <attribute name='createdonbehalfby' />
     <attribute name='isfunctionname' />
     <attribute name='sdkmessageidname' />
     <attribute name='name' />
     <attribute name='componentidunique' />
     <attribute name='iscustomizable' />
     <attribute name='isprivate' />
     <attribute name='customapiid' />
     <attribute name='importsequencenumber' />
     <attribute name='bindingtypename' />
     <attribute name='modifiedbyyominame' />
     <attribute name='allowedcustomprocessingsteptype' />
     <attribute name='componentstate' />
     <attribute name='allowedcustomprocessingsteptypename' />
     <attribute name='utcconversiontimezonecode' />
     <attribute name='createdbyyominame' />
     <attribute name='owningbusinessunit' />
     <attribute name='modifiedbyname' />
     <attribute name='owningteam' />
     <attribute name='isfunction' />
     <attribute name='workflowsdkstepenabled' />
     <attribute name='modifiedby' />
     <attribute name='createdby' />
     <attribute name='timezoneruleversionnumber' />
     <attribute name='sdkmessageid' />
     <attribute name='plugintypeid' />
     <attribute name='owneridtype' />
     <attribute name='statuscodename' />
     <attribute name='overwritetime' />
     <attribute name='uniquename' />
     <attribute name='solutionid' />
     <attribute name='owneridyominame' />
     <attribute name='modifiedon' />
     <attribute name='displayname' />
     <attribute name='bindingtype' />
     <attribute name='ismanaged' />
     <attribute name='statuscode' />
     <attribute name='createdbyname' />
     <attribute name='createdon' />
     <attribute name='plugintypeidname' />
     <attribute name='componentstatename' />
     <attribute name='boundentitylogicalname' />
     <attribute name='executeprivilegename' />
     <attribute name='isprivatename' />
     <attribute name='ownerid' />
     <attribute name='fxexpressionid' />
     <attribute name='fxexpressionidname' />
     <link-entity name='solutioncomponent' from='objectid' to='customapiid' link-type='inner' alias='SC'>
         <attribute name='componenttype' />
         <attribute name='solutionid' />
         <filter>
             <condition attribute='solutionid' operator='eq' value='${solutionid}'/>
         </filter>      
     </link-entity>
     <order attribute='name' />
   </entity>
 </fetch>";`;
