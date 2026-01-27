import React, { useMemo, useRef } from 'react';
import { Field, Input, Textarea, Switch, Tooltip } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { CustomApiRequestParameter, Customapirequestparameterstype, CustomApiRequestParameterUpdateable } from '../../models/CustomApiRequestParameter';
import { useDynamicColumnWidths } from '../../hooks/useDynamicColumnWidths';
import { produce } from 'immer';

interface RequestParameterEditProps {
    parameter: CustomApiRequestParameter;
    editedData: CustomApiRequestParameterUpdateable;
    onChange: (updater: (current: CustomApiRequestParameterUpdateable) => CustomApiRequestParameterUpdateable) => void;
}

export const RequestParameterEdit: React.FC<RequestParameterEditProps> = ({ parameter, editedData, onChange }) => {
    const styles = useStyles();
    const isOptionalLabelRef = useRef<HTMLSpanElement | null>(null);
    const customizableLabelRef = useRef<HTMLSpanElement | null>(null);
    const columnRefGroups = useMemo(
        () => [
            [isOptionalLabelRef, customizableLabelRef]
        ],
        []
    );

    const [column1Width ] = useDynamicColumnWidths(columnRefGroups);
    const column1Style = column1Width ? { minWidth: `${column1Width}px` } : undefined;


    // Helper to update fields, can change multiple fields at once
    const updateFields = (updater: (draft: CustomApiRequestParameterUpdateable) => void) => {
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
                >
                    <Input 
                        value={parameter.uniquename || ''} 
                        readOnly 
                        className={styles.disabledInput}
                        appearance='filled-darker' />
                </Field>

                <Field label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Name</span></span>}>
                    <Input
                        value={editedData.name ?? ''}
                        onChange={(event) => updateFields((draft) => {
                            draft.name = event.target.value ?? '';
                        })}
                        appearance='filled-darker'
                    />
                </Field>

                <Field label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Display Name</span></span>}>
                    <Input
                        value={editedData.displayname ?? ''}
                        onChange={(event) => updateFields((draft) => {
                            draft.displayname = event.target.value ?? '';
                        })}
                        appearance='filled-darker'
                    />
                </Field>

                <Field label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Description</span></span>}>
                    <Textarea
                        value={editedData.description ?? ''}
                        onChange={(event) => updateFields((draft) => {
                            draft.description = event.target.value ?? '';
                        })}
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
                        value={Customapirequestparameterstype[parameter.type]}
                        readOnly
                        appearance='filled-darker'
                    />
                </Field>
                {(Customapirequestparameterstype[parameter.type] === 'Entity' ||
                    Customapirequestparameterstype[parameter.type] === 'EntityReference') &&
                    <Field
                        label={
                            <span className={styles.fieldLabelStandard}>
                                Logical Entity Name <LockClosed16Regular />
                            </span>
                        }
                    >
                        <Input 
                            value={parameter.logicalentityname || 'expando'} 
                            readOnly
                            appearance='filled-darker' />
                    </Field>
                }
                

                <div className={styles.switchColumn}>
                    <Tooltip content={parameter.isoptional ? 'True' : 'False'} relationship='description' positioning='above-end'>
                        <div className={styles.switchRow}>
                            <Switch
                                checked={parameter.isoptional}
                                aria-disabled={true}
                                tabIndex={-1}
                                className={styles.readOnlySwitch}
                                label={
                                    <span
                                        ref={isOptionalLabelRef}
                                        className={styles.readOnlySwitchLabel}
                                        style={column1Style}
                                    >
                                        <span>Is Optional</span>
                                        <LockClosed16Regular />
                                    </span>
                                }
                                labelPosition="before"
                            />
                        </div>
                    </Tooltip>
                    
                </div>
            </div>
        </div>

    );
};
