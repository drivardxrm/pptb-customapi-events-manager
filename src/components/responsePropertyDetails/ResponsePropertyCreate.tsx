import React, {  useCallback, useEffect, useMemo } from 'react';
import { Field, Input, Textarea } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { useAppSettings } from '../../hooks/useAppSettings';
import { useCustomApis } from '../../hooks/useCustomApis';
import { useAppStore } from '../../store/useAppStore';
import { CustomApiResponsePropertyCreateable, getCustomApiResponsePropertiesTypeOptions, Customapiresponsepropertiestype } from '../../models/CustomApiResponseProperty';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { useEntities } from '../../hooks/useEntities';
import { produce } from 'immer';
import { ValidationStatus } from '../../utils/validation';
import { useCustomApiResponseProperties } from '../../hooks/useCustomApiResponseProperties';


interface ResponsePropertyCreateProps {
    createData: CustomApiResponsePropertyCreateable;
    onChange: (updater: (current: CustomApiResponsePropertyCreateable) => CustomApiResponsePropertyCreateable) => void;
    onValidationChange?: (validationStatus: ValidationStatus) => void;
}

export const ResponsePropertyCreate: React.FC<ResponsePropertyCreateProps> = ({ createData, onChange, onValidationChange }) => {
    const styles = useStyles();   
    const customApiQuery = useCustomApis();
    const responsePropertyQuery = useCustomApiResponseProperties();
    const settingsQuery = useAppSettings();
    const entityQuery = useEntities();
    const { selectedCustomApiId } = useAppStore();

    // Validation logic
    const validation: ValidationStatus = useMemo(() => {
        // Required Fields
        if (!createData.uniquename || createData.uniquename.trim() === '' ||
            createData.type === null
        ) {
            return { isValid: false, message: 'Please fill all required fields.' };
        }

        if (responsePropertyQuery.responseProperties && responsePropertyQuery.responseProperties.some(prop => prop.uniquename.toLowerCase() === createData.uniquename.toLowerCase())) {
            return { isValid: false, message: `Response Property named '${createData.uniquename}' already exist.` };
        }

        return { isValid: true };
    }, [createData, responsePropertyQuery.responseProperties]);

    useEffect(() => {
        onValidationChange?.(validation);
    }, [validation.isValid, validation.message, onValidationChange]);


    // Helper to update fields, can change multiple fields at once
    const updateFields = (updater: (draft: CustomApiResponsePropertyCreateable) => void) => {
        onChange(current => produce(current, draft => updater(draft)));
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
                        <span className={styles.fieldLabelStandard}>
                            <span className={styles.semiBoldLabel}>Unique Name</span> <LockClosed16Regular />
                        </span>
                    }
                    required
                >
                    <Input
                        value={createData.uniquename ?? ''}
                        appearance='filled-darker'
                        onChange={(event) => {
                            const value = event.target.value ?? '';
                            const previousUniquename = createData.uniquename ?? '';
                            const previousDefaultName = buildDefaultName(previousUniquename);
                            const nextDefaultName = buildDefaultName(value);

                            updateFields((draft) => {
                                draft.uniquename = value;

                                const prevName = createData.name ?? '';
                                if (prevName === '' || prevName === previousDefaultName) {
                                    draft.name = nextDefaultName;
                                }

                                const prevDisplayName = createData.displayname ?? '';
                                if (prevDisplayName === '' || prevDisplayName === previousDefaultName) {
                                    draft.displayname = nextDefaultName;
                                }
                            });
                        }}
                    />
                </Field>

                <Field 
                    label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Name</span></span>}
                >
                    <Input
                        value={createData.name ?? ''}
                        onChange={(event) =>
                            updateFields((draft) => {
                                draft.name = event.target.value ?? '';
                            })
                        }
                        appearance='filled-darker'
                    />
                </Field>

                <Field 
                    label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Display Name</span></span>}
                >
                    <Input
                        value={createData.displayname ?? ''}
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
                        value={createData.description ?? ''}
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
                    required
                >
                    <GenericTagPicker
                        items={getCustomApiResponsePropertiesTypeOptions()
                            .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                        initialValue={createData.type.toString()}
                        isDisabled={false}
                        onSelect={(id) => {
                            const selectedType = Number(id) as Customapiresponsepropertiestype;
                            updateFields((draft) => {
                                draft.type = selectedType;

                                if (
                                    draft.logicalentityname.length > 0 &&
                                    Customapiresponsepropertiestype[selectedType] !== 'Entity' &&
                                    Customapiresponsepropertiestype[selectedType] !== 'EntityReference'
                                ) {
                                    draft.logicalentityname = '';
                                }
                            });
                        }}
                    />
                </Field>


                {(Customapiresponsepropertiestype[createData.type] === 'Entity' ||
                    Customapiresponsepropertiestype[createData.type] === 'EntityReference') &&
                    <Field
                        label={
                            <span className={styles.fieldLabelStandard}>
                                Logical Entity Name <LockClosed16Regular />
                            </span>
                        }
                        hint={
                            <>
                                Leave blank for expando entity
                            </>
                        }
                    >
                        {entityQuery.isFetching && (
                            <Input value="Loading entities..." readOnly appearance='filled-darker' />
                        )}
                        {entityQuery.error && (
                            <Input
                                value={`Error loading entities: ${entityQuery.error.message}`}
                                readOnly
                                appearance='filled-darker'
                            />
                        )}
                        {!entityQuery.isFetching && entityQuery.entities && (
                            <GenericTagPicker
                                items={entityQuery.entities
                                    .map((entity) => ({
                                        id: entity.entityid,
                                        displayText: entity.logicalname || '',
                                    } as SelectableItem))
                                    .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                                isDisabled={false}
                                onSelect={(id) => {
                                    const selected = entityQuery.entities?.find((entity) => entity.entityid === id);
                                    updateFields((draft) => {
                                        draft.logicalentityname = selected?.logicalname || '';
                                    });
                                }}
                            />
                        )}
                    </Field>
                }
                
            </div>
        </div>

    );
};
