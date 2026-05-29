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
import { useCreateCatalog, useUpdateCatalog, useAllCatalogs } from '../../hooks/useCatalogs';
import { usePublishers } from '../../hooks/usePublishers';
import { useSolutions } from '../../hooks/useSolutions';
import { useAppStore } from '../../store/useAppStore';
import { Catalog, CatalogCreateInput, CatalogUpdateInput, DEFAULT_CATALOG_CREATE_TEMPLATE } from '../../models/Catalog';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { useAppSettings } from '../../hooks/useAppSettings';
import { ChevronDown16Regular, ChevronRight16Regular, LockClosed16Regular, LockOpen16Regular } from '@fluentui/react-icons';
import { hasCaseInsensitiveMatch } from '../../utils/validation';

export type CatalogDialogMode = 'create-root' | 'create-category' | 'edit';

type CatalogCreateFormData = CatalogCreateInput & {
    _publisherid_value: string;
};

const DEFAULT_CATALOG_CREATE_FORM: CatalogCreateFormData = {
    ...DEFAULT_CATALOG_CREATE_TEMPLATE,
    _publisherid_value: '',
};

interface CatalogDialogProps {
    open: boolean;
    mode: CatalogDialogMode;
    catalog: Catalog | null;
    parentCatalog: Catalog | null;
    onClose: () => void;
}

