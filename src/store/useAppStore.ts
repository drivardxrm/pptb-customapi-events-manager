import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { produce } from 'immer';
import type { ReactElement } from 'react';
import { DEFAULT_SETTINGS, type SelectionInitSetting } from '../models/AppSettings';


export interface LogEntry  {
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
};

export interface GlobalMessageAction {
    label: string;
    icon?: ReactElement;
    onClick: () => void;
};

export interface GlobalMessage {
    intent: 'info' | 'warning' | 'error' | 'success';
    title: string;
    body?: string;
    action?: GlobalMessageAction;
    dismissable?: boolean;
};

export type EditingComponent = 'none' | 'customapi' | 'requestparameter' | 'responseproperty';
export type ManagedFilterHandoffTarget = 'customapi' | 'businessevent';

interface PendingManagedFilterHandoff {
    target: ManagedFilterHandoffTarget;
    value: SelectionInitSetting;
}

const navMatchesManagedFilterTarget = (navItem: string, target: ManagedFilterHandoffTarget) =>
    target === 'customapi'
        ? navItem === 'customapi' || navItem === 'customapitester'
        : navItem === 'businessevent';

interface AppState {
    // Connection state
    connection: ToolBoxAPI.DataverseConnection | null;
    isLoadingConnection: boolean;
    instanceId: string;

    // Editing lock state
    editingComponent: EditingComponent;
    
    selectedSolutionId: string | null;
    selectedCustomApiId: string | null;
    selectedCatalogId: string | null;
    selectedRequestParameterId: string | null;
    selectedResponsePropertyId: string | null;
    selectedPublisherId: string | null;
    pendingBusinessEventAssignmentId: string | null;
    currentCustomApiSelectionInit: SelectionInitSetting;
    currentBusinessEventSelectionInit: SelectionInitSetting;
    pendingManagedFilterHandoff: PendingManagedFilterHandoff | null;
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
    setPendingBusinessEventAssignmentId: (assignmentId: string | null) => void;
    setCurrentCustomApiSelectionInit: (value: SelectionInitSetting) => void;
    setCurrentBusinessEventSelectionInit: (value: SelectionInitSetting) => void;
    setPendingManagedFilterHandoff: (handoff: PendingManagedFilterHandoff | null) => void;
    setSelectedNavItem: (navItem: string) => void;

    // Editing lock actions
    setEditingComponent: (component: EditingComponent) => void;

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
        pendingBusinessEventAssignmentId: null,
        currentCustomApiSelectionInit: DEFAULT_SETTINGS.customApiSelectionInit,
        currentBusinessEventSelectionInit: DEFAULT_SETTINGS.businessEventSelectionInit,
        pendingManagedFilterHandoff: null,
        selectedNavItem: 'customapi',

        editingComponent: 'none',

        theme:  'light',

        initTheme: async() => {
            let toolboxTheme = await window.toolboxAPI.utils.getCurrentTheme();
            set({ theme : toolboxTheme });
        },

        toggleTheme: () => set((state) => ({ 
            theme: state.theme === 'light' ? 'dark' : 'light' 
        })),

        // Connection actions
        setConnection: (connection) => {
            const currentConnectionId = _get().connection?.id;
            const newConnectionId = connection?.id;
            const addLog = _get().addLog;
            
            // Only reset selections if connection ID actually changed
            if (currentConnectionId !== newConnectionId) {
                set({ 
                    connection,
                    selectedSolutionId: null,
                    selectedCustomApiId: null,
                    selectedCatalogId: null,
                    selectedRequestParameterId: null,
                    selectedResponsePropertyId: null,
                    selectedPublisherId: null,
                    pendingBusinessEventAssignmentId: null,
                    currentCustomApiSelectionInit: DEFAULT_SETTINGS.customApiSelectionInit,
                    currentBusinessEventSelectionInit: DEFAULT_SETTINGS.businessEventSelectionInit,
                    pendingManagedFilterHandoff: null,
                });
                
                // Log connection change
                if (connection) {
                    addLog(`Connected to ${connection.name} (${connection.url})`, 'info');
                } else {
                    addLog('No active connection detected', 'warning');
                }
            } else {
                set({ connection });
            }
        },
        
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
        setSelectedRequestParameterId: (requestParameterId) => set((state) =>
            state.selectedRequestParameterId === requestParameterId
                ? state
                : { selectedRequestParameterId: requestParameterId }
        ),
        setSelectedResponsePropertyId: (responsePropertyId) => set((state) =>
            state.selectedResponsePropertyId === responsePropertyId
                ? state
                : { selectedResponsePropertyId: responsePropertyId }
        ),
        setSelectedPublisherId: (publisherId) => set(
            { selectedPublisherId: publisherId }
        ),
        setPendingBusinessEventAssignmentId: (assignmentId) => set((state) =>
            state.pendingBusinessEventAssignmentId === assignmentId
                ? state
                : { pendingBusinessEventAssignmentId: assignmentId }
        ),
        setCurrentCustomApiSelectionInit: (value) => set((state) =>
            state.currentCustomApiSelectionInit === value
                ? state
                : { currentCustomApiSelectionInit: value }
        ),
        setCurrentBusinessEventSelectionInit: (value) => set((state) =>
            state.currentBusinessEventSelectionInit === value
                ? state
                : { currentBusinessEventSelectionInit: value }
        ),
        setPendingManagedFilterHandoff: (handoff) => set((state) =>
            state.pendingManagedFilterHandoff?.target === handoff?.target &&
            state.pendingManagedFilterHandoff?.value === handoff?.value
                ? state
                : { pendingManagedFilterHandoff: handoff }
        ),
        setSelectedNavItem: (navItem) => set((state) => ({
            selectedNavItem: navItem,
            editingComponent: 'none',
            pendingBusinessEventAssignmentId:
                navItem === 'businessevent' ? state.pendingBusinessEventAssignmentId : null,
            pendingManagedFilterHandoff:
                state.pendingManagedFilterHandoff &&
                navMatchesManagedFilterTarget(navItem, state.pendingManagedFilterHandoff.target)
                    ? state.pendingManagedFilterHandoff
                    : null,
        })),

        setEditingComponent: (component) => set((state) =>
            state.editingComponent === component
                ? state
                : { editingComponent: component }
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

        clearGlobalMessage: (id) => set((state) => {
            if (!(id in state.globalMessages)) return state;
            const next = { ...state.globalMessages };
            delete next[id];
            return { ...state, globalMessages: next };
        }),

        clearAllGlobalMessages: () => set({ globalMessages: {} }),
    })
);
