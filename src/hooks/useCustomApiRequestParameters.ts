import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApiRequestParameter, CustomApiRequestParameterCreateable, CustomApiRequestParameterUpdateable } from '../models/CustomApiRequestParameter';
import { customApiRequestParameterService } from '../services/CustomApiRequestParameterService';
import { queryKeys } from '../utils/queryKeys';
import { UpdateResult, CreateResult, DeleteResult } from '../services/EntityService';


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

type CreateCustomApiRequestParameterInput = {
  next: CustomApiRequestParameterCreateable;
  solutionUniqueName?: string;
};

export const useCreateCustomApiRequestParameter = () => {
  const queryClient = useQueryClient();
  const { connection, addLog , instanceId, selectedCustomApiId  } = useAppStore()

  return useMutation<CreateResult, unknown, CreateCustomApiRequestParameterInput>({
    mutationFn: async ({  next, solutionUniqueName }) => {
      try {
        const result = await customApiRequestParameterService.createCustomApiRequestParameter(next, solutionUniqueName);

       
        addLog(`Custom API Request Parameter '${next.uniquename}' created successfully`, 'success');
        return result;
      } catch (error) {
        console.error('Error creating Custom API Request Parameter', error);
        addLog(`Failed to create Custom API Request Parameter. ${error}`, 'error');
        throw error;
      }
    },
    onSuccess: () => {
      
        queryClient.invalidateQueries({ queryKey: queryKeys.requestparameters(selectedCustomApiId ?? "", connection?.id ?? '', instanceId) });
      
    },
  });
};

type UpdateCustomApiRequestParameterInput = {
  current: CustomApiRequestParameter;
  next: CustomApiRequestParameterUpdateable;
};

export const useUpdateCustomApiRequestParameter = () => {
  const queryClient = useQueryClient();
  const { connection, addLog , instanceId, selectedCustomApiId  } = useAppStore()

  return useMutation<UpdateResult, unknown, UpdateCustomApiRequestParameterInput>({
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
    onSuccess: () => {
      
        queryClient.invalidateQueries({ queryKey: queryKeys.requestparameters(selectedCustomApiId ?? "", connection?.id ?? '', instanceId) });
      
    },
  });
};

type DeleteCustomApiRequestParameterInput = {
  requestParameter: CustomApiRequestParameter;
};

export const useDeleteCustomApiRequestParameter = () => {
  const queryClient = useQueryClient();
  const { addLog } = useAppStore();
  const { connection, instanceId, selectedCustomApiId } = useAppStore();

  return useMutation<DeleteResult, unknown, DeleteCustomApiRequestParameterInput>({
    mutationFn: async ({ requestParameter }) => {
      try {
        const result = await customApiRequestParameterService.deleteRecord(requestParameter.customapirequestparameterid);
        addLog(`Request Parameter '${requestParameter.uniquename}' deleted successfully`, 'success');
        return result;
      } catch (error) {
        console.error('Error deleting Request Parameter', error);
        addLog(`Failed to delete Request Parameter. ${error}`, 'error');
        throw error;
      }
    },
    onSuccess: () => {
      
        queryClient.invalidateQueries({ queryKey: queryKeys.requestparameters(selectedCustomApiId ?? '', connection?.id ?? '', instanceId) });
      
    },
  });
};
