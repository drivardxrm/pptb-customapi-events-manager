import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../store/useAppStore';
import { queryKeys } from '../utils/queryKeys';

export interface AttributeMetadata {
    LogicalName: string;
    DisplayName?: {
        LocalizedLabels: Array<{ Label: string; LanguageCode: number }>;
        UserLocalizedLabel?: { Label: string };
    };
    AttributeType: string;
    AttributeTypeName?: { Value: string };
    IsValidForCreate?: boolean;
    IsValidForUpdate?: boolean;
    RequiredLevel?: { Value: string };
    Description?: {
        LocalizedLabels: Array<{ Label: string; LanguageCode: number }>;
        UserLocalizedLabel?: { Label: string };
    };
    // For lookup attributes
    Targets?: string[];
    // For picklist attributes
    OptionSet?: {
        Options: Array<{
            Value: number;
            Label: { LocalizedLabels: Array<{ Label: string; LanguageCode: number }>; UserLocalizedLabel?: { Label: string } };
        }>;
    };
    // For decimal/double precision
    Precision?: number;
    // For money attributes
    PrecisionSource?: number;
    // For string attributes
    MaxLength?: number;
}

export interface EntityAttributesResult {
    value: AttributeMetadata[];
}

export const useEntityAttributes = (entityLogicalName: string | null | undefined) => {
    const connection = useAppStore((state) => state.connection);
    const instanceId = useAppStore((state) => state.instanceId);

    const { data, status, error, isFetching } = useQuery<EntityAttributesResult, Error>({
        queryKey: queryKeys.entityAttributes(entityLogicalName ?? '', connection?.id ?? '', instanceId),
        queryFn: async () => {
            const result = await window.dataverseAPI.getEntityRelatedMetadata(
                entityLogicalName!,
                'Attributes',
                // [
                //     'LogicalName',
                //     'DisplayName',
                //     'AttributeType',
                //     'AttributeTypeName',
                //     'IsValidForCreate',
                //     'IsValidForUpdate',
                //     'RequiredLevel',
                //     'Description',
                //     'Targets',
                //     'OptionSet',
                //     'Precision',
                //     'PrecisionSource',
                //     'MaxLength'
                // ]
            );
            // Cast through unknown to satisfy TypeScript
            return result as unknown as EntityAttributesResult;
        },
        enabled: !!connection && !!entityLogicalName,
        staleTime: Infinity
    });

    // Filter to only attributes valid for create/update and exclude system attributes
    const editableAttributes = (data?.value ?? []).filter(attr => {
        // Exclude system/internal attributes
        const excludedTypes = ['Virtual', 'EntityName', 'CalendarRules', 'PartyList'];
        if (excludedTypes.includes(attr.AttributeType)) return false;

        // Only include attributes valid for create or update
        return attr.IsValidForCreate || attr.IsValidForUpdate;
    });

    // Sort by display name
    const sortedAttributes = [...editableAttributes].sort((a, b) => {
        const aName = a.DisplayName?.UserLocalizedLabel?.Label || a.LogicalName;
        const bName = b.DisplayName?.UserLocalizedLabel?.Label || b.LogicalName;
        return aName.localeCompare(bName);
    });

    return {
        attributes: sortedAttributes,
        allAttributes: data?.value ?? [],
        status,
        error,
        isFetching
    };
};
