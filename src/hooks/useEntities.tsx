import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '../store/useAppStore'
import { queryKeys } from '../utils/queryKeys';
import { Entity } from '../models/Entity';

type EntitiesResult = { value: Entity[] };

export const fetchEntities = async (): Promise<EntitiesResult> => {
  const result = await window.dataverseAPI.queryData('entities?$select=entityid,logicalname,objecttypecode');
  return result as unknown as EntitiesResult;
};

export const getEntitiesQueryOptions = (connectionId: string, instanceId: string) => ({
  queryKey: queryKeys.entities(connectionId, instanceId),
  queryFn: fetchEntities,
  staleTime: Infinity,
});

export const resolveEntityMetadata = (entities: Entity[], logicalName: string) =>
  entities.find((entity) => entity.logicalname === logicalName);

export const resolveEntityObjectTypeCode = (entities: Entity[], logicalName: string) =>
  resolveEntityMetadata(entities, logicalName)?.objecttypecode ?? undefined;

export const useEntities = () => {
  const queryClient = useQueryClient();

  // Get connection and instanceId from Zustand store
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  const instanceId = useAppStore((state) => state.instanceId);

  const entitiesQueryOptions = useMemo(
    () => getEntitiesQueryOptions(connection?.id ?? '', instanceId),
    [connection?.id, instanceId],
  );

  const { data, status, error, isFetching } =
    useQuery<EntitiesResult, Error>(
      {
        ...entitiesQueryOptions,
        enabled: !!connection && !isLoading,
      }
    )

  const entities = data?.value || [];
  const entitiesByLogicalName = useMemo(
    () => new Map(entities.map((entity) => [entity.logicalname, entity])),
    [entities],
  );
  const ensureEntityObjectTypeCode = useCallback(
    async (logicalName: string) => {
      const cachedObjectTypeCode = resolveEntityMetadata(entities, logicalName)?.objecttypecode
        ?? entitiesByLogicalName.get(logicalName)?.objecttypecode;

      if (typeof cachedObjectTypeCode === 'number') {
        return cachedObjectTypeCode;
      }

      const fetchedEntities = await queryClient.fetchQuery(entitiesQueryOptions);
      const resolvedObjectTypeCode = resolveEntityObjectTypeCode(fetchedEntities.value, logicalName);

      if (typeof resolvedObjectTypeCode !== 'number') {
        throw new Error(`Component type metadata could not be resolved for '${logicalName}'.`);
      }

      return resolvedObjectTypeCode;
    },
    [entities, entitiesByLogicalName, entitiesQueryOptions, queryClient],
  );

  return {
    entities,
    getEntityMetadata: (logicalName: string) => resolveEntityMetadata(entities, logicalName) ?? entitiesByLogicalName.get(logicalName),
    getEntityObjectTypeCode: (logicalName: string) => resolveEntityObjectTypeCode(entities, logicalName),
    ensureEntityObjectTypeCode,
    status, error, isFetching
  }
}
