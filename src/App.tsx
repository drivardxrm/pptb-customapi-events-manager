import { useEffect, useState } from "react";
import { 
    Nav, 
    NavItem, 
    tokens,
    makeStyles 
} from "@fluentui/react-components";
import { 
    PlugConnected24Regular, 
    ServerMultipleRegular, 
    ClipboardBulletListRegular, 
    Info24Regular,
    Settings24Regular 
} from "@fluentui/react-icons";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { EventLog } from "./components/EventLog";
import { useAppStore } from "./store/useAppStore";
import { useConnectionSync } from "./hooks/useConnectionSync";
import { useToolBoxEvents } from "./hooks/useToolBoxEvents";
import { About } from "./components/About";
import { CustomApiSelector } from "./components/CustomApiSelector";
import { CustomApiDetails } from "./components/CustomApiDetails";
import { Settings } from "./components/Settings";

const useAppStyles = makeStyles({
    container: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        height: '100vh',
        padding: tokens.spacingVerticalL,
    },
    nav: {
        width: '200px',
        flexShrink: 0,
        backgroundColor: 'white',
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalM,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        paddingBottom: tokens.spacingVerticalXXL,
    },
});

type NavSection = 'connection' | 'customapi' | 'logs' | 'settings' | 'about';


function App() {
    const styles = useAppStyles();
    const [selectedNav, setSelectedNav] = useState<NavSection>('connection');
    
    // Zustand store
    const connection = useAppStore((state) => state.connection);
    const isLoading = useAppStore((state) => state.isLoadingConnection);
    const instanceId = useAppStore((state) => state.instanceId);
    //const logs = useAppStore((state) => state.logs);
    const addLog = useAppStore((state) => state.addLog);
    //const clearLogs = useAppStore((state) => state.clearLogs);
    const loadSettings = useAppStore((state) => state.loadSettings);
    
    //subscribe to events
    useToolBoxEvents();

    // Sync connection state with events
    useConnectionSync();

    // Add initial log with instance ID (run only once on mount)
    useEffect(() => {
        addLog(`Dataverse Custom API Manager initialized (Instance: ${instanceId})`, 'success');
        // Hydrate settings once at startup
        loadSettings();
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

    const renderContent = () => {
        switch (selectedNav) {
            case 'connection':
                return <ConnectionStatus />;
            case 'customapi':
                return (
                    <>
                        <CustomApiSelector />
                        <CustomApiDetails />
                    </>
                );
            case 'logs':
                return <EventLog/>;
            case 'settings':
                return <Settings />;
            case 'about':
                return <About />;
            default:
                return null;
        }
    };

    return (
        <>
            <header className="header">
                <h1>Dataverse Custom API Manager</h1>
                <p className="subtitle">A comprehensive management tool for Dataverse Custom APIs</p>
            </header>

            <div className={styles.container}>
                <div className={styles.nav}>
                    <Nav>
                        
                        <NavItem 
                            icon={<PlugConnected24Regular />} 
                            value="connection"
                            onClick={() => setSelectedNav('connection')}
                        >
                            Connection
                        </NavItem>
                        <NavItem 
                            icon={<ServerMultipleRegular />} 
                            value="customapi"
                            onClick={() => setSelectedNav('customapi')}
                        >
                            Custom API
                        </NavItem>
                        <NavItem 
                            icon={<ClipboardBulletListRegular />} 
                            value="logs"
                            onClick={() => setSelectedNav('logs')}
                        >
                            Logs
                        </NavItem>
                        <NavItem 
                            icon={<Settings24Regular />} 
                            value="settings"
                            onClick={() => setSelectedNav('settings')}
                        >
                            Settings
                        </NavItem>
                        <NavItem 
                            icon={<Info24Regular />} 
                            value="about"
                            onClick={() => setSelectedNav('about')}
                        >
                            About
                        </NavItem>
                    </Nav>
                </div>

                <div className={styles.content}>
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

export default App;
