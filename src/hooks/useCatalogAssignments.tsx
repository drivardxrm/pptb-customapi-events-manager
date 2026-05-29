import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { queryKeys } from '../utils/queryKeys';

import { Catalog } from '../models/Catalog';
import { CatalogAssignment, CatalogAssignmentCreateInput, CatalogAssignmentUpdateInput, getObjectType } from '../models/CatalogAssignment';
import { useAllCatalogs } from './useCatalogs';
import { catalogAssignmentService } from '../services/CatalogAssignmentService';
import { DeleteResult, UpdateResult, CreateResult } from '../services/EntityService';
import { notify } from '../utils/notify';


export const useCatalogAssignments = () => {

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
    allCatalogAssignments: data || [],
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

export interface CustomApiCatalogAssignmentTarget {
  assignment: CatalogAssignment;
  category: Catalog | null;
  rootCatalog: Catalog | null;
  assignmentLabel: string;
  pathLabel: string;
}

const getCatalogDisplayName = (catalog: Catalog | null | undefined) =>
  catalog?.displayname || catalog?.name || 'Unknown Catalog';

const resolveCatalogPath = (
  catalogId: string,
  catalogsById: Map<string, Catalog>,
) => {
  const category = catalogsById.get(catalogId) ?? null;

  if (!category) {
    return {
      category: null,
      rootCatalog: null,
    };
  }

  let rootCatalog = category;
  let currentCatalog = category;
  const visitedCatalogIds = new Set<string>([category.catalogid]);

  while (currentCatalog._parentcatalogid_value) {
    const parentCatalog = catalogsById.get(currentCatalog._parentcatalogid_value);
    if (!parentCatalog || visitedCatalogIds.has(parentCatalog.catalogid)) {
      break;
    }

    rootCatalog = parentCatalog;
    currentCatalog = parentCatalog;
    visitedCatalogIds.add(parentCatalog.catalogid);
  }

  return {
    category,
    rootCatalog,
  };
};

const buildCatalogPathLabel = (rootCatalog: Catalog | null, category: Catalog | null) => {
  if (rootCatalog && category && rootCatalog.catalogid !== category.catalogid) {
    return `${getCatalogDisplayName(rootCatalog)} → ${getCatalogDisplayName(category)}`;
  }

  return getCatalogDisplayName(category ?? rootCatalog);
};

export const useCustomApiCatalogAssignments = (customApiId: string | null | undefined) => {
  const { catalogAssignments, status, error, isFetching } = useCatalogAssignments();
  const { catalogs: allCatalogs, isFetching: isFetchingCatalogs } = useAllCatalogs();
  const catalogsById = useMemo(
    () => new Map(allCatalogs.map((catalog) => [catalog.catalogid, catalog])),
    [allCatalogs],
  );

  const businessEventAssignments = useMemo<CustomApiCatalogAssignmentTarget[]>(() => {
    if (!customApiId) {
      return [];
    }

    return catalogAssignments
      .filter(assignment => assignment._object_value === customApiId && getObjectType(assignment) === 'customapi')
      .map((assignment) => {
        const { category, rootCatalog } = resolveCatalogPath(assignment._catalogid_value, catalogsById);

        return {
          assignment,
          category,
          rootCatalog,
          assignmentLabel:
            assignment.name ||
            assignment['_object_value@OData.Community.Display.V1.FormattedValue'] ||
            'Unnamed Assignment',
          pathLabel: buildCatalogPathLabel(rootCatalog, category),
        };
      })
      .sort((left, right) => {
        const pathCompare = left.pathLabel.localeCompare(right.pathLabel);
        return pathCompare !== 0 ? pathCompare : left.assignmentLabel.localeCompare(right.assignmentLabel);
      });
  }, [catalogAssignments, catalogsById, customApiId]);

  return {
    businessEventAssignments,
    status,
    error,
    isFetching: isFetching || isFetchingCatalogs,
  };
};


type CreateCatalogAssignmentInput = {
  next: CatalogAssignmentCreateInput;
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
  next: CatalogAssignmentUpdateInput;
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
