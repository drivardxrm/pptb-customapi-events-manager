import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { queryKeys } from '../utils/queryKeys';
import { OptionSetOption, OptionSetQueryResult, OptionsetType } from '../models/OptionSet';



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

    // For Boolean attributes, options come from TrueOption/FalseOption instead of Options array
    const getBooleanOptions = (): OptionSetOption[] => {
        const result: OptionSetOption[] = [];
        if (data?.OptionSet?.FalseOption) result.push(data.OptionSet.FalseOption);
        if (data?.OptionSet?.TrueOption) result.push(data.OptionSet.TrueOption);
        return result;
    };

    const options = optionsetType === 'Boolean'
        ? getBooleanOptions()
        : data?.OptionSet?.Options ?? [];

    return {
        options,
        optionSetName: data?.LogicalName ?? '',
        optionsetDisplayName: data?.DisplayName?.UserLocalizedLabel?.Label ?? '',
        status,
        error,
        isFetching
    };
};
