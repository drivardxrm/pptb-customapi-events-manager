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
                    <Input value={property.uniquename || ''} readOnly appearance='filled-darker' />
                </Field>

                <Field label="Name">
                    <Input value={property.name || ''} readOnly appearance='filled-darker' />
                </Field>

                <Field label="Display Name">
                    <Input value={property.displayname || ''} readOnly appearance='filled-darker' />
                </Field>

                <Field label="Description">
                    <Textarea
                        value={property.description || ''}
                        readOnly
                        appearance='filled-darker'
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
                        appearance='filled-darker'
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
                        <Input 
                            value={property.logicalentityname || 'expando'} 
                            readOnly 
                            appearance='filled-darker' />
                    </Field>
                }
                

                
            </div>
        </div>
        

    );
};
