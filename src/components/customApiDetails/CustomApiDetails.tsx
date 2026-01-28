import React, { useState, useEffect, Activity } from 'react';
import { Badge, Button, Card, CardHeader, Divider, Spinner } from '@fluentui/react-components';
import { Edit24Regular, Save24Regular, Dismiss24Regular, LockClosed16Regular, AddCircleColor, DismissCircleColor } from '@fluentui/react-icons';
import { useAppStore } from '../../store/useAppStore';
import { useCustomApis, useUpdateCustomApi, useCreateCustomApi, useDeleteCustomApi } from '../../hooks/useCustomApis';
import { useStyles } from '../../styles/Styles';
import { CustomApi, CustomApiCreateable, CustomApiUpdateable, DEFAULT_CREATE_TEMPLATE } from '../../models/CustomApi';
import { CustomApiDetailsRead } from './CustomApiDetailsRead';
import { CustomApiDetailsEdit } from './CustomApiDetailsEdit';
import { CustomApiDetailsCreate } from './CustomApiDetailsCreate';
import { CustomApiCreateDialog } from './CustomApiCreateDialog';

import { RequestParameterDetails } from './../requestParameterDetails/RequestParameterDetails';
import { CustomApiSelector } from '../CustomApiSelector';
import { ResponsePropertyDetails } from '../responsePropertyDetails/ResponsePropertyDetails';
import { ValidationStatus } from '../../utils/validation';
import { CustomApiDeleteDialog } from './CustomApiDeleteDialog';



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
    const {selectedCustomApiId, setSelectedCustomApiId, setGlobalMessage, clearGlobalMessage, selectedNavItem } = useAppStore();
    const { customapis } = useCustomApis();
    const updateCustomApi = useUpdateCustomApi();
    const createCustomApi = useCreateCustomApi();
    const deleteCustomApi = useDeleteCustomApi();


    const selectedCustomApi = customapis.find((api) => api.customapiid === selectedCustomApiId)


    const [mode, setMode] = useState<CustomApiDetailsMode>('read');
    const [editedData, setEditedData] = useState<CustomApiUpdateable | null>(null);
    const [createData, setCreateData] = useState<CustomApiCreateable>(DEFAULT_CREATE_TEMPLATE);
    const [createValidation, setCreateValidation] = useState<ValidationStatus>({
        isValid: true,
    });
    const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    // Sync validation state with global messages
    useEffect(() => {
        if (mode === 'create' && !createValidation.isValid && createValidation.message) {
            setGlobalMessage('create-validation', {
                intent: 'warning',
                title: createValidation.message,
                dismissable: false,
            });
        } else {
            clearGlobalMessage('create-validation');
        }
    }, [mode, createValidation, setGlobalMessage, clearGlobalMessage]);

    // Clear validation message when component unmounts or leaving create mode
    useEffect(() => {
        return () => {
            clearGlobalMessage('create-validation');
        };
    }, [clearGlobalMessage]);

    // Show info message when no Custom API is selected
    useEffect(() => {
        if (selectedNavItem === 'customapi' && mode === 'read' && !selectedCustomApi) {
            setGlobalMessage('no-customapi-selected', {
                intent: 'info',
                title: 'No Custom API selected. Please select a Custom API above or create a new one.',
                dismissable: false,
                action: {
                    label: 'New Custom API',
                    icon: <AddCircleColor />,
                    onClick: () => {
                        setSelectedCustomApiId(null);
                        setCreateData(DEFAULT_CREATE_TEMPLATE);
                        setMode('create');
                    },
                },
            });
        } else {
            clearGlobalMessage('no-customapi-selected');
        }
    }, [selectedNavItem, mode, selectedCustomApi, setGlobalMessage, clearGlobalMessage, setSelectedCustomApiId]);

