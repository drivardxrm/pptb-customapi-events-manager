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

export interface OptionSet {
    Options?: OptionSetOption[];
    TrueOption?: OptionSetOption;
    FalseOption?: OptionSetOption;
    LogicalName?: string;
    DisplayName?: {
        LocalizedLabels: Array<{ Label: string; LanguageCode: number }>;
        UserLocalizedLabel?: { Label: string };
    };
}

export interface OptionSetQueryResult {
    OptionSet: OptionSet;
    LogicalName?: string;
    DisplayName?: {
        LocalizedLabels: Array<{ Label: string; LanguageCode: number }>;
        UserLocalizedLabel?: { Label: string };
    };
}

export type OptionsetType = 'Picklist' | 'State' | 'Status' | 'Boolean';