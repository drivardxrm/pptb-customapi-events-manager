import React from 'react';
import { Card, CardHeader, Divider, Spinner, tokens } from '@fluentui/react-components';
import { useAppStore } from '../store/useAppStore';
import { useStyles } from '../styles/Styles';

export const ConnectionStatus: React.FC = () => {
    const styles = useStyles();
    const {connection, isLoadingConnection} = useAppStore();

    
    if (isLoadingConnection) {
        return (
            <Card className={styles.card}>
                <CardHeader header={<h3>🔗 Connection Status</h3>} />
                <Divider />
                <div style={{ 
                    padding: tokens.spacingVerticalM, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: tokens.spacingHorizontalM 
                }}>
                    <Spinner size="small" />
                    <span>Checking connection...</span>
                </div>
            </Card>
        );
    }

    if (!connection) {
        return (
            <Card className={styles.card}>
                <CardHeader header={<h3>🔗 Connection Status</h3>} />
                <Divider />
                <div style={{
                    padding: tokens.spacingVerticalM,
                    backgroundColor: '#fff3cd',
                    borderLeft: `4px solid #ffc107`,
                    borderRadius: tokens.borderRadiusMedium
                }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>⚠️ No active connection</p>
                    <p style={{ margin: '8px 0 0 0' }}>Please connect to a Dataverse environment to use this tool.</p>
                </div>
            </Card>
        );
    }

    const envClass = connection.environment.toLowerCase();
    const envColors: Record<string, { bg: string; color: string }> = {
        production: { bg: '#dc3545', color: 'white' },
        sandbox: { bg: '#ffc107', color: '#333' },
        dev: { bg: '#17a2b8', color: 'white' }
    };
    const envStyle = envColors[envClass] || { bg: '#6c757d', color: 'white' };

    return (
        <Card className={styles.card}>
            <CardHeader header={<h3>🔗 Connection Status</h3>} />
            <Divider />
            <div style={{
                padding: tokens.spacingVerticalM,
                backgroundColor: '#d4edda',
                borderLeft: '4px solid #28a745',
                borderRadius: tokens.borderRadiusMedium
            }}>
                <div style={{ display: 'grid', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <strong style={{ minWidth: '100px', color: '#667eea' }}>Name:</strong>
                        <span>{connection.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <strong style={{ minWidth: '100px', color: '#667eea' }}>URL:</strong>
                        <span>{connection.url}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <strong style={{ minWidth: '100px', color: '#667eea' }}>Environment:</strong>
                        <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            backgroundColor: envStyle.bg,
                            color: envStyle.color
                        }}>
                            {connection.environment}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <strong style={{ minWidth: '100px', color: '#667eea' }}>ID:</strong>
                        <span>{connection.id}</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
