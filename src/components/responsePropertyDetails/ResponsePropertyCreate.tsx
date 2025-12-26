import React, {  useCallback } from 'react';
import { Field, Input, Textarea } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { useAppSettings } from '../../hooks/useAppSettings';
import { useCustomApis } from '../../hooks/useCustomApis';
import { useAppStore } from '../../store/useAppStore';
import { GenericTagPicker } from '../generic/GenericTagPicker';
import { CustomApiResponsePropertyCreateable, getCustomApiResponsePropertiesTypeOptions, Customapiresponsepropertiestype } from '../../models/CustomApiResponseProperty';

interface ResponsePropertyCreateProps {
    createData: CustomApiResponsePropertyCreateable;
    onChange: (updater: (current: CustomApiResponsePropertyCreateable) => CustomApiResponsePropertyCreateable) => void;
}

export const ResponsePropertyCreate: React.FC<ResponsePropertyCreateProps> = ({ createData, onChange }) => {
    const styles = useStyles();   
    const customApiQuery = useCustomApis();
    const settingsQuery = useAppSettings();
    const { selectedCustomApiId } = useAppStore();


    const updateField = <K extends keyof CustomApiResponsePropertyCreateable>(field: K, value: CustomApiResponsePropertyCreateable[K]) => {
        onChange((current) => ({ ...current, [field]: value }));
    };

    const buildDefaultName = useCallback(
        (uniquename: string) => {
            
            const selectedCustomApi = customApiQuery.customapis?.find(
                api => api.customapiid === selectedCustomApiId
            );

            if (selectedCustomApi && settingsQuery.appsettings?.responsePropertyDefaultName) {
            return settingsQuery.appsettings.responsePropertyDefaultName
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
                            getCustomApiResponsePropertiesTypeOptions()
                                .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                        initialValue={createData.type.toString()}
                        isDisabled={false}
                        onSelect={(id) => updateField('type', Number(id) as Customapiresponsepropertiestype)}
                    />
                </Field>


                {(Customapiresponsepropertiestype[createData.type] === 'Entity' ||
                    Customapiresponsepropertiestype[createData.type] === 'EntityReference') &&
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
                
            </div>
        </div>

    );
};
