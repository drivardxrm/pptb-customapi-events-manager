import { useCallback, useEffect, useState } from "react";
import {
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    MessageBarActions,
    MessageBarGroup,
    MessageBarIntent,
    Button,
} from "@fluentui/react-components";
import {
    DismissRegular,
    Settings24Filled,
} from "@fluentui/react-icons";
import { useStyles } from "../styles/Styles";
import { useAppSettings } from "../hooks/useAppSettings";
import { produce } from "immer";

export interface AppMessage {
    id: string;
    intent: MessageBarIntent;
    title: string;
    body: React.ReactNode;
    action?: {
        label: string;
        icon?: React.ReactElement;
        onClick: () => void;
    };
    dismissable?: boolean;
}

interface AppMessagesProps {
    onNavigate?: (section: string) => void;
}

export const AppMessages: React.FC<AppMessagesProps> = ({ onNavigate }) => {
    const styles = useStyles();
    const { appsettings } = useAppSettings();
    const [dismissedMessages, setDismissedMessages] = useState<Record<string, boolean>>({});

    const handleDismiss = useCallback((messageId: string) => {
        setDismissedMessages(produce(draft => {
            draft[messageId] = true;
        }));
    }, []);

    // Reset dismissed messages when conditions change
    useEffect(() => {
        if (appsettings?.defaultPublisherId !== null) {
            setDismissedMessages(produce(draft => {
                delete draft['publisher-warning'];
            }));
        }
    }, [appsettings?.defaultPublisherId]);

    // Build the list of active messages
    const messages: AppMessage[] = [];

    // Publisher warning message
    if (appsettings && appsettings.defaultPublisherId === null) {
        messages.push({
            id: 'publisher-warning',
            intent: 'info',
            title: 'Default Publisher not set!',
            body: (
                <>
                    You can set a default publisher in the <strong>Settings</strong> page to simplify Custom API creation.
                </>
            ),
            action: {
                label: 'Settings',
                icon: <Settings24Filled />,
                onClick: () => onNavigate?.('settings'),
            },
            dismissable: true,
        });
    }

    // Filter out dismissed messages
    const visibleMessages = messages.filter(msg => !dismissedMessages[msg.id]);

    if (visibleMessages.length === 0) {
        return null;
    }

    return (
        <MessageBarGroup className={styles.messageBarGroup}>
            {visibleMessages.map(message => (
                <MessageBar intent={message.intent} key={message.id}>
                    <MessageBarBody>
                        <MessageBarTitle>{message.title}</MessageBarTitle>
                        {message.body}
                    </MessageBarBody>
                    <MessageBarActions
                        containerAction={
                            message.dismissable ? (
                                <Button
                                    appearance="transparent"
                                    aria-label="Dismiss"
                                    icon={<DismissRegular />}
                                    onClick={() => handleDismiss(message.id)}
                                />
                            ) : undefined
                        }
                    >
                        {message.action && (
                            <Button
                                icon={message.action.icon}
                                onClick={message.action.onClick}
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