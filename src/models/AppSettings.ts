export interface AppSettings  {
    // User defaults
    defaultPublisherId: string | null;  
    requestParameterDefaultName: string | null;
    responsePropertyDefaultName: string | null;
  showDebug: boolean;

};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultPublisherId: null,
  requestParameterDefaultName: '{customapiname}-In-{uniquename}',
  responsePropertyDefaultName: '{customapiname}-Out-{uniquename}',
  showDebug: false,
};

export async function getAllSettings(connectionId:string): Promise<AppSettings> {
  const result = await window.toolboxAPI.settings.getAll();
  return mapRecordToSettings(result, connectionId);
}

// Utility: get connection scoped value from record
const getScopedValue = <K extends keyof AppSettings>(
  record: Record<string, unknown>,
  key: K,
  connectionId: string
) => {
  const scopedKey = `${key}_${connectionId}`;
  if (scopedKey in record) {
    return record[scopedKey] as AppSettings[K];
  }
  return null;
};

// Utility: convert arbitrary record to strongly-typed Settings, applying defaults
export function mapRecordToSettings(record: Record<string, any>, connectionId:string): AppSettings {
    return {
        defaultPublisherId: getScopedValue(record, 'defaultPublisherId', connectionId) ?? DEFAULT_SETTINGS.defaultPublisherId,
        requestParameterDefaultName: record.requestParameterDefaultName ?? DEFAULT_SETTINGS.requestParameterDefaultName,
        responsePropertyDefaultName: record.responsePropertyDefaultName ??  DEFAULT_SETTINGS.responsePropertyDefaultName,
        showDebug: typeof record.showDebug === 'boolean'
          ? record.showDebug
          : record.showDebug === 'true'
            ? true
            : DEFAULT_SETTINGS.showDebug,

    };
}



export async function updateSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K],
  connectionId:string
): Promise<void> {

  // if connection scoped, adjust key
  let keyStr = key as string;
  if (key === ('defaultPublisherId')) {
    keyStr = (`defaultPublisherId_${connectionId}`);
  }

  await window.toolboxAPI.settings.set(keyStr, value);
  
}

