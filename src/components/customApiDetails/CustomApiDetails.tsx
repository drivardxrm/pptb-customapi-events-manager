import React, { useState, useEffect } from 'react';
import { Badge, Button, Card, CardHeader, Divider, Spinner } from '@fluentui/react-components';
import { Edit24Regular, Save24Regular, Dismiss24Regular, LockClosed16Regular, AddCircleColor, DismissCircleColor } from '@fluentui/react-icons';
import { useAppStore } from '../../store/useAppStore';
import { useCustomApis, useUpdateCustomApi, useCreateCustomApi } from '../../hooks/useCustomApis';
import { useStyles } from '../../styles/Styles';
import { CustomApi, CustomApiCreateable, CustomApiUpdateable, DEFAULT_CREATE_TEMPLATE } from '../../models/CustomApi';
import { CustomApiDetailsRead } from './CustomApiDetailsRead';
import { CustomApiDetailsEdit } from './CustomApiDetailsEdit';
import { CustomApiDetailsCreate } from './CustomApiDetailsCreate';
import { ResponsePropertyList } from './../ResponsePropertyList';
import { RequestParameterDetails } from './../requestParameterDetails/RequestParameterDetails';
import { CustomApiSelector } from '../CustomApiSelector';



type CustomApiDetailsMode = 'read' | 'edit' | 'create';



const toEditable = (api: CustomApi): CustomApiUpdateable => ({
    name: api.name || '',
    displayname: api.displayname || '',
    description: api.description || '',
    executeprivilegename: api.executeprivilegename || '',
    _plugintypeid_value: api._plugintypeid_value || '',
    isprivate: api.isprivate,
});

