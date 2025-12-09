import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { PluginType } from '../models/PluginType';
import { queryKeys } from '../utils/queryKeys';


export const usePluginTypes = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);



  const { data, status, error, isFetching } =
    useQuery<{ value: PluginType[] }, Error>(
      {
        queryKey: queryKeys.plugintypes(connection?.id ?? '', instanceId), // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = window.dataverseAPI.queryData('plugintypes?$select=plugintypeid,typename,ismanaged'); // todo limit fields for perf
          console.log('Fetched plugintypes:', result);
          return result as unknown as { value: PluginType[] };
        },
        enabled: !!connection && !isLoading,
        staleTime: Infinity
      }
    )

  return {
    plugintypes: data?.value || [],
    status, error, isFetching
  }
}

