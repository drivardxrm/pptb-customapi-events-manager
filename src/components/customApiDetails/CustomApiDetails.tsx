import React, { useState, useEffect, useCallback, Activity } from 'react';
import { Button, Card, CardHeader, Divider, Spinner, Switch, Tooltip } from '@fluentui/react-components';
import { Edit24Regular, Save24Regular, Dismiss24Regular, LockClosed16Regular, AddCircleColor, DismissCircleColor, TextBulletListTreeRegular, FormRegular } from '@fluentui/react-icons';
import { useAppStore } from '../../store/useAppStore';
import { useCustomApis, useUpdateCustomApi, useCreateCustomApi, useDeleteCustomApi } from '../../hooks/useCustomApis';
import { useStyles } from '../../styles/Styles';
import { CustomApi, CustomApiCreateInput, CustomApiUpdateInput, DEFAULT_CREATE_TEMPLATE } from '../../models/CustomApi';
import { CustomApiDetailsRead } from './CustomApiDetailsRead';
import { CustomApiDetailsEdit } from './CustomApiDetailsEdit';
import { CustomApiDetailsCreate } from './CustomApiDetailsCreate';
import { CustomApiCreateDialog } from './CustomApiCreateDialog';
import { CustomApiTreeView } from './CustomApiTreeView';

import { RequestParameterDetails } from './../requestParameterDetails/RequestParameterDetails';
import { CustomApiSelector } from '../CustomApiSelector';
import { ResponsePropertyDetails } from '../responsePropertyDetails/ResponsePropertyDetails';
import { ValidationStatus } from '../../utils/validation';
import { CustomApiDeleteDialog } from './CustomApiDeleteDialog';
import { ModeBadge } from '../generic/ModeBadge';
import { ComponentStateBadge } from '../generic/ComponentStateBadge';
import { PowerFxBadge } from '../generic/PowerFxBadge';
import { CustomApiBusinessEventButton } from '../generic/CustomApiBusinessEventButton';
import { PowerFxDetails } from '../powerfxDetails/PowerFxDetails';
import { useCustomApiRequestParameters } from '../../hooks/useCustomApiRequestParameters';
import { useCustomApiResponseProperties } from '../../hooks/useCustomApiResponseProperties';
import { useAppSettings } from '../../hooks/useAppSettings';



type CustomApiDetailsMode = 'read' | 'edit' | 'create';



const toEditable = (api: CustomApi): CustomApiUpdateInput => ({
    name: api.name || '',
    displayname: api.displayname || '',
    description: api.description || '',
    executeprivilegename: api.executeprivilegename || '',
    _plugintypeid_value: api._plugintypeid_value || '',
    isprivate: api.isprivate,
});

