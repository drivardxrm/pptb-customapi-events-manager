export type Settings = {
    // User defaults
    defaultPublisherId?: string | null;
    requestParameterDefaultName?: string | null;
    responsePropertyDefaultName?: string | null;
};

export const DEFAULT_SETTINGS: Settings = {
    defaultPublisherId: null,
    requestParameterDefaultName: '{customapiname}-In-{uniquename}',
    responsePropertyDefaultName: '{customapiname}-Out-{uniquename}',
};

export async function getSetting<K extends keyof Settings>(key: K): Promise<Settings[K] | undefined> {
    try {
        const value = await window.toolboxAPI.settings.getSetting(key as string);
        return value as Settings[K];
    } catch {
        // Fallback to default when host read fails
        return DEFAULT_SETTINGS[key];
    }
}

export async function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<boolean> {
    try {
        await window.toolboxAPI.settings.setSetting(key as string, value as any);
        return true;
    } catch {
        return false;
    }
}

export async function getAllSettings(): Promise<Settings> {
    try {
        const allSettings = await window.toolboxAPI.settings.getSettings();
        // Merge with defaults to ensure all required keys exist
        return {
            ...DEFAULT_SETTINGS,
            ...allSettings
        } as Settings;
    } catch {
        // Fallback to defaults when host read fails
        return DEFAULT_SETTINGS;
    }
}