export const CatalogDialog: React.FC<CatalogDialogProps> = ({
    open,
    mode,
    catalog,
    parentCatalog,
    onClose,
}) => {
    const styles = useStyles();
    const createCatalog = useCreateCatalog();
    const updateCatalog = useUpdateCatalog();
    const { catalogs: allCatalogs } = useAllCatalogs();
    const publishersQuery = usePublishers();
    const { solutions, isFetching: isFetchingSolutions } = useSolutions();
    const {
        selectedSolutionId,
        selectedPublisherId,
        setSelectedSolutionId,
        setSelectedCatalogId,
        setPendingBusinessEventCatalogId,
        setSelectedPublisherId,
    } = useAppStore();
    const { appsettings } = useAppSettings();

    const isEdit = mode === 'edit';
    const isCreateCategory = mode === 'create-category';
    const isCreateRoot = mode === 'create-root';
    const previousOpenRef = useRef(false);
    const defaultPublisherAppliedRef = useRef(false);
    const uniqueNameInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState<CatalogCreateFormData>(DEFAULT_CATALOG_CREATE_FORM);
    const [editData, setEditData] = useState<CatalogUpdateInput>({ name: '', displayname: '', description: '' });
    const [selectedSolutionForCreate, setSelectedSolutionForCreate] = useState<string | null>(null);

    // Get selected solution for adding to solution
    const defaultPublisherId = appsettings?.defaultPublisherId ?? '';
    const [isPublisherExpanded, setIsPublisherExpanded] = useState(!(defaultPublisherId || selectedPublisherId));
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
    const activePublisherId = formData._publisherid_value;
    const getPublisherPrefix = (publisherId: string) =>
        publishersQuery.publishers?.find((publisher) => publisher.publisherid === publisherId)?.customizationprefix || '';
    const editParentCatalog = useMemo(() => {
        if (!isEdit || !catalog?._parentcatalogid_value) {
            return null;
        }

        return allCatalogs.find((existingCatalog) => existingCatalog.catalogid === catalog._parentcatalogid_value) ?? null;
    }, [allCatalogs, catalog, isEdit]);
   
    // useMemo to get the prefix of the selected publisher
    const selectedPublisherPrefix = useMemo(() => {
        if (!activePublisherId || !publishersQuery.publishers) {
            return '';
        }
        const publisher = publishersQuery.publishers.find(p => p.publisherid === activePublisherId);
        return publisher?.customizationprefix || '';
    }, [activePublisherId, publishersQuery.publishers]);

    // useMemo to get the display text of the selected publisher
    const selectedPublisherDisplay = useMemo(() => {
        if (!activePublisherId || !publishersQuery.publishers) {
            return '';
        }
        const publisher = publishersQuery.publishers.find(p => p.publisherid === activePublisherId);
        return publisher ? `${publisher.friendlyname} (${publisher.customizationprefix})` : '';
    }, [activePublisherId, publishersQuery.publishers]);


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

    const parentCatalogDisplayName = useMemo(() => {
        if (isCreateCategory && parentCatalog) {
            return parentCatalog.displayname || parentCatalog.name;
        }

        if (isEdit && catalog?._parentcatalogid_value) {
            return (
                editParentCatalog?.displayname ||
                editParentCatalog?.name ||
                catalog['_parentcatalogid_value@OData.Community.Display.V1.FormattedValue'] ||
                ''
            );
        }

        return '';
    }, [catalog, editParentCatalog, isCreateCategory, isEdit, parentCatalog]);

    const showParentCatalogSection = Boolean(
        parentCatalogDisplayName && (isCreateCategory || (isEdit && catalog?._parentcatalogid_value))
    );

    // Reset form when dialog opens
    useEffect(() => {
        if (!open) {
            previousOpenRef.current = false;
            defaultPublisherAppliedRef.current = false;
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

        const initialPublisherId = defaultPublisherId || selectedPublisherId || '';

        setFormData({
            ...DEFAULT_CATALOG_CREATE_FORM,
            _parentcatalogid_value: isCreateCategory ? parentCatalog?.catalogid || '' : '',
            _publisherid_value: initialPublisherId,
        });
        defaultPublisherAppliedRef.current = Boolean(defaultPublisherId);
        setSelectedPublisherId(initialPublisherId || null);

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
    }, [open, isEdit, isCreateCategory, catalog, parentCatalog, defaultPublisherId, unmanagedSolutions, selectedPublisherId, selectedSolutionId, setSelectedPublisherId]);

    useEffect(() => {
        if (!open || isEdit || defaultPublisherAppliedRef.current || !defaultPublisherId) {
            return;
        }

        defaultPublisherAppliedRef.current = true;
        setSelectedPublisherId(defaultPublisherId);
        setFormData((current) => (
            current._publisherid_value
                ? current
                : { ...current, _publisherid_value: defaultPublisherId }
        ));
    }, [defaultPublisherId, isEdit, open, setSelectedPublisherId]);

    useEffect(() => {
        if (!open || isEdit) {
            return;
        }

        setIsPublisherExpanded(!activePublisherId);
    }, [activePublisherId, isEdit, open]);

    

    // Validation
    const validation = useMemo(() => {
        if (isEdit) {
            if (!editData.name?.trim() || !editData.displayname?.trim()) {
                return { isValid: false, message: 'Name and Display Name are required.' };
            }
        } else {
            if (!activePublisherId) {
                return { isValid: false, message: 'Publisher is required.' };
            }
            if (!formData.uniquename?.trim() || !formData.name?.trim() || !formData.displayname?.trim()) {
                return { isValid: false, message: 'Unique Name, Name, and Display Name are required.' };
            }
            if (hasCaseInsensitiveMatch(allCatalogs, formData.uniquename, c => c.uniquename)) {
                return { isValid: false, message: `Catalog with unique name '${formData.uniquename}' already exists.` };
            }
        }
        return { isValid: true, message: '' };
    }, [activePublisherId, allCatalogs, isEdit, formData, editData]);

    const handleSave = async () => {
        try {
            if (isEdit && catalog) {
                await updateCatalog.mutateAsync({
                    current: catalog,
                    next: editData,
                });
            } else {
                const catalogPayload: CatalogCreateInput = {
                    uniquename: formData.uniquename,
                    name: formData.name,
                    displayname: formData.displayname,
                    description: formData.description,
                    _parentcatalogid_value: formData._parentcatalogid_value,
                };

                const result = await createCatalog.mutateAsync({
                    next: catalogPayload,
                    solutionId: selectedSolutionForCreate,
                    solutionUniqueName: selectedSolutionForCreateRecord?.uniquename,
                });

                if (result.created && result.id) {
                    const rootCatalogId = parentCatalog?._parentcatalogid_value || parentCatalog?.catalogid || result.id;
                    setSelectedSolutionId(selectedSolutionForCreate);
                    setSelectedCatalogId(rootCatalogId);
                    setPendingBusinessEventCatalogId(result.id);
                }
            }
            onClose();
        } catch (error) {
            // Error is handled by mutation hooks
            console.error('Error saving catalog:', error);
        }
    };

    const isSaving = createCatalog.isPending || updateCatalog.isPending;
    const dialogTitle = isEdit
        ? 'Edit Catalog'
        : isCreateRoot
            ? 'Create Root Catalog'
            : 'Create Category';

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface className={styles.dialogSurface}>
                <DialogBody>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogContent className={styles.dialogContentColumn}>
                        {/* Parent info for categories */}
                        {showParentCatalogSection && (
                            <div className={styles.dialogSection}>
                                <Text size={200} weight="semibold">Parent Catalog</Text>
                                <Text>{parentCatalogDisplayName}</Text>
                            </div>
                        )}

                        {!isEdit && (
                            <div className={styles.formGrid}>
                                {!isPublisherExpanded && activePublisherId && (
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

                                {(isPublisherExpanded || !activePublisherId) && (
                                    <div className={mergeClasses(styles.formSection, styles.twoColumn)}>
                                        <Field
                                            label={
                                                activePublisherId ? (
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
                                            {publishersQuery.isFetching ? (
                                                <Input value="Loading publishers..." readOnly appearance="filled-darker" />
                                            ) : (
                                                <GenericTagPicker
                                                    items={publishersQuery.publishers
                                                        .map((publisher) => ({
                                                            id: publisher.publisherid,
                                                            displayText: `${publisher.friendlyname} (${publisher.customizationprefix})`,
                                                        } as SelectableItem))
                                                        .sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                                                    initialValue={activePublisherId || ''}
                                                    onSelect={(id) => {
                                                        const nextPublisherId = id || '';
                                                        const nextPublisherPrefix = getPublisherPrefix(nextPublisherId);

                                                        setSelectedPublisherId(nextPublisherId || null);
                                                        setFormData((current) => {
                                                            const currentPrefix = getPublisherPrefix(current._publisherid_value);
                                                            const currentSuffix =
                                                                currentPrefix && current.uniquename.startsWith(`${currentPrefix}_`)
                                                                    ? current.uniquename.slice(currentPrefix.length + 1)
                                                                    : current.uniquename;

                                                            return {
                                                                ...current,
                                                                _publisherid_value: nextPublisherId,
                                                                uniquename: nextPublisherPrefix
                                                                    ? (currentSuffix ? `${nextPublisherPrefix}_${currentSuffix}` : '')
                                                                    : currentSuffix,
                                                            };
                                                        });

                                                        if (nextPublisherId) {
                                                            setIsPublisherExpanded(false); // auto-collapse on selection
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
                                           
                                            const currentSuffix =
                                                selectedPublisherPrefix && current.uniquename.startsWith(`${selectedPublisherPrefix}_`)
                                                    ? current.uniquename.slice(selectedPublisherPrefix.length + 1)
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

                        {isEdit && catalog && (
                            <div className={styles.formGrid}>
                                <div className={styles.formSection}>
                                    <Field
                                        label={
                                            <span className={styles.fieldLabelStandard}>
                                                <span className={styles.semiBoldLabel}>Unique Name</span>
                                                <LockClosed16Regular />
                                            </span>
                                        }
                                    >
                                        <Input
                                            appearance="filled-darker"
                                            value={catalog.uniquename || ''}
                                            readOnly
                                            className={styles.disabledInput}
                                        />
                                    </Field>
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
