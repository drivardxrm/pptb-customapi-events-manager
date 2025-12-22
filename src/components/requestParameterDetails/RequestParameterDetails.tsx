import React, { Activity, useEffect, useState } from 'react';
import {  
    Button,
    Card,
    CardHeader,
} from '@fluentui/react-components';
import { useStyles } from '../../styles/Styles';

import { 
    AddCircleColor,
    Edit24Regular,
    DismissCircleColor 
} from '@fluentui/react-icons';
import { useAppStore } from '../../store/useAppStore';
import { RequestParametersList } from './RequestParametersList';
import { CustomApiRequestParameterUpdateable } from '../../models/CustomApiRequestParameter';
import { useCustomApiRequestParameters } from '../../hooks/useCustomApiRequestParameters';
import { RequestParameterDetailsRead } from './RequestParameterRead';
import { Allotment } from 'allotment';
import "allotment/dist/style.css";




export type RequestParametersMode = 'read' | 'edit' | 'create';


export const RequestParameterDetails: React.FC = () => {
    const styles = useStyles();
    const { selectedRequestParameterId } = useAppStore();
    const [mode, setMode] = useState<RequestParametersMode>('read');
    const [editedData, setEditedData] = useState<CustomApiRequestParameterUpdateable | null>(null);
    const {requestParameters} = useCustomApiRequestParameters();


    const selectedRequestParameter = requestParameters?.find((param) => param.customapirequestparameterid === selectedRequestParameterId)

    useEffect(() => {
        if (selectedRequestParameter) {
            setEditedData(selectedRequestParameter);
            
        } else {
            setEditedData(null);
        }
        setMode('read');
    }, [selectedRequestParameter]);

    // const handleResize = (size: number) => {
    //     setLeftPaneSize(size);
    // };

    // const handleEdit = () => {
    //     if (!selectedRequestParameter) {
    //         return;
    //     }
    //     setEditedData(selectedRequestParameter);
    //     setMode('edit');
    // };

    // const handleCancel = () => {
    //     if (selectedRequestParameter) {
    //         setEditedData(selectedRequestParameter);
    //     }
    //     setMode('read');
    // };

    // const handleSave = async () => {
    //     if (!selectedRequestParameter || !editedData) {
    //         return;
    //     }

    //     try {
    //         await updateCustomApiRequestParameter.mutateAsync({
    //             current: selectedRequestParameter,
    //             next: editedData,
    //         });

    //         setMode('read');
    //     } catch (error) {
    //         console.error('Error saving Custom API', error);
    //     }
    // };

    const content = (() => {
        if (mode === 'create') {
            return <>TODO</>
        }

        if (mode === 'edit' && selectedRequestParameter && editedData) {
            return <>TODO</>;
        }

        if(mode === 'read' && selectedRequestParameter) {
            return <RequestParameterDetailsRead parameter={selectedRequestParameter} />;
        }
        return <></>;
    })();

    const headerActions = (() => {
        
       
        return (
            <div className={styles.headerActionGroup}>
                <Activity mode={mode === 'read' ? 'visible' : 'hidden'}>
                    <Button
                        aria-label='New Request Parameter'
                        appearance='secondary'
                        icon={<AddCircleColor/>}
                        onClick={() => {}}
                        className={styles.headerActionButton}
                    >
                        New Request Parameter
                    </Button>
                </Activity>
                <Activity mode={mode === 'read' && selectedRequestParameter? 'visible' : 'hidden'}>
                     <Button
                        appearance='secondary'
                        icon={<Edit24Regular />}
                        onClick={() => {}} 
                        className={styles.headerActionButton}
                    >
                        Edit
                    </Button>
                </Activity>
                <Activity mode={mode === 'read' && selectedRequestParameter? 'visible' : 'hidden'}>
                    <Button
                        appearance='secondary'
                        icon={<DismissCircleColor />}
                        onClick={() => {}} 
                        className={styles.headerActionButton}
                    >
                        Delete
                    </Button>
                </Activity>
                
            </div>
        )
        
        
        
        
        if (mode === 'create') {
            return <>TODO</>
        }

        if (mode === 'edit') {
            return <>TODO</>;
        }

        
        return <></>;
    })();




    // function handleEdit(_event:any): void {
    //     throw new Error('Function not implemented.');
    // }

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
                    <>
                        {headerActions}
                    </>     
                }

            />
            
          


            <div className={styles.cardBody}>
            
                <Allotment className={styles.splitContainer} >
                    <Allotment.Pane minSize={200}>
                        <div className={styles.splitPaneContent}>
                            <RequestParametersList requestParameters={requestParameters} />
                        </div>
                    </Allotment.Pane>
                    <Allotment.Pane snap>
                        <div className={styles.splitPaneContent}>
                            {content}
                        </div>
                    </Allotment.Pane>
                    
                </Allotment>                
            </div>
            
            
        </Card>
    );

};
