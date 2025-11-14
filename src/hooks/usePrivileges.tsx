import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { Privilege } from '../models/Privilege';


export const usePrivileges = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);



  const { data, status, error, isFetching } =
    useQuery<{ value: Privilege[] }, Error>(
      {
        queryKey: ['privileges', instanceId, connection?.id], // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = window.dataverseAPI.queryData('privileges?$select=privilegeid,name'); // todo limit fields for perf
          return result as unknown as { value: Privilege[] };
        },
        enabled: !!connection && !isLoading,
        staleTime: Infinity
      }
    )

  return {
    privileges: data?.value || [],
    status, error, isFetching
  }
}

