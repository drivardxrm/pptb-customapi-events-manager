import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApi, CustomApiCreateable, CustomApiUpdateable } from '../models/CustomApi';
import { customApiService } from '../services/CustomApiService';
import { queryKeys } from '../utils/queryKeys';
import { DeleteResult, UpdateResult, CreateResult } from '../services/EntityService';
import { notify } from '../utils/notify';


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
  solutionUniqueName?: string;
};

export const useCreateCustomApi = () => {
  const queryClient = useQueryClient();
  const {addLog} = useAppStore();
  const { connection, instanceId, selectedSolutionId }  = useAppStore();

  return useMutation<CreateResult, unknown, CreateCustomApiInput>({
    mutationFn: async ({  next, solutionUniqueName }) => {
      try {
        const result = await customApiService.createCustomApi( next, solutionUniqueName);

        
        addLog(`Custom API '${next.uniquename}' created successfully${solutionUniqueName ? ` in solution '${solutionUniqueName}'` : ''}`, 'success');
        notify({ title: 'Custom API Created', body: `'${next.uniquename}' created successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error creating Custom API', error);
        addLog(`Failed to create Custom API. ${error}`, 'error');
        notify({ title: 'Creation Failed', body: `Failed to create Custom API. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: () => {
      
        queryClient.invalidateQueries({ queryKey: queryKeys.customapis(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
      
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

  return useMutation<UpdateResult, unknown, UpdateCustomApiInput>({
    mutationFn: async ({ current, next }) => {
      try {
        const result = await customApiService.updateCustomApi(current, next);

        if (!result.updated) {
          addLog('No changes to save', 'warning');
          notify({ title: 'No Changes', body: 'No changes to save', type: 'warning', duration: 3000 });
          return result;
        }

        addLog(`Custom API '${current.uniquename}' updated successfully`, 'success');
        notify({ title: 'Custom API Updated', body: `'${current.uniquename}' updated successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error saving Custom API', error);
        addLog(`Failed to save Custom API changes. ${error}`, 'error');
        notify({ title: 'Update Failed', body: `Failed to save Custom API changes. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: () => {
      
        queryClient.invalidateQueries({ queryKey: queryKeys.customapis(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
      
    },
  });
};


type DeleteCustomApiInput = {
  customApi: CustomApi;
};

export const useDeleteCustomApi = () => {
  const queryClient = useQueryClient();
  const { addLog } = useAppStore();
  const { connection, instanceId, selectedSolutionId } = useAppStore();

  return useMutation<DeleteResult, unknown, DeleteCustomApiInput>({
    mutationFn: async ({ customApi }) => {
      try {
        const result = await customApiService.deleteRecord(customApi.customapiid);
        addLog(`Custom API '${customApi.uniquename}' deleted successfully`, 'success');
        notify({ title: 'Custom API Deleted', body: `'${customApi.uniquename}' deleted successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error deleting Custom API', error);
        addLog(`Failed to delete Custom API. ${error}`, 'error');
        notify({ title: 'Deletion Failed', body: `Failed to delete Custom API. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: () => {
      
        queryClient.invalidateQueries({ queryKey: queryKeys.customapis(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
      
    },
  });
};

