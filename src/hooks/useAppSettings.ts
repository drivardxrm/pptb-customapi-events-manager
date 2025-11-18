import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { AppSettings, getAllSettings, updateSetting } from '../models/AppSettings';



export const useAppSettings = () => {

  // Get connection and instanceId from Zustand store
  //const connection = useAppStore((state) => state.connection);
  //const isLoading = useAppStore((state) => state.isLoadingConnection);
  const {instanceId} = useAppStore();


  const { data, status, error, isFetching } =
    useQuery<AppSettings, Error>(
      {
        queryKey: ['appsettings', instanceId], // Include instanceId and connection id for proper cache management
        queryFn: () => getAllSettings(),
        //enabled: !!connection && !isLoading,
        staleTime: Infinity
      }
    )

  return {
    appsettings: data,
    status, error, isFetching
  }
}

export const useUpdateAppSettings = () => {
  const {instanceId} = useAppStore();
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ current, next }: { current: AppSettings; next: AppSettings }) => {
      const diffKeys = (Object.keys(next) as Array<keyof AppSettings>).filter(
        (key) => current[key] !== next[key],
      );

      if (diffKeys.length === 0) return current;

      await Promise.all(diffKeys.map((key) => updateSetting(key, next[key])));
      return { ...current, ...next };
    },
    onSuccess: (merged) => {
      queryClient.setQueryData(['appsettings', instanceId], merged);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appsettings', instanceId] });
    },
  });
}