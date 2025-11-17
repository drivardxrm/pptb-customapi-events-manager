export interface AppSettings  {
    // User defaults
    defaultPublisherId: string | null;
    requestParameterDefaultName: string | null;
    responsePropertyDefaultName: string | null;
};

export const DEFAULT_SETTINGS: AppSettings = {
    defaultPublisherId: null,
    requestParameterDefaultName: '{customapiname}-In-{uniquename}',
    responsePropertyDefaultName: '{customapiname}-Out-{uniquename}',
};

// Utility: convert arbitrary record to strongly-typed Settings, applying defaults
export function mapRecordToSettings(record: Record<string, any>): AppSettings {
    return {
        defaultPublisherId: record.defaultPublisherId ?? DEFAULT_SETTINGS.defaultPublisherId,
        requestParameterDefaultName: record.requestParameterDefaultName ?? DEFAULT_SETTINGS.requestParameterDefaultName,
        responsePropertyDefaultName: record.responsePropertyDefaultName ??  DEFAULT_SETTINGS.responsePropertyDefaultName,
    };
}