import React, { useState, useCallback, useMemo } from 'react';
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button,
    Field,
    Input,
    Textarea,
    Dropdown,
    Option,
    Spinner,
    Badge,
} from '@fluentui/react-components';
import { Checkmark24Regular, Dismiss24Regular, SquareRegular } from '@fluentui/react-icons';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import { useStyles } from '../../styles/Styles';
import { useEntityAttributes, AttributeMetadata } from '../../hooks/useEntityAttributes';
import { useMetadata } from '../../hooks/useMetadata';
import { EntityReferencePicker } from './EntityReferencePicker';
import { EntityReferenceValue } from '../../models/Entity';

interface EntityDataDialogProps {
    open: boolean;
    entityLogicalName: string;
    initialData: Record<string, unknown>;
    onConfirm: (data: Record<string, unknown>) => void;
    onCancel: () => void;
}

type FieldValue = string | number | boolean | Date | EntityReferenceValue | null | undefined;

export const EntityDataDialog: React.FC<EntityDataDialogProps> = ({
    open,
    entityLogicalName,
    initialData,
    onConfirm,
    onCancel,
}) => {
    const styles = useStyles();
    const { attributes, isFetching } = useEntityAttributes(entityLogicalName);
    const { collectionname } = useMetadata(entityLogicalName);
    
    const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>(() => {
        // Initialize from initialData, converting @odata.bind back to EntityReferenceValue
        const values: Record<string, FieldValue> = {};
        for (const [key, value] of Object.entries(initialData)) {
            if (key === '@odata.type') continue;
            if (key.endsWith('@odata.bind') && typeof value === 'string') {
                // Parse @odata.bind format: /entitysetname(guid)
                const match = value.match(/^\/([^(]+)\(([^)]+)\)$/);
                if (match) {
                    const fieldName = key.replace('@odata.bind', '');
                    values[fieldName] = {
                        entityLogicalName: '', // Will be resolved from targets
                        recordId: match[2],
                        primaryIdAttribute: '',
                        collectionName: match[1],
                    } as EntityReferenceValue & { collectionName: string };
                }
            } else {
                values[key] = value as FieldValue;
            }
        }
        return values;
    });

    const handleFieldChange = useCallback((logicalName: string, value: FieldValue) => {
        setFieldValues(prev => ({
            ...prev,
            [logicalName]: value
        }));
    }, []);

    const handleConfirm = useCallback(() => {
        // Build the output object with only set values
        const result: Record<string, unknown> = {
            '@odata.type': `Microsoft.Dynamics.CRM.${entityLogicalName}`
        };

        for (const [key, value] of Object.entries(fieldValues)) {
            if (value === null || value === undefined || value === '') continue;
            
            // Check if this is an EntityReference value
            if (typeof value === 'object' && 'recordId' in value && value.recordId) {
                const entityRef = value as EntityReferenceValue & { collectionName?: string };
                // Find the attribute to get the target entity's collection name
                const attr = attributes.find(a => a.LogicalName === key);
                if (attr?.Targets?.[0]) {
                    // We need to use the collection name for @odata.bind
                    // For now use a simple pluralization, but ideally we'd fetch metadata
                    const targetCollection = entityRef.collectionName || `${attr.Targets[0]}s`;
                    result[`${key}@odata.bind`] = `/${targetCollection}(${entityRef.recordId})`;
                }
            } else if (value instanceof Date) {
                result[key] = value.toISOString();
            } else {
                result[key] = value;
            }
        }

        onConfirm(result);
    }, [fieldValues, entityLogicalName, attributes, onConfirm]);

    const getDisplayName = (attr: AttributeMetadata): string => {
        return attr.DisplayName?.UserLocalizedLabel?.Label || attr.LogicalName;
    };

    const getDescription = (attr: AttributeMetadata): string | undefined => {
        return attr.Description?.UserLocalizedLabel?.Label;
    };

    const renderFieldInput = useCallback((attr: AttributeMetadata) => {
        const value = fieldValues[attr.LogicalName];
        const onChange = (newValue: FieldValue) => handleFieldChange(attr.LogicalName, newValue);

        switch (attr.AttributeType) {
            case 'String':
                return (
                    <Input
                        appearance="filled-darker"
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value || undefined)}
                        maxLength={attr.MaxLength}
                    />
                );

            case 'Memo':
                return (
                    <Textarea
                        appearance="filled-darker"
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value || undefined)}
                        resize="vertical"
                        rows={3}
                    />
                );

            case 'Integer':
            case 'BigInt':
                return (
                    <Input
                        appearance="filled-darker"
                        type="number"
                        value={value?.toString() ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            onChange(val === '' ? undefined : parseInt(val, 10));
                        }}
                    />
                );

            case 'Decimal':
            case 'Double':
                return (
                    <Input
                        appearance="filled-darker"
                        type="number"
                        step="any"
                        value={value?.toString() ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            onChange(val === '' ? undefined : parseFloat(val));
                        }}
                    />
                );

            case 'Money':
                return (
                    <Input
                        appearance="filled-darker"
                        type="number"
                        step="0.01"
                        value={value?.toString() ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            onChange(val === '' ? undefined : parseFloat(val));
                        }}
                    />
                );

            case 'Boolean':
                return (
                    <Dropdown
                        appearance="filled-darker"
                        placeholder="Select value"
                        selectedOptions={value === true ? ['true'] : value === false ? ['false'] : []}
                        value={value === true ? 'True' : value === false ? 'False' : ''}
                        onOptionSelect={(_, data) => {
                            if (data.optionValue === 'true') {
                                onChange(true);
                            } else if (data.optionValue === 'false') {
                                onChange(false);
                            } else {
                                onChange(undefined);
                            }
                        }}
                    >
                        <Option value="true">True</Option>
                        <Option value="false">False</Option>
                    </Dropdown>
                );

            case 'DateTime':
                return (
                    <DatePicker
                        appearance="filled-darker"
                        value={value instanceof Date ? value : value ? new Date(value as string) : null}
                        onSelectDate={(date) => onChange(date ?? undefined)}
                        placeholder="Select a date..."
                    />
                );

            case 'Picklist':
            case 'State':
            case 'Status':
                const options = attr.OptionSet?.Options ?? [];
                const selectedValue = value?.toString();
                return (
                    <Dropdown
                        appearance="filled-darker"
                        placeholder="Select value"
                        selectedOptions={selectedValue ? [selectedValue] : []}
                        value={options.find(o => o.Value.toString() === selectedValue)?.Label?.UserLocalizedLabel?.Label ?? ''}
                        onOptionSelect={(_, data) => {
                            onChange(data.optionValue ? parseInt(data.optionValue, 10) : undefined);
                        }}
                    >
                        {options.map(opt => (
                            <Option key={opt.Value} value={opt.Value.toString()}>
                                {opt.Label?.UserLocalizedLabel?.Label ?? opt.Value.toString()}
                            </Option>
                        ))}
                    </Dropdown>
                );

            case 'Lookup':
            case 'Customer':
            case 'Owner':
                // Use the first target entity for the picker
                const targetEntity = attr.Targets?.[0] ?? null;
                return (
                    <EntityReferencePicker
                        entityLogicalName={targetEntity}
                        value={value as EntityReferenceValue | null}
                        onChange={(val) => {
                            if (val) {
                                // Store with collection name for later use
                                onChange({
                                    ...val,
                                    collectionName: collectionname
                                } as EntityReferenceValue & { collectionName: string });
                            } else {
                                onChange(null);
                            }
                        }}
                    />
                );

            case 'UniqueIdentifier':
                return (
                    <Input
                        appearance="filled-darker"
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value || undefined)}
                    />
                );

            default:
                return (
                    <Input
                        appearance="filled-darker"
                        value={(value as string) ?? ''}
                        onChange={(e) => onChange(e.target.value || undefined)}
                    />
                );
        }
    }, [fieldValues, handleFieldChange, collectionname]);

    const dialogSurfaceStyle = useMemo(() => ({
        maxWidth: '700px',
        maxHeight: '80vh',
    }), []);

    const contentStyle = useMemo(() => ({
        maxHeight: '60vh',
        overflowY: 'auto' as const,
    }), []);

    return (
        <Dialog open={open} modalType="modal">
            <DialogSurface style={dialogSurfaceStyle}>
                <DialogBody>
                    <DialogTitle>
                        <span className={styles.flexRowCentered}>
                            Set Entity Data
                            <Badge 
                                appearance="outline" 
                                size="small"
                                color="severe"
                                icon={<SquareRegular />}
                            >
                                {entityLogicalName}
                            </Badge>
                        </span>
                    </DialogTitle>
                    <DialogContent>
                        {isFetching ? (
                            <div className={styles.flexRowCentered}>
                                <Spinner size="small" />
                                <span>Loading entity attributes...</span>
                            </div>
                        ) : (
                            <div style={contentStyle}>
                                <div className={styles.flexColumnM}>
                                    {attributes.map(attr => (
                                        <Field
                                            key={attr.LogicalName}
                                            label={
                                                <span className={styles.fieldLabelStandard}>
                                                    <span className={styles.semiBoldLabel}>
                                                        {getDisplayName(attr)}
                                                    </span>
                                                    <Badge 
                                                        appearance="outline" 
                                                        size="small"
                                                        color="informative"
                                                    >
                                                        {attr.AttributeType}
                                                    </Badge>
                                                </span>
                                            }
                                            hint={getDescription(attr) || attr.LogicalName}
                                        >
                                            {renderFieldInput(attr)}
                                        </Field>
                                    ))}
                                    {attributes.length === 0 && (
                                        <div className={styles.infoBox}>
                                            No editable attributes found for this entity.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            appearance="secondary"
                            icon={<Dismiss24Regular />}
                            onClick={onCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            icon={<Checkmark24Regular />}
                            onClick={handleConfirm}
                            disabled={isFetching}
                        >
                            OK
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
