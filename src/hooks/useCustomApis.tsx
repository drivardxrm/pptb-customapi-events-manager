import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApiDto } from '../models/CustomApiDto';
import { SelectableItem } from '../components/GenericTagPicker';
import { useMemo } from 'react';


export const useCustomApis = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);


  const { data, status, error, isFetching } =
    useQuery<{ value: CustomApiDto[] }, Error>(
      {
        queryKey: ['customapi', instanceId, connection?.id], // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = await window.dataverseAPI.queryData("customapis");
          return result as unknown as { value: CustomApiDto[] };
        },
        enabled: !!connection && !isLoading,
        staleTime: Infinity
      }
    )

  return {
    customapis: data?.value || [],
    status, error, isFetching
  }
}

export const useCustomApisAsSelectableItems = () => {
  const { customapis, status, error, isFetching } = useCustomApis();

  const items: SelectableItem[] = useMemo(
    () =>
      customapis.map(c => ({
        id: c.customapiid,
        displayText: c.uniquename,
        image : null
      })),
    [customapis]
  );

  return { items, status, error, isFetching };
};
