import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { queryKeys } from '../utils/queryKeys';

import { CatalogAssignment, CatalogAssignmentCreateable, CatalogAssignmentUpdateable } from '../models/CatalogAssignment';
import { catalogAssignmentService } from '../services/CatalogAssignmentService';
import { DeleteResult, UpdateResult, CreateResult } from '../services/EntityService';
import { notify } from '../utils/notify';


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

// Hook for fetching assignments for a specific catalog
export const useCatalogAssignmentsByCatalog = (catalogId: string | null) => {
  const { connection, isLoadingConnection, instanceId } = useAppStore();

  const { data, status, error, isFetching, refetch } = useQuery<CatalogAssignment[], Error>({
    queryKey: queryKeys.catalogassignmentsByCatalog(catalogId ?? '', connection?.id ?? '', instanceId),
    queryFn: async () => {
      if (!catalogId) {
        return [];
      }
      return await catalogAssignmentService.fetchAssignmentsByCatalog(catalogId);
    },
    enabled: !!connection && !isLoadingConnection && !!catalogId,
    staleTime: Infinity
  });

  return {
    assignments: data || [],
    status, error, isFetching, refetch
  };
};


type CreateCatalogAssignmentInput = {
  next: CatalogAssignmentCreateable;
  objectEntityName: string;
  solutionUniqueName?: string;
};

export const useCreateCatalogAssignment = () => {
  const queryClient = useQueryClient();
  const { addLog } = useAppStore();
  const { connection, instanceId, selectedSolutionId } = useAppStore();

  return useMutation<CreateResult, unknown, CreateCatalogAssignmentInput>({
    mutationFn: async ({ next, objectEntityName, solutionUniqueName }) => {
      try {
        const result = await catalogAssignmentService.createCatalogAssignment(next, objectEntityName, solutionUniqueName);

        addLog(`Catalog Assignment '${next.name}' created successfully${solutionUniqueName ? ` in solution '${solutionUniqueName}'` : ''}`, 'success');
        notify({ title: 'Assignment Created', body: `'${next.name}' created successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error creating Catalog Assignment', error);
        addLog(`Failed to create Catalog Assignment. ${error}`, 'error');
        notify({ title: 'Creation Failed', body: `Failed to create Catalog Assignment. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      if (result.created) {
        queryClient.invalidateQueries({ queryKey: queryKeys.catalogassignments(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
        // Invalidate assignments for the specific catalog
        if (variables.next._catalogid_value) {
          queryClient.invalidateQueries({ queryKey: queryKeys.catalogassignmentsByCatalog(variables.next._catalogid_value, connection?.id ?? '', instanceId) });
        }
      }
    },
  });
};


type UpdateCatalogAssignmentInput = {
  current: CatalogAssignment;
  next: CatalogAssignmentUpdateable;
};

export const useUpdateCatalogAssignment = () => {
  const queryClient = useQueryClient();
  const { addLog } = useAppStore();
  const { connection, instanceId, selectedSolutionId } = useAppStore();

  return useMutation<UpdateResult, unknown, UpdateCatalogAssignmentInput>({
    mutationFn: async ({ current, next }) => {
      try {
        const result = await catalogAssignmentService.updateCatalogAssignment(current, next);

        if (!result.updated) {
          addLog('No changes to save', 'warning');
          notify({ title: 'No Changes', body: 'No changes to save', type: 'warning', duration: 3000 });
          return result;
        }

        addLog(`Catalog Assignment '${current.name}' updated successfully`, 'success');
        notify({ title: 'Assignment Updated', body: `'${current.name}' updated successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error saving Catalog Assignment', error);
        addLog(`Failed to save Catalog Assignment changes. ${error}`, 'error');
        notify({ title: 'Update Failed', body: `Failed to save Catalog Assignment changes. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      if (result.updated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.catalogassignments(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
        // Invalidate assignments for the specific catalog
        if (variables.current._catalogid_value) {
          queryClient.invalidateQueries({ queryKey: queryKeys.catalogassignmentsByCatalog(variables.current._catalogid_value, connection?.id ?? '', instanceId) });
        }
      }
    },
  });
};


type DeleteCatalogAssignmentInput = {
  assignment: CatalogAssignment;
};

export const useDeleteCatalogAssignment = () => {
  const queryClient = useQueryClient();
  const { addLog } = useAppStore();
  const { connection, instanceId, selectedSolutionId } = useAppStore();

  return useMutation<DeleteResult, unknown, DeleteCatalogAssignmentInput>({
    mutationFn: async ({ assignment }) => {
      try {
        const result = await catalogAssignmentService.deleteRecord(assignment.catalogassignmentid);
        addLog(`Catalog Assignment '${assignment.name}' deleted successfully`, 'success');
        notify({ title: 'Assignment Deleted', body: `'${assignment.name}' deleted successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error deleting Catalog Assignment', error);
        addLog(`Failed to delete Catalog Assignment. ${error}`, 'error');
        notify({ title: 'Deletion Failed', body: `Failed to delete Catalog Assignment. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      if (result.deleted) {
        queryClient.invalidateQueries({ queryKey: queryKeys.catalogassignments(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
        // Invalidate assignments for the specific catalog
        if (variables.assignment._catalogid_value) {
          queryClient.invalidateQueries({ queryKey: queryKeys.catalogassignmentsByCatalog(variables.assignment._catalogid_value, connection?.id ?? '', instanceId) });
        }
      }
    },
  });
};
