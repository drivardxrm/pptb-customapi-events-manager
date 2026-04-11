import React, { useState, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogContent,
    DialogActions,
    Button,
    Field,
    Input,
    Dropdown,
    Option,
    Spinner,
    Text,
} from '@fluentui/react-components';
import { LockClosedRegular, LockOpenRegular, TableRegular, PlugConnectedRegular, PlayRegular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { useCreateCatalogAssignment, useUpdateCatalogAssignment } from '../../hooks/useCatalogAssignments';
import { useCustomApis } from '../../hooks/useCustomApis';
import { useSolutions } from '../../hooks/useSolutions';
import { useAppStore } from '../../store/useAppStore';
import { Catalog } from '../../models/Catalog';
import { CatalogAssignment, CatalogAssignmentCreateable, CatalogAssignmentUpdateable, CatalogAssignmentType, CatalogAssignmentTypeOptions, DEFAULT_ASSIGNMENT_CREATE_TEMPLATE } from '../../models/CatalogAssignment';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';

interface CatalogAssignmentModalProps {
    open: boolean;
    assignment: CatalogAssignment | null;
    parentCatalog: Catalog | null;
    onClose: () => void;
}

export const CatalogAssignmentModal: React.FC<CatalogAssignmentModalProps> = ({
    open,
    assignment,
    parentCatalog,
    onClose,
}) => {
    const styles = useStyles();
    const createAssignment = useCreateCatalogAssignment();
    const updateAssignment = useUpdateCatalogAssignment();
    const { customapis, isFetching: isFetchingCustomApis } = useCustomApis();
    const { solutions } = useSolutions();
    const { selectedSolutionId } = useAppStore();

    const isEdit = !!assignment;

    // Form state
    const [formData, setFormData] = useState<CatalogAssignmentCreateable>(DEFAULT_ASSIGNMENT_CREATE_TEMPLATE);
    const [editData, setEditData] = useState<CatalogAssignmentUpdateable>({ name: '' });
    const [selectedType, setSelectedType] = useState<CatalogAssignmentType | null>(1); // Default to Custom API

    // Get selected solution
    const selectedSolution = solutions.find(s => s.solutionid === selectedSolutionId);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            if (isEdit && assignment) {
                setEditData({
                    name: assignment.name || '',
                });
                setSelectedType(assignment.catalogassignmenttype);
            } else {
                setFormData({
                    ...DEFAULT_ASSIGNMENT_CREATE_TEMPLATE,
                    _catalogid_value: parentCatalog?.catalogid || '',
                });
                setSelectedType(1); // Default to Custom API
            }
        }
    }, [open, isEdit, assignment, parentCatalog]);

    // Validation
    const validation = useMemo(() => {
        if (isEdit) {
            if (!editData.name?.trim()) {
                return { isValid: false, message: 'Name is required.' };
            }
        } else {
            if (!formData.name?.trim()) {
                return { isValid: false, message: 'Name is required.' };
            }
            if (selectedType === null) {
                return { isValid: false, message: 'Assignment type is required.' };
            }
            if (!formData._object_value) {
                return { isValid: false, message: 'Please select an object to assign.' };
            }
        }
        return { isValid: true, message: '' };
    }, [isEdit, formData, editData, selectedType]);

    const handleSave = async () => {
        try {
            if (isEdit && assignment) {
                await updateAssignment.mutateAsync({
                    current: assignment,
                    next: editData,
                });
            } else {
                // Determine entity name based on type
                let objectEntityName = 'customapi';
                if (selectedType === 0) objectEntityName = 'entity';
                if (selectedType === 2) objectEntityName = 'workflow';

                await createAssignment.mutateAsync({
                    next: {
                        ...formData,
                        catalogassignmenttype: selectedType,
                    },
                    objectEntityName,
                    solutionUniqueName: selectedSolution?.uniquename,
                });
            }
            onClose();
        } catch (error) {
            console.error('Error saving assignment:', error);
        }
    };

    const getTitle = () => {
        if (isEdit) return 'Edit Assignment';
        return 'Create Assignment';
    };

    const getTypeIcon = (type: number) => {
        switch (type) {
            case 0: return <TableRegular />;
            case 1: return <PlugConnectedRegular />;
            case 2: return <PlayRegular />;
            default: return null;
        }
    };

    // Get selectable items based on type
    const getObjectItems = (): SelectableItem[] => {
        if (selectedType === 1) {
            // Custom APIs
            return customapis
                .filter(api => !api.ismanaged) // Only unmanaged for assignment
                .map(api => ({
                    id: api.customapiid,
                    displayText: `${api.displayname || api.name} (${api.uniquename})`,
                    image: api.ismanaged ? <LockClosedRegular /> : <LockOpenRegular />,
                }))
                .sort((a, b) => a.displayText.localeCompare(b.displayText));
        }
        // For Table and Custom Process Action, we would need additional hooks
        // For now, return empty array - these would need entity/workflow queries
        return [];
    };

    const isSaving = createAssignment.isPending || updateAssignment.isPending;
    const objectItems = getObjectItems();

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface className={styles.dialogSurface}>
                <DialogBody>
                    <DialogTitle>{getTitle()}</DialogTitle>
                    <DialogContent className={styles.dialogContentColumn}>
                        {/* Parent Catalog info */}
                        {parentCatalog && (
                            <div className={styles.dialogSection}>
                                <Text size={200} weight="semibold">Parent Category</Text>
                                <Text>{parentCatalog.displayname || parentCatalog.name}</Text>
                            </div>
                        )}

                        {/* Name */}
                        <Field label={<span className={styles.semiBoldLabel}>Name <span className={styles.required}>*</span></span>}>
                            <Input
                                appearance="filled-darker"
                                value={isEdit ? editData.name : formData.name}
                                onChange={(_, data) => {
                                    if (isEdit) {
                                        setEditData(prev => ({ ...prev, name: data.value }));
                                    } else {
                                        setFormData(prev => ({ ...prev, name: data.value }));
                                    }
                                }}
                                placeholder="Assignment name"
                            />
                        </Field>

                        {/* Type (create only) */}
                        {!isEdit && (
                            <Field label={<span className={styles.semiBoldLabel}>Type <span className={styles.required}>*</span></span>}>
                                <Dropdown
                                    appearance="filled-darker"
                                    placeholder="Select type"
                                    selectedOptions={selectedType !== null ? [selectedType.toString()] : []}
                                    value={selectedType !== null ? CatalogAssignmentTypeOptions[selectedType as keyof typeof CatalogAssignmentTypeOptions] : ''}
                                    onOptionSelect={(_, data) => {
                                        const value = data.optionValue ? parseInt(data.optionValue, 10) as CatalogAssignmentType : null;
                                        setSelectedType(value);
                                        // Clear object selection when type changes
                                        setFormData(prev => ({ ...prev, _object_value: '' }));
                                    }}
                                >
                                    {Object.entries(CatalogAssignmentTypeOptions).map(([key, label]) => (
                                        <Option key={key} value={key} text={label}>
                                            <span className={styles.optionLabel}>
                                                {getTypeIcon(parseInt(key, 10))}
                                                {label}
                                            </span>
                                        </Option>
                                    ))}
                                </Dropdown>
                            </Field>
                        )}

                        {/* Object Selector (create only) */}
                        {!isEdit && selectedType !== null && (
                            <Field label={<span className={styles.semiBoldLabel}>Object <span className={styles.required}>*</span></span>}>
                                {selectedType === 1 ? (
                                    // Custom API selector
                                    isFetchingCustomApis ? (
                                        <Input value="Loading Custom APIs..." readOnly appearance="filled-darker" />
                                    ) : objectItems.length === 0 ? (
                                        <Text className={styles.hintTextItalic}>No unmanaged Custom APIs available</Text>
                                    ) : (
                                        <GenericTagPicker
                                            items={objectItems}
                                            initialValue={formData._object_value}
                                            onSelect={(id) => setFormData(prev => ({ ...prev, _object_value: id || '' }))}
                                        />
                                    )
                                ) : (
                                    <Text className={styles.hintTextItalic}>
                                        {selectedType === 0 ? 'Table selection coming soon' : 'Custom Process Action selection coming soon'}
                                    </Text>
                                )}
                            </Field>
                        )}

                        {/* Show current object for edit mode */}
                        {isEdit && assignment && (
                            <div className={styles.dialogSection}>
                                <Text size={200} weight="semibold">Assigned Object</Text>
                                <Text>
                                    {assignment['_object_value@OData.Community.Display.V1.FormattedValue'] || assignment.objectname || 'Unknown'}
                                </Text>
                                <Text size={200} className={styles.hintText}>
                                    Type: {assignment.catalogassignmenttype !== null 
                                        ? CatalogAssignmentTypeOptions[assignment.catalogassignmenttype as keyof typeof CatalogAssignmentTypeOptions] 
                                        : 'Unknown'}
                                </Text>
                            </div>
                        )}

                        {/* Validation message */}
                        {!validation.isValid && (
                            <Text size={200} className={styles.required}>{validation.message}</Text>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={handleSave}
                            disabled={!validation.isValid || isSaving}
                            icon={isSaving ? <Spinner size="tiny" /> : undefined}
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
