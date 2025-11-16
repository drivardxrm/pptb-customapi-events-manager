import { useEffect, useState } from "react";
import { 
    Image,
    NavDrawer,
    NavDrawerBody,
    NavDrawerHeader,
    NavItem, 
    Tooltip,
    Hamburger,
    OnNavItemSelectData,
    AppItem
} from "@fluentui/react-components";
import { 
    ServerMultipleRegular, 
    ClipboardBulletListRegular, 
    Info24Regular,
    Settings24Regular,
    Settings24Filled,
    //PlugConnected32Regular, 
    PlugConnected24Regular,
    PlugConnected24Filled,
    Info24Filled,
    bundleIcon
} from "@fluentui/react-icons";
import { ConnectionStatus } from "./ConnectionStatus";
import { EventLog } from "./EventLog";
import { useAppStore } from "../store/useAppStore";
import { useConnectionSync } from "../hooks/useConnectionSync";
import { useToolBoxEvents } from "../hooks/useToolBoxEvents";
import { About } from "./About";
import { CustomApiSelector } from "./CustomApiSelector";
import { CustomApiDetails } from "./CustomApiDetails";
import { useStyles } from '../styles/Styles';
import logoImage from '../assets/logo_customapi.png';
import { SettingsForm } from "./SettingsForm";




// const useAppStyles = makeStyles({
//     container: {
//         display: 'flex',
//         gap: tokens.spacingHorizontalM,
//         height: '100vh',
//         padding: tokens.spacingVerticalL,
//     },
//     nav: {
//         width: '200px',
//         flexShrink: 0,
//         backgroundColor: 'white',
//         borderRadius: tokens.borderRadiusMedium,
//         padding: tokens.spacingVerticalM,
//         boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
//     },
//     content: {
//         flex: 1,
//         overflowY: 'auto',
//         paddingBottom: tokens.spacingVerticalXXL,
//     },
// });

type NavSection = 'connection' | 'customapi' | 'logs' | 'settings' | 'about';


function App() {
    //const styles = useAppStyles();
    const styles = useStyles();
    
    // Zustand store
    const connection = useAppStore((state) => state.connection);
    const isLoading = useAppStore((state) => state.isLoadingConnection);
    const instanceId = useAppStore((state) => state.instanceId);
    //const logs = useAppStore((state) => state.logs);
    const addLog = useAppStore((state) => state.addLog);
    //const clearLogs = useAppStore((state) => state.clearLogs);
    const loadSettings = useAppStore((state) => state.loadSettings);
    const [navCollapsed, setNavCollapsed] = useState(false);

    const [selectedNavItem, setSelectedNavItem] = useState<NavSection>('customapi');
    
    //icons bundle
    const ConnectionIcon = bundleIcon(
        PlugConnected24Filled,
        PlugConnected24Regular
    );
    const SettingsIcon = bundleIcon(
        Settings24Filled,
        Settings24Regular
    );
    const AboutIcon = bundleIcon(
        Info24Filled,
        Info24Regular
    );



    const navItems = [
        { value: 'customapi', icon: <ServerMultipleRegular />, label: 'Custom API' },
        { value: 'connection', icon: <ConnectionIcon />, label: 'Connection' },
        { value: 'logs', icon: <ClipboardBulletListRegular />, label: 'Logs' },
        { value: 'settings', icon: <SettingsIcon />, label: 'Settings' },
        { value: 'about', icon: <AboutIcon />, label: 'About' },
    ];



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


    const handleNavItemSelect = (
        _event: Event | React.SyntheticEvent<Element, Event>,
        data: OnNavItemSelectData
    ) => {
        //setSelectedCategoryValue(data.categoryValue as string);
        setSelectedNavItem(data.value as NavSection);
    };

     // Render content based on selected navigation item
    const renderContent = () => {
        switch (selectedNavItem) {
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
                return <SettingsForm />;
            case 'about':
                return <About />;
            default:
                return null;
        }
    };

    // Get background color based on environment
    const getEnvironmentColor = () => {
        if (!connection?.environment) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Default purple gradient
        
        const env = connection.environment.toLowerCase();
        switch (env) {
            case 'production':
                return 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'; // Red gradient
            case 'uat':
                return 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)'; // Yellow gradient
            case 'test':
                return 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)'; // Cyan gradient
            case 'dev':
                return 'linear-gradient(135deg, #28a745 0%, #218838 100%)'; // Green gradient
            default:
                return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; // Default purple gradient
        }
    };

    return (
        <>
            {/* <header className="header">
                <h1>Dataverse Custom API Manager</h1>
                <p className="subtitle">A comprehensive management tool for Dataverse Custom APIs</p>
            </header> */}

            <div className={styles.container} style={{ background: getEnvironmentColor() }}> 
                <div className={styles.nav}>
                    <NavDrawer
                        tabbable={true} // enables keyboard tabbing
                        selectedValue={selectedNavItem}
                        onNavItemSelect={handleNavItemSelect}
                        type={"inline"}
                        open={true}
                        className={styles.nav}
                    >
                        <NavDrawerHeader>
                            <Tooltip content={navCollapsed ? "Expand menu" : "Collapse menu"} relationship="label">
                                <Hamburger onClick={() => setNavCollapsed((prev) => !prev)} />
                            </Tooltip>
                        </NavDrawerHeader>

                        <NavDrawerBody>
                            <AppItem icon={
                                <Image
                                    alt="Custom API Manager logo"
                                    src={logoImage}
                                    height={40}
                                    width={40}
                                />} as="a"
                            >
                                {!navCollapsed ? "Custom API Manager" : null}
                            </AppItem>
                            
                            {navItems.map(item => (
                                <Tooltip key={item.value} content={item.label} relationship="label" visible={navCollapsed}>
                                    <NavItem icon={item.icon} value={item.value}>
                                        {!navCollapsed ? item.label : null}
                                    </NavItem>
                                </Tooltip>
                            ))}
                        </NavDrawerBody>
                        
                    </NavDrawer>
                </div>

                <div className={styles.content}>
                    {renderContent()}
                </div>
            </div>
        </>
    );
}

export default App;
