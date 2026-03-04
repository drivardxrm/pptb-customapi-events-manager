import React from 'react';
import { Field, Input, Textarea } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { Customapiresponsepropertiestype, CustomApiResponseProperty, CustomApiResponsePropertyUpdateable } from '../../models/CustomApiResponseProperty';
import { produce } from 'immer';

interface ResponsePropertyEditProps {
    property: CustomApiResponseProperty;
    editedData: CustomApiResponsePropertyUpdateable;
    onChange: (updater: (current: CustomApiResponsePropertyUpdateable) => CustomApiResponsePropertyUpdateable) => void;
}

export const ResponsePropertyEdit: React.FC<ResponsePropertyEditProps> = ({ property, editedData, onChange }) => {
    const styles = useStyles();
    
    // Helper to update fields, can change multiple fields at once
    const updateFields = (updater: (draft: CustomApiResponsePropertyUpdateable) => void) => {
        onChange(current => produce(current, draft => updater(draft)));
    };

    return (
        <div className={styles.formGrid}>
            <div className={styles.formSection}>
                <Field
                    label={
                        <span className={styles.fieldLabelStandard}>
                            Unique Name <LockClosed16Regular />
                        </span>
                    }
                    required
                >
                    <Input 
                        value={property.uniquename || ''} 
                        readOnly
                        appearance='filled-darker' 
                        className={styles.disabledInput}
                    />
                </Field>

                <Field label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Name</span></span>}>
                    <Input
                        value={editedData.name ?? ''}
                        onChange={(event) =>
                            updateFields((draft) => {
                                draft.name = event.target.value ?? '';
                            })
                        }
                        appearance='filled-darker'
                    />
                </Field>

                <Field label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Display Name</span></span>}>
                    <Input
                        value={editedData.displayname ?? ''}
                        onChange={(event) =>
                            updateFields((draft) => {
                                draft.displayname = event.target.value ?? '';
                            })
                            
                        }
                        appearance='filled-darker'
                    />
                </Field>

                <Field label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Description</span></span>}>
                    <Textarea
                        spellCheck={false}
                        value={editedData.description ?? ''}
                        onChange={(event) =>
                            updateFields((draft) => {
                                draft.description = event.target.value ?? '';
                            })
                        }
                        resize="vertical"
                        rows={2}
                        appearance='filled-darker'
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
                            className={styles.disabledInput}
                            appearance='filled-darker' 
                        />
                    </Field>
                }
                

                
            </div>
        </div>

    );
};
