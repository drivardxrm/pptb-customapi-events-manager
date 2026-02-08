import React, { Activity, useCallback, useEffect, useState } from 'react';
import { 
    Image, 
    Button,
    Card,
    CardHeader,
    Divider,
    Spinner,
    mergeClasses,
} from '@fluentui/react-components';
import { useStyles } from '../../styles/Styles';
import outputImage from '../../assets/output.png';
import { 
    AddCircleColor,
    Edit24Regular,
    DismissCircleColor,
    Save24Regular,
    Dismiss24Regular, 
} from '@fluentui/react-icons';
import { useAppStore } from '../../store/useAppStore';
import { CustomApiResponsePropertyCreateable, CustomApiResponsePropertyUpdateable, getResponsePropertyCreateTemplate } from '../../models/CustomApiResponseProperty';
import { useCreateCustomApiResponseProperty, useCustomApiResponseProperties, useDeleteCustomApiResponseProperty, useUpdateCustomApiResponseProperty } from '../../hooks/useCustomApiResponseProperties';
import { ResponsePropertyList } from './ResponsePropertyList';
import { ResponsePropertyCreate } from './ResponsePropertyCreate';
import { ResponsePropertyEdit } from './ResponsePropertyEdit';
import { ResponsePropertyRead } from './ResponsePropertyRead';
import { ResponsePropertyCreateDialog } from './ResponsePropertyCreateDialog';
import { ResponsePropertyDeleteDialog } from './ResponsePropertyDeleteDialog';
import { ValidationStatus } from '../../utils/validation';
import { ModeBadge } from '../generic/ModeBadge';
import { ComponentStateBadge } from '../generic/ComponentStateBadge';
import { useCustomApis } from '../../hooks/useCustomApis';







export type ResponsePropertiesMode = 'read' | 'edit' | 'create';


