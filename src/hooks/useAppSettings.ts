import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { AppSettings, mapRecordToSettings } from '../models/AppSettings';



export const useAppSettings = () => {

  // Get connection and instanceId from Zustand store
  //const connection = useAppStore((state) => state.connection);
  //const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);


  const { data, status, error, isFetching } =
    useQuery<AppSettings, Error>(
      {
        queryKey: ['appsettings', instanceId], // Include instanceId and connection id for proper cache management
        queryFn: async () => {
          // TODO Ensure connection is valid
          const result = await window.toolboxAPI.settings.getSettings();
          console.log('Fetched settings:', result);
          const mapped = mapRecordToSettings(result);
          return mapped;
        },
        //enabled: !!connection && !isLoading,
        staleTime: Infinity
      }
    )

  return {
    appsettings: data,
    status, error, isFetching
  }
}