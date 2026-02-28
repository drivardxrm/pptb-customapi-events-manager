import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { queryKeys } from '../utils/queryKeys';
import { Entity } from '../models/Entity';


export const useEntities = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);



  const { data, status, error, isFetching } =
    useQuery<{ value: Entity[] }, Error>(
      {
        queryKey: queryKeys.entities(connection?.id ?? '', instanceId), // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = window.dataverseAPI.queryData('entities?$select=entityid,logicalname'); // todo limit fields for perf
          return result as unknown as { value: Entity[] };
        },
        enabled: !!connection && !isLoading,
        staleTime: Infinity
      }
    )

  return {
    entities: data?.value || [],
    status, error, isFetching
  }
}

