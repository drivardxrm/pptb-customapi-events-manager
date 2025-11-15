import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApiResponseProperty } from '../models/CustomApiResponseProperty';



export const useCustomApiResponseProperties = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);
  const selectedCustomApiId = useAppStore((state) => state.selectedCustomApiId);


  const { data, status, error, isFetching } =
    useQuery<{ value: CustomApiResponseProperty[] }, Error>(
      {
        queryKey: ['customapiresponseproperty', selectedCustomApiId, instanceId, connection?.id], // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = await window.dataverseAPI.queryData(`customapiresponseproperties?$filter=_customapiid_value eq ${selectedCustomApiId}`);
          return result as unknown as { value: CustomApiResponseProperty[] };
        },
        enabled: !!connection && !isLoading && !!selectedCustomApiId,
        staleTime: Infinity
      }
    )

  return {
    responseProperties: data?.value || [],
    status, error, isFetching
  }
}


