import React, { useMemo, useRef } from 'react';
import { Field, Input, Textarea, Switch, Tooltip } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { CustomApiRequestParameter, Customapirequestparameterstype } from '../../models/CustomApiRequestParameter';
import { useDynamicColumnWidths } from '../../hooks/useDynamicColumnWidths';

interface RequestParameterDetailsReadProps {
    parameter: CustomApiRequestParameter;
}

export const RequestParameterRead: React.FC<RequestParameterDetailsReadProps> = ({ parameter }) => {
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
                    <Input value={parameter.uniquename || ''} readOnly className={styles.readOnlyInput} />
                </Field>

                <Field label="Name">
                    <Input value={parameter.name || ''} readOnly className={styles.readOnlyInput} />
                </Field>

                <Field label="Display Name">
                    <Input value={parameter.displayname || ''} readOnly className={styles.readOnlyInput} />
                </Field>

                <Field label="Description">
                    <Textarea
                        value={parameter.description || ''}
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
                        value={Customapirequestparameterstype[parameter.type]}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </Field>
                {(Customapirequestparameterstype[parameter.type] === 'Entity' ||
                    Customapirequestparameterstype[parameter.type] === 'EntityReference') &&
                    <Field
                        label={
                            <span className={styles.label}>
                                Logical Entity Name <LockClosed16Regular />
                            </span>
                        }
                    >
                        <Input value={parameter.logicalentityname || ''} readOnly className={styles.readOnlyInput} />
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
