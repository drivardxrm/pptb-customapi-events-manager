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




