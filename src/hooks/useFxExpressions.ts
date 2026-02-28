import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { FxExpression } from '../models/FxExpression';
import { queryKeys } from '../utils/queryKeys';


export const useFxExpression = (fxexpressionid: string | null) => {
  const { connection, isLoadingConnection, instanceId } = useAppStore();

  const { data, status, error, isFetching } =
    useQuery<FxExpression | null, Error>(
      {
        queryKey: queryKeys.fxexpression(fxexpressionid ?? '', connection?.id ?? '', instanceId),
        queryFn: async () => {
          const result = await window.dataverseAPI.retrieve('fxexpression', fxexpressionid!);
          return result as unknown as FxExpression;
        },
        enabled: !!connection && !isLoadingConnection && !!fxexpressionid,
        staleTime: Infinity
      }
    )

  return {
    fxexpression: data ?? null,
    status,
    error,
    isFetching
  }
}
