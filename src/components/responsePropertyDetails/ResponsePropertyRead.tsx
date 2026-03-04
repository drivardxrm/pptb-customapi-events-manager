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
                        <span className={styles.fieldLabelStandard}>
                            Unique Name <LockClosed16Regular />
                        </span>
                    }
                >
                    <Input value={property.uniquename || ''} readOnly appearance='filled-darker' />
                </Field>

                <Field label={<span className={styles.fieldLabelStandard}>Name</span>}>
                    <Input value={property.name || ''} readOnly appearance='filled-darker' />
                </Field>

                <Field label={<span className={styles.fieldLabelStandard}>Display Name</span>}>
                    <Input value={property.displayname || ''} readOnly appearance='filled-darker' />
                </Field>

                <Field label={<span className={styles.fieldLabelStandard}>Description</span>}>
                    <Textarea
                        value={property.description || ''}
                        readOnly
                        spellCheck={false}
                        appearance='filled-darker'
                        resize="vertical"
                        rows={2}
                    />
                </Field>

                <Field
                    label={
                        <span className={styles.fieldLabelStandard}>
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
                            <span className={styles.fieldLabelStandard}>
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
