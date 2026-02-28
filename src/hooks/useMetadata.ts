import DataverseAPI from '@pptb/types/dataverseAPI'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { queryKeys } from '../utils/queryKeys';

export const useMetadata = (entityname:string) => {
  const { connection, instanceId }  = useAppStore();  

  const { data, status, error, isFetching } =
    useQuery<DataverseAPI.EntityMetadata, Error>(
      {
        queryKey: queryKeys.metadata(entityname, connection?.id ?? '', instanceId), 
        queryFn: () => window.dataverseAPI.getEntityMetadata(entityname, true),
        enabled: entityname !== null && entityname !== undefined && entityname !== '',
        staleTime: Infinity
      }
    )

  return {
    metadata: data,
    primaryid: data?.PrimaryIdAttribute,
    primaryname: data?.PrimaryNameAttribute,
    collectionname: data?.LogicalCollectionName, 
    status,
    error,
    isFetching
  }
}
