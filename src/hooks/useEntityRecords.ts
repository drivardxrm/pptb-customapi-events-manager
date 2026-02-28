import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { useMetadata } from './useMetadata';
import { queryKeys } from '../utils/queryKeys';

export interface BoundEntityRecord {
    id: string;
    name: string;
}

export const useEntityRecords = (entityLogicalName: string | null | undefined) => {
    const connection = useAppStore((state) => state.connection);
    const isLoadingConnection = useAppStore((state) => state.isLoadingConnection);
    const instanceId = useAppStore((state) => state.instanceId);
    
    // Get entity metadata using useMetadata hook
    const metadataResult = useMetadata(entityLogicalName ?? '');
    const collectionname = metadataResult.metadata?.LogicalCollectionName;
    const primaryid = metadataResult.metadata?.PrimaryIdAttribute as string | undefined;
    const primaryname = metadataResult.metadata?.PrimaryNameAttribute as string | undefined;
    const isFetchingMetadata = metadataResult.isFetching;

    const { data, status, error, isFetching } = useQuery<{ value: Record<string, unknown>[] }, Error>({
        queryKey: queryKeys.entityRecords(entityLogicalName ?? '', connection?.id ?? '', instanceId),
        queryFn: async () => {
            if (!collectionname || !primaryid) {
                return { value: [] };
            }

            const selectFields = primaryname 
                ? `$select=${primaryid},${primaryname}`
                : `$select=${primaryid}`;

            const result = window.dataverseAPI.queryData(`${collectionname}?${selectFields}&$top=100`);
            return result as unknown as { value: Record<string, unknown>[] };
        },
        enabled: !!connection && !isLoadingConnection && !!entityLogicalName && !!collectionname && !!primaryid,
        staleTime: Infinity
    });

    // Transform to BoundEntityRecord format
    const records: BoundEntityRecord[] = (data?.value ?? []).map(record => {
        const idKey = primaryid ?? 'id';
        const nameKey = primaryname;
        return {
            id: record[idKey] as string,
            name: nameKey ? (record[nameKey] as string ?? record[idKey] as string) : record[idKey] as string,
        };
    });

    return {
        records,
        collectionname,
        primaryid,
        primaryname,
        status,
        error,
        isFetching: isFetching || isFetchingMetadata,
    };
};
