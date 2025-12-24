import React, { Activity, useEffect, useState } from 'react';
import {  
    Badge,
    Button,
    Card,
    CardHeader,
    Divider,
    Spinner,
} from '@fluentui/react-components';
import { useStyles } from '../../styles/Styles';

import { 
    AddCircleColor,
    Edit24Regular,
    DismissCircleColor,
    Save24Regular,
    Dismiss24Regular, 
} from '@fluentui/react-icons';
import { useAppStore } from '../../store/useAppStore';
import { RequestParametersList } from './RequestParametersList';
import { CustomApiRequestParameterCreateable, CustomApiRequestParameterUpdateable, getRequestParameterCreateTemplate } from '../../models/CustomApiRequestParameter';
import { useCreateCustomApiRequestParameter, useCustomApiRequestParameters,  useUpdateCustomApiRequestParameter } from '../../hooks/useCustomApiRequestParameters';
import { RequestParameterRead } from './RequestParameterRead';
import { RequestParameterEdit } from './RequestParameterEdit';
import { RequestParameterCreate } from './RequestParameterCreate';






export type RequestParametersMode = 'read' | 'edit' | 'create';


export const RequestParameterDetails: React.FC = () => {
    const styles = useStyles();
    const { selectedCustomApiId , selectedRequestParameterId, setSelectedRequestParameterId } = useAppStore();
    const [mode, setMode] = useState<RequestParametersMode>('read');
    const [editedData, setEditedData] = useState<CustomApiRequestParameterUpdateable | null>(null);
    const [createData, setCreateData] = useState<CustomApiRequestParameterCreateable | null>(null);
    const {requestParameters } = useCustomApiRequestParameters();
    const updateCustomApiRequestParameter = useUpdateCustomApiRequestParameter();
    const createCustomApiRequestParameter = useCreateCustomApiRequestParameter();


    const selectedRequestParameter = requestParameters?.find((param) => param.customapirequestparameterid === selectedRequestParameterId)

    useEffect(() => {
        if (selectedRequestParameter) {
            setEditedData(selectedRequestParameter);
            
        } else {
            setEditedData(null);
        }
    }, [selectedRequestParameter]);



    const handleCreate = () => {
        setSelectedRequestParameterId(null);
        setCreateData(getRequestParameterCreateTemplate(selectedCustomApiId!));
        setMode('create');
    };


    const handleEdit = () => {
        if (!selectedRequestParameter) {
            return;
        }
        setEditedData(selectedRequestParameter);
        setMode('edit');
    };

    const handleCancel = () => {
        if (selectedRequestParameter) {
            setEditedData(selectedRequestParameter);
        }
        setMode('read');
    };

    const handleSave = async () => {
        
        try {

            if(mode === 'create') {
                
                if (selectedRequestParameter || !createData) {
                    return;
                }
                let result = await createCustomApiRequestParameter.mutateAsync({
                    next: createData,
                });

                if(result.created && result.customApiRequestParameterId) {
                    setSelectedRequestParameterId(result.customApiRequestParameterId);
                    setCreateData(getRequestParameterCreateTemplate(selectedCustomApiId!));
                }
                
            }
            else if(mode === 'edit') {
                
                if (!selectedRequestParameter || !editedData) {
                    return;
                }
                await updateCustomApiRequestParameter.mutateAsync({
                    current: selectedRequestParameter,
                    next: editedData,
                });
            }

            setMode('read');
        } catch (error) {
            console.error('Error saving Request Parameter', error);
        }
    };

    const handleCreateDataChange = (updater: (current: CustomApiRequestParameterCreateable) => CustomApiRequestParameterCreateable) => {
        setCreateData((current) => (current ? updater(current) : current));
    };


    const handleEditedDataChange = (updater: (current: CustomApiRequestParameterUpdateable) => CustomApiRequestParameterUpdateable) => {
        setEditedData((current) => (current ? updater(current) : current));
    };

    const content = (() => {
        if (mode === 'create') {
            return <RequestParameterCreate createData={createData!} onChange={handleCreateDataChange} />;
        }

        if (mode === 'edit' && selectedRequestParameter && editedData) {
            return <RequestParameterEdit parameter={selectedRequestParameter} editedData={editedData} onChange={handleEditedDataChange} />;
        }

        if(mode === 'read' && selectedRequestParameter) {
            return <RequestParameterRead parameter={selectedRequestParameter} />;
        }
        return <></>;
    })();

    const headerChip = (() => {
        switch (mode) {
            case 'edit':
                return { label: 'Editing', color: 'warning' as const };
            case 'create':
                return { label: 'Create mode', color: 'success' as const };
            default:
                return { label: 'Read-only', color: 'informative' as const };
        }
    })();

    const headerActions = (() => {
        
       
        return (
            <div className={styles.headerActionGroup}>
                <Activity mode={mode === 'read' ? 'visible' : 'hidden'}>
                    <Button
                        aria-label='New Request Parameter'
                        appearance='secondary'
                        icon={<AddCircleColor/>}
                        onClick={handleCreate}
                        className={styles.headerActionButton}
                    >
                        New Request Parameter
                    </Button>
                </Activity>
                <Activity mode={mode === 'read' && selectedRequestParameter? 'visible' : 'hidden'}>
                     <Button
                        appearance='secondary'
                        icon={<Edit24Regular />}
                        onClick={handleEdit} 
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

                <Activity mode={mode === 'edit' || mode === 'create'? 'visible' : 'hidden'}>
                    <>
                        <Button
                            appearance='primary'
                            icon={createCustomApiRequestParameter.isPending || updateCustomApiRequestParameter.isPending ? <Spinner size='tiny' /> : <Save24Regular />}
                            disabled={createCustomApiRequestParameter.isPending || updateCustomApiRequestParameter.isPending}
                            onClick={handleSave}
                            className={styles.headerActionButton}
                        >
                            { createCustomApiRequestParameter.isPending || updateCustomApiRequestParameter.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                            appearance="secondary"
                            icon={<Dismiss24Regular />}
                            disabled={createCustomApiRequestParameter.isPending || updateCustomApiRequestParameter.isPending}
                            onClick={handleCancel}
                            className={styles.headerActionButton}
                        >
                            Cancel
                        </Button>
                    </>
                </Activity>
                
            </div>
        )
    
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
                            <Badge appearance="tint" color={headerChip.color} shape="rounded">
                                {headerChip.label}
                            </Badge>
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
                <div className={styles.splitContainer} >
                    <div className={styles.splitPaneContent}>
                        <RequestParametersList requestParameters={requestParameters} />
                    </div>
                    <Divider inset vertical/>
                    <div className={styles.splitPaneContent}>
                        {content}
                    </div>                                         
                </div>
             </div>
            
        </Card>
    );

};
