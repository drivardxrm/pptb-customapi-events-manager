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
import { useCustomApis } from '../hooks/useCustomApis';
import { useStyles } from '../styles/Styles';
import { useQueryClient } from '@tanstack/react-query';
import { usePrivileges } from '../hooks/usePrivileges';
import { GenericTagPicker, SelectableItem } from './GenericTagPicker';
import { usePluginTypes } from '../hooks/usePluginTypes';



export const CustomApiDetailsForm: React.FC = () => {
    const styles = useStyles();
    const selectedCustomApiId = useAppStore((state) => state.selectedCustomApiId);
    const addLog = useAppStore((state) => state.addLog);
    const { customapis } = useCustomApis();
    const privilegesQuery = usePrivileges();
    const pluginTypesQuery = usePluginTypes();
    const queryClient = useQueryClient();


    const selectedCustomApi = useMemo(
        () => customapis.find((api) => api.customapiid === selectedCustomApiId),
        [customapis, selectedCustomApiId]
    );

    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedData, setEditedData] = useState<{ 
        displayname: string; 
        executeprivilegename: string;
        plugintypeid: string;}
        >(
        { displayname: '', executeprivilegename: '', plugintypeid: '' }
    );

    // Sync editedData when selection changes
    useEffect(() => {
        if (selectedCustomApi) {
            setEditedData({
                displayname: selectedCustomApi.displayname || '',
                executeprivilegename: selectedCustomApi.executeprivilegename || '',
                plugintypeid: selectedCustomApi.plugintypeid || ''
            });
            setIsEditMode(false);
        }
    }, [selectedCustomApi]);

    const handleEdit = () => setIsEditMode(true);
    const handleCancel = () => {
        if (selectedCustomApi) {
            setEditedData({
                displayname: selectedCustomApi.displayname || '',
                executeprivilegename: selectedCustomApi.executeprivilegename || '',
                plugintypeid: selectedCustomApi.plugintypeid || ''
            });
        }
        setIsEditMode(false);
    };

    const handleSave = async () => {
        if (!selectedCustomApi) return;
        try {
            setIsSaving(true);
            addLog('Saving Custom API changes...', 'info');
            // Build payload with only changed fields
            const original = {
                displayname: selectedCustomApi.displayname || '',
                executeprivilegename: selectedCustomApi.executeprivilegename || '',
                plugintypeid: selectedCustomApi.plugintypeid || ''
            };
            const payload: Record<string, any> = {};
            if (editedData.displayname !== original.displayname) {
                payload.displayname = editedData.displayname || null;
            }
            if (editedData.executeprivilegename !== original.executeprivilegename) {
                payload.executeprivilegename = editedData.executeprivilegename || null;
            }
            if (editedData.plugintypeid !== original.plugintypeid) {
                payload.plugintypeid = editedData.plugintypeid || null;
            }
            if (Object.keys(payload).length === 0) {
                addLog('No changes to save', 'warning');
                setIsEditMode(false);
                return;
            }
            await window.dataverseAPI.update('customapi', selectedCustomApi.customapiid, payload);
            await queryClient.invalidateQueries({ queryKey: ['customapi'] }); // todo might not be needed
            addLog(`Custom API '${selectedCustomApi.uniquename}' updated successfully`, 'success');
            setIsEditMode(false);
        } catch (e) {
            console.error('Error saving Custom API', e);
            addLog('Failed to save Custom API changes', 'error');
        } finally {
            setIsSaving(false);
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
                            <Button appearance="primary" icon={isSaving ? <Spinner size="tiny" /> : <Save24Regular />} disabled={isSaving} onClick={handleSave}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button appearance="secondary" icon={<Dismiss24Regular />} disabled={isSaving} onClick={handleCancel}>Cancel</Button>
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
                            value={isEditMode ? editedData.displayname : (selectedCustomApi.displayname || '')} 
                            readOnly={!isEditMode} 
                            className={!isEditMode ? styles.readOnlyInput : undefined}
                            onChange={(e) => isEditMode && setEditedData({ ...editedData, displayname: e.target.value })}
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Name">
                        <Input 
                            value={selectedCustomApi.name || ''} 
                            readOnly 
                            className={styles.readOnlyInput}
                        />
                    </Field>
                </div>

                <div className={`${styles.formSection} ${styles.fullWidth}`}>
                    <Field label="Description">
                        <Textarea 
                            value={selectedCustomApi.description || ''} 
                            readOnly 
                            className={styles.readOnlyInput}
                            resize="vertical"
                            rows={3}
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
                                initialValue={selectedCustomApi.executeprivilegename}
                                isDisabled={!isEditMode} 
                                onSelect={(id) => {
                                    isEditMode && setEditedData({ ...editedData, executeprivilegename: privilegesQuery.privileges.find(priv => priv.privilegeid === id)?.name || '' })                                      
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
                            checked={selectedCustomApi.isprivate} 
                            disabled 
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Is Customizable">
                        <Switch 
                            checked={selectedCustomApi.iscustomizable} 
                            disabled 
                        />
                    </Field>
                </div>


                

                {/* System Information
                <div className={`${styles.formSection} ${styles.fullWidth}`}>
                    <Field label="Status">
                        <div className={styles.badgeContainer}>
                            <Badge 
                                appearance="filled" 
                                color={selectedCustomApi.ismanaged ? 'important' : 'success'}
                            >
                                {selectedCustomApi.ismanaged ? 'Managed' : 'Unmanaged'}
                            </Badge>
                            <Badge 
                                appearance="filled" 
                                color={selectedCustomApi.iscustomizable ? 'informative' : 'warning'}
                            >
                                {selectedCustomApi.iscustomizable ? 'Customizable' : 'Not Customizable'}
                            </Badge>
                            <Badge appearance="outline">
                                State: {selectedCustomApi.statecode === 0 ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </Field>
                </div> */}

              

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
                                initialValue={selectedCustomApi.plugintypeid}
                                isDisabled={!isEditMode} 
                                onSelect={(id) => {
                                    isEditMode && setEditedData({ ...editedData, plugintypeid: id || '' })                                      
                                }}
                            />
                        )}
                    </Field>
                </div>

            </div>
        </Card>
    );
};
