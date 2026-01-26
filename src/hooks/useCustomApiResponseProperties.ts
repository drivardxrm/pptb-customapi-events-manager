import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApiResponseProperty, CustomApiResponsePropertyCreateable, CustomApiResponsePropertyUpdateable } from '../models/CustomApiResponseProperty';
import { queryKeys } from '../utils/queryKeys';
import { customApiResponsePropertyService } from '../services/CustomApiResponsePropertyService';
import { UpdateResult,CreateResult } from '../services/EntityService';



export const useCustomApiResponseProperties = () => {

  const { connection, isLoadingConnection , instanceId, selectedCustomApiId  } = useAppStore()


  const { data, status, error, isFetching } =
    useQuery<{ value: CustomApiResponseProperty[] }, Error>(
      {
        queryKey: queryKeys.responseproperties(selectedCustomApiId ?? "", connection?.id ?? '', instanceId), 
        queryFn: async () => {
          const result = window.dataverseAPI.queryData(`customapiresponseproperties?$filter=_customapiid_value eq ${selectedCustomApiId}`);
          return result as unknown as { value: CustomApiResponseProperty[] };
        },
        enabled: !!connection && !isLoadingConnection && !!selectedCustomApiId,
        staleTime: Infinity
      }
    )

  return {
    responseProperties: data?.value || [],
    status, error, isFetching
  }
}

type CreateCustomApiResponsePropertyInput = {
  next: CustomApiResponsePropertyCreateable;
};

export const useCreateCustomApiResponseProperty = () => {
  const queryClient = useQueryClient();
  const { connection, addLog , instanceId, selectedCustomApiId  } = useAppStore()

  return useMutation<CreateResult, unknown, CreateCustomApiResponsePropertyInput>({
    mutationFn: async ({  next }) => {
      try {
        const result = await customApiResponsePropertyService.createCustomApiResponseProperty( next);

       
        addLog(`Custom API Response Property '${next.uniquename}' created successfully`, 'success');
        return result;
      } catch (error) {
        console.error('Error creating Custom API Response Property', error);
        addLog(`Failed to create Custom API Response Property. ${error}`, 'error');
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result.created) {
        queryClient.invalidateQueries({ queryKey: queryKeys.responseproperties(selectedCustomApiId ?? "", connection?.id ?? '', instanceId) });
      }
    },
  });
};

type UpdateCustomApiResponsePropertyInput = {
  current: CustomApiResponseProperty;
  next: CustomApiResponsePropertyUpdateable;
};

export const useUpdateCustomApiResponseProperty = () => {
  const queryClient = useQueryClient();
  const { connection, addLog , instanceId, selectedCustomApiId  } = useAppStore()

  return useMutation<UpdateResult, unknown, UpdateCustomApiResponsePropertyInput>({
    mutationFn: async ({ current, next }) => {
      try {
        const result = await customApiResponsePropertyService.updateCustomApiResponseProperty(current, next);

        if (!result.updated) {
          addLog('No changes to save', 'warning');
          return result;
        }

        addLog(`Custom API Response Property'${current.uniquename}' updated successfully`, 'success');
        return result;
      } catch (error) {
        console.error('Error saving Custom API Response Property', error);
        addLog(`Failed to save Custom API Response Property changes. ${error}`, 'error');
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result.updated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.responseproperties(selectedCustomApiId ?? "", connection?.id ?? '', instanceId) });
      }
    },
  });
};
