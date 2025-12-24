import React, {  useCallback, useMemo, useRef } from 'react';
import { Field, Input, Textarea, Switch, Tooltip } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import {  CustomApiRequestParameterCreateable, Customapirequestparameterstype, getCustomApiRequestParametersTypeOptions } from '../../models/CustomApiRequestParameter';
import { useDynamicColumnWidths } from '../../hooks/useDynamicColumnWidths';
import { useAppSettings } from '../../hooks/useAppSettings';
import { useCustomApis } from '../../hooks/useCustomApis';
import { useAppStore } from '../../store/useAppStore';
import { GenericTagPicker } from '../generic/GenericTagPicker';

interface RequestParameterCreateProps {
    createData: CustomApiRequestParameterCreateable;
    onChange: (updater: (current: CustomApiRequestParameterCreateable) => CustomApiRequestParameterCreateable) => void;
}

export const RequestParameterCreate: React.FC<RequestParameterCreateProps> = ({ createData, onChange }) => {
    const styles = useStyles();
    const isOptionalLabelRef = useRef<HTMLSpanElement | null>(null);
    const customizableLabelRef = useRef<HTMLSpanElement | null>(null);
    const columnRefGroups = useMemo(
        () => [
            [isOptionalLabelRef, customizableLabelRef]
        ],
        []
    );

    const [ column1Width ] = useDynamicColumnWidths(columnRefGroups);
    const column1Style = column1Width ? { minWidth: `${column1Width}px` } : undefined;
    const customApiQuery = useCustomApis();
    const settingsQuery = useAppSettings();
    const { selectedCustomApiId } = useAppStore();


    const updateField = <K extends keyof CustomApiRequestParameterCreateable>(field: K, value: CustomApiRequestParameterCreateable[K]) => {
        onChange((current) => ({ ...current, [field]: value }));
    };

    const buildDefaultName = useCallback(
        (uniquename: string) => {
            
            const selectedCustomApi = customApiQuery.customapis?.find(
                api => api.customapiid === selectedCustomApiId
            );

            if (selectedCustomApi && settingsQuery.appsettings?.requestParameterDefaultName) {
            return settingsQuery.appsettings.requestParameterDefaultName
                .replace('{customapiname}', selectedCustomApi.name ?? '')
                .replace('{uniquename}', uniquename);
            }

            return uniquename;
        },
        [selectedCustomApiId, customApiQuery.customapis, settingsQuery.appsettings]
    );

    
    if(!settingsQuery.appsettings || !customApiQuery.customapis) {
        return <>Loading...</>;
    }
    return (
        <div className={styles.formGrid}>
            <div className={styles.formSection}>
                

                <Field
                    label={
                        <span className={styles.semiBoldLabel}>
                            Unique Name <LockClosed16Regular />
                        </span>
                    }
                >
                    <Input
                        value={createData.uniquename ?? ''}
                        onChange={(event) => 
                            {
                                var previousUniquename = createData.uniquename ?? '';
                                var previousDefaultName = buildDefaultName(previousUniquename);
                                
                                updateField('uniquename', event.target.value || '')
                                
                                if(createData.name === '' || createData.name === previousDefaultName) {
                                    updateField('name', buildDefaultName(event.target.value) || '');
                                }
                                if(createData.displayname === '' || createData.displayname === previousDefaultName) {
                                    updateField('displayname', buildDefaultName(event.target.value) || '');
                                }
                                
                            }
                        }
                    />
                </Field>

                <Field label={<span className={styles.semiBoldLabel}>Name</span>}>
                    <Input
                        value={createData.name ?? ''}
                        onChange={(event) => updateField('name', event.target.value || '')}
                    />
                </Field>

                <Field label={<span className={styles.semiBoldLabel}>Display Name</span>}>
                    <Input
                        value={createData.displayname ?? ''}
                        onChange={(event) => updateField('displayname', event.target.value || '')}
                    />
                </Field>

                <Field label={<span className={styles.semiBoldLabel}>Description</span>}>
                    <Textarea
                        value={createData.description ?? ''}
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
                    <GenericTagPicker
                        items={
                            getCustomApiRequestParametersTypeOptions()
                                .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                        initialValue={createData.type.toString()}
                        isDisabled={false}
                        onSelect={(id) => updateField('type', Number(id) as Customapirequestparameterstype)}
                    />
                </Field>


                {(Customapirequestparameterstype[createData.type] === 'Entity' ||
                    Customapirequestparameterstype[createData.type] === 'EntityReference') &&
                    <Field
                        label={
                            <span className={styles.label}>
                                Logical Entity Name <LockClosed16Regular />
                            </span>
                        }
                    >
                        <Input value={createData.logicalentityname || ''} readOnly className={styles.readOnlyInput} />
                    </Field>
                }
                

                <div className={styles.switchColumn}>
                    <Tooltip content={createData.isoptional ? 'True' : 'False'} relationship='description' positioning='above-end'>
                        <div className={styles.switchRow}>
                            <Switch
                                checked={createData.isoptional}
                                onChange={(_, data) => updateField('isoptional', data.checked)}
                                tabIndex={-1}
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
