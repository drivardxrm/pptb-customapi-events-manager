import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApiRequestParameter, CustomApiRequestParameterUpdateable } from '../models/CustomApiRequestParameter';
import { customApiRequestParameterService, CustomApiRequestParameterUpdateResult } from '../services/CustomApiRequestParameterService';
import { queryKeys } from '../utils/queryKeys';


export const useCustomApiRequestParameters = () => {

  
  const { connection, isLoadingConnection , instanceId, selectedCustomApiId  } = useAppStore()

  const { data, status, error, isFetching } =
    useQuery<{ value: CustomApiRequestParameter[] }, Error>(
      {
        queryKey: queryKeys.requestparameters(selectedCustomApiId ?? "", connection?.id ?? '', instanceId), 
        queryFn: async () => {
          const result = window.dataverseAPI.queryData(`customapirequestparameters?$filter=_customapiid_value eq ${selectedCustomApiId}`);
          return result as unknown as { value: CustomApiRequestParameter[] };
        },
        enabled: !!connection && !isLoadingConnection,
        staleTime: Infinity
      }
    )

  return {
    requestParameters: data?.value || [],
    status, error, isFetching
  }
}

type UpdateCustomApiRequestParameterInput = {
  current: CustomApiRequestParameter;
  next: CustomApiRequestParameterUpdateable;
};

export const useUpdateCustomApiRequestParameter = () => {
  const queryClient = useQueryClient();
  const { connection, addLog , instanceId, selectedCustomApiId  } = useAppStore()

  return useMutation<CustomApiRequestParameterUpdateResult, unknown, UpdateCustomApiRequestParameterInput>({
    mutationFn: async ({ current, next }) => {
      try {
        const result = await customApiRequestParameterService.updateCustomApiRequestParameter(current, next);

        if (!result.updated) {
          addLog('No changes to save', 'warning');
          return result;
        }

        addLog(`Custom API Request Parameter'${current.uniquename}' updated successfully`, 'success');
        return result;
      } catch (error) {
        console.error('Error saving Custom API', error);
        addLog(`Failed to save Custom API Request Parameter changes. ${error}`, 'error');
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result.updated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.requestparameters(selectedCustomApiId ?? "", connection?.id ?? '', instanceId) });
      }
    },
  });
};


