import React from 'react';
import { Card, CardHeader, Divider, Link, tokens } from '@fluentui/react-components';
import { useStyles } from '../styles/Styles';

export const About: React.FC = () => {
    const styles = useStyles();
    
    return (
        <Card className={styles.card}>
            <CardHeader header={<h3>About</h3>} />
            <Divider />
            <div style={{ padding: tokens.spacingVerticalL, display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalM }}>
                <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#667eea' }}>Dataverse Custom API Manager</h4>
                    <p style={{ margin: '0 0 16px 0' }}>
                        A comprehensive management tool for Dataverse Custom APIs built with React and Fluent UI.
                    </p>
                </div>
                
                <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#667eea' }}>Author</h4>
                    <p style={{ margin: 0 }}>David Rivard</p>
                </div>
                
                <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#667eea' }}>Links</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <Link 
                            href="https://github.com/drivardxrm/PPTB-Dataverse-Custom-API-Manager" 
                            target="_blank"
                        >
                            GitHub Repository
                        </Link>
                        <Link 
                            href="https://github.com/drivardxrm" 
                            target="_blank"
                        >
                            Author's GitHub Profile
                        </Link>
                    </div>
                </div>
                
                <div>
                    <h4 style={{ margin: '0 0 8px 0', color: '#667eea' }}>Version</h4>
                    <p style={{ margin: 0 }}>1.0.0</p>
                </div>
                
                <div style={{ 
                    marginTop: tokens.spacingVerticalL,
                    padding: tokens.spacingVerticalM,
                    backgroundColor: tokens.colorNeutralBackground3,
                    borderRadius: tokens.borderRadiusMedium,
                    fontSize: '12px',
                    color: tokens.colorNeutralForeground3
                }}>
                    <p style={{ margin: 0 }}>
                        Built with React, TypeScript, Fluent UI, TanStack Query, and Zustand.
                    </p>
                </div>
            </div>
        </Card>
    );
};
