import { useQuery } from '@tanstack/react-query'
import { SolutionDto } from '../types/SolutionDto'
import { useAppContext } from '../contexts/AppContext'

export const useSolutions = () => {

  // Get connection and instanceId from AppContext
  const { connection, isLoading, instanceId } = useAppContext();


  const { data, status, error, isFetching } =
    useQuery<{ value: SolutionDto[] }, Error>(
      {
        queryKey: ['solutions', instanceId, connection?.id], // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = await window.dataverseAPI.getSolutions(["solutionid", "uniquename", "friendlyname", "version", "ismanaged"]);
          return result as unknown as { value: SolutionDto[] };
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