// Clear message when component unmounts
useEffect(() => {
    return () => {
        clearGlobalMessage('no-customapi-selected');
    };
}, [clearGlobalMessage]);

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
        // For create mode, show confirmation dialog first
        if (mode === 'create') {
            setShowCreateConfirmation(true);
            return;
        }

        // For edit mode, save directly
        await performSave(null);
    };

    const handleCreateConfirm = async (solutionUniqueName: string | null) => {
        await performSave(solutionUniqueName);
        setShowCreateConfirmation(false);
    };
    const handleCreateCancel = () => {
        setShowCreateConfirmation(false);
    };

    const performSave = async (solutionUniqueName: string | null) => {
        try {
            if (mode === 'create') {
                // Creating new Custom API
                if (selectedCustomApi || !createData) {
                    return;
                }
                let result = await createCustomApi.mutateAsync({
                    next: createData,
                    solutionUniqueName: solutionUniqueName ?? undefined,
                });

                if (result.created && result.id) {
                    setSelectedCustomApiId(result.id);
                    setCreateData(DEFAULT_CREATE_TEMPLATE);
                }
            } else if (mode === 'edit') {
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

    

    const handleDelete = () => {
        if (!selectedCustomApi || selectedCustomApi.ismanaged) {
            return;
        }
        setShowDeleteConfirmation(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCustomApi) {
            return;
        }
        try {
            await deleteCustomApi.mutateAsync({ customApi: selectedCustomApi });
            setSelectedCustomApiId(null);
            setShowDeleteConfirmation(false);
        } catch (error) {
            console.error('Error deleting Custom API', error);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirmation(false);
    };

    



    const handleEditedDataChange = (updater: (current: CustomApiUpdateable) => CustomApiUpdateable) => {
        setEditedData((current) => (current ? updater(current) : current));
    };

    const handleCreateDataChange = (updater: (current: CustomApiCreateable) => CustomApiCreateable) => {
        setCreateData((current) => updater(current));
    };



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
            {/* <h2 style={{ margin: 0 }}>Create a new Custom API</h2> */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
                <LockClosed16Regular />
                <span>Some fields remain immutable after creation.</span>
            </div>
        </div>
    ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h2 style={{ margin: 0 }}>{selectedCustomApi?.displayname || selectedCustomApi?.uniquename}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
                <LockClosed16Regular />
                <span>Fields that cannot be modified after creation</span>
            </div>
        </div>
    );

     const headerAction = (
        <div className={styles.headerActionGroup}>
            {/* NEW */}
            <Activity mode={mode === 'read' ? 'visible' : 'hidden'}>
                <Button
                    appearance='secondary'
                    icon={<AddCircleColor/>}
                    onClick={handleCreate}
                    className={styles.headerActionButton}
                >
                    New Custom API
                </Button>
            </Activity>

            {/* EDIT */}
            <Activity mode={mode === 'read' && selectedCustomApi  ? 'visible' : 'hidden'}>
                <Button
                    appearance='secondary'
                    icon={<Edit24Regular />}
                    onClick={handleEdit}
                    className={styles.headerActionButton}
                >
                    Edit
                </Button>
            </Activity>

            {/* DELETE */}
            <Activity mode={mode  === 'read' && selectedCustomApi && !selectedCustomApi.ismanaged  ? 'visible' : 'hidden'}>
                <Button
                    appearance='secondary'
                    icon={<DismissCircleColor />}
                    onClick={handleDelete} 
                    className={styles.headerActionButton}
                >
                    Delete
                </Button>
            </Activity>
            
            {/* SAVE + CANCEL */}
            <Activity mode={mode === 'edit' || mode === 'create'? 'visible' : 'hidden'}>
                <>
                    <Button
                        appearance='primary'
                        icon={createCustomApi.isPending || updateCustomApi.isPending ? <Spinner size='tiny' /> : <Save24Regular />}
                        disabled={createCustomApi.isPending || updateCustomApi.isPending || (mode === 'create' && !createValidation.isValid)}
                        onClick={handleSave}
                        className={styles.headerActionButton}
                    >
                        { createCustomApi.isPending || updateCustomApi.isPending ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                        appearance="secondary"
                        icon={<Dismiss24Regular />}
                        disabled={createCustomApi.isPending || updateCustomApi.isPending}
                        onClick={handleCancel}
                        className={styles.headerActionButton}
                    >
                        Cancel
                    </Button>
                </>
            </Activity>

        </div>)

    const content = (() => {
        if (mode === 'create') {
            return <CustomApiDetailsCreate 
                    createData={createData} 
                    onChange={handleCreateDataChange} 
                    onValidationChange={setCreateValidation}
                />;
        }

        if (mode === 'edit' && selectedCustomApi && editedData) {
            return <CustomApiDetailsEdit api={selectedCustomApi} editedData={editedData} onChange={handleEditedDataChange} />;
        }

        if (mode === 'read' && !selectedCustomApi)  {
            return <div className={styles.infoBox}>
                    <p>No Custom API selected</p>
                    <p>Please select a Custom API above or create new one</p>
                </div>;
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
                                <h3>{headerTitle}</h3>
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
            
                        <ResponsePropertyDetails/>
                    </>
                }
                
            </Card>

            {/* Create Confirmation Dialog */}
            <CustomApiCreateDialog
                open={showCreateConfirmation}
                createData={createData}
                isSaving={createCustomApi.isPending}
                onConfirm={handleCreateConfirm}
                onCancel={handleCreateCancel}
            />

            {/* Delete Confirmation Dialog */}
            <CustomApiDeleteDialog
                open={showDeleteConfirmation}
                customApi={selectedCustomApi ?? null}
                isDeleting={deleteCustomApi.isPending}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </>
        
    );
};
