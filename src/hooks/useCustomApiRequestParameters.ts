import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApiRequestParameter, CustomApiRequestParameterCreateInput, CustomApiRequestParameterUpdateInput } from '../models/CustomApiRequestParameter';
import { customApiRequestParameterService } from '../services/CustomApiRequestParameterService';
import { queryKeys } from '../utils/queryKeys';
import { UpdateResult, CreateResult, DeleteResult } from '../services/EntityService';
import { notify } from '../utils/notify';


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
  next: CustomApiRequestParameterCreateInput;
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
        notify({ title: 'Request Parameter Created', body: `'${next.uniquename}' created successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error creating Custom API Request Parameter', error);
        addLog(`Failed to create Custom API Request Parameter. ${error}`, 'error');
        notify({ title: 'Creation Failed', body: `Failed to create Request Parameter. ${error}`, type: 'error', duration: 5000 });
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
  next: CustomApiRequestParameterUpdateInput;
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
          notify({ title: 'No Changes', body: 'No changes to save', type: 'warning', duration: 3000 });
          return result;
        }

        addLog(`Custom API Request Parameter '${current.uniquename}' updated successfully`, 'success');
        notify({ title: 'Request Parameter Updated', body: `'${current.uniquename}' updated successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error saving Custom API', error);
        addLog(`Failed to save Custom API Request Parameter changes. ${error}`, 'error');
        notify({ title: 'Update Failed', body: `Failed to save Request Parameter changes. ${error}`, type: 'error', duration: 5000 });
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
        notify({ title: 'Request Parameter Deleted', body: `'${requestParameter.uniquename}' deleted successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error deleting Request Parameter', error);
        addLog(`Failed to delete Request Parameter. ${error}`, 'error');
        notify({ title: 'Deletion Failed', body: `Failed to delete Request Parameter. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: () => {
      
        queryClient.invalidateQueries({ queryKey: queryKeys.requestparameters(selectedCustomApiId ?? '', connection?.id ?? '', instanceId) });
      
    },
  });
};