export const CustomApiDetails: React.FC = () => {
    const styles = useStyles();
    const {selectedCustomApiId, setSelectedCustomApiId} = useAppStore();
    const { customapis } = useCustomApis();
    const updateCustomApi = useUpdateCustomApi();
    const createCustomApi = useCreateCustomApi();


    const selectedCustomApi = customapis.find((api) => api.customapiid === selectedCustomApiId)


    const [mode, setMode] = useState<CustomApiDetailsMode>('read');
    const [editedData, setEditedData] = useState<CustomApiUpdateable | null>(null);
    const [createData, setCreateData] = useState<CustomApiCreateable>(DEFAULT_CREATE_TEMPLATE);

    useEffect(() => {
        if (selectedCustomApi) {
            setEditedData(toEditable(selectedCustomApi));
            setMode('read');
        } else {
            setEditedData(null);
        }
    }, [selectedCustomApi]);

    const handleEdit = () => {
        if (!selectedCustomApi) {
            return;
        }
        setEditedData(toEditable(selectedCustomApi));
        setMode('edit');
    };

    const handleCreate = () => {
        setSelectedCustomApiId(null);
        setCreateData(DEFAULT_CREATE_TEMPLATE);
        setMode('create');
    };

    const handleCancel = () => {
        if (mode === "edit" && selectedCustomApi) {
            setEditedData(toEditable(selectedCustomApi));
        }else if (mode === "create") {
            setCreateData(DEFAULT_CREATE_TEMPLATE);
        }
        setMode('read');
    };

    const handleSave = async () => {
        

        try {
        
            if(mode === 'create') {
                // Creating new Custom API
                if (selectedCustomApi || !createData) {
                    return;
                }
                let result = await createCustomApi.mutateAsync({
                    next: createData,
                });

                if(result.created && result.customApiId) {
                    setSelectedCustomApiId(result.customApiId);
                    setCreateData(DEFAULT_CREATE_TEMPLATE);
                }
                
            }
            else if(mode === 'edit') {
                
                if (!selectedCustomApi || !editedData) {
                    return;
                }
                await updateCustomApi.mutateAsync({
                    current: selectedCustomApi,
                    next: editedData,
                });
                

            }
            
            setMode('read');
        } catch (error) {
            console.error('Error saving Custom API', error);
        }
    };



    const handleEditedDataChange = (updater: (current: CustomApiUpdateable) => CustomApiUpdateable) => {
        setEditedData((current) => (current ? updater(current) : current));
    };

    const handleCreateDataChange = (updater: (current: CustomApiCreateable) => CustomApiCreateable) => {
        setCreateData((current) => updater(current));
    };

    if (mode !== 'create' && (!selectedCustomApi)) {
        return (
            <>
                <CustomApiSelector/>
                
                <Card className={styles.card}>
                <CardHeader
                    header={<h3>Custom API Details</h3>}
                    action={
                        <div className={styles.headerActionGroup}>
                            <Button
                                appearance='secondary'
                                icon={<AddCircleColor/>}
                                onClick={handleCreate}
                                className={styles.headerActionButton}
                            >
                                New Custom API
                            </Button>
                        </div>
                    }
                />
                <div className={styles.infoBox}>
                    <p>No Custom API selected</p>
                    <p>Please select a Custom API from the list above</p>
                </div>
            </Card>
            </>
            
        );
    }

    

    const headerTitle = mode === 'create' ? 'Create Custom API' : 'Custom API Details';
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

    const headerDescription = mode === 'create' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 style={{ margin: 0 }}>Create a new Custom API</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
                <LockClosed16Regular />
                <span>Some fields remain immutable after creation.</span>
            </div>
        </div>
    ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 style={{ margin: 0 }}>{selectedCustomApi!.displayname || selectedCustomApi!.uniquename}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
                <LockClosed16Regular />
                <span>Fields that cannot be modified after creation</span>
            </div>
        </div>
    );

    const headerAction = (() => {
        switch (mode) {
            case 'read':
                return (
                    <div className={styles.headerActionGroup}>
                        <Button
                            appearance='secondary'
                            icon={<AddCircleColor/>}
                            onClick={handleCreate}
                            className={styles.headerActionButton}
                        >
                            New Custom API
                        </Button>
                        <Button
                            appearance='secondary'
                            icon={<Edit24Regular />}
                            onClick={handleEdit}
                            className={styles.headerActionButton}
                        >
                            Edit
                        </Button>
                        <Button
                            appearance='secondary'
                            icon={<DismissCircleColor />}
                            onClick={() => {}} 
                            className={styles.headerActionButton}
                        >
                            Delete
                        </Button>
                    </div>
                );
            case 'edit':
            
                return (
                    <div className={styles.headerActionGroup}>
                        <Button
                            appearance='primary'
                            icon={updateCustomApi.isPending ? <Spinner size='tiny' /> : <Save24Regular />}
                            disabled={updateCustomApi.isPending}
                            onClick={handleSave}
                            className={styles.headerActionButton}
                        >
                            {updateCustomApi.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                            appearance="secondary"
                            icon={<Dismiss24Regular />}
                            disabled={updateCustomApi.isPending}
                            onClick={handleCancel}
                            className={styles.headerActionButton}
                        >
                            Cancel
                        </Button>
                    </div>
                );
            case 'create':
                return (
                    <div className={styles.headerActionGroup}>
                        <Button
                            appearance='primary'
                            icon={createCustomApi.isPending ? <Spinner size='tiny' /> : <Save24Regular />}
                            disabled={createCustomApi.isPending}
                            onClick={handleSave}
                            className={styles.headerActionButton}
                        >
                            {createCustomApi.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                            appearance="secondary"
                            icon={<Dismiss24Regular />}
                            disabled={createCustomApi.isPending}
                            onClick={handleCancel}
                            className={styles.headerActionButton}
                        >
                            Cancel
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    })();

    const content = (() => {
        if (mode === 'create') {
            return <CustomApiDetailsCreate createData={createData} onChange={handleCreateDataChange} />;
        }

        if (mode === 'edit' && selectedCustomApi && editedData) {
            return <CustomApiDetailsEdit api={selectedCustomApi} editedData={editedData} onChange={handleEditedDataChange} />;
        }

        return <CustomApiDetailsRead api={selectedCustomApi!} />;
    })();

    return (
        <>
            <CustomApiSelector/>
            
            <Card className={styles.card}>
                <CardHeader 
                    header={
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                                <h3 style={{ margin: 0 }}>{headerTitle}</h3>
                                <Badge appearance="tint" color={headerChip.color} shape="rounded">
                                    {headerChip.label}
                                </Badge>
                            </div>
                        </div>
                    }
                    description={headerDescription}
                    action={headerAction}
                />
                <Divider />
                {content}
                {
                    selectedCustomApi &&
                    <>
                        <RequestParameterDetails/>
                        <Divider/>
                        <ResponsePropertyList/>
                    </>
                }
                
            </Card>
        </>
        
    );
};
