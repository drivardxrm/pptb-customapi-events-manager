import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { queryKeys } from '../utils/queryKeys';

export interface OptionSetOption {
    Value: number;
    Label: {
        LocalizedLabels: Array<{ Label: string; LanguageCode: number }>;
        UserLocalizedLabel?: { Label: string };
    };
    Description?: {
        LocalizedLabels: Array<{ Label: string; LanguageCode: number }>;
        UserLocalizedLabel?: { Label: string };
    };
    Color?: string;
}

export interface OptionSetResult {
    Options: OptionSetOption[];
    Name?: string;
    DisplayName?: {
        LocalizedLabels: Array<{ Label: string; LanguageCode: number }>;
        UserLocalizedLabel?: { Label: string };
    };
}

export const useOptionSetValues = (
    entityLogicalName: string | null | undefined,
    attributeLogicalName: string | null | undefined
) => {
    const connection = useAppStore((state) => state.connection);
    const instanceId = useAppStore((state) => state.instanceId);

    const { data, status, error, isFetching } = useQuery<OptionSetResult, Error>({
        queryKey: queryKeys.optionSetValues(
            entityLogicalName ?? '',
            attributeLogicalName ?? '',
            connection?.id ?? '',
            instanceId
        ),
        queryFn: async () => {
            const result = await window.dataverseAPI.getEntityRelatedMetadata(
                entityLogicalName!,
                `Attributes(${attributeLogicalName})/OptionSet`,
                []
            );
            return result as unknown as OptionSetResult;
        },
        enabled: !!connection && !!entityLogicalName && !!attributeLogicalName,
        staleTime: Infinity
    });

    return {
        options: data?.Options ?? [],
        optionSetName: data?.Name,
        status,
        error,
        isFetching
    };
};
