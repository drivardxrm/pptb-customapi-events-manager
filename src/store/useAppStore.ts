import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import { JSXElement } from '@fluentui/react-components';


export interface LogEntry  {
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
};

export interface GlobalMessage {
    intent: 'info' | 'warning' | 'error' | 'success';
    title: string;
    body?: string;
    action?: {
        label: string;
        icon?: JSXElement ;     // jsx element   // Icon name (e.g., 'settings', 'add')
        navigateTo?: string;  // For navigation
        actionId?: string;    // For custom action dispatch
    };
    dismissable?: boolean;
};

interface AppState {
    // Connection state
    connection: ToolBoxAPI.DataverseConnection | null;
    isLoadingConnection: boolean;
    instanceId: string;

    
    selectedSolutionId: string | null;
    selectedCustomApiId: string | null;
    selectedCatalogId: string | null;
    selectedRequestParameterId: string | null;
    selectedResponsePropertyId: string | null;
    selectedPublisherId: string | null;
    selectedNavItem: string;

    theme : 'light' | 'dark';
    initTheme: () => void;
    toggleTheme: () => void;


    // Logs state
    logs: LogEntry[];

    // Global messages state
    globalMessages: Record<string, GlobalMessage>;

    // Actions
    setConnection: (connection: ToolBoxAPI.DataverseConnection | null) => void;
    setIsLoadingConnection: (isLoading: boolean) => void;
    refreshConnection: () => Promise<void>;
    
    setSelectedSolutionId: (solutionId: string | null) => void;
    setSelectedCustomApiId: (customApiId: string | null) => void;
    setSelectedCatalogId: (catalogId: string | null) => void;
    setSelectedRequestParameterId: (requestParameterId: string | null) => void;
    setSelectedResponsePropertyId: (responsePropertyId: string | null) => void;
    setSelectedPublisherId: (publisherId: string | null) => void;
    setSelectedNavItem: (navItem: string) => void;



    // Log actions
    addLog: (message: string, type?: LogEntry['type']) => void;
    clearLogs: () => void;

    // Global message actions
    setGlobalMessage: (id: string, message: GlobalMessage | null) => void;
    clearGlobalMessage: (id: string) => void;
    clearAllGlobalMessages: () => void;
}

export const useAppStore = create<AppState>((set, _get) => ({
        // Initial state
        connection: null,
        isLoadingConnection: true,
        instanceId: uuidv4(),
        logs: [],
        globalMessages: {},

    

        selectedSolutionId: null,
        selectedCustomApiId: null,
        selectedCatalogId: null,
        selectedRequestParameterId: null,
        selectedResponsePropertyId: null,
        selectedPublisherId: null,
        selectedNavItem: 'customapi',

        theme:  'light',

        initTheme: async() => {
            let toolboxTheme = await window.toolboxAPI.utils.getCurrentTheme();
            set({ theme : toolboxTheme });
        },

        toggleTheme: () => set((state) => ({ 
            theme: state.theme === 'light' ? 'dark' : 'light' 
        })),

        // Connection actions
        setConnection: (connection) => set({ connection }),
        
        setIsLoadingConnection: (isLoading) => set({ isLoadingConnection: isLoading }),

        refreshConnection: async () => {
            try {
                set({ isLoadingConnection: true });
                //console.log('Fetching active connection...');
                const conn = await window.toolboxAPI.connections.getActiveConnection();
            
                //console.log('Active connection result:', conn);
                
                // Handle case where API returns null/undefined or empty object
                if (!conn || !conn.id) {
                    //console.log('No valid active connection, setting to null');
                    set({ connection: null });
                } else {
                    //console.log('Setting active connection:', conn.name);
                    set({ connection: conn });
                }
            } catch (error) {
                //console.error('Error refreshing connection:', error);
                set({ connection: null });
            } finally {
                set({ isLoadingConnection: false });
            }
        },

        setSelectedSolutionId: (solutionId) => set({ selectedSolutionId: solutionId }),
        setSelectedCustomApiId: (customApiId) => set(
            { selectedCustomApiId: customApiId }    
        ),
        setSelectedCatalogId: (catalogId) => set(
            { selectedCatalogId: catalogId }
        ),
        setSelectedRequestParameterId: (requestParameterId) => set(
            { selectedRequestParameterId: requestParameterId }
        ),
        setSelectedResponsePropertyId: (responsePropertyId) => set(
            { selectedResponsePropertyId: responsePropertyId }
        ),
        setSelectedPublisherId: (publisherId) => set(
            { selectedPublisherId: publisherId }
        ),
        setSelectedNavItem: (navItem) => set(
            { selectedNavItem: navItem }
        ),
        
        // Log actions
        addLog: (message, type = 'info') => {
            const newLog: LogEntry = {
                timestamp: new Date(),
                message,
                type,
            };
            set((state) => ({
                logs: [newLog, ...state.logs].slice(0, 1000), // Keep last 1000 entries
            }));
            console.log(`[${type.toUpperCase()}] ${message}`);
        },

        clearLogs: () => set({ logs: [] }),

        // Global message actions
        setGlobalMessage: (id, message) => set(produce((state: AppState) => {
            if (message === null) {
                delete state.globalMessages[id];
            } else {
                state.globalMessages[id] = message;
            }
        })),

        clearGlobalMessage: (id) => set(produce((state: AppState) => {
            delete state.globalMessages[id];
        })),

        clearAllGlobalMessages: () => set({ globalMessages: {} }),
    })
);

