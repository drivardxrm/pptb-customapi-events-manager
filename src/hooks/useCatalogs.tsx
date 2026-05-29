import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { queryKeys } from '../utils/queryKeys';
import { Catalog, CatalogCreateInput, CatalogUpdateInput } from '../models/Catalog';
import { catalogService } from '../services/CatalogService';
import { DeleteResult, UpdateResult, CreateResult } from '../services/EntityService';
import { notify } from '../utils/notify';


const useCatalogCollection = (solutionId: string | null | undefined) => {
  const { connection, isLoadingConnection, instanceId }  = useAppStore();

  const normalizedSolutionId = solutionId ?? '';
  const { data, status, error, isFetching } =
    useQuery<Catalog[], Error>(
      {
        queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId , normalizedSolutionId), // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = normalizedSolutionId === ''
            ? await catalogService.fetchAllCatalogs()
            : await catalogService.fetchSolutionCatalogs(normalizedSolutionId);
          return result;
        },
        enabled: !!connection && !isLoadingConnection,
        staleTime: Infinity
      }
    );

  return {
    catalogs: data || [],
    status, error, isFetching
  };
};

export const useCatalogs = () => {
  const { selectedSolutionId } = useAppStore();
  return useCatalogCollection(selectedSolutionId);
}

export const useAllCatalogs = () => useCatalogCollection(null);


// Hook for fetching root catalogs (those without a parent)
export const useRootCatalogs = () => {
  const {catalogs, status, error, isFetching} = useCatalogs()

  return {
    rootCatalogs: catalogs.filter(c => !c._parentcatalogid_value) || [],
    status, error, isFetching
  };
};

// Hook for fetching children of a catalog (categories under a root)
export const useCatalogChildren = (parentCatalogId: string | null) => {
  const { connection, isLoadingConnection, instanceId } = useAppStore();

  const { data, status, error, isFetching, refetch } = useQuery<Catalog[], Error>({
    queryKey: queryKeys.catalogChildren(parentCatalogId ?? '', connection?.id ?? '', instanceId),
    queryFn: async () => {
      if (!parentCatalogId) {
        return [];
      }
      return await catalogService.fetchCategoryChildren(parentCatalogId);
    },
    enabled: !!connection && !isLoadingConnection && !!parentCatalogId,
    staleTime: Infinity
  });

  return {
    children: data || [],
    status, error, isFetching, refetch
  };
};

type CreateCatalogInput = {
  next: CatalogCreateInput;
  solutionId?: string | null;
  solutionUniqueName?: string;
};

export const useCreateCatalog = () => {
  const queryClient = useQueryClient();
  const {addLog} = useAppStore();
  const { connection, instanceId, selectedSolutionId }  = useAppStore();

  return useMutation<CreateResult, unknown, CreateCatalogInput>({
    mutationFn: async ({  next, solutionUniqueName }) => {
      try {
        const result = await catalogService.createCatalog( next, solutionUniqueName);

       
        addLog(`Catalog '${next.uniquename}' created successfully${solutionUniqueName ? ` in solution '${solutionUniqueName}'` : ''}`, 'success');
        notify({ title: 'Catalog Created', body: `'${next.uniquename}' created successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error creating Catalog', error);
        addLog(`Failed to create Catalog. ${error}`, 'error');
        notify({ title: 'Creation Failed', body: `Failed to create Catalog. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      if (result.created) {
        queryClient.invalidateQueries({ queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
        if (selectedSolutionId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId, '') });
        }
        if (variables.solutionId !== undefined && variables.solutionId !== selectedSolutionId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId, variables.solutionId ?? '') });
        }
        // Also invalidate children query if this was a category (has parent)
        if (variables.next._parentcatalogid_value) {
          queryClient.invalidateQueries({ queryKey: queryKeys.catalogChildren(variables.next._parentcatalogid_value, connection?.id ?? '', instanceId) });
        }
      }
    },
  });
};


type UpdateCatalogInput = {
  current: Catalog;
  next: CatalogUpdateInput;
};

export const useUpdateCatalog = () => {
  const queryClient = useQueryClient();
  const {addLog} = useAppStore();
  const { connection, instanceId, selectedSolutionId }  = useAppStore();

  return useMutation<UpdateResult, unknown, UpdateCatalogInput>({
    mutationFn: async ({ current, next }) => {
      try {
        const result = await catalogService.updateCatalog(current, next);

        if (!result.updated) {
          addLog('No changes to save', 'warning');
          notify({ title: 'No Changes', body: 'No changes to save', type: 'warning', duration: 3000 });
          return result;
        }

        addLog(`Catalog '${current.uniquename}' updated successfully`, 'success');
        notify({ title: 'Catalog Updated', body: `'${current.uniquename}' updated successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error saving Catalog', error);
        addLog(`Failed to save Catalog changes. ${error}`, 'error');
        notify({ title: 'Update Failed', body: `Failed to save Catalog changes. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      if (result.updated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
        if (selectedSolutionId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId, '') });
        }
        // Invalidate children if this catalog has a parent
        if (variables.current._parentcatalogid_value) {
          queryClient.invalidateQueries({ queryKey: queryKeys.catalogChildren(variables.current._parentcatalogid_value, connection?.id ?? '', instanceId) });
        }
      }
    },
  });
};


type DeleteCatalogInput = {
  catalog: Catalog;
};

export const useDeleteCatalog = () => {
  const queryClient = useQueryClient();
  const { addLog } = useAppStore();
  const { connection, instanceId, selectedSolutionId } = useAppStore();

  return useMutation<DeleteResult, unknown, DeleteCatalogInput>({
    mutationFn: async ({ catalog }) => {
      try {
        const result = await catalogService.deleteRecord(catalog.catalogid);
        addLog(`Catalog '${catalog.uniquename}' deleted successfully`, 'success');
        notify({ title: 'Catalog Deleted', body: `'${catalog.uniquename}' deleted successfully`, type: 'success', duration: 3000 });
        return result;
      } catch (error) {
        console.error('Error deleting Catalog', error);
        addLog(`Failed to delete Catalog. ${error}`, 'error');
        notify({ title: 'Deletion Failed', body: `Failed to delete Catalog. ${error}`, type: 'error', duration: 5000 });
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      if (result.deleted) {
        queryClient.invalidateQueries({ queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
        if (selectedSolutionId) {
          queryClient.invalidateQueries({ queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId, '') });
        }
        // Invalidate children query if this was a category
        if (variables.catalog._parentcatalogid_value) {
          queryClient.invalidateQueries({ queryKey: queryKeys.catalogChildren(variables.catalog._parentcatalogid_value, connection?.id ?? '', instanceId) });
        }
        // Also invalidate this catalog's own children
        queryClient.invalidateQueries({ queryKey: queryKeys.catalogChildren(variables.catalog.catalogid, connection?.id ?? '', instanceId) });
      }
    },
  });
};
