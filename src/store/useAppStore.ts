import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AppSettings, DEFAULT_SETTINGS } from '../models/AppSettings';

export type LogEntry = {
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
};

interface AppState {
    // Connection state
    connection: ToolBoxAPI.DataverseConnection | null;
    isLoadingConnection: boolean;
    instanceId: string;

    
    selectedSolutionId: string | null;
    selectedCustomApiId: string | null;

    // Logs state
    logs: LogEntry[];

    // Settings state
    settings: AppSettings;

    isLoadingSettings: boolean;
    loadingSettingsError?: string;

    // Actions
    setConnection: (connection: ToolBoxAPI.DataverseConnection | null) => void;
    setIsLoadingConnection: (isLoading: boolean) => void;
    refreshConnection: () => Promise<void>;
    
    setSelectedSolutionId: (solutionId: string | null) => void;
    setSelectedCustomApiId: (customApiId: string | null) => void;

    // Log actions
    addLog: (message: string, type?: LogEntry['type']) => void;
    clearLogs: () => void;

    // Settings actions
    loadSettings: () => Promise<void>;
    updateSettings: (updated:AppSettings) => Promise<void>;
}

    export const useAppStore = create<AppState>((set, get) => ({
        // Initial state
        connection: null,
        isLoadingConnection: true,
        instanceId: uuidv4(),
        logs: [],

        settings: DEFAULT_SETTINGS,
        isLoadingSettings: true,

        selectedSolutionId: null,
        selectedCustomApiId: null,

        // Connection actions
        setConnection: (connection) => set({ connection }),
        
        setIsLoadingConnection: (isLoading) => set({ isLoadingConnection: isLoading }),

        refreshConnection: async () => {
            try {
                set({ isLoadingConnection: true });
                console.log('Fetching active connection...');
                const conn = await window.toolboxAPI.connections.getActiveConnection();
                console.log('Active connection result:', conn);
                
                // Handle case where API returns null/undefined or empty object
                if (!conn || !conn.id) {
                    console.log('No valid active connection, setting to null');
                    set({ connection: null });
                } else {
                    console.log('Setting active connection:', conn.name);
                    set({ connection: conn });
                }
            } catch (error) {
                console.error('Error refreshing connection:', error);
                set({ connection: null });
            } finally {
                set({ isLoadingConnection: false });
            }
        },

        setSelectedSolutionId: (solutionId) => set({ selectedSolutionId: solutionId }),
        setSelectedCustomApiId: (customApiId) => set({ selectedCustomApiId: customApiId }),
        // Log actions
        addLog: (message, type = 'info') => {
            const newLog: LogEntry = {
                timestamp: new Date(),
                message,
                type,
            };
            set((state) => ({
                logs: [newLog, ...state.logs], // Keep last 50 entries
            }));
            console.log(`[${type.toUpperCase()}] ${message}`);
        },

        clearLogs: () => set({ logs: [] }),

        // Settings actions
        loadSettings: async () => {
            try {
                set({ isLoadingSettings: true });
                // const allSettings = await window.toolboxAPI.settings.getSettings();
                // const loaded = mapRecordToSettings(allSettings);

                const defaultPublisherId = await window.toolboxAPI.settings.getSetting('defaultPublisherId');
                const requestParameterDefaultName = await window.toolboxAPI.settings.getSetting('requestParameterDefaultName');
                const responsePropertyDefaultName = await window.toolboxAPI.settings.getSetting('responsePropertyDefaultName');

                const loaded: AppSettings = {
                    defaultPublisherId: defaultPublisherId ?? DEFAULT_SETTINGS.defaultPublisherId,
                    requestParameterDefaultName: requestParameterDefaultName ?? DEFAULT_SETTINGS.requestParameterDefaultName,
                    responsePropertyDefaultName: responsePropertyDefaultName ?? DEFAULT_SETTINGS.responsePropertyDefaultName,
                };

                set({ settings: loaded });
                set((state) => ({
                    logs: [
                        { timestamp: new Date(), message: 'Settings loaded', type: 'success' },
                        ...state.logs,
                    ],
                }));
            } catch (error) {
                console.error('Error loading settings:', error);
                set({ loadingSettingsError: (error as Error).message });
                set((state) => ({
                    logs: [
                        { timestamp: new Date(), message: 'Failed to load settings', type: 'warning' },
                        ...state.logs,
                    ],
                }));
            } finally {
                set({ isLoadingSettings: false });
            }
        },

        updateSettings: async (updated: AppSettings) => {
            const current = get().settings;
            
            // Compare and update only changed properties
            const changedKeys: (keyof AppSettings)[] = [];
            for (const key in updated) {
                if (updated.hasOwnProperty(key)) {
                    const typedKey = key as keyof AppSettings;
                    if (updated[typedKey] !== current[typedKey]) {
                        changedKeys.push(typedKey);
                    }
                }
            }

            // Optimistic update
            set({ settings: updated });

            // Persist each changed setting
            try {
                await Promise.all(
                    changedKeys.map(key => 
                        window.toolboxAPI.settings.setSetting(key, updated[key] as any)
                    )
                );
                
            } catch (error) {
                // Rollback on failure
                set({ settings: current });
                // throw error to be handled by caller
                throw error;
            }
        },
    })
);
