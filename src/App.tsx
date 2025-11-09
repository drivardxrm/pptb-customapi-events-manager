import { useEffect } from "react";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { DataverseAPIDemo } from "./components/DataverseAPIDemo";
import { EventLog } from "./components/EventLog";
import { ToolboxAPIDemo } from "./components/ToolboxAPIDemo";
import { useToolboxEvents } from "./hooks/useToolboxAPI";
import { GenericTagPicker } from "./components/GenericTagPicker";
import { useSolutionsAsSelectableItems } from "./hooks/useSolutions";
import { useCustomApisAsSelectableItems } from "./hooks/useCustomApis";
import { useAppStore } from "./store/useAppStore";
import { useConnectionSync } from "./hooks/useConnectionSync";
import { useCustomApiRequestParametersAsSelectableItems } from "./hooks/useCustomApiRequestParameters";
import { useCustomApiResponsePropertiesAsSelectableItems } from "./hooks/useCustomApiResponseProperties";

function App() {
    // Zustand store
    const connection = useAppStore((state) => state.connection);
    const isLoading = useAppStore((state) => state.isLoadingConnection);
    const instanceId = useAppStore((state) => state.instanceId);
    const logs = useAppStore((state) => state.logs);
    const addLog = useAppStore((state) => state.addLog);
    const clearLogs = useAppStore((state) => state.clearLogs);
    const setSelectedSolutionId = useAppStore((state) => state.setSelectedSolutionId);
    const setSelectedCustomApiId = useAppStore((state) => state.setSelectedCustomApiId);

    // Sync connection state with events
    useConnectionSync();

    const solutions = useSolutionsAsSelectableItems();
    const customapis = useCustomApisAsSelectableItems();
    const requestParameters = useCustomApiRequestParametersAsSelectableItems();
    const responseProperties = useCustomApiResponsePropertiesAsSelectableItems();


    // Handle platform events (non-connection events)
    useToolboxEvents((event: string, data: any) => {
        console.log(`🔔 App received event: ${event}`, data);
        
        // Terminal events handled by dedicated components
        if (event.startsWith('terminal:')) {
            console.log('💻 Terminal event:', event);
        }
    });

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
                        {solutions.items && (
                                <GenericTagPicker 
                                    items={solutions.items} 
                                    onLog={addLog} 
                                    onSelect={(id) => {
                                        setSelectedSolutionId(id);
                                        if(id){
                                            addLog(`Solution selected: ${id}`, 'success');
                                        } else {
                                            addLog('Solution selection cleared', 'warning');
                                        }
                                    }}
                                />
                        )}

                        {customapis.items && (
                                <GenericTagPicker 
                                    items={customapis.items} 
                                    onLog={addLog} 
                                    onSelect={(id) => {
                                        setSelectedCustomApiId(id);
                                        if(id){
                                            addLog(`Custom API selected: ${id}`, 'info');
                                        } else {
                                            addLog('Custom API selection cleared', 'warning');
                                        }
                                    }}
                                />
                        )}
                        {requestParameters.items && (
                                <GenericTagPicker 
                                    items={requestParameters.items} 
                                    onLog={addLog} 
                                    onSelect={() => {}} // No action for now
                                />
                        )}
                        {responseProperties.items && (
                                <GenericTagPicker 
                                    items={responseProperties.items} 
                                    onLog={addLog} 
                                    onSelect={() => {}} // No action for now
                                />
                        )}
            
            {/* <SolutionSelector onLog={addLog} /> */}

            <ToolboxAPIDemo onLog={addLog} />

            <DataverseAPIDemo connection={connection} onLog={addLog} />

            <EventLog logs={logs} onClear={clearLogs} />
        </>
    );
}

export default App;
