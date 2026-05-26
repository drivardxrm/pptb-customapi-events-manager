import React, { useState, useEffect, useMemo, useRef } from 'react';
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
    Divider,
    Label,
    mergeClasses,
} from '@fluentui/react-components';
import { useStyles } from '../../styles/Styles';
import { useCreateCatalog, useUpdateCatalog, useCatalogs } from '../../hooks/useCatalogs';
import { usePublishers } from '../../hooks/usePublishers';
import { useSolutions } from '../../hooks/useSolutions';
import { useAppStore } from '../../store/useAppStore';
import { Catalog, CatalogCreateable, CatalogUpdateable, DEFAULT_CATALOG_CREATE_TEMPLATE } from '../../models/Catalog';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { useAppSettings } from '../../hooks/useAppSettings';
import { ChevronDown16Regular, ChevronRight16Regular, LockOpen16Regular } from '@fluentui/react-icons';

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
    const { solutions, isFetching: isFetchingSolutions } = useSolutions();
    const { selectedSolutionId, selectedPublisherId, setSelectedPublisherId } = useAppStore();
    const { appsettings } = useAppSettings();

    const isEdit = mode === 'edit';
    const isCreateCategory = mode === 'create-category';
    const isCreateRoot = mode === 'create-root';
    const previousOpenRef = useRef(false);
    const uniqueNameInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState<CatalogCreateable>(DEFAULT_CATALOG_CREATE_TEMPLATE);
    const [editData, setEditData] = useState<CatalogUpdateable>({ name: '', displayname: '', description: '' });
    const [selectedSolutionForCreate, setSelectedSolutionForCreate] = useState<string | null>(null);

    // Get selected solution for adding to solution
    const initialPublisherId = appsettings?.defaultPublisherId ?? selectedPublisherId ?? '';
    const [isPublisherExpanded, setIsPublisherExpanded] = useState(!initialPublisherId);
    const unmanagedSolutions = useMemo(() => solutions.filter((solution) => !solution.ismanaged), [solutions]);
    const solutionItems: SelectableItem[] = useMemo(() =>
        unmanagedSolutions
            .map((solution) => ({
                id: solution.solutionid,
                displayText: `${solution.friendlyname} (${solution.uniquename})`,
                image: <LockOpen16Regular />,
            } as SelectableItem))
            .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || '')),
    [unmanagedSolutions]);
    const selectedSolutionForCreateRecord = unmanagedSolutions.find(
        (solution) => solution.solutionid === selectedSolutionForCreate
    );
    const getPublisherPrefix = (publisherId: string) =>
        publishers.find((publisher) => publisher.publisherid === publisherId)?.customizationprefix || '';
    const selectedPublisherPrefix = useMemo(
        () => getPublisherPrefix(formData._publisherid_value),
        [formData._publisherid_value, publishers]
    );
    const selectedPublisherDisplay = useMemo(() => {
        const publisher = publishers.find((item) => item.publisherid === formData._publisherid_value);
        return publisher ? `${publisher.friendlyname} (${publisher.customizationprefix})` : '';
    }, [formData._publisherid_value, publishers]);
    const uniqueNameSuffix = useMemo(() => {
        if (!formData.uniquename) {
            return '';
        }

        if (selectedPublisherPrefix && formData.uniquename.startsWith(`${selectedPublisherPrefix}_`)) {
            return formData.uniquename.slice(selectedPublisherPrefix.length + 1);
        }

        const parts = formData.uniquename.split('_');
        return parts.length > 1 ? parts.slice(1).join('_') : parts[0] ?? '';
    }, [formData.uniquename, selectedPublisherPrefix]);

    // Reset form when modal opens
    useEffect(() => {
        if (!open) {
            previousOpenRef.current = false;
            return;
        }

        if (previousOpenRef.current) {
            return;
        }

        previousOpenRef.current = true;

        if (isEdit && catalog) {
            setEditData({
                name: catalog.name || '',
                displayname: catalog.displayname || '',
                description: catalog.description || '',
            });
            return;
        }

        setFormData({
            ...DEFAULT_CATALOG_CREATE_TEMPLATE,
            _parentcatalogid_value: isCreateCategory ? parentCatalog?.catalogid || '' : '',
            _publisherid_value: initialPublisherId,
        });

        const isInUnmanagedList = unmanagedSolutions.some(
            (solution) => solution.solutionid === selectedSolutionId
        );
        setSelectedSolutionForCreate(isInUnmanagedList ? selectedSolutionId : null);

        // Focus unique name input when create form opens
        if (!isEdit) {
            setTimeout(() => {
                uniqueNameInputRef.current?.focus();
            }, 100);
        }
    }, [open, isEdit, isCreateCategory, catalog, parentCatalog, initialPublisherId, unmanagedSolutions, selectedSolutionId]);

    useEffect(() => {
        if (!open || isEdit) {
            return;
        }

        setIsPublisherExpanded(!formData._publisherid_value);
    }, [formData._publisherid_value, isEdit, open]);

    useEffect(() => {
        if (!open || isEdit || !appsettings?.defaultPublisherId) {
            return;
        }

        setFormData((current) =>
            current._publisherid_value
                ? current
                : { ...current, _publisherid_value: appsettings.defaultPublisherId! }
        );
    }, [appsettings?.defaultPublisherId, isEdit, open]);

    // Validation
    const validation = useMemo(() => {
        if (isEdit) {
            if (!editData.name?.trim() || !editData.displayname?.trim()) {
                return { isValid: false, message: 'Name and Display Name are required.' };
            }
        } else {
            if (!formData._publisherid_value) {
                return { isValid: false, message: 'Publisher is required.' };
            }
            if (!formData.uniquename?.trim() || !formData.name?.trim() || !formData.displayname?.trim()) {
                return { isValid: false, message: 'Unique Name, Name, and Display Name are required.' };
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
                    solutionUniqueName: selectedSolutionForCreateRecord?.uniquename,
                });
            }
            onClose();
        } catch (error) {
            // Error is handled by mutation hooks
            console.error('Error saving catalog:', error);
        }
    };

    const getTitle = () => {
        if (isEdit) return 'Edit Catalog';
        if (isCreateRoot) return 'Create Root Catalog';
        return 'Create Category';
    };

    const isSaving = createCatalog.isPending || updateCatalog.isPending;

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface className={styles.dialogSurface}>
                <DialogBody>
                    <DialogTitle>{getTitle()}</DialogTitle>
                    <DialogContent className={styles.dialogContentColumn}>
                        {/* Parent info for categories */}
                        {isCreateCategory && parentCatalog && (
                            <div className={styles.dialogSection}>
                                <Text size={200} weight="semibold">Parent Catalog</Text>
                                <Text>{parentCatalog.displayname || parentCatalog.name}</Text>
                            </div>
                        )}

                        {!isEdit && (
                            <div className={styles.formGrid}>
                                {!isPublisherExpanded && formData._publisherid_value && (
                                    <div
                                        className={styles.formSection}
                                        onClick={() => setIsPublisherExpanded(true)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span className={styles.fieldLabelClickable}>
                                            <ChevronRight16Regular />
                                            <span className={styles.semiBoldLabel}>Publisher:</span>
                                            <Text>{selectedPublisherDisplay}</Text>
                                        </span>
                                    </div>
                                )}

                                {(isPublisherExpanded || !formData._publisherid_value) && (
                                    <div className={mergeClasses(styles.formSection, styles.twoColumn)}>
                                        <Field
                                            label={
                                                formData._publisherid_value ? (
                                                    <span
                                                        className={styles.fieldLabelClickable}
                                                        onClick={() => setIsPublisherExpanded(false)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <ChevronDown16Regular />
                                                        <span className={styles.semiBoldLabel}>Publisher</span>
                                                    </span>
                                                ) : 'Publisher'
                                            }
                                            required
                                        >
                                            {isFetchingPublishers ? (
                                                <Input value="Loading publishers..." readOnly appearance="filled-darker" />
                                            ) : (
                                                <GenericTagPicker
                                                    items={publishers
                                                        .map((publisher) => ({
                                                            id: publisher.publisherid,
                                                            displayText: `${publisher.friendlyname} (${publisher.customizationprefix})`,
                                                        } as SelectableItem))
                                                        .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                                                    initialValue={formData._publisherid_value || ''}
                                                    onSelect={(id) => {
                                                        const nextPublisherId = id || '';
                                                        const nextPublisherPrefix = nextPublisherId ? getPublisherPrefix(nextPublisherId) : '';

                                                        setSelectedPublisherId(nextPublisherId);
                                                        setFormData((current) => {
                                                            const currentPrefix = getPublisherPrefix(current._publisherid_value);
                                                            const currentSuffix =
                                                                currentPrefix && current.uniquename.startsWith(`${currentPrefix}_`)
                                                                    ? current.uniquename.slice(currentPrefix.length + 1)
                                                                    : current.uniquename;

                                                            return {
                                                                ...current,
                                                                _publisherid_value: nextPublisherId,
                                                                uniquename:
                                                                    nextPublisherPrefix && currentSuffix
                                                                        ? `${nextPublisherPrefix}_${currentSuffix}`
                                                                        : '',
                                                            };
                                                        });

                                                        if (nextPublisherId) {
                                                            setIsPublisherExpanded(false);
                                                        }
                                                    }}
                                                />
                                            )}
                                        </Field>
                                    </div>
                                )}
                            </div>
                        )}

                        {!isEdit && selectedPublisherPrefix !== '' && (
                            <Field label={<span className={styles.semiBoldLabel}>Unique Name <span className={styles.required}>*</span></span>}>
                                <Input
                                    ref={uniqueNameInputRef}
                                    appearance="filled-darker"
                                    contentBefore={<Text size={400}>{`${selectedPublisherPrefix}_`}</Text>}
                                    value={uniqueNameSuffix}
                                    onChange={(_, data) => {
                                        const suffix = data.value;

                                        setFormData((current) => {
                                            const currentPrefix = getPublisherPrefix(current._publisherid_value);
                                            const currentSuffix =
                                                currentPrefix && current.uniquename.startsWith(`${currentPrefix}_`)
                                                    ? current.uniquename.slice(currentPrefix.length + 1)
                                                    : current.uniquename;

                                            if (suffix === currentSuffix) {
                                                return current;
                                            }

                                            return {
                                                ...current,
                                                uniquename: `${selectedPublisherPrefix}_${suffix}`,
                                                name:
                                                    current.name.trim() === '' || current.name === currentSuffix
                                                        ? suffix
                                                        : current.name,
                                                displayname:
                                                    current.displayname.trim() === '' || current.displayname === currentSuffix
                                                        ? suffix
                                                        : current.displayname,
                                                description:
                                                    current.description.trim() === '' || current.description === currentSuffix
                                                        ? suffix
                                                        : current.description,
                                            };
                                        });
                                    }}
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
                                rows={3}
                            />
                        </Field>

                        {!isEdit && (
                            <div className={styles.dialogSection}>
                                <Label weight="semibold" size="large">Add to Solution (Optional)</Label>
                                <Text className={styles.hintText}>
                                    Select an unmanaged solution to add the Business Event to. If no solution is selected, it will be created in the default solution.
                                </Text>
                                <Divider />
                                {isFetchingSolutions ? (
                                    <Spinner size="small" label="Loading solutions..." />
                                ) : (
                                    <GenericTagPicker
                                        items={solutionItems}
                                        initialValue={selectedSolutionForCreate ?? undefined}
                                        onSelect={(id) => setSelectedSolutionForCreate(id)}
                                    />
                                )}
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
