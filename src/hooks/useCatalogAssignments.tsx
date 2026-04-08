import {  useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { queryKeys } from '../utils/queryKeys';

import { CatalogAssignment } from '../models/CatalogAssignment';
import { catalogAssignmentService } from '../services/CatalogAssignmentService';


export const useCatalogAssignements = () => {

  // Get connection and instanceId from Zustand store
  const { connection, isLoadingConnection, instanceId, selectedSolutionId }  = useAppStore();

  

  const { data, status, error, isFetching } =
    useQuery<CatalogAssignment[], Error>(
      {
        queryKey: queryKeys.catalogassignments(connection?.id ?? '', instanceId , selectedSolutionId ?? ''), // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result =  await catalogAssignmentService.fetchAllCatalogAssignments()
          //console.log('Fetched customapis:', result);
          return result;
        },
        enabled: !!connection && !isLoadingConnection,
        staleTime: Infinity
      }
    )

  return {
    catalogAssignments: data || [],
    status, error, isFetching
  }
}



