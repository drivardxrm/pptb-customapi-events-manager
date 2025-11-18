export interface AppSettings  {
    // User defaults
    defaultPublisherId: string | null;
    requestParameterDefaultName: string | null;
    responsePropertyDefaultName: string | null;
    booleantest : boolean | null;
    numbertest : number | null;
};

export const DEFAULT_SETTINGS: AppSettings = {
    defaultPublisherId: null,
    requestParameterDefaultName: '{customapiname}-In-{uniquename}',
    responsePropertyDefaultName: '{customapiname}-Out-{uniquename}',
    booleantest: null,
    numbertest: null,
};

export async function getAllSettings(): Promise<AppSettings> {
  const result = await window.toolboxAPI.settings.getSettings();
  return mapRecordToSettings(result);
}



// Utility: convert arbitrary record to strongly-typed Settings, applying defaults
export function mapRecordToSettings(record: Record<string, any>): AppSettings {
    return {
        defaultPublisherId: record.defaultPublisherId ?? DEFAULT_SETTINGS.defaultPublisherId,
        requestParameterDefaultName: record.requestParameterDefaultName ?? DEFAULT_SETTINGS.requestParameterDefaultName,
        responsePropertyDefaultName: record.responsePropertyDefaultName ??  DEFAULT_SETTINGS.responsePropertyDefaultName,
        booleantest: record.booleantest ?? DEFAULT_SETTINGS.booleantest,
        numbertest: record.numbertest ?? DEFAULT_SETTINGS.numbertest,
    };
}

export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  await window.toolboxAPI.settings.setSetting(key, value);
}

