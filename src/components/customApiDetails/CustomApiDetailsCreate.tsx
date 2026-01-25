import React, { useEffect, useMemo, useRef } from 'react';
import { Field, Input, Textarea, Switch, mergeClasses, Tooltip, Text } from '@fluentui/react-components';
import { LockClosed16Regular, LockOpen16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { CustomApiCreateable, getBindingTypeOptions, getAllowedCustomProcessingStepTypeOptions, Customapisallowedcustomprocessingsteptype, Customapisbindingtype } from '../../models/CustomApi';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { usePrivileges } from '../../hooks/usePrivileges';
import { usePluginTypes } from '../../hooks/usePluginTypes';
import { useDynamicColumnWidths } from '../../hooks/useDynamicColumnWidths';
import { usePublishers } from '../../hooks/usePublishers';
import { useAppStore } from '../../store/useAppStore';
import { useAppSettings } from '../../hooks/useAppSettings';
import { ValidationStatus } from '../../utils/validation';
import { useCustomApis } from '../../hooks/useCustomApis';
import { produce } from 'immer';
import { useEntities } from '../../hooks/useEntities';

interface CustomApiDetailsCreateProps {
    createData: CustomApiCreateable;
    onChange: (updater: (current: CustomApiCreateable) => CustomApiCreateable) => void;
    onValidationChange?: (validationStatus: ValidationStatus) => void;
}

export const CustomApiDetailsCreate: React.FC<CustomApiDetailsCreateProps> = ({ createData, onChange, onValidationChange }) => {
    const styles = useStyles();
    const privilegesQuery = usePrivileges();
    const pluginTypesQuery = usePluginTypes();
    const publishersQuery = usePublishers()
    const customApiQuery = useCustomApis()
    const { selectedPublisherId, setSelectedPublisherId } = useAppStore();
    const settingsQuery = useAppSettings();
    const entityQuery = useEntities();

    const functionLabelRef = useRef<HTMLSpanElement | null>(null);
    const workflowLabelRef = useRef<HTMLSpanElement | null>(null);
    const privateLabelRef = useRef<HTMLSpanElement | null>(null);

    const columnRefGroups = useMemo(
        () => [
            [functionLabelRef, workflowLabelRef],
            [privateLabelRef],
        ],
        []
    );

    const [column1Width, column2Width] = useDynamicColumnWidths(columnRefGroups);
    const column1Style = column1Width ? { minWidth: `${column1Width}px` } : undefined;
    const column2Style = column2Width ? { minWidth: `${column2Width}px` } : undefined;

    // Validation logic
    const validation:ValidationStatus = useMemo(() => {
        if (!selectedPublisherId) {
            return { isValid: false, message: 'Select a publisher.' };
        }
        
        // Required Fields
        if (!createData.uniquename || createData.uniquename.trim() === '' ||
            !createData.name || createData.name.trim() === '' ||
            !createData.displayname || createData.displayname.trim() === '' ||
            !createData.description || createData.description.trim() === '' ||
            createData.allowedcustomprocessingsteptype === null ||
            createData.bindingtype === null ||
            (createData.bindingtype === 1 && (!createData.boundentitylogicalname || createData.boundentitylogicalname.trim() === ''))
        ) {
            return { isValid: false, message: 'Please fill all required fields.' };
        }

        if (customApiQuery.customapis && customApiQuery.customapis.some(api => api.uniquename.toLowerCase() === createData.uniquename.toLowerCase())) {
            return { isValid: false, message: `Custom API named '${createData.uniquename}' already exist.` };
        }

        return { isValid: true };
    }, [createData, selectedPublisherId, customApiQuery.customapis]);


    useEffect(() => {
        onValidationChange?.(validation);
    }, [validation.isValid, validation.message, onValidationChange]);

    // Helper to update fields, can change multiple fields at once
    const updateFields = (updater: (draft: CustomApiCreateable) => void) => {
        onChange(current => produce(current, draft => updater(draft)));
    };


    const uniqueNameSuffix = useMemo(() => {
        if (!createData.uniquename) {
            return '';
        }
        const parts = createData.uniquename.split('_');
        return parts.length > 1 ? parts[1] ?? '' : '';
    }, [createData.uniquename]);

    // sets the publisher from settings
    useEffect(() => {
        if (!selectedPublisherId && !settingsQuery.isFetching && settingsQuery.appsettings?.defaultPublisherId ) {
            setSelectedPublisherId(settingsQuery.appsettings?.defaultPublisherId);
        }
    }, [selectedPublisherId, settingsQuery, setSelectedPublisherId]);

    // useMemo to get the prefix of the selected publisher
    const selectedPublisherPrefix = useMemo(() => {
        if (!selectedPublisherId || !publishersQuery.publishers) {
            return '';
        }
        const publisher = publishersQuery.publishers.find(p => p.publisherid === selectedPublisherId);
        return publisher?.customizationprefix || '';
    }, [selectedPublisherId, publishersQuery.publishers]);



    return (
        <>
        
            <div className={styles.formGrid}>
                <div className={styles.formSection}>
                    <Field 
                        label='Publisher'
                        hint='Publisher for the Custom API'
                    >
                        
                        {publishersQuery.isFetching  && (
                            <Input 
                                value={"Loading publishers..."} 
                                readOnly 
                                appearance='filled-darker'
                            />
                        )}
                        {publishersQuery.error && (
                            <Input 
                                value={`Error loading publishers: ${publishersQuery.error.message}`} 
                                readOnly 
                                appearance='filled-darker'
                            />
                        )}
                        {!publishersQuery.isFetching && publishersQuery.publishers  && (
                            <GenericTagPicker 
                                    items={publishersQuery.publishers.map(p => ({
                                        id: p.publisherid,
                                        displayText: `${p.friendlyname} (${p.customizationprefix})` || ''
                                    } as SelectableItem)      
                                ).sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))} 
                                initialValue={selectedPublisherId || ''}
                                //isDisabled={!isEditMode} 
                                onSelect={(id) =>  setSelectedPublisherId(id || '')}
                            />
                        )}
                    </Field>
                </div>
            </div>
            
            {selectedPublisherPrefix === '' && (
                <div>
                    <Text weight="semibold">Warning:</Text> Please select a publisher to set the customization prefix for the Unique Name.
                </div>
            )}
            {selectedPublisherPrefix !== '' && (
                <div className={styles.formGrid}>
                    <div className={styles.formSection}>
                        <Field 
                            label={
                                <span className={styles.semiBoldLabel}>
                                    Unique Name <LockClosed16Regular />
                                </span>
                            }
                            required
                        >
                            <Input 
                                appearance='filled-darker'
                                contentBefore={
                                    <Text size={400}>{`${selectedPublisherPrefix}_`}</Text>
                                }
                                value={uniqueNameSuffix}
                                onChange={(event) => {
                                    const suffix = event.target.value ?? '';

                                    updateFields((next) => {
                                        const currentSuffix = next.uniquename?.split('_')[1] ?? '';

                                        if (suffix === currentSuffix) {
                                            return;
                                        }

                                        next.uniquename = `${selectedPublisherPrefix}_${suffix}`;

                                        if (!next.displayname || next.displayname === currentSuffix) {
                                            next.displayname = suffix;
                                        }

                                        if (!next.name || next.name === currentSuffix) {
                                            next.name = suffix;
                                        }

                                        if (!next.description || next.description === currentSuffix) {
                                            next.description = suffix;
                                        }
                                    });
                                }}
                            />
                        </Field>
                    </div>

                    <div className={styles.formSection}>
                        <Field 
                            label={<span className={styles.semiBoldLabel}>Name</span>}
                            required
                        >
                            <Input
                                appearance='filled-darker'
                                value={createData.name ?? ''}
                                onChange={(event) => {
                                    updateFields((next) => {
                                        next.name = event.target.value || '';
                                    })
                                }}
                            />
                        </Field>
                    </div>

                    <div className={styles.formSection}>
                        <Field 
                            label={<span className={styles.semiBoldLabel}>Display Name</span>}
                            required
                        >
                            <Input
                                appearance='filled-darker'
                                value={createData.displayname ?? ''}
                                onChange={(event) => {
                                    updateFields((next) => {
                                        next.displayname = event.target.value || '';
                                    })
                                }}
                            />
                        </Field>
                    </div>

                    

                    <div className={mergeClasses(styles.formSection,styles.fullWidth)}>
                        <Field label={<span className={styles.semiBoldLabel}>Description</span>} required>
                            <Textarea
                                appearance='filled-darker'
                                value={createData.description ?? ''}
                                onChange={(event) => {
                                    updateFields((next) => {
                                        next.description = event.target.value || '';
                                    })
                                }}
                                resize="vertical"
                                rows={2}
                            />
                        </Field>
                    </div>

                    <div className={styles.formSection}>
                        <Field 
                            label={
                                <span className={styles.semiBoldLabel}>
                                    Allowed Custom Processing Step Type <LockClosed16Regular />
                                </span>
                            }
                            required
                        >
                            <GenericTagPicker
                                items={
                                    getAllowedCustomProcessingStepTypeOptions()
                                        .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                                initialValue={createData.allowedcustomprocessingsteptype?.toString()}
                                isDisabled={false}
                                onSelect={(id) => {
                                    const value = id === null ? null : Number(id) as Customapisallowedcustomprocessingsteptype;

                                    updateFields((next) => {
                                        next.allowedcustomprocessingsteptype = value;
                                    })
                                }}
                            />
                        </Field>
                    </div>

                    <div className={styles.formSection}>
                        <Field label={
                            <span className={styles.semiBoldLabel}>
                                Binding Type <LockClosed16Regular />
                            </span>}
                            required
                        >
                            <GenericTagPicker
                                items={
                                    getBindingTypeOptions()
                                        .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                                initialValue={createData.bindingtype?.toString()}
                                isDisabled={false}
                                onSelect={(id) => {
                                    
                                    const value = id === null ? null : Number(id) as Customapisbindingtype;
                                    updateFields((next) => {
                                        next.bindingtype = value;
                                        if (value !== 1) {
                                            next.boundentitylogicalname = '';
                                        }
                                    })
                                }}
                            />
                        </Field>
                    </div>

                    {createData.bindingtype === 1 && (
                        <div className={styles.formSection}>
                            <Field label={
                                <span className={styles.semiBoldLabel}>
                                    Bound Entity Logical Name <LockClosed16Regular />
                                </span>}
                                required
                            >
                                {entityQuery.isFetching && (
                                    <Input value="Loading entities..." readOnly appearance='filled-darker' />
                                )}
                                {entityQuery.error && (
                                    <Input
                                        value={`Error loading entities: ${entityQuery.error.message}`}
                                        readOnly
                                        appearance='filled-darker'
                                    />
                                )}
                                {!entityQuery.isFetching && entityQuery.entities && (
                                    <GenericTagPicker
                                        items={entityQuery.entities
                                            .map((entity) => ({
                                                id: entity.entityid,
                                                displayText: entity.logicalname || '',
                                            } as SelectableItem))
                                            .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                                        isDisabled={false}
                                        onSelect={(id) => {
                                            const selected = entityQuery.entities?.find((entity) => entity.entityid === id);
                                            updateFields((next) => {
                                                next.boundentitylogicalname = selected?.logicalname || '';
                                            })
                                        }}
                                    />
                                )}
                            </Field>
                        </div>
                    )}

                    

                    

                    <div className={mergeClasses(styles.formSection,styles.twoColumn)}>
                        <Field label={<span className={styles.semiBoldLabel}>Plugin Type</span>}>
                            {pluginTypesQuery.isFetching && (
                                <Input value="Loading plugintypes..." readOnly appearance='filled-darker' />
                            )}
                            {pluginTypesQuery.error && (
                                <Input
                                    value={`Error loading privileges: ${pluginTypesQuery.error.message}`}
                                    readOnly
                                    appearance='filled-darker'
                                />
                            )}
                            {!pluginTypesQuery.isFetching && pluginTypesQuery.plugintypes && (
                                <GenericTagPicker
                                    items={pluginTypesQuery.plugintypes
                                        .map((type) => ({
                                            id: type.plugintypeid,
                                            displayText: type.typename || '',
                                            image: type.ismanaged ? <LockClosed16Regular /> : <LockOpen16Regular />,
                                        } as SelectableItem))
                                        .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                                    initialValue={createData._plugintypeid_value}
                                    isDisabled={false}
                                    onSelect={(id) => {
                                        updateFields((next) => {
                                            next._plugintypeid_value = id || '';
                                        })
                                    }}
                                />
                            )}
                        </Field>
                    </div>

                    <div className={styles.formSection}>
                        <Field label={<span className={styles.semiBoldLabel}>Execute Privilege Name</span>}>
                            {privilegesQuery.isFetching && (
                                <Input value="Loading privileges..." readOnly appearance='filled-darker' />
                            )}
                            {privilegesQuery.error && (
                                <Input
                                    value={`Error loading privileges: ${privilegesQuery.error.message}`}
                                    readOnly
                                    appearance='filled-darker'
                                />
                            )}
                            {!privilegesQuery.isFetching && privilegesQuery.privileges && (
                                <GenericTagPicker
                                    items={privilegesQuery.privileges
                                        .map((privilege) => ({
                                            id: privilege.privilegeid,
                                            displayText: privilege.name || '',
                                        } as SelectableItem))
                                        .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                                    //initialValue={createData.executeprivilegename}
                                    isDisabled={false}
                                    onSelect={(id) => {
                                        const selected = privilegesQuery.privileges?.find((priv) => priv.privilegeid === id);
                                        updateFields((next) => {
                                            next.executeprivilegename = selected?.name || '';
                                        })
                                    }}
                                />
                            )}
                        </Field>
                    </div>



                    <div className={styles.formSection}>
                        <div className={styles.switchColumn}>
                            <Tooltip content={createData.isfunction ? 'True' : 'False'} relationship='description' positioning='above-end'>
                                <div className={styles.switchRow}>
                                    <Switch
                                        
                                        checked={createData.isfunction}
                                        onChange={(_, data) => {
                                            updateFields((next) => {
                                                next.isfunction = data.checked;
                                            })
                                        }}
                                        tabIndex={-1}
                                        label={
                                            <span 
                                                ref={functionLabelRef}
                                                className={styles.readOnlySwitchLabel}
                                                style={column1Style}
                                            >
                                                <span>Is Function</span>
                                                <LockClosed16Regular />
                                            </span>
                                        }
                                        labelPosition="before"
                                    />
                                </div>
                            </Tooltip>
                            <Tooltip content={createData.workflowsdkstepenabled ? 'True' : 'False'} relationship='description' positioning='above-end'>
                                <div className={styles.switchRow}>
                                    <Switch
                                        checked={createData.workflowsdkstepenabled}
                                        onChange={(_, data) => {
                                            updateFields((next) => {
                                                next.workflowsdkstepenabled = data.checked;
                                            })
                                        }}
                                        tabIndex={-1}
                                        label={
                                            <span 
                                                ref={workflowLabelRef}
                                                className={styles.readOnlySwitchLabel}
                                                style={column1Style}
                                            >
                                                <span>Workflow SDK Step Enabled</span>
                                                <LockClosed16Regular />
                                            </span>
                                        }
                                        labelPosition="before"
                                    />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                    <div className={styles.formSection}>
                        <div className={styles.switchColumn}>
                            <Tooltip content={createData.isprivate ? 'True' : 'False'} relationship='description' positioning='above-end'>
                                <div className={styles.switchRow}>
                                    <Switch
                                        checked={createData.isprivate}
                                        onChange={(_, data) => {
                                            updateFields((next) => {
                                                next.isprivate = data.checked;
                                            })
                                        }}
                                        tabIndex={-1}
                                        label={
                                            <span
                                                ref={privateLabelRef}
                                                className={mergeClasses(styles.readOnlySwitchLabel, styles.semiBoldLabel)}
                                                style={column2Style}
                                            >
                                                Is Private
                                            </span>
                                        }
                                        labelPosition="before"
                                    />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