export const ResponsePropertyDetails: React.FC = () => {
    const styles = useStyles();
    const { selectedCustomApiId , selectedResponsePropertyId, setSelectedResponsePropertyId, setGlobalMessage, clearGlobalMessage, editingComponent, setEditingComponent } = useAppStore();
    const isLocked = editingComponent !== 'none' && editingComponent !== 'responseproperty';
    const [mode, setMode] = useState<ResponsePropertiesMode>('read');
    const [editedData, setEditedData] = useState<CustomApiResponsePropertyUpdateable | null>(null);
    const [createData, setCreateData] = useState<CustomApiResponsePropertyCreateable | null>(null);
    const { customapis } = useCustomApis();
    const {responseProperties } = useCustomApiResponseProperties();
    const updateCustomApiResponseProperty = useUpdateCustomApiResponseProperty();
    const createCustomApiResponseProperty = useCreateCustomApiResponseProperty();
    const deleteCustomApiResponseProperty = useDeleteCustomApiResponseProperty();

    const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [createValidation, setCreateValidation] = useState<ValidationStatus>({ isValid: true });


    const selectedCustomApi = customapis.find((api) => api.customapiid === selectedCustomApiId)

    // Sync validation state with global messages
    useEffect(() => {
        if (mode === 'create' && !createValidation.isValid && createValidation.message) {
            setGlobalMessage('response-property-create-validation', {
                intent: 'warning',
                title: createValidation.message,
                dismissable: false,
            });
        } else {
            clearGlobalMessage('response-property-create-validation');
        }
    }, [mode, createValidation, setGlobalMessage, clearGlobalMessage]);

    // Clear validation message when component unmounts or leaving create mode
    useEffect(() => {
        return () => {
            clearGlobalMessage('response-property-create-validation');
        };
    }, [clearGlobalMessage]);

    const selectedResponseProperty = responseProperties?.find((prop) => prop.customapiresponsepropertyid === selectedResponsePropertyId)

    useEffect(() => {
        if (selectedResponseProperty) {
            setEditedData(selectedResponseProperty);
            
        } else {
            setEditedData(null);
        }
    }, [selectedResponseProperty]);



    const handleCreate = () => {
        setSelectedResponsePropertyId(null);
        setCreateData(getResponsePropertyCreateTemplate(selectedCustomApiId!));
        setMode('create');
        setEditingComponent('responseproperty');
    };


    const handleEdit = () => {
        if (!selectedResponseProperty) {
            return;
        }
        setEditedData(selectedResponseProperty);
        setMode('edit');
        setEditingComponent('responseproperty');
    };

    const handleCancel = () => {
        if (selectedResponseProperty) {
            setEditedData(selectedResponseProperty);
        }
        setMode('read');
        setEditingComponent('none');
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
                // Creating new Response Property
                if (selectedResponseProperty || !createData) {
                    return;
                }
                let result = await createCustomApiResponseProperty.mutateAsync({
                    next: createData,
                    solutionUniqueName: solutionUniqueName ?? undefined,
                });

                if(result.created && result.id) {
                    setSelectedResponsePropertyId(result.id);
                    setCreateData(getResponsePropertyCreateTemplate(selectedCustomApiId!));
                }
                
            }
            else if(mode === 'edit') {
                
                if (!selectedResponseProperty || !editedData) {
                    return;
                }
                await updateCustomApiResponseProperty.mutateAsync({
                    current: selectedResponseProperty,
                    next: editedData,
                });
            }

            setMode('read');
            setEditingComponent('none');
        } catch (error) {
            console.error('Error saving Response Property', error);
        }
    };

    const handleDelete = () => {
        if (!selectedResponseProperty || selectedResponseProperty.ismanaged) {
            return;
        }
        setShowDeleteConfirmation(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedResponseProperty) {
            return;
        }
        try {
            await deleteCustomApiResponseProperty.mutateAsync({ responseProperty: selectedResponseProperty });
            setSelectedResponsePropertyId(null);
            setShowDeleteConfirmation(false);
        } catch (error) {
            console.error('Error deleting Response Property', error);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirmation(false);
    };

    const handleCreateDataChange = (updater: (current: CustomApiResponsePropertyCreateable) => CustomApiResponsePropertyCreateable) => {
        setCreateData((current) => (current ? updater(current) : current));
    };

    const handleValidationChange = useCallback((validationStatus: ValidationStatus) => {
        setCreateValidation(validationStatus);
    }, []);


    const handleEditedDataChange = (updater: (current: CustomApiResponsePropertyUpdateable) => CustomApiResponsePropertyUpdateable) => {
        setEditedData((current) => (current ? updater(current) : current));
    };

    const content = (() => {
        if (mode === 'create') {
            return <ResponsePropertyCreate createData={createData!} onChange={handleCreateDataChange} onValidationChange={handleValidationChange} />;
        }

        if (mode === 'edit' && selectedResponseProperty && editedData) {
            return <ResponsePropertyEdit property={selectedResponseProperty} editedData={editedData} onChange={handleEditedDataChange} />;
        }

        if(mode === 'read' && selectedResponseProperty) {
            return <ResponsePropertyRead property={selectedResponseProperty} />;
        }
        return <></>;
    })();

    const headerActions = (() => {
        
       
        return (
            <div className={styles.headerActionGroup}>
                <Activity mode={mode === 'read' && selectedCustomApi && !selectedCustomApi.ismanaged ? 'visible' : 'hidden'}>
                    <Button
                        aria-label='New Response Property'
                        appearance='secondary'
                        icon={<AddCircleColor/>}
                        onClick={handleCreate}
                        className={styles.headerActionButton}
                    >
                        New Response Property
                    </Button>
                </Activity>
                <Activity mode={mode === 'read' && selectedResponseProperty && !selectedResponseProperty.ismanaged ? 'visible' : 'hidden'}>
                     <Button
                        appearance='secondary'
                        icon={<Edit24Regular />}
                        onClick={handleEdit} 
                        className={styles.headerActionButton}
                    >
                        Edit
                    </Button>
                </Activity>
                <Activity mode={mode === 'read' && selectedResponseProperty && !selectedResponseProperty.ismanaged ? 'visible' : 'hidden'}>
                    <Button
                        appearance='secondary'
                        icon={<DismissCircleColor />}
                        onClick={handleDelete} 
                        className={styles.headerActionButton}
                    >
                        Delete
                    </Button>
                </Activity>

                <Activity mode={mode === 'edit' || mode === 'create'? 'visible' : 'hidden'}>
                    <>
                        <Button
                            appearance='primary'
                            icon={createCustomApiResponseProperty.isPending || updateCustomApiResponseProperty.isPending ? <Spinner size='tiny' /> : <Save24Regular />}
                            disabled={createCustomApiResponseProperty.isPending || updateCustomApiResponseProperty.isPending || (mode === 'create' && !createValidation.isValid)}
                            onClick={handleSave}
                            className={styles.headerActionButton}
                        >
                            { createCustomApiResponseProperty.isPending || updateCustomApiResponseProperty.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                            appearance="secondary"
                            icon={<Dismiss24Regular />}
                            disabled={createCustomApiResponseProperty.isPending || updateCustomApiResponseProperty.isPending}
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
        <>
            <Card className={mergeClasses(styles.card, isLocked && styles.lockedSection)}>
                <CardHeader 
                    header={
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                                <Image alt="Response Properties" src={outputImage} height={40} width={40} />
                                <h3 style={{ margin: 0 }}>Response Properties (Output)</h3>
                                <ModeBadge mode={mode} />
                                {selectedResponseProperty && (
                                    <ComponentStateBadge isManaged={selectedResponseProperty.ismanaged} />
                                )}
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
                            <ResponsePropertyList responseProperties={responseProperties} />
                        </div>
                        <Divider inset vertical/>
                        <div className={styles.splitPaneContent}>
                            {content}
                        </div>                                         
                    </div>
                 </div>
                
            </Card>
            {/* Create Confirmation Dialog */}
            {createData && (
                <ResponsePropertyCreateDialog
                    open={showCreateConfirmation}
                    createData={createData}
                    isSaving={createCustomApiResponseProperty.isPending}
                    onConfirm={handleCreateConfirm}
                    onCancel={handleCreateCancel}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ResponsePropertyDeleteDialog
                open={showDeleteConfirmation}
                responseProperty={selectedResponseProperty ?? null}
                isDeleting={deleteCustomApiResponseProperty.isPending}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </>
    );

};
