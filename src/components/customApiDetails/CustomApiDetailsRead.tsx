import React, { useMemo, useRef } from 'react';
import { Field, Input, Textarea, Switch, Tooltip, mergeClasses } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { useDynamicColumnWidths } from '../../hooks/useDynamicColumnWidths';
import { CustomApi, Customapisallowedcustomprocessingsteptype, Customapisbindingtype, allowedCustomProcessingStepTypeIcons, customapisBindingTypeIcons } from '../../models/CustomApi';

interface CustomApiDetailsReadProps {
    api: CustomApi;
}

export const CustomApiDetailsRead: React.FC<CustomApiDetailsReadProps> = ({ api }) => {
    const styles = useStyles();
    const functionLabelRef = useRef<HTMLSpanElement | null>(null);
    const workflowLabelRef = useRef<HTMLSpanElement | null>(null);
    const privateLabelRef = useRef<HTMLSpanElement | null>(null);

    const columnRefGroups = useMemo(
        () => [
            [functionLabelRef, workflowLabelRef],
            [privateLabelRef],
        ],
        []
    );

    const [column1Width, column2Width] = useDynamicColumnWidths(columnRefGroups);
    const column1Style = column1Width ? { minWidth: `${column1Width}px` } : undefined;
    const column2Style = column2Width ? { minWidth: `${column2Width}px` } : undefined;

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
                    <Input value={api.uniquename || ''} readOnly appearance='filled-darker' />
                </Field>
            </div>

           

            <div className={styles.formSection}>
                <Field label={<span className={styles.fieldLabelStandard}>Name</span>}>
                    <Input value={api.name || ''} readOnly appearance='filled-darker' />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={<span className={styles.fieldLabelStandard}>Display Name</span>}>
                    <Input value={api.displayname || ''} readOnly appearance='filled-darker' />
                </Field>
            </div>

            <div className={mergeClasses(styles.formSection, styles.fullWidth)}>
                <Field label={<span className={styles.fieldLabelStandard}>Description</span>}>
                    <Textarea
                        value={api.description || ''}
                        readOnly
                        spellCheck={false}
                        appearance='filled-darker'
                        resize="vertical"
                        rows={2}
                    />
                </Field>
            </div>

             <div className={styles.formSection}>
                <Field
                    label={
                        <span className={styles.fieldLabelStandard}>
                            Allowed Custom Processing Step Type <LockClosed16Regular />
                        </span>
                    }
                >
                    <Input
                        contentBefore={allowedCustomProcessingStepTypeIcons[api.allowedcustomprocessingsteptype!]}
                        value={Customapisallowedcustomprocessingsteptype[api.allowedcustomprocessingsteptype!]}
                        readOnly
                        appearance='filled-darker'
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field
                    label={
                        <span className={styles.fieldLabelStandard}>
                            Binding Type <LockClosed16Regular />
                        </span>
                    }
                >
                    <Input
                        contentBefore={customapisBindingTypeIcons[api.bindingtype!]}
                        value={Customapisbindingtype[api.bindingtype!]}
                        readOnly
                        appearance='filled-darker'
                    />
                </Field>
            </div>

            {(api.bindingtype === 1  || api.bindingtype === 2) && (
                <div className={styles.formSection}>
                    <Field
                        label={
                            <span className={styles.fieldLabelStandard}>
                                Bound Entity Logical Name <LockClosed16Regular />
                            </span>
                        }
                    >
                        <Input value={api.boundentitylogicalname || ''} readOnly appearance='filled-darker' />
                    </Field>
                </div>
            )}

           

            

            <div className={mergeClasses(styles.formSection, styles.twoColumn)}>
                <Field label={<span className={styles.fieldLabelStandard}>Plugin Type</span>}>
                    <Input
                        value={api['_plugintypeid_value@OData.Community.Display.V1.FormattedValue']}
                        readOnly
                        appearance='filled-darker'
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label={<span className={styles.fieldLabelStandard}>Execute Privilege Name</span>}>
                    <Input value={api.executeprivilegename || ''} readOnly appearance='filled-darker' />
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
                    <Tooltip content={api.isprivate ? 'True' : 'False'} relationship='description' positioning='above-end'>
                        <div className={styles.switchRow}>
                            <Switch
                                checked={api.isprivate}
                                aria-disabled={true}
                                tabIndex={-1}
                                className={styles.readOnlySwitch}
                                label={
                                    <span
                                        ref={privateLabelRef}
                                        className={styles.readOnlySwitchLabel}
                                        style={column2Style}
                                    >
                                        Is Private
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
