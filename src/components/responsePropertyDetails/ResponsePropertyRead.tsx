import React from 'react';
import { Field, Input, Textarea } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { Customapiresponsepropertiestype, CustomApiResponseProperty } from '../../models/CustomApiResponseProperty';

interface ResponsePropertyReadProps {
    property: CustomApiResponseProperty;
}

export const ResponsePropertyRead: React.FC<ResponsePropertyReadProps> = ({ property }) => {
    const styles = useStyles();

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

                <Field label="Name">
                    <Input value={property.name || ''} readOnly className={styles.readOnlyInput} />
                </Field>

                <Field label="Display Name">
                    <Input value={property.displayname || ''} readOnly className={styles.readOnlyInput} />
                </Field>

                <Field label="Description">
                    <Textarea
                        value={property.description || ''}
                        readOnly
                        className={styles.readOnlyInput}
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
