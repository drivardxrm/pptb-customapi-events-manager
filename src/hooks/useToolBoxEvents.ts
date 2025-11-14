import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export const useToolBoxEvents = () => {
   const addLog = useAppStore((state) => state.addLog);

  useEffect(() => {
    console.log('🎯 useToolBoxEvents: Setting up event listener');
        if (!window.toolboxAPI || !window.toolboxAPI.events || !window.toolboxAPI.events.on) {
            console.warn('⚠️ useToolBoxEvents: toolboxAPI.events.on is not available yet');
            return;
        }
        const onFn: any = window.toolboxAPI.events.on;
        console.log('🔍 useToolBoxEvents: Detected events.on arity =', onFn.length);
        console.log('🔍 useToolBoxEvents: events object keys =', Object.keys(window.toolboxAPI.events));
    
    const handler = (_event: any, payload: ToolBoxAPI.ToolBoxEventPayload) => {
        console.log(`🎯 useToolBoxEvents: Event received!`);
        console.log(`🎯 Event: ${payload.event}, Data:`, payload.data);

        // Handle all non-connection events
        if (!payload.event.startsWith('connection:')) {
            switch (payload.event) {
                case "terminal:output":
                    console.log("Terminal output:", payload.data);
                    addLog(`Terminal output: ${JSON.stringify(payload.data)}`, "info");
                    break;

                case "terminal:command:completed":
                    console.log("Command completed:", payload.data);
                    addLog("Terminal command completed", "success");
                    break;

                case "terminal:error":
                    console.error("Terminal error:", payload.data);
                    addLog(`Terminal error: ${payload.data}`, "error");
                    break;

                default:
                    console.log(`Unhandled event: ${payload.event}`, payload.data);
                    addLog(`Event: ${payload.event}`, "info");
                    break;
            }
        }
    };

        // Subscribe to events – try both signature styles
        console.log('🎯 useToolBoxEvents: Registering handler');
        try {
            if (onFn.length >= 2) {
                // Likely Node/EventEmitter style expecting (eventName, callback)
                const eventNames = [
                    'connection:updated',
                    'connection:created',
                    'connection:deleted',
                    'terminal:output',
                    'terminal:command:completed',
                    'terminal:error'
                ];
                eventNames.forEach(ev => {
                    try {
                        onFn(ev, handler);
                        console.log(`✅ useToolBoxEvents: Subscribed with explicit event name '${ev}'`);
                    } catch (e) {
                        console.warn(`⚠️ useToolBoxEvents: Failed subscribing to '${ev}' with (event, handler) signature`, e);
                    }
                });
            } else {
                // Generic broadcast style expecting (handler)
                onFn(handler);
                console.log('✅ useToolBoxEvents: Subscribed using single-argument handler signature');
            }
        } catch (e) {
            console.error('❌ useToolBoxEvents: Error during subscription', e);
        }

    // Cleanup on unmount
    return () => {
      console.log('🎯 useToolBoxEvents: Cleaning up');
      // Note: Current API doesn't support unsubscribe
    };
  }, [addLog]);
};