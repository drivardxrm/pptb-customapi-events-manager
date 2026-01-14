import { ReactElement, useEffect, useMemo, useState } from "react";
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
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    MessageBarActions,
    Button,
    MessageBarGroup,
} from "@fluentui/react-components";
import { 
    ConnectedRegular, 
    ConnectedFilled,
    ClipboardBulletListRegular, 
    ClipboardBulletListFilled, 
    Info24Regular,
    Info24Filled,
    Settings24Regular,
    Settings24Filled,
    PlugConnected24Regular,
    PlugConnected24Filled,
    BugRegular,
    BugFilled,
    DismissRegular
    
} from "@fluentui/react-icons";
import { ConnectionStatus } from "./ConnectionStatus";
import { EventLog } from "./EventLog";
import { useAppStore } from "../store/useAppStore";
import { useConnectionSync } from "../hooks/useConnectionSync";
import { useToolBoxEvents } from "../hooks/useToolBoxEvents";
import { About } from "./About";
import { CustomApiDetails } from "./customApiDetails/CustomApiDetails";
import { useStyles } from '../styles/Styles';
import logoImage from '../assets/logo_customapi.png';
import { SettingsForm } from "./SettingsForm";
import { DebugView } from "./DebugView";
import { useAppSettings } from "../hooks/useAppSettings";
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
    

    const navItems: Array<{
        value: NavSection;
        icon: ReactElement;
        iconSelected: ReactElement;
        label: string;
        hidden?: boolean;
    }> = [
        { value: 'customapi', icon: <ConnectedRegular className={styles.navIcon} />, iconSelected: <ConnectedFilled className={styles.navIconSelected}/>, label: 'Custom API' },
        { value: 'settings', icon: <Settings24Regular className={styles.navIcon}/>, iconSelected: <Settings24Filled className={styles.navIconSelected}/>, label: 'Settings' },
        { value: 'connection', icon: <PlugConnected24Regular className={styles.navIcon}/>, iconSelected: <PlugConnected24Filled className={styles.navIconSelected}/>, label: 'Connection' },
        { value: 'logs', icon: <ClipboardBulletListRegular className={styles.navIcon}/>, iconSelected: <ClipboardBulletListFilled className={styles.navIconSelected}/>, label: 'Logs' },
        { value: 'about', icon: <Info24Regular className={styles.navIcon}/>, iconSelected: <Info24Filled className={styles.navIconSelected}/>, label: 'About' },
        { value: 'debug', icon: <BugRegular className={styles.navIcon}/>, iconSelected: <BugFilled className={styles.navIconSelected}/>, label: 'Debug', hidden: !appsettings?.showDebug },
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

    // must be reevaluated if appsettings.defaultPublisherId changes

    const messages = useMemo(() => {
        if (appsettings && appsettings.defaultPublisherId === null) {
            return (
                <MessageBarGroup className={styles.messageBarGroup}>
                    <MessageBar intent={'info'} key={'publisher-warning'}>
                        <MessageBarBody>
                            <MessageBarTitle>Default Publisher not set!</MessageBarTitle>
                            You can set a default publisher in the <strong>Settings</strong> page to simplify Custom API creation.
                        </MessageBarBody>
                        <MessageBarActions
                            containerAction={
                                <Button
                                appearance="transparent"
                                aria-label="Dismiss"
                                icon={<DismissRegular />}
                                />
                            }
                            >
                            <Button 
                                icon={<Settings24Filled/>} 
                                onClick={()=>setSelectedNavItem('settings')}
                            >
                                Settings
                            </Button>
                        </MessageBarActions>
                    </MessageBar>
                </MessageBarGroup>
            );
                
        }
        return <></>;
    }, [appsettings?.defaultPublisherId]);



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
                return appsettings?.showDebug ? <DebugView /> : null;
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
                        {messages}
                        {renderContent()}
                    </div>
                {/* </div> */}
            </div>
       
    );
}

export default App;
