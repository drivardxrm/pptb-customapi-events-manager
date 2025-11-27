import React from 'react';
import { Field, Input, Textarea, Switch } from '@fluentui/react-components';
import { LockClosed16Regular, LockOpen16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { CustomApi, CustomApiUpdateable, Customapisallowedcustomprocessingsteptype, Customapisbindingtype } from '../../models/CustomApi';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { usePrivileges } from '../../hooks/usePrivileges';
import { usePluginTypes } from '../../hooks/usePluginTypes';

interface CustomApiDetailsEditProps {
    api: CustomApi;
    editedData: CustomApiUpdateable;
    onChange: (updater: (current: CustomApiUpdateable) => CustomApiUpdateable) => void;
}

export const CustomApiDetailsEdit: React.FC<CustomApiDetailsEditProps> = ({ api, editedData, onChange }) => {
    const styles = useStyles();
    const privilegesQuery = usePrivileges();
    const pluginTypesQuery = usePluginTypes();

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
                <Field label="Display Name">
                    <Input
                        value={editedData.displayname ?? ''}
                        onChange={(event) => updateField('displayname', event.target.value || '')}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label="Name">
                    <Input
                        value={editedData.name ?? ''}
                        onChange={(event) => updateField('name', event.target.value || '')}
                    />
                </Field>
            </div>

            <div className={`${styles.formSection} ${styles.fullWidth}`}>
                <Field label="Description">
                    <Textarea
                        value={editedData.description ?? ''}
                        onChange={(event) => updateField('description', event.target.value || '')}
                        resize="vertical"
                        rows={3}
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
                <Field label="Execute Privilege Name">
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
                <Field label="Is Private">
                    <Switch
                        checked={editedData.isprivate}
                        onChange={(_, data) => updateField('isprivate', data.checked)}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label="Is Customizable">
                    <Switch
                        checked={editedData.iscustomizable}
                        onChange={(_, data) => updateField('iscustomizable', data.checked)}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label="Plugin Type">
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
        </div>
    );
};
