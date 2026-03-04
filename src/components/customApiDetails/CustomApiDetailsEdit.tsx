import React, { useMemo, useRef } from 'react';
import { Field, Input, Textarea, Switch, mergeClasses, Tooltip } from '@fluentui/react-components';
import { LockClosed16Regular, LockOpen16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { CustomApi, CustomApiUpdateable, Customapisallowedcustomprocessingsteptype, Customapisbindingtype, allowedCustomProcessingStepTypeIcons, customapisBindingTypeIcons } from '../../models/CustomApi';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { usePrivileges } from '../../hooks/usePrivileges';
import { usePluginTypes } from '../../hooks/usePluginTypes';
import { useDynamicColumnWidths } from '../../hooks/useDynamicColumnWidths';
import { produce } from 'immer';

interface CustomApiDetailsEditProps {
    api: CustomApi;
    editedData: CustomApiUpdateable;
    onChange: (updater: (current: CustomApiUpdateable) => CustomApiUpdateable) => void;
}

export const CustomApiDetailsEdit: React.FC<CustomApiDetailsEditProps> = ({ api, editedData, onChange }) => {
    const styles = useStyles();
    const privilegesQuery = usePrivileges();
    const pluginTypesQuery = usePluginTypes();

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


    // Helper to update fields, can change multiple fields at once
    const updateFields = (updater: (draft: CustomApiUpdateable) => void) => {
        onChange(current => produce(current, draft => updater(draft)));
    };

    return (
        <div className={styles.formGrid}>
            <div className={styles.formSection}>
                <Field label={
                    <span className={styles.fieldLabelStandard}>
                        Unique Name <LockClosed16Regular />
                    </span>
                }>
                    <Input 
                        appearance='filled-darker'
                        value={api.uniquename || ''} 
                        readOnly 
                        className={styles.disabledInput}                     
                    />
                </Field>
            </div>

            

            <div className={styles.formSection}>
                <Field label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Name</span></span>}>
                    <Input
                        appearance='filled-darker'
                        value={editedData.name ?? ''}
                        onChange={(event) => 
                            updateFields((next) => {
                                        next.name = event.target.value || '';
                            })
                        }
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Display Name</span></span>}>
                    <Input
                        appearance='filled-darker'
                        value={editedData.displayname ?? ''}
                        onChange={(event) => 
                            updateFields((next) => {
                                next.displayname = event.target.value || '';
                            })
                        }
                    />
                </Field>
            </div>

            <div className={mergeClasses(styles.formSection,styles.fullWidth)}>
                <Field label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Description</span></span>}>
                    <Textarea
                        appearance='filled-darker'
                        spellCheck={false}
                        value={editedData.description ?? ''}
                        onChange={(event) => 
                            updateFields((next) => {
                                next.description = event.target.value || '';
                            })
                        }
                        resize="vertical"
                        rows={2}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={
                    <span className={styles.fieldLabelStandard}>
                        Allowed Custom Processing Step Type <LockClosed16Regular />
                    </span>}
                >
                    <Input
                        appearance='filled-darker'
                        contentBefore={allowedCustomProcessingStepTypeIcons[api.allowedcustomprocessingsteptype!]}
                        value={Customapisallowedcustomprocessingsteptype[api.allowedcustomprocessingsteptype!]}
                        readOnly
                        className={styles.disabledInput}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={
                    <span className={styles.fieldLabelStandard}>
                        Binding Type <LockClosed16Regular />
                    </span>}
                >
                    <Input
                        appearance='filled-darker'
                        contentBefore={customapisBindingTypeIcons[api.bindingtype!]}
                        value={Customapisbindingtype[api.bindingtype!]} 
                        readOnly 
                        className={styles.disabledInput}
                    />
                </Field>
            </div>

            {(api.bindingtype === 1  || api.bindingtype === 2) && (
                <div className={styles.formSection}>
                    <Field label={
                        <span className={styles.fieldLabelStandard}>
                            Bound Entity Logical Name <LockClosed16Regular />
                        </span>}
                    >
                        <Input 
                            appearance='filled-darker'
                            value={api.boundentitylogicalname || ''} 
                            readOnly 
                            className={styles.disabledInput}
                        />
                    </Field>
                </div>
            )}

            

           

            <div className={mergeClasses(styles.formSection,styles.twoColumn)}>
                <Field label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Plugin Type</span></span>}>
                    {pluginTypesQuery.isFetching && (
                        <Input value="Loading plugintypes..." readOnly appearance='filled-darker' />
                    )}
                    {pluginTypesQuery.error && (
                        <Input
                            value={`Error loading privileges: ${pluginTypesQuery.error.message}`}
                            readOnly
                            
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
                            initialValue={editedData._plugintypeid_value}
                            isDisabled={false}
                            onSelect={(id) => 
                                
                                updateFields((next) => {
                                        next._plugintypeid_value = id || '';
                                    }
                                )

                            }
                        />
                    )}
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Execute Privilege Name</span></span>}>
                    {privilegesQuery.isFetching && (
                        <Input value="Loading privileges..." readOnly appearance='filled-darker' />
                    )}
                    {privilegesQuery.error && (
                        <Input
                            value={`Error loading privileges: ${privilegesQuery.error.message}`}
                            readOnly
                            
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
                            initialValue={privilegesQuery.privileges?.find((priv) => priv.name === editedData.executeprivilegename)?.privilegeid}
                            isDisabled={false}
                            onSelect={(id) => {
                                const selected = privilegesQuery.privileges?.find((priv) => priv.privilegeid === id);
                                updateFields((next) => {
                                        next.executeprivilegename = selected?.name || '';
                                    }
                                )
                            }}
                        />
                    )}
                </Field>
            </div>



            <div className={styles.formSection}>
                <div className={styles.switchColumn}>
                    <Tooltip content={api.isfunction ? 'True' : 'False'} relationship='description' positioning='above-end'>
                        <div className={styles.switchRow}>
                            <Switch
                                
                                checked={api.isfunction}
                                aria-disabled={true}
                                tabIndex={-1}
                                className={styles.readOnlySwitch}
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
                    <Tooltip content={api.workflowsdkstepenabled ? 'True' : 'False'} relationship='description' positioning='above-end'>
                        <div className={styles.switchRow}>
                            <Switch
                                checked={api.workflowsdkstepenabled}
                                aria-disabled={true}
                                tabIndex={-1}
                                className={styles.readOnlySwitch}
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
                    <Tooltip content={editedData.isprivate ? 'True' : 'False'} relationship='description' positioning='above-end'>
                        <div className={styles.switchRow}>
                            <Switch
                                checked={editedData.isprivate}
                                onChange={(_, data) => 
                                    updateFields((next) => {
                                            next.isprivate = data.checked;
                                        }
                                    )
                                }
                                //className={styles.readOnlySwitch}
                                tabIndex={-1}
                                label={
                                    <span 
                                        ref={privateLabelRef}
                                        className={mergeClasses(styles.readOnlySwitchLabel,styles.semiBoldLabel)}
                                        style={column2Style}
                                    >
                                        Is Private</span>}
                                labelPosition="before"
                            />
                        </div>
                    </Tooltip>
                    
                </div>
            </div>
            
                

        </div>
    );
};
