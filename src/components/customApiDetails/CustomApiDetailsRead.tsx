import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Field, Input, Textarea, Switch, Tooltip, mergeClasses } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { CustomApi, Customapisallowedcustomprocessingsteptype, Customapisbindingtype } from '../../models/CustomApi';

interface CustomApiDetailsReadProps {
    api: CustomApi;
}

export const CustomApiDetailsRead: React.FC<CustomApiDetailsReadProps> = ({ api }) => {
    const styles = useStyles();
    const functionLabelRef = useRef<HTMLSpanElement | null>(null);
    const workflowLabelRef = useRef<HTMLSpanElement | null>(null);
    const privateLabelRef = useRef<HTMLSpanElement | null>(null);
    const customizableLabelRef = useRef<HTMLSpanElement | null>(null);
    const [columnWidths, setColumnWidths] = useState({ left: 0, right: 0 });

    const measureLabel = useCallback((ref: React.RefObject<HTMLSpanElement | null>) => {
        if (!ref.current) {
            return 0;
        }
        const previousMinWidth = ref.current.style.minWidth;
        ref.current.style.minWidth = '0px';
        const width = ref.current.getBoundingClientRect().width;
        ref.current.style.minWidth = previousMinWidth;
        return width;
    }, []);

    const updateColumnWidths = useCallback(() => {
        const left = Math.max(
            measureLabel(functionLabelRef),
            measureLabel(workflowLabelRef)
        );
        const right = Math.max(
            measureLabel(privateLabelRef),
            measureLabel(customizableLabelRef)
        );

        const paddedLeft = left ? Math.ceil(left + 15) : 0;
        const paddedRight = right ? Math.ceil(right + 15) : 0;

        setColumnWidths((prev) => {
            if (prev.left === paddedLeft && prev.right === paddedRight) {
                return prev;
            }
            return { left: paddedLeft, right: paddedRight };
        });
    }, [measureLabel]);

    useLayoutEffect(() => {
        updateColumnWidths();
    }, [updateColumnWidths]);

    useEffect(() => {
        window.addEventListener('resize', updateColumnWidths);
        return () => {
            window.removeEventListener('resize', updateColumnWidths);
        };
    }, [updateColumnWidths]);

    const leftColumnStyle = columnWidths.left
        ? { minWidth: `${columnWidths.left}px` }
        : undefined;
    const rightColumnStyle = columnWidths.right
        ? { minWidth: `${columnWidths.right}px` }
        : undefined;

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
                    <Input value={api.uniquename || ''} readOnly className={styles.readOnlyInput} />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label="Display Name">
                    <Input value={api.displayname || ''} readOnly className={styles.readOnlyInput} />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label="Name">
                    <Input value={api.name || ''} readOnly className={styles.readOnlyInput} />
                </Field>
            </div>

            <div className={mergeClasses(styles.formSection, styles.fullWidth)}>
                <Field label="Description">
                    <Textarea
                        value={api.description || ''}
                        readOnly
                        className={styles.readOnlyInput}
                        resize="vertical"
                        rows={2}
                    />
                </Field>
            </div>

             <div className={styles.formSection}>
                <Field
                    label={
                        <span className={styles.label}>
                            Allowed Custom Processing Step Type <LockClosed16Regular />
                        </span>
                    }
                >
                    <Input
                        value={Customapisallowedcustomprocessingsteptype[api.allowedcustomprocessingsteptype]}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field
                    label={
                        <span className={styles.label}>
                            Binding Type <LockClosed16Regular />
                        </span>
                    }
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
                    <Field
                        label={
                            <span className={styles.label}>
                                Bound Entity Logical Name <LockClosed16Regular />
                            </span>
                        }
                    >
                        <Input value={api.boundentitylogicalname || ''} readOnly className={styles.readOnlyInput} />
                    </Field>
                </div>
            )}

           

            

            <div className={mergeClasses(styles.formSection, styles.twoColumn)}>
                <Field label="Plugin Type">
                    <Input
                        value={api['_plugintypeid_value@OData.Community.Display.V1.FormattedValue']}
                        readOnly
                        className={styles.readOnlyInput}
                    />
                </Field>
            </div>

            <div className={styles.formSection}>
                <Field label="Execute Privilege Name">
                    <Input value={api.executeprivilegename || ''} readOnly className={styles.readOnlyInput} />
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
                                        style={leftColumnStyle}
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
                                        style={leftColumnStyle}
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
                                        style={rightColumnStyle}
                                    >
                                        Is Private
                                    </span>
                                }
                                labelPosition="before"
                            />
                        </div>
                    </Tooltip>
                    <Tooltip content={api.iscustomizable ? 'True' : 'False'} relationship='description' positioning='above-end'>
                        <div className={styles.switchRow}>
                            <Switch
                                checked={api.iscustomizable}
                                aria-disabled={true}
                                tabIndex={-1}
                                className={styles.readOnlySwitch}
                                label={
                                    <span
                                        ref={customizableLabelRef}
                                        className={styles.readOnlySwitchLabel}
                                        style={rightColumnStyle}
                                    >
                                        Is Customizable
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
