import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { queryKeys } from '../utils/queryKeys';
import { Catalog, CatalogCreateable, CatalogUpdateable } from '../models/Catalog';
import { CatalogCreateResult, CatalogDeleteResult, catalogService, CatalogUpdateResult } from '../services/CatalogService';


export const useCatalogs = () => {

  // Get connection and instanceId from Zustand store
  const { connection, isLoadingConnection, instanceId, selectedSolutionId }  = useAppStore();

  

  const { data, status, error, isFetching } =
    useQuery<Catalog[], Error>(
      {
        queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId , selectedSolutionId ?? ''), // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          const result = selectedSolutionId == null || selectedSolutionId == '' ? 
            await catalogService.fetchAllCatalogs() :
            await catalogService.fetchSolutionCatalogs(selectedSolutionId);
          //console.log('Fetched customapis:', result);
          return result;
        },
        enabled: !!connection && !isLoadingConnection,
        staleTime: Infinity
      }
    )

  return {
    catalogs: data || [],
    status, error, isFetching
  }
}

type CreateCatalogInput = {
  next: CatalogCreateable;
  solutionUniqueName?: string;
};

export const useCreateCatalog = () => {
  const queryClient = useQueryClient();
  const {addLog} = useAppStore();
  const { connection, instanceId, selectedSolutionId }  = useAppStore();

  return useMutation<CatalogCreateResult, unknown, CreateCatalogInput>({
    mutationFn: async ({  next, solutionUniqueName }) => {
      try {
        const result = await catalogService.createCatalog( next, solutionUniqueName);

       
        addLog(`Catalog '${next.uniquename}' created successfully${solutionUniqueName ? ` in solution '${solutionUniqueName}'` : ''}`, 'success');
        return result;
      } catch (error) {
        console.error('Error creating Catalog', error);
        addLog(`Failed to create Catalog. ${error}`, 'error');
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result.created) {
        queryClient.invalidateQueries({ queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
      }
    },
  });
};


type UpdateCatalogInput = {
  current: Catalog;
  next: CatalogUpdateable;
};

export const useUpdateCatalog = () => {
  const queryClient = useQueryClient();
  const {addLog} = useAppStore();
  const { connection, instanceId, selectedSolutionId }  = useAppStore();

  return useMutation<CatalogUpdateResult, unknown, UpdateCatalogInput>({
    mutationFn: async ({ current, next }) => {
      try {
        const result = await catalogService.updateCatalog(current, next);

        if (!result.updated) {
          addLog('No changes to save', 'warning');
          return result;
        }

        addLog(`Catalog '${current.uniquename}' updated successfully`, 'success');
        return result;
      } catch (error) {
        console.error('Error saving Catalog', error);
        addLog(`Failed to save Catalog changes. ${error}`, 'error');
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result.updated) {
        queryClient.invalidateQueries({ queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
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

  return useMutation<CatalogDeleteResult, unknown, DeleteCatalogInput>({
    mutationFn: async ({ catalog }) => {
      try {
        const result = await catalogService.deleteCatalog(catalog.catalogid);
        addLog(`Catalog '${catalog.uniquename}' deleted successfully`, 'success');
        return result;
      } catch (error) {
        console.error('Error deleting Catalog', error);
        addLog(`Failed to delete Catalog. ${error}`, 'error');
        throw error;
      }
    },
    onSuccess: (result) => {
      if (result.deleted) {
        queryClient.invalidateQueries({ queryKey: queryKeys.catalogs(connection?.id ?? '', instanceId, selectedSolutionId ?? '') });
      }
    },
  });
};

