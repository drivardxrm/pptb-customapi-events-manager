import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { CustomApiResponseProperty } from '../models/CustomApiResponseProperty';
import { queryKeys } from '../utils/queryKeys';



export const useCustomApiResponseProperties = () => {

  const { connection, isLoadingConnection , instanceId, selectedCustomApiId  } = useAppStore()


  const { data, status, error, isFetching } =
    useQuery<{ value: CustomApiResponseProperty[] }, Error>(
      {
        queryKey: queryKeys.responseproperties(selectedCustomApiId ?? "", connection?.id ?? '', instanceId), 
        queryFn: async () => {
          const result = window.dataverseAPI.queryData(`customapiresponseproperties?$filter=_customapiid_value eq ${selectedCustomApiId}`);
          return result as unknown as { value: CustomApiResponseProperty[] };
        },
        enabled: !!connection && !isLoadingConnection && !!selectedCustomApiId,
        staleTime: Infinity
      }
    )

  return {
    responseProperties: data?.value || [],
    status, error, isFetching
  }
}


