import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useToolBoxEvents = () => {
//   const refreshConnection = useAppStore((state) => state.refreshConnection);
   const addLog = useAppStore((state) => state.addLog);

  useEffect(() => {
    
    const eventCallback = (_event: any, payload: ToolBoxAPI.ToolBoxEventPayload) => {
        console.log(`[${payload.timestamp}] ${payload.event}:`, payload.data);

        switch (payload.event) {
            case "connection:updated":
                console.log("Connection updated:", payload.data);
                addLog("Connection updated." + payload.data, "info");
                // Refresh UI with new connection
                //refreshConnectionUI();
                break;

            // case "connection:deleted":
            //     console.log("Connection deleted:", payload.data);
            //     // Clear connection-dependent UI
            //     clearConnectionUI();
            //     break;

            // case "terminal:output":
            //     // Show terminal output in UI
            //     const { terminalId, output } = payload.data as any;
            //     appendTerminalOutput(terminalId, output);
            //     break;

            // case "terminal:command:completed":
            //     console.log("Command completed:", payload.data);
            //     break;

            // case "terminal:error":
            //     console.error("Terminal error:", payload.data);
            //     break;
        }
    };


    // Subscribe to event
    window.toolboxAPI.events.on(eventCallback);

    // Cleanup on unmount
    return () => {
      window.toolboxAPI.events.off(eventCallback);
    };
  }, []); // Empty dependency array ensures this runs once on mount
};