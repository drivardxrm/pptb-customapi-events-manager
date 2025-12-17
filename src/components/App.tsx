import { ReactElement, useEffect, useState } from "react";
import { 
    Image,
    NavDrawer,
    NavDrawerBody,
    NavDrawerHeader,
    NavItem, 
    Tooltip,
    Hamburger,
    OnNavItemSelectData,
    AppItem,
    mergeClasses
} from "@fluentui/react-components";
import { 
    ServerMultipleRegular, 
    ClipboardBulletListRegular, 
    Info24Regular,
    Settings24Regular,
    Settings24Filled,
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
//import { CustomApiSelector } from "./CustomApiSelector";
import { CustomApiDetails } from "./customApiDetails/CustomApiDetails";
import { useStyles } from '../styles/Styles';
import logoImage from '../assets/logo_customapi.png';
import { SettingsForm } from "./SettingsForm";
import { StoreDebugView } from "./StoreDebugView";
import { useAppSettings } from "../hooks/useAppSettings";
//import { CustomApiList } from "./CustomApiList";




type NavSection = 'connection' | 'customapi' | 'logs' | 'settings' | 'about' | 'debug';


function App() {
    //const styles = useAppStyles();
    const styles = useStyles();
    
    // Zustand store
    const {connection, isLoadingConnection, instanceId, addLog} = useAppStore();
    const { appsettings } = useAppSettings();
    // const isLoading = useAppStore((state) => state.isLoadingConnection);
    // const instanceId = useAppStore((state) => state.instanceId);
    // const addLog = useAppStore((state) => state.addLog);

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
    const navItems: Array<{ value: NavSection; icon: ReactElement; label: string; hidden?:boolean }> = [
        { value: 'customapi', icon: <ServerMultipleRegular />, label: 'Custom API' },
        { value: 'connection', icon: <ConnectionIcon />, label: 'Connection' },
        { value: 'logs', icon: <ClipboardBulletListRegular />, label: 'Logs' },
        { value: 'settings', icon: <SettingsIcon />, label: 'Settings' },
        { value: 'about', icon: <AboutIcon />, label: 'About' },
        { value: 'debug', icon: <ServerMultipleRegular />, label: 'Debug', hidden: !appsettings?.showDebug }
    ];



    useEffect(() => {
        if (!appsettings?.showDebug && selectedNavItem === 'debug') {
            setSelectedNavItem('customapi');
        }
    }, [appsettings?.showDebug, selectedNavItem]);

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
        if (!isLoadingConnection) {
            if (connection) {
                addLog(`Initial connection: ${connection.name} (${connection.url})`, 'info');
            } else {
                addLog('No active connection detected', 'warning');
            }
        }
    }, [connection, isLoadingConnection, addLog]);


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
                        {/* <CustomApiList/> */}
                        {/* <CustomApiSelector /> */}
                        <CustomApiDetails />
                    </>
                );
            case 'logs':
                return <EventLog/>;
            case 'settings':
                return <SettingsForm />;
            case 'about':
                return <About />;
            case 'debug':
                return appsettings?.showDebug ? <StoreDebugView /> : null;
            default:
                return null;
        }
    };

    // Get environment-specific class based on environment
    const getEnvironmentClass = () => {
        if (!connection?.environment) return styles.containerDefault;
        
        const env = connection.environment.toLowerCase();
        switch (env) {
            case 'production':
                return styles.containerProduction;
            case 'uat':
                return styles.containerUat;
            default:
                return styles.containerDefault;
        }
    };

    return (
        <>
            {/* <header className="header">
                <h1>Dataverse Custom API Manager</h1>
                <p className="subtitle">A comprehensive management tool for Dataverse Custom APIs</p>
            </header> */}

            <div className={mergeClasses(styles.container, getEnvironmentClass())}> 
                <div className={styles.appWrapper}>
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
                            
                            {navItems.filter(i => !i.hidden).map(item => (
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
            </div>
        </>
    );
}

export default App;
