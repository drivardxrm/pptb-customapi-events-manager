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
import { LockClosedRegular, LockOpenRegular, FolderRegular, FolderOpenRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { useCatalogAssignements, useCreateCatalogAssignment, useUpdateCatalogAssignment } from '../../hooks/useCatalogAssignments';
import { useCatalogs } from '../../hooks/useCatalogs';
import { useCustomApis } from '../../hooks/useCustomApis';
import { useEntities } from '../../hooks/useEntities';
import { useWorflows } from '../../hooks/useWorkflows';
import { useSolutions } from '../../hooks/useSolutions';
import { useAppStore } from '../../store/useAppStore';
import { Catalog } from '../../models/Catalog';
import { CatalogAssignment, CatalogAssignmentCreateable, CatalogAssignmentUpdateable, DEFAULT_ASSIGNMENT_CREATE_TEMPLATE, ObjectIdTypeLabels, getObjectTypeLabel, getObjectType, objectIdTypeIcons } from '../../models/CatalogAssignment';
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
    const { allCatalogAssignments } = useCatalogAssignements();
    const { catalogs } = useCatalogs();
    const { customapis, isFetching: isFetchingCustomApis } = useCustomApis();
    const { entities, isFetching: isFetchingEntities } = useEntities();
    const { entities: workflows, isFetching: isFetchingWorkflows } = useWorflows();
    const { solutions } = useSolutions();
    const { selectedSolutionId } = useAppStore();

    // Find root catalog (parent of the category)
    const rootCatalog = parentCatalog 
        ? catalogs.find(c => c.catalogid === parentCatalog._parentcatalogid_value) 
        : null;

    const isEdit = !!assignment;

    // Form state
    const [formData, setFormData] = useState<CatalogAssignmentCreateable>(DEFAULT_ASSIGNMENT_CREATE_TEMPLATE);
    const [editData, setEditData] = useState<CatalogAssignmentUpdateable>({ name: '' });
    const [selectedObjectType, setSelectedObjectType] = useState<string>('customapi'); // Entity logical name

    // Get selected solution
    const selectedSolution = solutions.find(s => s.solutionid === selectedSolutionId);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            if (isEdit && assignment) {
                setEditData({
                    name: assignment.name || '',
                });
                // Read object type from the annotation field for display purposes
                setSelectedObjectType(getObjectType(assignment) || 'customapi');
            } else {
                setFormData({
                    ...DEFAULT_ASSIGNMENT_CREATE_TEMPLATE,
                    _catalogid_value: parentCatalog?.catalogid || '',
                });
                setSelectedObjectType('customapi'); // Default to Custom API
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
            if (!selectedObjectType) {
                return { isValid: false, message: 'Assignment type is required.' };
            }
            if (!formData._object_value) {
                return { isValid: false, message: 'Please select an object to assign.' };
            }
            if (
                allCatalogAssignments.some((existingAssignment) =>
                    existingAssignment._catalogid_value === formData._catalogid_value &&
                    existingAssignment._object_value === formData._object_value &&
                    getObjectType(existingAssignment) === selectedObjectType
                )
            ) {
                return {
                    isValid: false,
                    message: `This ${ObjectIdTypeLabels[selectedObjectType] ?? 'object'} is already assigned to the selected catalog.`,
                };
            }
        }
        return { isValid: true, message: '' };
    }, [allCatalogAssignments, isEdit, formData, editData, selectedObjectType]);

    const handleSave = async () => {
        try {
            if (isEdit && assignment) {
                await updateAssignment.mutateAsync({
                    current: assignment,
                    next: editData,
                });
            } else {
                // objectEntityName is the entity logical name (e.g., 'customapi')
                // Dataverse will populate objectidtype automatically based on the bound object
                await createAssignment.mutateAsync({
                    next: formData,
                    objectEntityName: selectedObjectType,
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

    const getTypeIcon = (objectType: string) => {
        return objectIdTypeIcons[objectType] || null;
    };

    // Get selectable items based on type
    const getObjectItems = (): SelectableItem[] => {
        if (selectedObjectType === 'customapi') {
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
        if (selectedObjectType === 'entity') {
            // Tables/Entities
            return entities
                .map(entity => ({
                    id: entity.entityid,
                    displayText: entity.logicalname || '',
                } as SelectableItem))
                .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''));
        }
        if (selectedObjectType === 'workflow') {
            // Custom Process Actions (Workflows)
            return workflows
                .map(workflow => ({
                    id: workflow.workflowid,
                    displayText: workflow.name || '',
                } as SelectableItem))
                .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''));
        }
        return [];
    };

    const isSaving = createAssignment.isPending || updateAssignment.isPending;
    const objectItems = getObjectItems();

    // Handle object selection - also auto-fill name if empty
    const handleObjectSelect = (id: string | null) => {
        if (!id) {
            setFormData(prev => ({ ...prev, _object_value: '' }));
            return;
        }

        let objectName = '';
        if (selectedObjectType === 'customapi') {
            const api = customapis.find(a => a.customapiid === id);
            objectName = api?.displayname || api?.name || '';
        } else if (selectedObjectType === 'entity') {
            const entity = entities.find(e => e.entityid === id);
            objectName = entity?.logicalname || '';
        } else if (selectedObjectType === 'workflow') {
            const workflow = workflows.find(w => w.workflowid === id);
            objectName = workflow?.name || '';
        }

        setFormData(prev => ({
            ...prev,
            _object_value: id,
            // Auto-fill name only if currently empty
            name: prev.name?.trim() ? prev.name : objectName,
        }));
    };

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface className={styles.dialogSurface}>
                <DialogBody>
                    <DialogTitle>{getTitle()}</DialogTitle>
                    <DialogContent className={styles.dialogContentColumn}>
                        {/* Catalog path: Root Catalog → Category */}
                        {parentCatalog && (
                            <div className={styles.dialogSection}>
                                <div className={styles.catalogPathContainer}>
                                    <FolderRegular />
                                    <Text>{rootCatalog?.displayname || rootCatalog?.name || 'Unknown Catalog'}</Text>
                                    <ChevronRightRegular />
                                    <FolderOpenRegular />
                                    <Text>{parentCatalog.displayname || parentCatalog.name}</Text>
                                </div>
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
                                    selectedOptions={selectedObjectType ? [selectedObjectType] : []}
                                    value={selectedObjectType ? ObjectIdTypeLabels[selectedObjectType] || selectedObjectType : ''}
                                    onOptionSelect={(_, data) => {
                                        const value = data.optionValue || 'customapi';
                                        setSelectedObjectType(value);
                                        // Clear object selection when type changes
                                        setFormData(prev => ({ ...prev, _object_value: '' }));
                                    }}
                                >
                                    {Object.entries(ObjectIdTypeLabels).map(([key, label]) => (
                                        <Option key={key} value={key} text={label}>
                                            <span className={styles.optionLabel}>
                                                {getTypeIcon(key)}
                                                {label}
                                            </span>
                                        </Option>
                                    ))}
                                </Dropdown>
                            </Field>
                        )}

                        {/* Object Selector (create only) */}
                        {!isEdit && selectedObjectType && (
                            <Field label={<span className={styles.semiBoldLabel}>Object <span className={styles.required}>*</span></span>}>
                                {selectedObjectType === 'customapi' ? (
                                    // Custom API selector
                                    isFetchingCustomApis ? (
                                        <Input value="Loading Custom APIs..." readOnly appearance="filled-darker" />
                                    ) : objectItems.length === 0 ? (
                                        <Text className={styles.hintTextItalic}>No unmanaged Custom APIs available</Text>
                                    ) : (
                                        <GenericTagPicker
                                            items={objectItems}
                                            initialValue={formData._object_value}
                                            onSelect={handleObjectSelect}
                                        />
                                    )
                                ) : selectedObjectType === 'entity' ? (
                                    // Entity/Table selector
                                    isFetchingEntities ? (
                                        <Input value="Loading Tables..." readOnly appearance="filled-darker" />
                                    ) : objectItems.length === 0 ? (
                                        <Text className={styles.hintTextItalic}>No Tables available</Text>
                                    ) : (
                                        <GenericTagPicker
                                            items={objectItems}
                                            initialValue={formData._object_value}
                                            onSelect={handleObjectSelect}
                                        />
                                    )
                                ) : selectedObjectType === 'workflow' ? (
                                    // Workflow/Custom Process Action selector
                                    isFetchingWorkflows ? (
                                        <Input value="Loading Custom Process Actions..." readOnly appearance="filled-darker" />
                                    ) : objectItems.length === 0 ? (
                                        <Text className={styles.hintTextItalic}>No Custom Process Actions available</Text>
                                    ) : (
                                        <GenericTagPicker
                                            items={objectItems}
                                            initialValue={formData._object_value}
                                            onSelect={handleObjectSelect}
                                        />
                                    )
                                ) : null}
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
                                    Type: {getObjectTypeLabel(assignment)}
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
