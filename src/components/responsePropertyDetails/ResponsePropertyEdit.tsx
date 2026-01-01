import React from 'react';
import { Field, Input, Textarea } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { Customapiresponsepropertiestype, CustomApiResponseProperty, CustomApiResponsePropertyUpdateable } from '../../models/CustomApiResponseProperty';

interface ResponsePropertyEditProps {
    property: CustomApiResponseProperty;
    editedData: CustomApiResponsePropertyUpdateable;
    onChange: (updater: (current: CustomApiResponsePropertyUpdateable) => CustomApiResponsePropertyUpdateable) => void;
}

export const ResponsePropertyEdit: React.FC<ResponsePropertyEditProps> = ({ property, editedData, onChange }) => {
    const styles = useStyles();
    const updateField = <K extends keyof CustomApiResponsePropertyUpdateable>(field: K, value: CustomApiResponsePropertyUpdateable[K]) => {
        onChange((current) => ({ ...current, [field]: value }));
    };
    

    return (
        <div className={styles.formGrid}>
            <div className={styles.formSection}>
                <Field
                    label={
                        <span className={styles.label}>
                            Unique Name <LockClosed16Regular />
                        </span>
                    }
                >
                    <Input value={property.uniquename || ''} readOnly className={styles.readOnlyInput} />
                </Field>

                <Field label={<span className={styles.semiBoldLabel}>Name</span>}>
                    <Input
                        value={editedData.name ?? ''}
                        onChange={(event) => updateField('name', event.target.value || '')}
                    />
                </Field>

                <Field label={<span className={styles.semiBoldLabel}>Display Name</span>}>
                    <Input
                        value={editedData.displayname ?? ''}
                        onChange={(event) => updateField('displayname', event.target.value || '')}
                    />
                </Field>

                <Field label={<span className={styles.semiBoldLabel}>Description</span>}>
                    <Textarea
                        value={editedData.description ?? ''}
                        onChange={(event) => updateField('description', event.target.value || '')}
                        resize="vertical"
                        rows={2}
                    />
                </Field>

                <Field
                    label={
                        <span className={styles.label}>
                            Type <LockClosed16Regular />
                        </span>
                    }
                >
                    <Input
                        value={Customapiresponsepropertiestype[property.type]}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </Field>
                {(Customapiresponsepropertiestype[property.type] === 'Entity' ||
                    Customapiresponsepropertiestype[property.type] === 'EntityReference') &&
                    <Field
                        label={
                            <span className={styles.label}>
                                Logical Entity Name <LockClosed16Regular />
                            </span>
                        }
                    >
                        <Input value={property.logicalentityname || 'expando'} readOnly className={styles.readOnlyInput} />
                    </Field>
                }
                

                
            </div>
        </div>

    );
};
