import React from 'react';
import { Field, Input, Textarea, Switch } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { CustomApi, Customapisallowedcustomprocessingsteptype, Customapisbindingtype } from '../../models/CustomApi';


interface CustomApiDetailsReadProps {
    api: CustomApi;
}

export const CustomApiDetailsRead: React.FC<CustomApiDetailsReadProps> = ({ api }) => {
    const styles = useStyles();


    return (
        <div className={styles.formGrid}>
            <div className={styles.formSection}>
                <Field label={
                    <span className={styles.label}>
                        Unique Name <LockClosed16Regular />
                    </span>
                }>
                    <Input
                        value={api.uniquename || ''}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label="Display Name">
                    <Input
                        value={api.displayname || ''}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label="Name">
                    <Input
                        value={api.name || ''}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </Field>
            </div>

            <div className={`${styles.formSection} ${styles.fullWidth}`}>
                <Field label="Description">
                    <Textarea
                        value={api.description || ''}
                        readOnly
                        className={styles.readOnlyInput}
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
                    <Input
                        value={Customapisbindingtype[api.bindingtype]}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </Field>
            </div>

            {api.bindingtype === 1 && (
                <div className={styles.formSection}>
                    <Field label={
                        <span className={styles.label}>
                            Bound Entity Logical Name <LockClosed16Regular />
                        </span>}
                    >
                        <Input
                            value={api.boundentitylogicalname || ''}
                            readOnly
                            className={styles.readOnlyInput}
                        />
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
                    <Input
                        value={api.executeprivilegename || ''}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={
                    <span className={styles.label}>
                        Is Function <LockClosed16Regular />
                    </span>
                }>
                    <Switch checked={api.isfunction} disabled />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={
                    <span className={styles.label}>
                        Workflow SDK Step Enabled <LockClosed16Regular />
                    </span>
                }>
                    <Switch checked={api.workflowsdkstepenabled} disabled />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label="Is Private">
                    <Switch checked={api.isprivate} disabled />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label="Is Customizable">
                    <Switch checked={api.iscustomizable} disabled />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label="Plugin Type">
                    <Input
                        value={api['_plugintypeid_value@OData.Community.Display.V1.FormattedValue']}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </Field>
            </div>
        </div>
    );
};
