import { useEffect } from "react";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { DataverseAPIDemo } from "./components/DataverseAPIDemo";
import { EventLog } from "./components/EventLog";
import { ToolboxAPIDemo } from "./components/ToolboxAPIDemo";



import { useAppStore } from "./store/useAppStore";
import { useConnectionSync } from "./hooks/useConnectionSync";
import { CustomApiDetailsForm } from "./components/CustomApiDetailsForm";
import { CustomApiSelectorForm } from "./components/CustomApiSelectorForm";
import { useToolBoxEvents } from "./hooks/useToolBoxEvents";


function App() {
    // Zustand store
    const connection = useAppStore((state) => state.connection);
    const isLoading = useAppStore((state) => state.isLoadingConnection);
    const instanceId = useAppStore((state) => state.instanceId);
    const logs = useAppStore((state) => state.logs);
    const addLog = useAppStore((state) => state.addLog);
    const clearLogs = useAppStore((state) => state.clearLogs);
    
    //subscribe to events
    useToolBoxEvents();

    // Sync connection state with events
    useConnectionSync();

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
            
            <CustomApiSelectorForm />
            
            {/* {requestParameters.items && (
                    <GenericTagPicker 
                        items={requestParameters.items} 
                        onSelect={() => {}} // No action for now
                    />
            )}
            {responseProperties.items && (
                    <GenericTagPicker 
                        items={responseProperties.items} 
                        onSelect={() => {}} // No action for now
                    />
            )} */}
            
            <CustomApiDetailsForm />

            {/* <SolutionSelector onLog={addLog} /> */}

            <ToolboxAPIDemo onLog={addLog} />

            <DataverseAPIDemo connection={connection} onLog={addLog} />

            <EventLog logs={logs} onClear={clearLogs} />
        </>
    );
}

export default App;
