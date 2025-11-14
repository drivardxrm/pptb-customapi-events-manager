import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Hook to initialize and sync connection state with events
 */
export const useConnectionSync = () => {
    const refreshConnection = useAppStore((state) => state.refreshConnection);
    // const addLog = useAppStore((state) => state.addLog);
    // const connection = useAppStore((state) => state.connection);

    // Fetch initial connection on mount
    useEffect(() => {
        refreshConnection();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Subscribe to connection events
    // useEffect(() => {
    //     const handler = (_event: any, payload: ToolBoxAPI.ToolBoxEventPayload) => {
    //         console.log('🔔 Connection event received:', payload.event, payload.data);
            
    //         // Listen for all connection-related events
    //         if (payload.event.startsWith('connection:')) {
    //             console.log('📡 Refreshing connection due to event:', payload.event);
                
    //             // Log the event
    //             switch (payload.event) {
    //                 case 'connection:updated':
    //                     case 'connection:created':
    //                     refreshConnection().then(() => {
    //                         const conn = useAppStore.getState().connection;
    //                         if (conn) {
    //                             addLog(`Connected to: ${conn.name} (${conn.url})`, 'success');
    //                         }
    //                     });
    //                     break;
                        
    //                 case 'connection:deleted':
    //                     const currentConn = connection;
    //                     refreshConnection().then(() => {
    //                         if (currentConn) {
    //                             addLog(`Disconnected from: ${currentConn.name}`, 'warning');
    //                         } else {
    //                             addLog('Connection closed', 'warning');
    //                         }
    //                     });
    //                     break;
                        
    //                 default:
    //                     refreshConnection();
    //                     break;
    //             }
    //         }
    //     };

    //     window.toolboxAPI.events.on(handler);

    //     return () => {
    //         // Note: Current API doesn't support unsubscribe
    //     };
    // }, [refreshConnection, addLog, connection]);
};
