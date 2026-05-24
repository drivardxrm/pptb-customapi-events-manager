import React, {  useCallback, useEffect, useMemo, useRef } from 'react';
import { Field, Input, Textarea, Switch, Tooltip } from '@fluentui/react-components';
import { LockClosed16Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import {  CustomApiRequestParameterCreateable, Customapirequestparameterstype, getCustomApiRequestParametersTypeOptions } from '../../models/CustomApiRequestParameter';
import { useDynamicColumnWidths } from '../../hooks/useDynamicColumnWidths';
import { useAppSettings } from '../../hooks/useAppSettings';
import { useCustomApis } from '../../hooks/useCustomApis';
import { useAppStore } from '../../store/useAppStore';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { useEntities } from '../../hooks/useEntities';
import { produce } from 'immer';
import { ValidationStatus } from '../../utils/validation';
import { useCustomApiRequestParameters } from '../../hooks/useCustomApiRequestParameters';

interface RequestParameterCreateProps {
    createData: CustomApiRequestParameterCreateable;
    onChange: (updater: (current: CustomApiRequestParameterCreateable) => CustomApiRequestParameterCreateable) => void;
    onValidationChange?: (validationStatus: ValidationStatus) => void;
}

export const RequestParameterCreate: React.FC<RequestParameterCreateProps> = ({ createData, onChange, onValidationChange }) => {
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
    const requestParameterQuery = useCustomApiRequestParameters();
    const settingsQuery = useAppSettings();
    const entityQuery = useEntities();
    const { selectedCustomApiId } = useAppStore();

    // Memoize items to keep the array reference stable across re-renders.
    // Unstable references cause GenericTagPicker's items effect to run every render,
    // which can contribute to React Error #185 (Maximum update depth exceeded).
    const typeItems = useMemo(() => {
        return getCustomApiRequestParametersTypeOptions()
            .filter(option => {
                const selectedCustomApi = customApiQuery.customapis?.find(api => api.customapiid === selectedCustomApiId);
                if (selectedCustomApi?.isfunction) {
                    return option.displayText !== "Entity" &&
                        option.displayText !== "EntityReference" &&
                        option.displayText !== "EntityCollection";
                }
                return true;
            })
            .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''));
    }, [selectedCustomApiId, customApiQuery.customapis]);

    // Validation logic
    const validation: ValidationStatus = useMemo(() => {
        // Required Fields
        if (!createData.uniquename || createData.uniquename.trim() === '' ||
            createData.type === null
        ) {
            return { isValid: false, message: 'Please fill all required fields.' };
        }

        if (requestParameterQuery.requestParameters && requestParameterQuery.requestParameters.some(param => param.uniquename.toLowerCase() === createData.uniquename.toLowerCase())) {
            return { isValid: false, message: `Request Parameter named '${createData.uniquename}' already exist.` };
        }

        return { isValid: true };
    }, [createData, requestParameterQuery.requestParameters]);

    useEffect(() => {
        onValidationChange?.(validation);
    }, [validation.isValid, validation.message, onValidationChange]);


     // Helper to update fields, can change multiple fields at once
    const updateFields = (updater: (draft: CustomApiRequestParameterCreateable) => void) => {
        onChange(current => produce(current, draft => updater(draft)));
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
                        <span className={styles.fieldLabelStandard}>
                            <span className={styles.semiBoldLabel}>Unique Name</span> <LockClosed16Regular />
                        </span>
                    }
                    required
                >
                    <Input
                        appearance='filled-darker'
                        value={createData.uniquename ?? ''}
                        required
                        onChange={(event) => {
                            const value = event.target.value ?? '';
                            const previousDefaultName = buildDefaultName(createData.uniquename ?? '');
                            const nextDefaultName = buildDefaultName(value);

                            updateFields((draft) => {
                                const prevName = draft.name ?? '';
                                const prevDisplayName = draft.displayname ?? '';

                                draft.uniquename = value;

                                if (prevName === '' || prevName === previousDefaultName) {
                                    draft.name = nextDefaultName;
                                }

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
                        appearance='filled-darker'
                        required
                        value={createData.name ?? ''}
                        onChange={(event) =>
                            updateFields((draft) => {
                                draft.name = event.target.value ?? '';
                            })
                        }
                    />
                </Field>

                <Field 
                    label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Display Name</span></span>}
                >
                    <Input
                        appearance='filled-darker'
                        required
                        value={createData.displayname ?? ''}
                        onChange={(event) =>
                            updateFields((draft) => {
                                draft.displayname = event.target.value ?? '';
                            })
                        }
                    />
                </Field>

                <Field 
                    label={<span className={styles.fieldLabelStandard}><span className={styles.semiBoldLabel}>Description</span></span>}
                >
                    <Textarea
                        appearance='filled-darker'
                        spellCheck={false}
                        required
                        value={createData.description ?? ''}
                        onChange={(event) =>
                            updateFields((draft) => {
                                draft.description = event.target.value ?? '';
                            })
                        }
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
                    required
                >
                    <GenericTagPicker
                        items={typeItems}
                        initialValue={createData.type.toString()}
                        isDisabled={false}
                        onSelect={(id) => {
                            const selectedType = Number(id) as Customapirequestparameterstype;

                            updateFields((draft) => {
                                draft.type = selectedType;

                                if (
                                    draft.logicalentityname.length > 0 &&
                                    Customapirequestparameterstype[selectedType] !== 'Entity' &&
                                    Customapirequestparameterstype[selectedType] !== 'EntityReference'
                                ) {
                                    draft.logicalentityname = '';
                                }
                            });
                        }}
                    />
                </Field>


                {(Customapirequestparameterstype[createData.type] === 'Entity' ||
                    Customapirequestparameterstype[createData.type] === 'EntityReference') &&
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
                

                <div className={styles.switchColumn}>
                    <Tooltip content={createData.isoptional ? 'True' : 'False'} relationship='description' positioning='above-end'>
                        <div className={styles.switchRow}>
                            <Switch
                                checked={createData.isoptional}
                                onChange={(_, data) =>
                                    updateFields((draft) => {
                                        draft.isoptional = data.checked;
                                    })
                                }
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
