import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from '@tanstack/react-query';

export interface AppContextState {
    connection: ToolBoxAPI.DataverseConnection | null;
    instanceId: string;
    isLoading: boolean;
    refreshConnection: () => Promise<void>;
}

const AppContext = createContext<AppContextState | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

// Main provider component - must be used inside QueryClientProvider
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [connection, setConnection] = useState<ToolBoxAPI.DataverseConnection | null>(null);
    const [instanceId] = useState<string>(() => uuidv4());
    const [isLoading, setIsLoading] = useState(true);
    const queryClient = useQueryClient();

    const refreshConnection = useCallback(async () => {
        try {
            setIsLoading(true);
            console.log('Fetching active connection...');
            const conn = await window.toolboxAPI.connections.getActiveConnection();
            console.log('Active connection result:', conn);
            
            // Handle case where API returns null/undefined or empty object
            if (!conn || !conn.id) {
                console.log('No valid active connection, setting to null');
                setConnection(null);
            } else {
                console.log('Setting active connection:', conn.name);
                setConnection(conn);
            }
            
            // Invalidate all queries when connection changes
            await queryClient.invalidateQueries();
            console.log('Queries invalidated');
        } catch (error) {
            console.error('Error refreshing connection:', error);
            setConnection(null);
        } finally {
            setIsLoading(false);
        }
    }, [queryClient]);

    // Fetch initial connection state on component mount
    useEffect(() => {
        refreshConnection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

    // Subscribe to connection events to automatically refresh
    useEffect(() => {
        const handler = (_event: any, payload: ToolBoxAPI.ToolBoxEventPayload) => {
            console.log('AppContext received event:', payload.event, payload.data);
            
            // Listen for all connection-related events
            if (payload.event.startsWith('connection:')) {
                console.log('Connection event detected, refreshing connection...');
                refreshConnection();
            }
        };

        window.toolboxAPI.events.on(handler);

        return () => {
            // Note: Current API doesn't support unsubscribe
        };
    }, [refreshConnection]);

    const value: AppContextState = {
        connection,
        instanceId,
        isLoading,
        refreshConnection,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextState => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
