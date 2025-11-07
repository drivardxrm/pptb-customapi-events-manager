import { useCallback, useEffect } from "react";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { DataverseAPIDemo } from "./components/DataverseAPIDemo";
import { EventLog } from "./components/EventLog";
import { ToolboxAPIDemo } from "./components/ToolboxAPIDemo";
import { useEventLog, useToolboxEvents } from "./hooks/useToolboxAPI";
import { SolutionSelector } from "./components/SolutionSelector";
import { useAppContext } from "./contexts/AppContext";

function App() {
    const { connection, isLoading, instanceId, refreshConnection } = useAppContext();
    const { logs, addLog, clearLogs  } = useEventLog();

    // Handle platform events
    const handleEvent = useCallback(
        (event: string, data: any) => {
            
            console.log(`App received event: ${event}`, data);
            
            switch (event) {
                case 'connection:created':
                case 'connection:updated':
                    // if (data?.name) {
                    //     addLog(`Connected to: ${data.name} (${data.url})`, 'success');
                    // } else {
                    //     addLog('Connection established', 'success');
                    // }
                    refreshConnection();
                    break;
                    
                case 'connection:deleted':
                    // if (data?.name) {
                    //     addLog(`Disconnected from: ${data.name}`, 'warning');
                    // } else {
                    //     addLog('Connection closed', 'warning');
                    // }
                    refreshConnection();
                    break;

                case 'terminal:output':
                case 'terminal:command:completed':
                case 'terminal:error':
                    // Terminal events handled by dedicated components
                    break;
            }
        },
        [addLog]
    );

    useToolboxEvents(handleEvent);

    // Add initial log with instance ID (run only once on mount)
    useEffect(() => {
        addLog(`Dataverse Custom API Manager initialized (Instance: ${instanceId})`, 'success');
    }, [addLog, instanceId]);

    // Log initial connection status
    useEffect(() => {
        if (!isLoading) {
            if (connection) {
                addLog(`Initial connection: ${connection.name} (${connection.url})`, 'info');
            } else {
                addLog('No active connection detected', 'warning');
            }
        }
    }, [connection, isLoading, addLog]);

    return (
        <>
            <header className="header">
                <h1>Dataverse Custom API Manager</h1>
                <p className="subtitle">A comprehensive management tool for Dataverse Custom APIs</p>
            </header>

            <ConnectionStatus />
 
            <SolutionSelector onLog={addLog} />

            <ToolboxAPIDemo onLog={addLog} />

            <DataverseAPIDemo connection={connection} onLog={addLog} />

            <EventLog logs={logs} onClear={clearLogs} />
        </>
    );
}

export default App;
