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
    Textarea,
    Spinner,
    Text,
} from '@fluentui/react-components';
import { useStyles } from '../../styles/Styles';
import { useCreateCatalog, useUpdateCatalog, useCatalogs } from '../../hooks/useCatalogs';
import { usePublishers } from '../../hooks/usePublishers';
import { useSolutions } from '../../hooks/useSolutions';
import { useAppStore } from '../../store/useAppStore';
import { Catalog, CatalogCreateable, CatalogUpdateable, DEFAULT_CATALOG_CREATE_TEMPLATE } from '../../models/Catalog';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';

export type CatalogModalMode = 'create-root' | 'create-category' | 'edit';

interface CatalogModalProps {
    open: boolean;
    mode: CatalogModalMode;
    catalog: Catalog | null;
    parentCatalog: Catalog | null;
    onClose: () => void;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
    open,
    mode,
    catalog,
    parentCatalog,
    onClose,
}) => {
    const styles = useStyles();
    const createCatalog = useCreateCatalog();
    const updateCatalog = useUpdateCatalog();
    const { catalogs } = useCatalogs();
    const { publishers, isFetching: isFetchingPublishers } = usePublishers();
    const { solutions } = useSolutions();
    const { selectedSolutionId, selectedPublisherId, setSelectedPublisherId } = useAppStore();

    const isEdit = mode === 'edit';
    const isCategory = mode === 'create-category';

    // Form state
    const [formData, setFormData] = useState<CatalogCreateable>(DEFAULT_CATALOG_CREATE_TEMPLATE);
    const [editData, setEditData] = useState<CatalogUpdateable>({ name: '', displayname: '', description: '' });

    // Get selected solution for adding to solution
    const selectedSolution = solutions.find(s => s.solutionid === selectedSolutionId);

    // Reset form when modal opens
    useEffect(() => {
        if (open) {
            if (isEdit && catalog) {
                setEditData({
                    name: catalog.name || '',
                    displayname: catalog.displayname || '',
                    description: catalog.description || '',
                });
            } else {
                setFormData({
                    ...DEFAULT_CATALOG_CREATE_TEMPLATE,
                    _parentcatalogid_value: parentCatalog?.catalogid || '',
                    _publisherid_value: selectedPublisherId || '',
                });
            }
        }
    }, [open, isEdit, catalog, parentCatalog, selectedPublisherId]);

    // Validation
    const validation = useMemo(() => {
        if (isEdit) {
            if (!editData.name?.trim() || !editData.displayname?.trim()) {
                return { isValid: false, message: 'Name and Display Name are required.' };
            }
        } else {
            if (!formData.uniquename?.trim() || !formData.name?.trim() || !formData.displayname?.trim()) {
                return { isValid: false, message: 'Unique Name, Name, and Display Name are required.' };
            }
            if (!formData._publisherid_value) {
                return { isValid: false, message: 'Publisher is required.' };
            }
            // Check for duplicate unique name
            if (catalogs.some(c => c.uniquename.toLowerCase() === formData.uniquename.toLowerCase())) {
                return { isValid: false, message: `Catalog with unique name '${formData.uniquename}' already exists.` };
            }
        }
        return { isValid: true, message: '' };
    }, [isEdit, formData, editData, catalogs]);

    const handleSave = async () => {
        try {
            if (isEdit && catalog) {
                await updateCatalog.mutateAsync({
                    current: catalog,
                    next: editData,
                });
            } else {
                await createCatalog.mutateAsync({
                    next: formData,
                    solutionUniqueName: selectedSolution?.uniquename,
                });
                // Remember publisher selection
                if (formData._publisherid_value) {
                    setSelectedPublisherId(formData._publisherid_value);
                }
            }
            onClose();
        } catch (error) {
            // Error is handled by mutation hooks
            console.error('Error saving catalog:', error);
        }
    };

    const getTitle = () => {
        if (isEdit) return 'Edit Catalog';
        if (isCategory) return 'Create Category';
        return 'Create Root Catalog';
    };

    const isSaving = createCatalog.isPending || updateCatalog.isPending;

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface className={styles.dialogSurface}>
                <DialogBody>
                    <DialogTitle>{getTitle()}</DialogTitle>
                    <DialogContent className={styles.dialogContentColumn}>
                        {/* Parent info for categories */}
                        {isCategory && parentCatalog && (
                            <div className={styles.dialogSection}>
                                <Text size={200} weight="semibold">Parent Catalog</Text>
                                <Text>{parentCatalog.displayname || parentCatalog.name}</Text>
                            </div>
                        )}

                        {/* Publisher Selector (create only) */}
                        {!isEdit && (
                            <Field label={<span className={styles.semiBoldLabel}>Publisher <span className={styles.required}>*</span></span>}>
                                {isFetchingPublishers ? (
                                    <Input value="Loading publishers..." readOnly appearance="filled-darker" />
                                ) : (
                                    <GenericTagPicker
                                        items={publishers.map(p => ({
                                            id: p.publisherid,
                                            displayText: `${p.friendlyname} (${p.customizationprefix})`,
                                            image: null,
                                        } as SelectableItem))}
                                        initialValue={formData._publisherid_value}
                                        onSelect={(id) => setFormData(prev => ({ ...prev, _publisherid_value: id || '' }))}
                                    />
                                )}
                            </Field>
                        )}

                        {/* Unique Name (create only) */}
                        {!isEdit && (
                            <Field label={<span className={styles.semiBoldLabel}>Unique Name <span className={styles.required}>*</span></span>}>
                                <Input
                                    appearance="filled-darker"
                                    value={formData.uniquename}
                                    onChange={(_, data) => setFormData(prev => ({ ...prev, uniquename: data.value }))}
                                    placeholder="e.g., contoso_mybusinessevent"
                                />
                            </Field>
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
                                placeholder="Name"
                            />
                        </Field>

                        {/* Display Name */}
                        <Field label={<span className={styles.semiBoldLabel}>Display Name <span className={styles.required}>*</span></span>}>
                            <Input
                                appearance="filled-darker"
                                value={isEdit ? editData.displayname : formData.displayname}
                                onChange={(_, data) => {
                                    if (isEdit) {
                                        setEditData(prev => ({ ...prev, displayname: data.value }));
                                    } else {
                                        setFormData(prev => ({ ...prev, displayname: data.value }));
                                    }
                                }}
                                placeholder="Display Name"
                            />
                        </Field>

                        {/* Description */}
                        <Field label={<span className={styles.semiBoldLabel}>Description</span>}>
                            <Textarea
                                appearance="filled-darker"
                                value={isEdit ? editData.description : formData.description}
                                onChange={(_, data) => {
                                    if (isEdit) {
                                        setEditData(prev => ({ ...prev, description: data.value }));
                                    } else {
                                        setFormData(prev => ({ ...prev, description: data.value }));
                                    }
                                }}
                                placeholder="Description"
                                rows={3}
                            />
                        </Field>

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
