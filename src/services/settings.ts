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
    const entries = await Promise.all(
        (Object.keys(DEFAULT_SETTINGS) as Array<keyof Settings>).map(async (k) => {
            const v = await getSetting(k);
            return [k, v === undefined ? DEFAULT_SETTINGS[k] : v] as const;
        })
    );
    return Object.fromEntries(entries) as Settings;
}
