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
    // ConnectedRegular, 
    // ConnectedFilled,
    DeveloperBoardLightningRegular,
    DeveloperBoardLightningFilled,
    ClipboardBulletListRegular, 
    ClipboardBulletListFilled, 
    Info24Regular,
    Info24Filled,
    Settings24Regular,
    Settings24Filled,
    BugRegular,
    BugFilled,
    FlashFlowRegular,
    FlashFlowFilled   
    
} from "@fluentui/react-icons";
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
import { ThemeSwitcher } from './ThemeSwitcher';
// import { CatalogSelector } from "./CatalogSelector";
import { AppMessages } from "./AppMessages";



type NavSection = 'customapi' | 'businessevent' | 'logs' | 'settings' | 'about' | 'debug';


function App() {
    
    const styles = useStyles();
    const {instanceId, addLog, selectedNavItem, setSelectedNavItem, setGlobalMessage, clearGlobalMessage} = useAppStore();
    const { appsettings } = useAppSettings();


    const [navCollapsed, setNavCollapsed] = useState(false);
    

    const navItems: Array<{
        value: NavSection;
        icon: ReactElement;
        iconSelected: ReactElement;
        label: string;
        hidden?: boolean;
    }> = [
        { value: 'customapi', icon: <DeveloperBoardLightningRegular className={styles.navIcon} />, iconSelected: <DeveloperBoardLightningFilled className={styles.navIconSelected}/>, label: 'Custom APIs' },
        { value: 'businessevent', icon: <FlashFlowRegular className={styles.navIcon} />, iconSelected: <FlashFlowFilled className={styles.navIconSelected}/>, label: 'Business Events' },
        { value: 'settings', icon: <Settings24Regular className={styles.navIcon}/>, iconSelected: <Settings24Filled className={styles.navIconSelected}/>, label: 'Settings' },
        // { value: 'connection', icon: <PlugConnected24Regular className={styles.navIcon}/>, iconSelected: <PlugConnected24Filled className={styles.navIconSelected}/>, label: 'Connection' },
        { value: 'logs', icon: <ClipboardBulletListRegular className={styles.navIcon}/>, iconSelected: <ClipboardBulletListFilled className={styles.navIconSelected}/>, label: 'Logs' },
        { value: 'about', icon: <Info24Regular className={styles.navIcon}/>, iconSelected: <Info24Filled className={styles.navIconSelected}/>, label: 'About' },
        { value: 'debug', icon: <BugRegular className={styles.navIcon}/>, iconSelected: <BugFilled className={styles.navIconSelected}/>, label: 'Debug', hidden: !appsettings?.showDebug },
    ];



    useEffect(() => {
        if (!appsettings?.showDebug && selectedNavItem === 'debug') {
            setSelectedNavItem('customapi');
        }
    }, [appsettings?.showDebug, selectedNavItem]);

    // Show coming soon message for business events
    useEffect(() => {
        if (selectedNavItem === 'businessevent') {
            setGlobalMessage('businessevent-coming-soon', {
                intent: 'info',
                title: 'Business Events - Coming Soon!',
                body: 'This feature is currently under development.',
                dismissable: false,
            });
        } else {
            clearGlobalMessage('businessevent-coming-soon');
        }
    }, [selectedNavItem, setGlobalMessage, clearGlobalMessage]);

   

    //subscribe to events
    useToolBoxEvents();

    // Sync connection state with events
    useConnectionSync();

    // Add initial log with instance ID (run only once on mount)
    useEffect(() => {
        addLog(`Dataverse Custom API Manager initialized (Instance: ${instanceId})`, 'success');
    }, [addLog, instanceId]);




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
            // case 'connection':
            //     return <ConnectionStatus />;
            case 'customapi':
                return (
                    <>
                        {/* <CustomApiList/> */}
                        {/* <CustomApiSelector /> */}
                        <CustomApiDetails />
                    </>
                );
            case 'businessevent':
                return (
                    <>
                        

                         {/* <CatalogSelector /> */}
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
                                    icon={<Image alt="Custom API Studio" src={logoImage} height={40} width={40} />}
                                    as="a"
                                >
                                    {!navCollapsed ? "Custom API Studio" : null}
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
                        <ThemeSwitcher isCollapsed={navCollapsed} />
                    </div>
                    
                    <div className={styles.content}>
                        <div className={styles.sticky}>
                            <AppMessages />
                        </div>
                        {renderContent()}
                    </div>
                {/* </div> */}
            </div>
       
    );
}

export default App;
