import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { queryKeys } from '../utils/queryKeys';
import { OptionSetQueryResult, OptionsetType } from '../models/OptionSet';



export const useOptionSetValues = (
    entityLogicalName: string,
    attributeLogicalName: string,
    optionsetType: OptionsetType
) => {
    const connection = useAppStore((state) => state.connection);
    const instanceId = useAppStore((state) => state.instanceId);

    const { data, status, error, isFetching } = useQuery<OptionSetQueryResult, Error>({
        queryKey: queryKeys.optionSetValues(
            entityLogicalName ?? '',
            attributeLogicalName ?? '',
            connection?.id ?? '',
            instanceId
        ),
        queryFn: async () => {
            const result = await window.dataverseAPI.queryData(
                `EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes(LogicalName='${attributeLogicalName}')/Microsoft.Dynamics.CRM.${optionsetType}AttributeMetadata?$select=LogicalName,DisplayName&$expand=OptionSet`
            );
            return result as unknown as OptionSetQueryResult;
        },
        enabled: !!connection && !!entityLogicalName && !!attributeLogicalName,
        staleTime: Infinity
    });

    return {
        options: data?.OptionSet?.Options ?? [],
        optionSetName: data?.LogicalName ?? '',
        optionsetDisplayName: data?.DisplayName?.UserLocalizedLabel?.Label ?? '',
        status,
        error,
        isFetching
    };
};
