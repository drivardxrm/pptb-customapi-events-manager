import React from 'react';
import {  
    Button,
    Card,
    CardHeader
} from '@fluentui/react-components';
import { useStyles } from '../styles/Styles';
import { RequestParametersList } from './RequestParametersList';
import { AddCircleColor, DismissCircleColor, Edit24Regular, DismissCircleRegular } from '@fluentui/react-icons';
import { useAppStore } from '../store/useAppStore';






export const RequestParametersDetails: React.FC = () => {
    const styles = useStyles();
    const { selectedRequestParameterId } = useAppStore();

    return (
        <Card className={styles.card}>
            <CardHeader 
                header={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                            <h3 style={{ margin: 0 }}>Request Parameters (Input)</h3>
                        </div>
                    </div>
                }
                action={
                    <div className={styles.headerActionGroup}>
                        <Button
                            aria-label='New Request Parameter'
                            appearance='secondary'
                            icon={<AddCircleColor/>}
                        >
                            New
                        </Button>
                        <Button
                            aria-label='Edit Request Parameter'
                            appearance='secondary'
                            icon={<Edit24Regular />}
                            disabled={selectedRequestParameterId === null || selectedRequestParameterId === undefined || selectedRequestParameterId === ''}
                        >
                            Edit
                        </Button>
                        <Button
                            aria-label='Delete Request Parameter'
                            appearance='secondary'
                            icon={selectedRequestParameterId === null || selectedRequestParameterId === undefined || selectedRequestParameterId === '' ? <DismissCircleRegular/> : <DismissCircleColor />}
                            onClick={() => {}} 
                            className={styles.headerActionButton}
                            disabled={selectedRequestParameterId === null || selectedRequestParameterId === undefined || selectedRequestParameterId === ''}
                        >
                            Delete
                        </Button>    
                    </div>
                }

            />
            
            <RequestParametersList/>
        </Card>
    );

};
