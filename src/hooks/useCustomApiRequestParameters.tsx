import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'

import { useMemo } from 'react';
import { SelectableItem } from '../components/GenericTagPicker';
import { CustomApiRequestParameter } from '../models/CustomApiRequestParameter';



export const useCustomApiRequestParameters = () => {

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);
  const selectedCustomApiId = useAppStore((state) => state.selectedCustomApiId);


  const { data, status, error, isFetching } =
    useQuery<{ value: CustomApiRequestParameter[] }, Error>(
      {
        queryKey: ['customapirequestparameter', selectedCustomApiId, instanceId, connection?.id], // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = await window.dataverseAPI.queryData(`customapirequestparameters?$filter=_customapiid_value eq ${selectedCustomApiId}`);
          return result as unknown as { value: CustomApiRequestParameter[] };
        },
        enabled: !!connection && !isLoading,
        staleTime: Infinity
      }
    )

  return {
    requestParameters: data?.value || [],
    status, error, isFetching
  }
}

export const useCustomApiRequestParametersAsSelectableItems = () => {
  const { requestParameters, status, error, isFetching } = useCustomApiRequestParameters();

  const items: SelectableItem[] = useMemo(
    () =>
      requestParameters.map(c => ({
        id: c.customapirequestparameterid,
        displayText: c.uniquename,
        image : null
      })),
    [requestParameters]
  );

  return { items, status, error, isFetching };
};
