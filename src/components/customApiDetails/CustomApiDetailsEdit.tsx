import React, { useMemo, useRef } from 'react';
import { Field, Input, Textarea, Switch, mergeClasses, Tooltip } from '@fluentui/react-components';
import { LockClosed16Regular, LockOpen16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { CustomApi, CustomApiUpdateable, Customapisallowedcustomprocessingsteptype, Customapisbindingtype } from '../../models/CustomApi';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { usePrivileges } from '../../hooks/usePrivileges';
import { usePluginTypes } from '../../hooks/usePluginTypes';
import { useDynamicColumnWidths } from '../../hooks/useDynamicColumnWidths';

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
        const customizableLabelRef = useRef<HTMLSpanElement | null>(null);
        const columnRefGroups = useMemo(
            () => [
                [functionLabelRef, workflowLabelRef],
                [privateLabelRef, customizableLabelRef],
            ],
            []
        );
    
        const [column1Width, column2Width] = useDynamicColumnWidths(columnRefGroups);
        const column1Style = column1Width ? { minWidth: `${column1Width}px` } : undefined;
        const column2Style = column2Width ? { minWidth: `${column2Width}px` } : undefined;


    const updateField = <K extends keyof CustomApiUpdateable>(field: K, value: CustomApiUpdateable[K]) => {
        onChange((current) => ({ ...current, [field]: value }));
    };

    return (
        <div className={styles.formGrid}>
            <div className={styles.formSection}>
                <Field label={
                    <span className={styles.label}>
                        Unique Name <LockClosed16Regular />
                    </span>
                }>
                    <Input value={api.uniquename || ''} readOnly className={styles.readOnlyInput} />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={<span className={styles.editableLabel}>Display Name</span>}>
                    <Input
                        value={editedData.displayname ?? ''}
                        onChange={(event) => updateField('displayname', event.target.value || '')}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={<span className={styles.editableLabel}>Name</span>}>
                    <Input
                        value={editedData.name ?? ''}
                        onChange={(event) => updateField('name', event.target.value || '')}
                    />
                </Field>
            </div>

            <div className={mergeClasses(styles.formSection,styles.fullWidth)}>
                <Field label={<span className={styles.editableLabel}>Description</span>}>
                    <Textarea
                        value={editedData.description ?? ''}
                        onChange={(event) => updateField('description', event.target.value || '')}
                        resize="vertical"
                        rows={2}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={
                    <span className={styles.label}>
                        Allowed Custom Processing Step Type <LockClosed16Regular />
                    </span>}
                >
                    <Input
                        value={Customapisallowedcustomprocessingsteptype[api.allowedcustomprocessingsteptype]}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={
                    <span className={styles.label}>
                        Binding Type <LockClosed16Regular />
                    </span>}
                >
                    <Input value={Customapisbindingtype[api.bindingtype]} readOnly className={styles.readOnlyInput} />
                </Field>
            </div>

            {api.bindingtype === 1 && (
                <div className={styles.formSection}>
                    <Field label={
                        <span className={styles.label}>
                            Bound Entity Logical Name <LockClosed16Regular />
                        </span>}
                    >
                        <Input value={api.boundentitylogicalname || ''} readOnly className={styles.readOnlyInput} />
                    </Field>
                </div>
            )}

            

           

            <div className={mergeClasses(styles.formSection,styles.twoColumn)}>
                <Field label={<span className={styles.editableLabel}>Plugin Type</span>}>
                    {pluginTypesQuery.isFetching && (
                        <Input value="Loading plugintypes..." readOnly className={styles.readOnlyInput} />
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
                            items={pluginTypesQuery.plugintypes
                                .map((type) => ({
                                    id: type.plugintypeid,
                                    displayText: type.typename || '',
                                    image: type.ismanaged ? <LockClosed16Regular /> : <LockOpen16Regular />,
                                } as SelectableItem))
                                .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                            initialValue={editedData._plugintypeid_value}
                            isDisabled={false}
                            onSelect={(id) => updateField('_plugintypeid_value', id || '')}
                        />
                    )}
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={<span className={styles.editableLabel}>Execute Privilege Name</span>}>
                    {privilegesQuery.isFetching && (
                        <Input value="Loading privileges..." readOnly className={styles.readOnlyInput} />
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
                            items={privilegesQuery.privileges
                                .map((privilege) => ({
                                    id: privilege.privilegeid,
                                    displayText: privilege.name || '',
                                } as SelectableItem))
                                .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                            initialValue={editedData.executeprivilegename}
                            isDisabled={false}
                            onSelect={(id) => {
                                const selected = privilegesQuery.privileges?.find((priv) => priv.privilegeid === id);
                                updateField('executeprivilegename', selected?.name || '');
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
                                onChange={(_, data) => updateField('isprivate', data.checked)}
                                className={styles.readOnlySwitch}
                                tabIndex={-1}
                                label={
                                    <span 
                                        ref={privateLabelRef}
                                        className={mergeClasses(styles.readOnlySwitchLabel,styles.editableLabel)}
                                        style={column2Style}
                                    >
                                        Is Private</span>}
                                labelPosition="before"
                            />
                        </div>
                    </Tooltip>
                    <Tooltip content={editedData.iscustomizable ? 'True' : 'False'} relationship='description' positioning='above-end'>
                        <div className={styles.switchRow}>
                            <Switch
                                checked={editedData.iscustomizable}
                                onChange={(_, data) => updateField('iscustomizable', data.checked)}
                                tabIndex={-1}
                                className={styles.readOnlySwitch}
                                label={
                                    <span 
                                        ref={customizableLabelRef}
                                        className={mergeClasses(styles.readOnlySwitchLabel,styles.editableLabel)}
                                        style={column2Style}
                                    >
                                        Is Customizable
                                    </span>}
                                labelPosition="before"
                            />
                        </div>
                    </Tooltip>
                </div>
            </div>
            
                

        </div>
    );
};
