import React, { Activity, useCallback, useEffect, useState } from 'react';
import {  
    Button,
    Card,
    CardHeader,
    Divider,
    Spinner,
    Image,
    mergeClasses,
} from '@fluentui/react-components';
import { useStyles } from '../../styles/Styles';
import inputImage from '../../assets/input.png';

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
import { useCreateCustomApiRequestParameter, useCustomApiRequestParameters,  useDeleteCustomApiRequestParameter,  useUpdateCustomApiRequestParameter } from '../../hooks/useCustomApiRequestParameters';
import { RequestParameterRead } from './RequestParameterRead';
import { RequestParameterEdit } from './RequestParameterEdit';
import { RequestParameterCreate } from './RequestParameterCreate';
import { RequestParameterCreateDialog } from './RequestParameterCreateDialog';
import { RequestParameterDeleteDialog } from './RequestParameterDeleteDialog';
import { ValidationStatus } from '../../utils/validation';
import { ComponentStateBadge } from '../generic/ComponentStateBadge';
import { useCustomApis } from '../../hooks/useCustomApis';
import { ModeBadge } from '../generic/ModeBadge';






export type RequestParametersMode = 'read' | 'edit' | 'create';


export const RequestParameterDetails: React.FC = () => {
    const styles = useStyles();
    const { selectedCustomApiId , selectedRequestParameterId, setSelectedRequestParameterId, setGlobalMessage, clearGlobalMessage, setEditingComponent, editingComponent } = useAppStore();
    const isLocked = editingComponent !== 'none' && editingComponent !== 'requestparameter';
    const [mode, setMode] = useState<RequestParametersMode>('read');
    const [editedData, setEditedData] = useState<CustomApiRequestParameterUpdateable | null>(null);
    const [createData, setCreateData] = useState<CustomApiRequestParameterCreateable | null>(null);
    const { customapis } = useCustomApis();
    const {requestParameters } = useCustomApiRequestParameters();
    const updateCustomApiRequestParameter = useUpdateCustomApiRequestParameter();
    const createCustomApiRequestParameter = useCreateCustomApiRequestParameter();
    const deleteCustomApiRequestParameter = useDeleteCustomApiRequestParameter();

    const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [createValidation, setCreateValidation] = useState<ValidationStatus>({ isValid: true });


    const selectedCustomApi = customapis.find((api) => api.customapiid === selectedCustomApiId)

    // Sync validation state with global messages
    useEffect(() => {
        if (mode === 'create' && !createValidation.isValid && createValidation.message) {
            setGlobalMessage('request-parameter-create-validation', {
                intent: 'warning',
                title: createValidation.message,
                dismissable: false,
            });
        } else {
            clearGlobalMessage('request-parameter-create-validation');
        }
    }, [mode, createValidation, setGlobalMessage, clearGlobalMessage]);

    // Clear validation message when component unmounts or leaving create mode
    useEffect(() => {
        return () => {
            clearGlobalMessage('request-parameter-create-validation');
        };
    }, [clearGlobalMessage]);

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
        setEditingComponent('requestparameter');
    };


    const handleEdit = () => {
        if (!selectedRequestParameter) {
            return;
        }
        setEditedData(selectedRequestParameter);
        setMode('edit');
        setEditingComponent('requestparameter');
    };

    const handleCreateDataChange = (updater: (current: CustomApiRequestParameterCreateable) => CustomApiRequestParameterCreateable) => {
        setCreateData((current) => (current ? updater(current) : current));
    };

    const handleValidationChange = useCallback((validationStatus: ValidationStatus) => {
        setCreateValidation(validationStatus);
    }, []);


    const handleEditedDataChange = (updater: (current: CustomApiRequestParameterUpdateable) => CustomApiRequestParameterUpdateable) => {
        setEditedData((current) => (current ? updater(current) : current));
    };

    const handleCancel = () => {
        if (selectedRequestParameter) {
            setEditedData(selectedRequestParameter);
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
                // Creating new Request Param
                if (selectedRequestParameter || !createData) {
                    return;
                }
                let result = await createCustomApiRequestParameter.mutateAsync({
                    next: createData,
                    solutionUniqueName: solutionUniqueName ?? undefined,
                });

                if(result.created && result.id) {
                    setSelectedRequestParameterId(result.id);
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
            setEditingComponent('none');
        } catch (error) {
            console.error('Error saving Request Parameter', error);
        }
    };

    const handleDelete = () => {
        if (!selectedRequestParameter || selectedRequestParameter.ismanaged) {
            return;
        }
        setShowDeleteConfirmation(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedRequestParameter) {
            return;
        }
        try {
            await deleteCustomApiRequestParameter.mutateAsync({ requestParameter: selectedRequestParameter });
            setSelectedRequestParameterId(null);
            setShowDeleteConfirmation(false);
        } catch (error) {
            console.error('Error deleting Request Parameter', error);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirmation(false);
    };

    

    const content = (() => {
        if (mode === 'create') {
            return <RequestParameterCreate createData={createData!} onChange={handleCreateDataChange} onValidationChange={handleValidationChange} />;
        }

        if (mode === 'edit' && selectedRequestParameter && editedData) {
            return <RequestParameterEdit parameter={selectedRequestParameter} editedData={editedData} onChange={handleEditedDataChange} />;
        }

        if(mode === 'read' && selectedRequestParameter) {
            return <RequestParameterRead parameter={selectedRequestParameter} />;
        }
        return <></>;
    })();

    const headerActions = (() => {
        
       
        return (
            <div className={styles.headerActionGroup}>
                <Activity mode={mode === 'read' && selectedCustomApi && !selectedCustomApi.ismanaged ? 'visible' : 'hidden'}>
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
                <Activity mode={mode === 'read' && selectedRequestParameter && !selectedRequestParameter.ismanaged ? 'visible' : 'hidden'}>
                     <Button
                        appearance='secondary'
                        icon={<Edit24Regular />}
                        onClick={handleEdit} 
                        className={styles.headerActionButton}
                    >
                        Edit
                    </Button>
                </Activity>
                <Activity mode={mode === 'read' && selectedRequestParameter && !selectedRequestParameter.ismanaged ? 'visible' : 'hidden'}>
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
                            icon={createCustomApiRequestParameter.isPending || updateCustomApiRequestParameter.isPending ? <Spinner size='tiny' /> : <Save24Regular />}
                            disabled={createCustomApiRequestParameter.isPending || updateCustomApiRequestParameter.isPending || (mode === 'create' && !createValidation.isValid)}
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
        <>
            <Card className={mergeClasses(styles.card, isLocked && styles.lockedSection)}>
                <CardHeader 
                    header={
                        <div className={styles.cardHeaderContainer}>
                            <div className={styles.cardHeaderRow}>
                                <Image alt="Request Parameters" src={inputImage} height={40} width={40} />
                                <h3 className={styles.headingNoMargin}>Request Parameters (Input)</h3>
                                <ModeBadge mode={mode} />
                                {selectedRequestParameter && (
                                    <ComponentStateBadge isManaged={selectedRequestParameter.ismanaged} />
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
                            <RequestParametersList requestParameters={requestParameters} />
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
                <RequestParameterCreateDialog
                    open={showCreateConfirmation}
                    createData={createData}
                    isSaving={createCustomApiRequestParameter.isPending}
                    onConfirm={handleCreateConfirm}
                    onCancel={handleCreateCancel}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <RequestParameterDeleteDialog
                open={showDeleteConfirmation}
                requestParameter={selectedRequestParameter ?? null}
                isDeleting={deleteCustomApiRequestParameter.isPending}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </>
    );

};
