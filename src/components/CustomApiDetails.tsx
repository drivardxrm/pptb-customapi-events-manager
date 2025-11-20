import React, { useState, useEffect, useMemo } from 'react';
import { 
    Field, 
    Input,
    Textarea,
    Switch,
    Card,
    CardHeader,
    Divider,
    Button,
    Spinner,
} from '@fluentui/react-components';
import { Edit24Regular, Save24Regular, Dismiss24Regular, LockClosed16Regular, LockOpen16Regular } from '@fluentui/react-icons';
import { useAppStore } from '../store/useAppStore';
import { useCustomApis, useUpdateCustomApi } from '../hooks/useCustomApis';
import { useStyles } from '../styles/Styles';
import { usePrivileges } from '../hooks/usePrivileges';
import { GenericTagPicker, SelectableItem } from './generic/GenericTagPicker';
import { usePluginTypes } from '../hooks/usePluginTypes';
import { CustomApiUpdateable } from '../models/CustomApi';



export const CustomApiDetails: React.FC = () => {
    const styles = useStyles();
    const {selectedCustomApiId} = useAppStore();
    const { customapis } = useCustomApis();
    const updateCustomApi = useUpdateCustomApi();
    const privilegesQuery = usePrivileges();
    const pluginTypesQuery = usePluginTypes();


    const selectedCustomApi = useMemo(
        () => customapis.find((api) => api.customapiid === selectedCustomApiId),
        [customapis, selectedCustomApiId]
    );

    const [isEditMode, setIsEditMode] = useState(false);
    const [editedData, setEditedData] = useState<CustomApiUpdateable | null>(null)
        


    // Sync editedData when selection changes
    useEffect(() => {
        if (selectedCustomApi) {
            setEditedData({
                name: selectedCustomApi.name || '',
                displayname: selectedCustomApi.displayname || '',
                description: selectedCustomApi.description || '',
                executeprivilegename: selectedCustomApi.executeprivilegename || '',
                _plugintypeid_value: selectedCustomApi._plugintypeid_value || '',
                iscustomizable: selectedCustomApi.iscustomizable,
                isprivate: selectedCustomApi.isprivate,
            });
            setIsEditMode(false);
        }
    }, [selectedCustomApi]);

    const handleEdit = () => setIsEditMode(true);
    const handleCancel = () => {
        if (selectedCustomApi) {
            setEditedData({
                name: selectedCustomApi.name || '',
                displayname: selectedCustomApi.displayname || '',
                description: selectedCustomApi.description || '',
                executeprivilegename: selectedCustomApi.executeprivilegename || '',
                _plugintypeid_value: selectedCustomApi._plugintypeid_value || '',
                iscustomizable: selectedCustomApi.iscustomizable,
                isprivate: selectedCustomApi.isprivate,
            });
        }
        setIsEditMode(false);
    };

    const handleSave = async () => {
        if (!selectedCustomApi || !editedData) return;

        try {
            await updateCustomApi.mutateAsync({
                current: selectedCustomApi,
                next: editedData,
            });

            setIsEditMode(false);
        } catch (error) {
            console.error('Error saving Custom API', error);
        }
    };

    if (!selectedCustomApiId || !selectedCustomApi) {
        return (
            <Card className={styles.card}>
                <CardHeader header={<h3>Custom API Details</h3>} />
                <div className={styles.infoBox}>
                    <p>No Custom API selected</p>
                    <p>Please select a Custom API from the list above</p>
                </div>
            </Card>
        );
    }

    const getBindingTypeLabel = (type: number): string => {
        switch (type) {
            case 0: return 'Global';
            case 1: return 'Entity';
            case 2: return 'Entity Collection';
            default: return `Unknown (${type})`;
        }
    };

    const getAllowedCustomProcessingStepTypeLabel = (type: number): string => {
        switch (type) {
            case 0: return 'None';
            case 1: return 'Async Only';
            case 2: return 'Sync and Async';
            default: return `Unknown (${type})`;
        }
    };

    return (
        <Card className={styles.card}>
            <CardHeader 
                header={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h3 style={{ margin: 0 }}>Custom API Details</h3>
                        
                    </div>
                }
                description={
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <h2 style={{ margin: 0 }}>{selectedCustomApi.displayname || selectedCustomApi.uniquename}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontStyle: 'italic', color: '#666' }}>
                            <LockClosed16Regular />
                            <span>Fields that cannot be modified after creation</span>
                        </div>
                    </div>    
                    
                }
                action={
                    !isEditMode ? (
                        <Button appearance="primary" icon={<Edit24Regular />} onClick={handleEdit}>Edit</Button>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button appearance="primary" icon={updateCustomApi.isPending ? <Spinner size="tiny" /> : <Save24Regular />} disabled={updateCustomApi.isPending} onClick={handleSave}>
                                {updateCustomApi.isPending ? 'Saving...' : 'Save'}
                            </Button>
                            <Button appearance="secondary" icon={<Dismiss24Regular />} disabled={updateCustomApi.isPending} onClick={handleCancel}>Cancel</Button>
                        </div>
                    )
                }
            />
            <Divider />
            
            <div className={styles.formGrid}>
                {/* Basic Information */}
                <div className={styles.formSection}>
                    <Field label={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Unique Name <LockClosed16Regular />
                        </span>
                    }>
                        <Input 
                            value={selectedCustomApi.uniquename || ''} 
                            readOnly 
                            className={styles.readOnlyInput}
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Display Name">
                        <Input 
                            value={isEditMode ? editedData?.displayname ?? '' : (selectedCustomApi.displayname || '')} 
                            readOnly={!isEditMode} 
                            className={!isEditMode ? styles.readOnlyInput : undefined}
                            onChange={(e) => {
                                if (isEditMode && editedData) {
                                    setEditedData({ ...editedData, displayname: e.target.value });
                                }
                            }}
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Name">
                        <Input 
                            value={isEditMode ? editedData?.name ?? '' : (selectedCustomApi.name || '')} 
                            readOnly={!isEditMode} 
                            className={!isEditMode ? styles.readOnlyInput : undefined}
                            onChange={(e) => {
                                if (isEditMode && editedData) {
                                    setEditedData({ ...editedData, name: e.target.value });
                                }
                            }}
                        />
                    </Field>
                </div>

                <div className={`${styles.formSection} ${styles.fullWidth}`}>
                    <Field label="Description">
                        <Textarea 
                            value={isEditMode ? editedData?.description ?? '' : (selectedCustomApi.description || '')} 
                            readOnly={!isEditMode} 
                            className={!isEditMode ? styles.readOnlyInput : undefined}
                            resize="vertical"
                            rows={3}
                            onChange={(e) => {
                                if (isEditMode && editedData) {
                                    setEditedData({ ...editedData, description: e.target.value });
                                }
                            }}
                        />
                    </Field>
                </div>

                {/* Configuration */}
                <div className={styles.formSection}>
                    <Field label={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Binding Type <LockClosed16Regular />
                        </span>}>
                        <Input 
                            value={getBindingTypeLabel(selectedCustomApi.bindingtype)} 
                            readOnly 
                            className={styles.readOnlyInput}
                        />
                    </Field>
                </div>

                {selectedCustomApi.bindingtype === 1 && (
                    <div className={styles.formSection}>
                        <Field label={
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                Bound Entity Logical Name <LockClosed16Regular />
                            </span>}>
                            <Input 
                                value={selectedCustomApi.boundentitylogicalname || ''} 
                                readOnly 
                                className={styles.readOnlyInput}
                            />
                        </Field>
                    </div>
                )}

                <div className={styles.formSection}>
                    <Field label={
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                Allowed Custom Processing Step Type <LockClosed16Regular />
                            </span>}>
                        <Input 
                            value={getAllowedCustomProcessingStepTypeLabel(selectedCustomApi.allowedcustomprocessingsteptype)} 
                            readOnly 
                            className={styles.readOnlyInput}
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Execute Privilege Name">
                        {privilegesQuery.isFetching && (
                            <Input 
                                value={"Loading privileges..."} 
                                readOnly 
                                className={styles.readOnlyInput}
                            />
                        )}
                        {privilegesQuery.error && (
                            <Input 
                                value={`Error loading privileges: ${privilegesQuery.error.message}`} 
                                readOnly 
                                className={styles.readOnlyInput}
                            />
                        )}
                        {!privilegesQuery.isFetching && privilegesQuery.privileges && (
                            <GenericTagPicker 
                                 items={privilegesQuery.privileges.map(p => ({
                                        id: p.privilegeid,
                                        displayText: p.name || ''
                                    } as SelectableItem)      
                                ).sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))} 
                                initialValue={editedData?.executeprivilegename ?? selectedCustomApi.executeprivilegename}
                                isDisabled={!isEditMode} 
                                onSelect={(id) => {
                                    if (isEditMode && editedData) {
                                        setEditedData({
                                            ...editedData,
                                            executeprivilegename: privilegesQuery.privileges.find(priv => priv.privilegeid === id)?.name || '',
                                        });
                                    }
                                }}
                            />
                        )}
                    </Field>
                </div>

                {/* Boolean Flags */}
                <div className={styles.formSection}>
                    <Field label={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Is Function <LockClosed16Regular />
                        </span>
                    }>
                        <Switch 
                            checked={selectedCustomApi.isfunction} 
                            disabled 
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            Workflow SDK Step Enabled <LockClosed16Regular />
                        </span>
                    }>
                        <Switch 
                            checked={selectedCustomApi.workflowsdkstepenabled} 
                            disabled 
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Is Private">
                        <Switch 
                            checked={isEditMode ? editedData!.isprivate : selectedCustomApi.isprivate} 
                            disabled = {!isEditMode}
                            onChange={(e) => {
                                if (isEditMode && editedData) {
                                    setEditedData({ ...editedData, isprivate: e.target.checked });
                                }
                            }}
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Is Customizable">
                        <Switch 
                            checked={isEditMode ? editedData!.iscustomizable : selectedCustomApi.iscustomizable} 
                            disabled = {!isEditMode}
                            onChange={(e) => {
                                if (isEditMode && editedData) {
                                    setEditedData({ ...editedData, iscustomizable: e.target.checked });
                                }
                            }}
                        />
                    </Field>
                </div>


                


              

                <div className={styles.formSection}>
                    <Field label="Plugin Type ID">
                        {/* <Input 
                            value={selectedCustomApi.plugintypeid || '(None)'} 
                            readOnly 
                            className={styles.readOnlyInput}
                            size="small"
                        /> */}
                        {pluginTypesQuery.isFetching && (
                            <Input 
                                value={"Loading plugintypes..."} 
                                readOnly 
                                className={styles.readOnlyInput}
                            />
                        )}
                        {pluginTypesQuery.error && (
                            <Input 
                                value={`Error loading privileges: ${pluginTypesQuery.error.message}`} 
                                readOnly 
                                className={styles.readOnlyInput}
                            />
                        )}
                        {!pluginTypesQuery.isFetching && pluginTypesQuery.plugintypes && (
                            <GenericTagPicker 
                                items={pluginTypesQuery.plugintypes.map(p => ({
                                        id: p.plugintypeid,
                                        displayText: p.typename || '',
                                        image: p.ismanaged ? <LockClosed16Regular /> : <LockOpen16Regular />
                                    } as SelectableItem)      
                                ).sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))} 
                                initialValue={editedData?._plugintypeid_value ?? selectedCustomApi._plugintypeid_value}
                                isDisabled={!isEditMode} 
                                onSelect={(id) => {
                                    if (isEditMode && editedData) {
                                        setEditedData({ ...editedData, _plugintypeid_value: id || '' });
                                    }
                                }}
                            />
                        )}
                    </Field>
                </div>

            </div>
        </Card>
    );
};
