import { useQuery } from '@tanstack/react-query'
import { useConnection } from './useToolboxAPI'
import { SolutionDto } from '../types/SolutionDto'

export const useSolutions = () => {

  // TODO on refresh connection ?? invaliate querie
  const { connection, isLoading } = useConnection();


  const { data, status, error, isFetching } =
    useQuery<{ value: SolutionDto[] }, Error>(
      {
        queryKey: ['solutions'], // TODO add instanceid 
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
