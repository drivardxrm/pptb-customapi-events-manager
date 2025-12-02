import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApiRequestParameter, CustomApiRequestParameterUpdateable } from '../models/CustomApiRequestParameter';
import { customApiRequestParameterService, CustomApiRequestParameterUpdateResult } from '../services/CustomApiRequestParameterService';


export const useCustomApiRequestParameters = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);
  const selectedCustomApiId = useAppStore((state) => state.selectedCustomApiId);


  const { data, status, error, isFetching } =
    useQuery<{ value: CustomApiRequestParameter[] }, Error>(
      {
        queryKey: ['customapirequestparameter', selectedCustomApiId, instanceId, connection?.id], // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = window.dataverseAPI.queryData(`customapirequestparameters?$filter=_customapiid_value eq ${selectedCustomApiId}`);
          return result as unknown as { value: CustomApiRequestParameter[] };
        },
        enabled: !!connection && !isLoading,
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
  const {addLog} = useAppStore();

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
        queryClient.invalidateQueries({ queryKey: ['customapirequestparameter'] });
      }
    },
  });
};


