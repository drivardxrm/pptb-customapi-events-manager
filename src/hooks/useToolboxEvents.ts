import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useToolboxEvents = () => {
    const addLog = useAppStore((state) => state.addLog);
    const refreshConnection = useAppStore((state) => state.refreshConnection);

    useEffect(() => {
        
        const handler = (event: any, payload: ToolBoxAPI.ToolBoxEventPayload) => {
            console.log('📡 useToolboxEvents: Event received:', event, payload);

            
            switch (payload.event) {
                case 'connection:updated':
                case 'connection:created':
                case 'connection:deleted':
                    console.log('Connection event detected, refreshing connection...');
                    addLog(`Toolbox Event: ${JSON.stringify(payload)}`, "info");
                    refreshConnection();
                    break;
                
                // case "terminal:output":
                //     console.log("Terminal output:", payload.data);
                //     addLog(`Terminal output: ${JSON.stringify(payload.data)}`, "info");
                //     break;

                // case "terminal:command:completed":
                //     console.log("Command completed:", payload.data);
                //     addLog("Terminal command completed", "success");
                //     break;

                // case "terminal:error":
                //     console.error("Terminal error:", payload.data);
                //     addLog(`Terminal error: ${payload.data}`, "error");
                //     break;

                default:
                    console.log(`Unhandled event: ${payload.event}`, payload.data);
                    //addLog(`Event: ${payload.event}`, "info");
                    break;
            
            }
        };

        window.toolboxAPI.events.on(handler);

        // Cleanup on unmount
        return () => {
        
        // Note: Current API doesn't support unsubscribe
        };
    }, []); // Empty deps to set up only once on mount
};