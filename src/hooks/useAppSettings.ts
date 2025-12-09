import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { AppSettings, getAllSettings, updateSetting } from '../models/AppSettings';
import { queryKeys } from '../utils/queryKeys';



export const useAppSettings = () => {

  // Get connection and instanceId from Zustand store
  //const connection = useAppStore((state) => state.connection);
  //const isLoading = useAppStore((state) => state.isLoadingConnection);
  const {instanceId, connection} = useAppStore();


  const { data, status, error, isFetching } =
    useQuery<AppSettings, Error>(
      {
        queryKey: queryKeys.appsettings(connection?.id ?? '', instanceId), //['appsettings', connection?.id, instanceId], // Include instanceId and connection id for proper cache management
        queryFn: () => getAllSettings(connection!.id),
        enabled: !!connection,
        staleTime: Infinity
      }
    )

  return {
    appsettings: data,
    status, error, isFetching
  }
}

export const useUpdateAppSettings = () => {
  const {instanceId, connection } = useAppStore();
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ current, next }: { current: AppSettings; next: AppSettings }) => {
      const diffKeys = (Object.keys(next) as Array<keyof AppSettings>).filter(
        (key) => current[key] !== next[key],
      );

      if (diffKeys.length === 0) return current;



      await Promise.all(diffKeys.map((key) => updateSetting(key, next[key], connection!.id)));
      return { ...current, ...next };
    },
    onSuccess: (merged) => {
      queryClient.setQueryData(queryKeys.appsettings(connection?.id ?? '', instanceId), merged);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appsettings(connection?.id ?? '', instanceId) });
    },
  });
}