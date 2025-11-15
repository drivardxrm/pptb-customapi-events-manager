import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { Publisher } from '../models/Publisher';



export const usePublishers = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);



  const { data, status, error, isFetching } =
    useQuery<{ value: Publisher[] }, Error>(
      {
        queryKey: ['publishers', instanceId, connection?.id], // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = window.dataverseAPI.queryData('publishers?$select=publisherid,uniquename,friendlyname,customizationprefix'); // todo limit fields for perf
          return result as unknown as { value: Publisher[] };
        },
        enabled: !!connection && !isLoading,
        staleTime: Infinity
      }
    )

  return {
    publishers: data?.value || [],
    status, error, isFetching
  }
}

