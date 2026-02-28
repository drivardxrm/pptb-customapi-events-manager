import { Card, CardHeader, Divider, Button } from '@fluentui/react-components';
import { Delete24Regular } from '@fluentui/react-icons';
import type { LogEntry } from '../hooks/useToolboxAPI';
import { useStyles } from '../styles/Styles';
import { useAppStore } from '../store/useAppStore';



const getLogColors = (type: LogEntry['type']) => {
    switch (type) {
        case 'error':
            return { borderColor: '#dc3545', backgroundColor: '#3d2d2e' };
        case 'success':
            return { borderColor: '#28a745', backgroundColor: '#2d3d2e' };
        case 'warning':
            return { borderColor: '#ffc107', backgroundColor: '#3d3d2e' };
        default:
            return { borderColor: '#667eea', backgroundColor: '#2d2d30' };
    }
};

export const EventLog = () => {
    const styles = useStyles();
    const { logs, clearLogs}  = useAppStore();
   
    
    return (
        <Card className={styles.card}>
            <CardHeader 
                header={<h3>📋 Event Log</h3>}
                action={
                    <Button 
                        appearance="secondary" 
                        icon={<Delete24Regular />}
                        onClick={clearLogs}
                    >
                        Clear Log
                    </Button>
                }
            />
            <Divider />
            <div className={styles.eventLogContainer}>
                {logs.length === 0 ? (
                    <div className={styles.eventLogEmpty}>No logs yet...</div>
                ) : (
                    logs.map((log, index) => {
                        const colors = getLogColors(log.type);
                        return (
                            <div 
                                key={index} 
                                className={styles.eventLogEntry}
                                style={{
                                    borderLeft: `3px solid ${colors.borderColor}`,
                                    backgroundColor: colors.backgroundColor
                                }}
                            >
                                <span className={styles.eventLogTimestamp}>
                                    [{log.timestamp.toLocaleTimeString()}]
                                </span>
                                <span>{log.message}</span>
                            </div>
                        );
                    })
                )}
            </div>
        </Card>
    );
};
