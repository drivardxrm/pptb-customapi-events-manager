import { useQuery } from '@tanstack/react-query'
import { SolutionDto } from '../types/SolutionDto'
import { useAppContext } from '../contexts/AppContext'
import { SelectableItem } from '../components/GenericTagPicker';
import { useMemo } from 'react';
import { LockClosedKey24Regular, LockOpen24Regular } from '@fluentui/react-icons';

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

export const useSolutionsAsSelectableItems = () => {
  const { solutions, status, error, isFetching } = useSolutions();

  const items: SelectableItem[] = useMemo(
    () =>
      solutions.map(s => ({
        id: s.solutionid,
        displayText: s.uniquename,
        image : s.ismanaged ? <LockClosedKey24Regular /> : <LockOpen24Regular />
      })),
    [solutions]
  );

  return { items, status, error, isFetching };
};
