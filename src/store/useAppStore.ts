import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_SETTINGS, Settings, getAllSettings, setSetting } from '../services/settings';

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
    settings: Settings;

    isLoadingSettings: boolean;

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
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
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
                logs: [newLog, ...state.logs.slice(0, 49)], // Keep last 50 entries
            }));
            console.log(`[${type.toUpperCase()}] ${message}`);
        },

        clearLogs: () => set({ logs: [] }),

        // Settings actions
        loadSettings: async () => {
            try {
                set({ isLoadingSettings: true });
                const loaded = await getAllSettings();
                set({ settings: loaded });
                set((state) => ({
                    logs: [
                        { timestamp: new Date(), message: 'Settings loaded', type: 'success' },
                        ...state.logs.slice(0, 49),
                    ],
                }));
            } catch (error) {
                console.error('Error loading settings:', error);
                set((state) => ({
                    logs: [
                        { timestamp: new Date(), message: 'Failed to load settings', type: 'warning' },
                        ...state.logs.slice(0, 49),
                    ],
                }));
            } finally {
                set({ isLoadingSettings: false });
            }
        },

        updateSetting: async (key, value) => {
            const prev = get().settings[key];
            // optimistic update
            set({ settings: { ...get().settings, [key]: value } as Settings });
            const ok = await setSetting(key, value as any);
            if (!ok) {
                // rollback and log error
                set({ settings: { ...get().settings, [key]: prev } as Settings });
                set((state) => ({
                    logs: [
                        { timestamp: new Date(), message: `Failed to persist setting: ${String(key)}`, type: 'error' },
                        ...state.logs.slice(0, 49),
                    ],
                }));
            } else {
                set((state) => ({
                    logs: [
                        { timestamp: new Date(), message: `Setting updated: ${String(key)}`, type: 'success' },
                        ...state.logs.slice(0, 49),
                    ],
                }));
            }
        },
    })
);
