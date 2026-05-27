import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { queryKeys } from '../utils/queryKeys';
import { Workflow } from '../models/Workflow';


export const useWorflows = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);



  const { data, status, error, isFetching } =
    useQuery<{ value: Workflow[] }, Error>(
      {
        queryKey: queryKeys.workflows(connection?.id ?? '', instanceId), // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = window.dataverseAPI.queryData('workflows?$select=workflowid,name'); // todo limit fields for perf
          return result as unknown as { value: Workflow[] };
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

