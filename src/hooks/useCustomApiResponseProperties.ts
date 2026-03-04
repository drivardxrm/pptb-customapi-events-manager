import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApiResponseProperty, CustomApiResponsePropertyCreateable, CustomApiResponsePropertyUpdateable } from '../models/CustomApiResponseProperty';
import { queryKeys } from '../utils/queryKeys';
import { customApiResponsePropertyService } from '../services/CustomApiResponsePropertyService';
import { UpdateResult, CreateResult, DeleteResult } from '../services/EntityService';
import { notify } from '../utils/notify';



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
  solutionUniqueName?: string;
};

export const useCreateCustomApiResponseProperty = () => {
  const queryClient = useQueryClient();
  const { connection, addLog , instanceId, selectedCustomApiId  } = useAppStore()

  return useMutation<CreateResult, unknown, CreateCustomApiResponsePropertyInput>({
    mutationFn: async ({  next, solutionUniqueName }) => {
      try {
        const result = await customApiResponsePropertyService.createCustomApiResponseProperty(next, solutionUniqueName);

       
        addLog(`Custom API Response Property '${next.uniquename}' created successfully`, 'success');
        notify({ title: 'Response Property Created', body: `'${next.uniquename}' created successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error creating Custom API Response Property', error);
        addLog(`Failed to create Custom API Response Property. ${error}`, 'error');
        notify({ title: 'Creation Failed', body: `Failed to create Response Property. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: () => {
      
        queryClient.invalidateQueries({ queryKey: queryKeys.responseproperties(selectedCustomApiId ?? "", connection?.id ?? '', instanceId) });
      
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
          notify({ title: 'No Changes', body: 'No changes to save', type: 'warning', duration: 3000 });
          return result;
        }

        addLog(`Custom API Response Property'${current.uniquename}' updated successfully`, 'success');
        notify({ title: 'Response Property Updated', body: `'${current.uniquename}' updated successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error saving Custom API Response Property', error);
        addLog(`Failed to save Custom API Response Property changes. ${error}`, 'error');
        notify({ title: 'Update Failed', body: `Failed to save Response Property changes. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: () => {
      
        queryClient.invalidateQueries({ queryKey: queryKeys.responseproperties(selectedCustomApiId ?? "", connection?.id ?? '', instanceId) });
      
    },
  });
};

type DeleteCustomApiResponsePropertyInput = {
  responseProperty: CustomApiResponseProperty;
};

export const useDeleteCustomApiResponseProperty = () => {
  const queryClient = useQueryClient();
  const { addLog } = useAppStore();
  const { connection, instanceId, selectedCustomApiId } = useAppStore();

  return useMutation<DeleteResult, unknown, DeleteCustomApiResponsePropertyInput>({
    mutationFn: async ({ responseProperty }) => {
      try {
        const result = await customApiResponsePropertyService.deleteRecord(responseProperty.customapiresponsepropertyid);
        addLog(`Response Property '${responseProperty.uniquename}' deleted successfully`, 'success');
        notify({ title: 'Response Property Deleted', body: `'${responseProperty.uniquename}' deleted successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error deleting Response Property', error);
        addLog(`Failed to delete Response Property. ${error}`, 'error');
        notify({ title: 'Deletion Failed', body: `Failed to delete Response Property. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: () => {
      
        queryClient.invalidateQueries({ queryKey: queryKeys.responseproperties(selectedCustomApiId ?? "", connection?.id ?? '', instanceId) });
      
    },
  });
};
