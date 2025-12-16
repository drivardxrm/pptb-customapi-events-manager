import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApi, CustomApiCreateable, CustomApiUpdateable } from '../models/CustomApi';
import { CustomApiCreateResult, customApiService, CustomApiUpdateResult } from '../services/CustomApiService';
import { queryKeys } from '../utils/queryKeys';


export const useCustomApis = () => {

  // Get connection and instanceId from Zustand store
  const { connection, isLoadingConnection, instanceId, selectedSolutionId }  = useAppStore();

  

  const { data, status, error, isFetching } =
    useQuery<CustomApi[], Error>(
      {
        queryKey: queryKeys.customapis(connection?.id ?? '', instanceId , selectedSolutionId ?? ''), // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = selectedSolutionId == null || selectedSolutionId == '' ? 
            await customApiService.fetchAllCustomApi() :
            await customApiService.fetchSolutionCustomApi(selectedSolutionId);
          //console.log('Fetched customapis:', result);
          return result;
        },
        enabled: !!connection && !isLoadingConnection,
        staleTime: Infinity
      }
    )

  return {
    customapis: data || [],
    status, error, isFetching
  }
}

type CreateCustomApiInput = {
  next: CustomApiCreateable;
};

export const useCreateCustomApi = () => {
  const queryClient = useQueryClient();
  const {addLog} = useAppStore();
  const { connection, instanceId, selectedSolutionId }  = useAppStore();

  return useMutation<CustomApiCreateResult, unknown, CreateCustomApiInput>({
    mutationFn: async ({  next }) => {
      try {
        const result = await customApiService.createCustomApi( next);

       
        addLog(`Custom API '${next.uniquename}' created successfully`, 'success');
        return result;
      } catch (error) {
        console.error('Error creating Custom API', error);
        addLog(`Failed to create Custom API. ${error}`, 'error');
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result.created) {
        queryClient.invalidateQueries({ queryKey: queryKeys.customapis(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
      }
    },
  });
};


type UpdateCustomApiInput = {
  current: CustomApi;
  next: CustomApiUpdateable;
};

export const useUpdateCustomApi = () => {
  const queryClient = useQueryClient();
  const {addLog} = useAppStore();
  const { connection, instanceId, selectedSolutionId }  = useAppStore();

  return useMutation<CustomApiUpdateResult, unknown, UpdateCustomApiInput>({
    mutationFn: async ({ current, next }) => {
      try {
        const result = await customApiService.updateCustomApi(current, next);

        if (!result.updated) {
          addLog('No changes to save', 'warning');
          return result;
        }

        addLog(`Custom API '${current.uniquename}' updated successfully`, 'success');
        return result;
      } catch (error) {
        console.error('Error saving Custom API', error);
        addLog(`Failed to save Custom API changes. ${error}`, 'error');
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result.updated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.customapis(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
      }
    },
  });
};



// todo would be nice to apply filter afterwards as well

// const fetchXmlAllCutomApis = 
//   `<fetch>
//     <entity name='customapi'>
//       <attribute name='createdonbehalfbyyominame' />
//       <attribute name='owninguser' />
//       <attribute name='statecode' />
//       <attribute name='owneridname' />
//       <attribute name='description' />
//       <attribute name='statecodename' />
//       <attribute name='ismanagedname' />
//       <attribute name='createdonbehalfby' />
//       <attribute name='isfunctionname' />
//       <attribute name='sdkmessageidname' />
//       <attribute name='name' />
//       <attribute name='componentidunique' />
//       <attribute name='iscustomizable' />
//       <attribute name='isprivate' />
//       <attribute name='customapiid' />
//       <attribute name='importsequencenumber' />
//       <attribute name='bindingtypename' />
//       <attribute name='modifiedbyyominame' />
//       <attribute name='allowedcustomprocessingsteptype' />
//       <attribute name='componentstate' />
//       <attribute name='allowedcustomprocessingsteptypename' />
//       <attribute name='utcconversiontimezonecode' />
//       <attribute name='createdbyyominame' />
//       <attribute name='owningbusinessunit' />
//       <attribute name='modifiedbyname' />
//       <attribute name='owningteam' />
//       <attribute name='isfunction' />
//       <attribute name='workflowsdkstepenabled' />
//       <attribute name='modifiedby' />
//       <attribute name='createdby' />
//       <attribute name='timezoneruleversionnumber' />
//       <attribute name='sdkmessageid' />
//       <attribute name='plugintypeid' />
//       <attribute name='owneridtype' />
//       <attribute name='statuscodename' />
//       <attribute name='overwritetime' />
//       <attribute name='uniquename' />
//       <attribute name='solutionid' />
//       <attribute name='owneridyominame' />
//       <attribute name='modifiedon' />
//       <attribute name='displayname' />
//       <attribute name='bindingtype' />
//       <attribute name='ismanaged' />
//       <attribute name='statuscode' />
//       <attribute name='createdbyname' />
//       <attribute name='createdon' />
//       <attribute name='plugintypeidname' />
//       <attribute name='componentstatename' />
//       <attribute name='boundentitylogicalname' />
//       <attribute name='executeprivilegename' />
//       <attribute name='isprivatename' />
//       <attribute name='ownerid' />
//       <attribute name='fxexpressionid' />
//       <attribute name='fxexpressionidname' />
//       <order attribute='name' />
//     </entity>
//   </fetch>";`;

// const fetchXmlCutomApisForSolution = (solutionid:string) => `
//  <fetch>
//    <entity name='customapi'>
//      <attribute name='createdonbehalfbyyominame' />
//      <attribute name='owninguser' />
//      <attribute name='statecode' />
//      <attribute name='owneridname' />
//      <attribute name='description' />
//      <attribute name='statecodename' />
//      <attribute name='ismanagedname' />
//      <attribute name='createdonbehalfby' />
//      <attribute name='isfunctionname' />
//      <attribute name='sdkmessageidname' />
//      <attribute name='name' />
//      <attribute name='componentidunique' />
//      <attribute name='iscustomizable' />
//      <attribute name='isprivate' />
//      <attribute name='customapiid' />
//      <attribute name='importsequencenumber' />
//      <attribute name='bindingtypename' />
//      <attribute name='modifiedbyyominame' />
//      <attribute name='allowedcustomprocessingsteptype' />
//      <attribute name='componentstate' />
//      <attribute name='allowedcustomprocessingsteptypename' />
//      <attribute name='utcconversiontimezonecode' />
//      <attribute name='createdbyyominame' />
//      <attribute name='owningbusinessunit' />
//      <attribute name='modifiedbyname' />
//      <attribute name='owningteam' />
//      <attribute name='isfunction' />
//      <attribute name='workflowsdkstepenabled' />
//      <attribute name='modifiedby' />
//      <attribute name='createdby' />
//      <attribute name='timezoneruleversionnumber' />
//      <attribute name='sdkmessageid' />
//      <attribute name='plugintypeid' />
//      <attribute name='owneridtype' />
//      <attribute name='statuscodename' />
//      <attribute name='overwritetime' />
//      <attribute name='uniquename' />
//      <attribute name='solutionid' />
//      <attribute name='owneridyominame' />
//      <attribute name='modifiedon' />
//      <attribute name='displayname' />
//      <attribute name='bindingtype' />
//      <attribute name='ismanaged' />
//      <attribute name='statuscode' />
//      <attribute name='createdbyname' />
//      <attribute name='createdon' />
//      <attribute name='plugintypeidname' />
//      <attribute name='componentstatename' />
//      <attribute name='boundentitylogicalname' />
//      <attribute name='executeprivilegename' />
//      <attribute name='isprivatename' />
//      <attribute name='ownerid' />
//      <attribute name='fxexpressionid' />
//      <attribute name='fxexpressionidname' />
//      <link-entity name='solutioncomponent' from='objectid' to='customapiid' link-type='inner' alias='SC'>
//          <attribute name='componenttype' />
//          <attribute name='solutionid' />
//          <filter>
//              <condition attribute='solutionid' operator='eq' value='${solutionid}'/>
//          </filter>      
//      </link-entity>
//      <order attribute='name' />
//    </entity>
//  </fetch>";`;
