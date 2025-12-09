import { useQuery } from '@tanstack/react-query'

import { useAppStore } from '../store/useAppStore'
import { Solution } from '../models/Solution';
import { queryKeys } from '../utils/queryKeys';


export const useSolutions = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);


  const { data, status, error, isFetching } =
    useQuery<{ value: Solution[] }, Error>(
      {
        queryKey: queryKeys.solutions(connection?.id ?? '', instanceId), // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          // TODO Ensure connection is valid
          const result = window.dataverseAPI.getSolutions(["solutionid", "uniquename", "friendlyname", "version", "ismanaged"]);
          console.log('Fetched solutions:', result);
          return result as unknown as { value: Solution[] };
        },
        enabled: !!connection && !isLoading,
        staleTime: Infinity
      }
    )

  return {
    solutions: data?.value || [],
    status, error, isFetching
  }
}
