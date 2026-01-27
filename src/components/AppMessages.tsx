import { useEffect } from "react";
import {
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    MessageBarActions,
    MessageBarGroup,
    Button,
} from "@fluentui/react-components";
import {
    DismissRegular,
    Settings24Filled,
} from "@fluentui/react-icons";
import { useStyles } from "../styles/Styles";
import { useAppSettings } from "../hooks/useAppSettings";
import { useAppStore } from "../store/useAppStore";

interface AppMessagesProps {
    onNavigate?: (section: string) => void;
}

export const AppMessages: React.FC<AppMessagesProps> = ({ onNavigate }) => {
    const styles = useStyles();
    const { appsettings } = useAppSettings();
    const { globalMessages, setGlobalMessage, clearGlobalMessage } = useAppStore();

    // Manage publisher warning message via global store
    useEffect(() => {
        if (appsettings && appsettings.defaultPublisherId === null) {
            setGlobalMessage('publisher-warning', {
                intent: 'info',
                title: 'Default Publisher not set!',
                body: 'You can set a default publisher in the Settings page to simplify Custom API creation.',
                action: {
                    label: 'Settings',
                    navigateTo: 'settings',
                },
                dismissable: true,
            });
        } else {
            clearGlobalMessage('publisher-warning');
        }
    }, [appsettings?.defaultPublisherId, setGlobalMessage, clearGlobalMessage]);

    const messages = Object.entries(globalMessages);

    if (messages.length === 0) {
        return null;
    }

    return (
        <MessageBarGroup className={styles.messageBarGroup}>
            {messages.map(([id, message]) => (
                <MessageBar intent={message.intent} key={id}>
                    <MessageBarBody>
                        <MessageBarTitle>{message.title}</MessageBarTitle>
                        {message.body}
                    </MessageBarBody>
                    <MessageBarActions
                        containerAction={
                            message.dismissable !== false ? (
                                <Button
                                    appearance="transparent"
                                    aria-label="Dismiss"
                                    icon={<DismissRegular />}
                                    onClick={() => clearGlobalMessage(id)}
                                />
                            ) : undefined
                        }
                    >
                        {message.action && (
                            <Button
                                icon={<Settings24Filled />}
                                onClick={() => onNavigate?.(message.action!.navigateTo ?? '')}
                            >
                                {message.action.label}
                            </Button>
                        )}
                    </MessageBarActions>
                </MessageBar>
            ))}
        </MessageBarGroup>
    );
};