export const CustomApiDetails: React.FC = () => {
    const styles = useStyles();
    const {
        selectedCustomApiId,
        setSelectedCustomApiId,
        setSelectedRequestParameterId,
        setSelectedResponsePropertyId,
        setGlobalMessage,
        clearGlobalMessage,
        selectedNavItem,
        editingComponent,
        setEditingComponent,
    } = useAppStore();
    const isLocked = editingComponent !== 'none' && editingComponent !== 'customapi';
    const { customapis } = useCustomApis();
    const updateCustomApi = useUpdateCustomApi();
    const createCustomApi = useCreateCustomApi();
    const deleteCustomApi = useDeleteCustomApi();
    const { requestParameters } = useCustomApiRequestParameters();
    const { responseProperties } = useCustomApiResponseProperties();
    const { appsettings } = useAppSettings();


    const selectedCustomApi = customapis.find((api) => api.customapiid === selectedCustomApiId)


    const [mode, setMode] = useState<CustomApiDetailsMode>('read');
    const [showTreeView, setShowTreeView] = useState(appsettings?.showCustomApiDetailsTreeView ?? false);
    const [requestParameterCreateTrigger, setRequestParameterCreateTrigger] = useState(0);
    const [responsePropertyCreateTrigger, setResponsePropertyCreateTrigger] = useState(0);
    const [requestParameterEditId, setRequestParameterEditId] = useState<string | null>(null);
    const [responsePropertyEditId, setResponsePropertyEditId] = useState<string | null>(null);
    const [returnToTreeViewAfterCustomApiAction, setReturnToTreeViewAfterCustomApiAction] = useState(false);
    const [returnToTreeViewAfterRequestParameterAction, setReturnToTreeViewAfterRequestParameterAction] = useState(false);
    const [returnToTreeViewAfterResponsePropertyAction, setReturnToTreeViewAfterResponsePropertyAction] = useState(false);
    const [editedData, setEditedData] = useState<CustomApiUpdateInput | null>(null);
    const [createData, setCreateData] = useState<CustomApiCreateInput>(DEFAULT_CREATE_TEMPLATE);
    const [createValidation, setCreateValidation] = useState<ValidationStatus>({
        isValid: true,
    });
    const [showCreateConfirmation, setShowCreateConfirmation] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    // Sync showTreeView with app settings when settings load
    useEffect(() => {
        if (appsettings?.showCustomApiDetailsTreeView !== undefined) {
            setShowTreeView(appsettings.showCustomApiDetailsTreeView);
        }
    }, [appsettings?.showCustomApiDetailsTreeView]);

    const clearTreeViewChildActionState = useCallback(() => {
        setRequestParameterCreateTrigger(0);
        setResponsePropertyCreateTrigger(0);
        setRequestParameterEditId(null);
        setResponsePropertyEditId(null);
        setReturnToTreeViewAfterRequestParameterAction(false);
        setReturnToTreeViewAfterResponsePropertyAction(false);
    }, []);

    useEffect(() => {
        if (!showTreeView) {
            return;
        }

        clearTreeViewChildActionState();
        setSelectedRequestParameterId(null);
        setSelectedResponsePropertyId(null);
    }, [
        clearTreeViewChildActionState,
        showTreeView,
        setSelectedRequestParameterId,
        setSelectedResponsePropertyId,
    ]);

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
                title: 'No Custom API selected. Select a Custom API below or create a new one.',
                dismissable: false,
                action: {
                    label: 'New Custom API',
                    icon: <AddCircleColor />,
                    onClick: handleCreate,
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

    // Show warning message when selected Custom API is a Power Fx function
    useEffect(() => {
        if (selectedCustomApi?._fxexpressionid_value) {
            setGlobalMessage('powerfx-warning', {
                intent: 'warning',
                title: 'Warning! The selected Custom API is a Power Fx Function.',
                body: 'Limited operations are permitted. Use the Maker portal to add more Input/Output parameters or to modify the Power Fx Expression.',
                dismissable: false,
            });
        } else {
            clearGlobalMessage('powerfx-warning');
        }
    }, [selectedCustomApi, setGlobalMessage, clearGlobalMessage]);

    // Clear Power Fx warning when component unmounts
    useEffect(() => {
        return () => {
            clearGlobalMessage('powerfx-warning');
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

    const handleEdit = (returnToTreeViewOnExit = false) => {
        if (!selectedCustomApi || selectedCustomApi.ismanaged) {
            return;
        }
        setEditedData(toEditable(selectedCustomApi));
        setReturnToTreeViewAfterCustomApiAction(returnToTreeViewOnExit);
        setMode('edit');
        setEditingComponent('customapi');
    };

    const handleCreate = () => {
        setSelectedCustomApiId(null);
        setCreateData(DEFAULT_CREATE_TEMPLATE);
        setReturnToTreeViewAfterCustomApiAction(false);
        setMode('create');
        setEditingComponent('customapi');
    };

    const handleCancel = () => {
        if (mode === "edit" && selectedCustomApi) {
            setEditedData(toEditable(selectedCustomApi));
        }else if (mode === "create") {
            setCreateData(DEFAULT_CREATE_TEMPLATE);
        }
        setMode('read');
        setEditingComponent('none');
        if (returnToTreeViewAfterCustomApiAction) {
            setReturnToTreeViewAfterCustomApiAction(false);
            setShowTreeView(true);
        }
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
            setEditingComponent('none');
            if (returnToTreeViewAfterCustomApiAction) {
                setReturnToTreeViewAfterCustomApiAction(false);
                setShowTreeView(true);
            }
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

    const handleCreateRequestParameterFromTree = useCallback(() => {
        setReturnToTreeViewAfterRequestParameterAction(true);
        setShowTreeView(false);
        setRequestParameterCreateTrigger((current) => current + 1);
    }, []);

    const handleCreateResponsePropertyFromTree = useCallback(() => {
        setReturnToTreeViewAfterResponsePropertyAction(true);
        setShowTreeView(false);
        setResponsePropertyCreateTrigger((current) => current + 1);
    }, []);

    const handleRequestParameterCreationRequestHandled = useCallback(() => {
        setRequestParameterCreateTrigger(0);
    }, []);

    const handleResponsePropertyCreationRequestHandled = useCallback(() => {
        setResponsePropertyCreateTrigger(0);
    }, []);

    const handleEditRequestParameterFromTree = useCallback((requestParameterId: string) => {
        setSelectedResponsePropertyId(null);
        setReturnToTreeViewAfterRequestParameterAction(true);
        setRequestParameterEditId(requestParameterId);
        setShowTreeView(false);
    }, [setSelectedResponsePropertyId]);

    const handleEditResponsePropertyFromTree = useCallback((responsePropertyId: string) => {
        setSelectedRequestParameterId(null);
        setReturnToTreeViewAfterResponsePropertyAction(true);
        setResponsePropertyEditId(responsePropertyId);
        setShowTreeView(false);
    }, [setSelectedRequestParameterId]);

    const handleRequestParameterEditRequestHandled = useCallback(() => {
        setRequestParameterEditId(null);
    }, []);

    const handleResponsePropertyEditRequestHandled = useCallback(() => {
        setResponsePropertyEditId(null);
    }, []);

    const handleRequestParameterTreeActionFinished = useCallback(() => {
        setReturnToTreeViewAfterRequestParameterAction(false);
        setShowTreeView(true);
    }, []);

    const handleResponsePropertyTreeActionFinished = useCallback(() => {
        setReturnToTreeViewAfterResponsePropertyAction(false);
        setShowTreeView(true);
    }, []);

    



    const handleEditedDataChange = (updater: (current: CustomApiUpdateInput) => CustomApiUpdateInput) => {
        setEditedData((current) => (current ? updater(current) : current));
    };

    const handleCreateDataChange = (updater: (current: CustomApiCreateInput) => CustomApiCreateInput) => {
        setCreateData((current) => updater(current));
    };



    const headerTitle = mode === 'create' ? 'Create Custom API' : 'Custom API Details';

    const headerDescription = mode === 'create' ? (
        <div className={styles.flexColumn}>
            <div className={styles.hintTextItalic}>
                <LockClosed16Regular />
                <span>Some fields remain immutable after creation.</span>
            </div>
        </div>
    ) : (
        <div className={styles.flexColumn}>
            <div className={styles.headingActionRow}>
                <h2 className={styles.headingNoMargin}>{selectedCustomApi?.displayname || selectedCustomApi?.uniquename}</h2>
                <CustomApiBusinessEventButton customApiId={selectedCustomApi?.customapiid} />
            </div>
            <div className={styles.hintTextItalic}>
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
            <Activity mode={mode === 'read' && selectedCustomApi && !selectedCustomApi.ismanaged && !showTreeView ? 'visible' : 'hidden'}>
                <Button
                    appearance='secondary'
                    icon={<Edit24Regular />}
                    onClick={() => handleEdit()}
                    className={styles.headerActionButton}
                >
                    Edit
                </Button>
            </Activity>

            {/* DELETE */}
            <Activity mode={mode  === 'read' && selectedCustomApi && !selectedCustomApi.ismanaged && !selectedCustomApi._fxexpressionid_value  ? 'visible' : 'hidden'}>
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

        // Show tree view or form view based on toggle
        if (mode === 'read' && selectedCustomApi && showTreeView) {
            return <CustomApiTreeView 
                api={selectedCustomApi} 
                requestParameters={requestParameters} 
                responseProperties={responseProperties}
                onCreateRequestParameter={handleCreateRequestParameterFromTree}
                onCreateResponseProperty={handleCreateResponsePropertyFromTree}
                onEditRequestParameter={handleEditRequestParameterFromTree}
                onEditResponseProperty={handleEditResponsePropertyFromTree}
                onEdit={() => {
                    setShowTreeView(false);
                    handleEdit(true);
                }}
                onDelete={ 
                    () => {
                        handleDelete();
                    }
                }
            />;
        }

        return <CustomApiDetailsRead api={selectedCustomApi!} />;
    })();

    return (
        <>
            <CustomApiSelector/>
            
            <Card className={styles.card}>
                <div className={isLocked ? styles.lockedSection : undefined}>
                    <CardHeader 
                        header={
                            <div className={styles.cardHeaderContainer}>
                                <div className={styles.cardHeaderRow}>
                                    <h3>{headerTitle}</h3>
                                    <div className={styles.headerBadgeGroup}>
                                        <ModeBadge mode={mode} />
                                        {selectedCustomApi && (
                                            <ComponentStateBadge isManaged={selectedCustomApi.ismanaged} />
                                        )}
                                        {selectedCustomApi?._fxexpressionid_value && (
                                            <PowerFxBadge />
                                        )}
                                        {/* Tree View Toggle - only visible in read mode with a selected API */}
                                        {mode === 'read' && (
                                            <div>
                                               
                                                
                                                <Tooltip content='Toggle compact tree view' relationship='label'>
                                                    <Switch
                                                        checked={showTreeView}
                                                        onChange={(_, data) => {
                                                            setShowTreeView(data.checked);
                                                            // Reset the editing lock when switching to tree view, since
                                                            // child components unmount without getting a chance to reset it.
                                                            if (data.checked && (editingComponent === 'requestparameter' || editingComponent === 'responseproperty')) {
                                                                setEditingComponent('none');
                                                            }
                                                        }}
                                                        label={showTreeView ? 
                                                            <div className={styles.flexRowCentered}><TextBulletListTreeRegular /><span>Tree View</span></div> : 
                                                            <div className={styles.flexRowCentered}><FormRegular /><span>Form View</span></div>  }
                                                        labelPosition='after'
                                                    />
                                                </Tooltip>
                                            </div>
                                            
                                        )}
                                    </div>
                                </div>
                            </div>
                        }
                        description={headerDescription}
                        action={headerAction}
                    />
                    <Divider />
                    {content}
                </div>
                {/* Hide request/response sections when in tree view mode */}
                {selectedCustomApi && !showTreeView && (
                    <>
                        <RequestParameterDetails
                            creationRequestToken={requestParameterCreateTrigger}
                            onCreationRequestHandled={handleRequestParameterCreationRequestHandled}
                            editRequestParameterId={requestParameterEditId}
                            onEditRequestHandled={handleRequestParameterEditRequestHandled}
                            onActionFinished={returnToTreeViewAfterRequestParameterAction ? handleRequestParameterTreeActionFinished : undefined}
                        />
               
                        <ResponsePropertyDetails
                            creationRequestToken={responsePropertyCreateTrigger}
                            onCreationRequestHandled={handleResponsePropertyCreationRequestHandled}
                            editRequestPropertyId={responsePropertyEditId}
                            onEditRequestHandled={handleResponsePropertyEditRequestHandled}
                            onActionFinished={returnToTreeViewAfterResponsePropertyAction ? handleResponsePropertyTreeActionFinished : undefined}
                        />

                        {selectedCustomApi._fxexpressionid_value && (
                            <PowerFxDetails fxexpressionid={selectedCustomApi._fxexpressionid_value} />
                        )}
                    </>
                )}

                {selectedCustomApi  && selectedCustomApi._fxexpressionid_value && (
                    <PowerFxDetails fxexpressionid={selectedCustomApi._fxexpressionid_value} />
                )}
                
               
                
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
