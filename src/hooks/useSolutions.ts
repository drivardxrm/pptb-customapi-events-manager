import { useQuery } from '@tanstack/react-query'

import { useAppStore } from '../store/useAppStore'
import { Solution } from '../models/Solution';


export const useSolutions = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);


  const { data, status, error, isFetching } =
    useQuery<{ value: Solution[] }, Error>(
      {
        queryKey: ['solutions', instanceId, connection?.id], // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = await window.dataverseAPI.getSolutions(["solutionid", "uniquename", "friendlyname", "version", "ismanaged"]);
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

// export const useSolutionsAsSelectableItems = () => {
//   const { solutions, status, error, isFetching } = useSolutions();

//   const items: SelectableItem[] = useMemo(
//     () =>
//       solutions.map(s => ({
//         id: s.solutionid,
//         displayText: s.uniquename,
//         image : s.ismanaged ? <LockClosedKey24Regular /> : <LockOpen24Regular />
//       })),
//     [solutions]
//   );

//   return { items, status, error, isFetching };
// };
