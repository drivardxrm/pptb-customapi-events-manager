import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApiResponsePropertyDto } from '../models/CustomApiResponsePropertyDto';
import { useMemo } from 'react';
import { SelectableItem } from '../components/GenericTagPicker';



export const useCustomApiResponseProperties = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);
  const selectedCustomApiId = useAppStore((state) => state.selectedCustomApiId);


  const { data, status, error, isFetching } =
    useQuery<{ value: CustomApiResponsePropertyDto[] }, Error>(
      {
        queryKey: ['customapiresponseproperty', selectedCustomApiId, instanceId, connection?.id], // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = await window.dataverseAPI.queryData(`customapiresponseproperties?$filter=_customapiid_value eq ${selectedCustomApiId}`);
          return result as unknown as { value: CustomApiResponsePropertyDto[] };
        },
        enabled: !!connection && !isLoading && !!selectedCustomApiId,
        staleTime: Infinity
      }
    )

  return {
    responseProperties: data?.value || [],
    status, error, isFetching
  }
}

export const useCustomApiResponsePropertiesAsSelectableItems = () => {
  const { responseProperties, status, error, isFetching } = useCustomApiResponseProperties();

  const items: SelectableItem[] = useMemo(
    () =>
      responseProperties.map(c => ({
        id: c.customapiresponsepropertyid,
        displayText: c.uniquename,
        image : null
      })),
    [responseProperties]
  );

  return { items, status, error, isFetching };
};
