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
    AppItem
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
import { mergeClasses } from '@fluentui/react-components';



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
    
    // //icons bundle
    // const ConnectionIcon = bundleIcon(
    //     PlugConnected24Filled,
    //     PlugConnected24Regular
    // );
    // const SettingsIcon = bundleIcon(
    //     Settings24Filled,
    //     Settings24Regular
    // );
    // const AboutIcon = bundleIcon(
    //     Info24Filled,
    //     Info24Regular
    // );
    const navItems: Array<{
        value: NavSection;
        icon: ReactElement;
        iconSelected: ReactElement;
        label: string;
        hidden?: boolean;
    }> = [
        { value: 'customapi', icon: <ServerMultipleRegular className={styles.navIcon} />, iconSelected: <ServerMultipleRegular className={styles.navIconSelected}/>, label: 'Custom API' },
        { value: 'connection', icon: <PlugConnected24Regular className={styles.navIcon}/>, iconSelected: <PlugConnected24Filled className={styles.navIconSelected}/>, label: 'Connection' },
        { value: 'logs', icon: <ClipboardBulletListRegular className={styles.navIcon}/>, iconSelected: <ClipboardBulletListRegular className={styles.navIconSelected}/>, label: 'Logs' },
        { value: 'settings', icon: <Settings24Regular className={styles.navIcon}/>, iconSelected: <Settings24Filled className={styles.navIconSelected}/>, label: 'Settings' },
        { value: 'about', icon: <Info24Regular className={styles.navIcon}/>, iconSelected: <Info24Filled className={styles.navIconSelected}/>, label: 'About' },
        { value: 'debug', icon: <ServerMultipleRegular className={styles.navIcon}/>, iconSelected: <ServerMultipleRegular className={styles.navIconSelected}/>, label: 'Debug', hidden: !appsettings?.showDebug },
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

    const renderNavIcon = (item: typeof navItems[number], isSelected: boolean) => {
        const iconElement = isSelected ? item.iconSelected : item.icon;

        return navCollapsed ? (
            <Tooltip content={item.label} relationship="label">
                <span
                    onClick={(event) => {
                        handleNavItemSelect(event, { value: item.value } as OnNavItemSelectData);
                    }}
                >
                    {iconElement}
                </span>
            </Tooltip>
        ) : (
            <span
                onClick={(event) => {
                    handleNavItemSelect(event, { value: item.value } as OnNavItemSelectData);
                }}
            >
                {iconElement}
            </span>
        );
    };



    return (
       
            <div className={styles.container}> 
                {/* <div className={styles.appWrapper}> */}
                    <div className={mergeClasses(styles.nav, navCollapsed && styles.navCollapsed)}>
                        <NavDrawer
                          style={{ '--fui-NavDrawer-width': navCollapsed ? '72px' : '280px' } as React.CSSProperties}
                          tabbable
                          selectedValue={selectedNavItem}
                          onNavItemSelect={handleNavItemSelect}
                          type="inline"
                          open
                          className={mergeClasses(styles.nav, navCollapsed && styles.navCollapsed)}
                        >
                            <NavDrawerHeader>
                                <Tooltip content={navCollapsed ? "Expand menu" : "Collapse menu"} relationship="label">
                                    <Hamburger onClick={() => setNavCollapsed(prev => !prev)} />
                                </Tooltip>
                            </NavDrawerHeader>
                            <NavDrawerBody>
                                <AppItem
                                    icon={<Image alt="Custom API Manager logo" src={logoImage} height={40} width={40} />}
                                    as="a"
                                >
                                    {!navCollapsed ? "Custom API Manager" : null}
                                </AppItem>
                                {navItems.filter(i => !i.hidden).map(item => {
                                    const isSelected = selectedNavItem === item.value;
                                    return (
                                        <NavItem
                                            key={item.value}
                                            value={item.value}
                                            icon={renderNavIcon(item, isSelected)}
                                        >
                                            {!navCollapsed ? item.label : null}
                                        </NavItem>
                                    );
                                })}
                            </NavDrawerBody>
                        </NavDrawer>
                    </div>

                    <div className={styles.content}>
                        {renderContent()}
                    </div>
                {/* </div> */}
            </div>
       
    );
}

export default App;
