import React from 'react';
import { Card, CardHeader, Divider, Link } from '@fluentui/react-components';
import { useStyles } from '../styles/Styles';

export const About: React.FC = () => {
    const styles = useStyles();
    
    return (
        <Card className={styles.card}>
            <CardHeader header={<h3>About</h3>} />
            <Divider />
            <div className={styles.aboutContainer}>
                <div>
                    <h4 className={styles.aboutHeading}>Custom API Studio</h4>
                    <p className={styles.aboutTextSpaced}>
                        A comprehensive management tool for Dataverse Custom APIs built with React and Fluent UI.
                    </p>
                </div>
                
                <div>
                    <h4 className={styles.aboutHeading}>Author</h4>
                    <p className={styles.aboutText}>David Rivard</p>
                </div>
                
                <div>
                    <h4 className={styles.aboutHeading}>Links</h4>
                    <div className={styles.aboutLinksContainer}>
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
                    <h4 className={styles.aboutHeading}>Version</h4>
                    <p className={styles.aboutText}>1.0.0</p>
                </div>
                
                <div className={styles.aboutFooter}>
                    <p className={styles.aboutText}>
                        Built with React, TypeScript, Fluent UI, TanStack Query, and Zustand.
                    </p>
                </div>
            </div>
        </Card>
    );
};
