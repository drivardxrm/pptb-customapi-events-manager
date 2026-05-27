import React, { useEffect, useState } from 'react';
import {
    Tree,
    TreeItem,
    TreeItemLayout,
    Button,
    Spinner,
    Text,
    Badge,
    makeStyles,
    tokens,
    mergeClasses,
    TreeOpenChangeData,
    TreeOpenChangeEvent,
} from '@fluentui/react-components';
import {
    FolderRegular,
    FolderOpenRegular,
    PlugConnectedRegular,
    AddRegular,
    EditRegular,
    DeleteRegular,
    LockClosedRegular,
} from '@fluentui/react-icons';
import { useCatalogs, useDeleteCatalog } from '../../hooks/useCatalogs';
import { useCatalogAssignmentsByCatalog, useDeleteCatalogAssignment } from '../../hooks/useCatalogAssignments';
import { useAppStore } from '../../store/useAppStore';
import { Catalog } from '../../models/Catalog';
import { CatalogAssignment, getObjectTypeLabel, getObjectTypeIcon } from '../../models/CatalogAssignment';
import { ConfirmDialog } from './ConfirmDialog';
import { SelectedTreeItem } from './TreeItemDetailsPanel';

const useTreeStyles = makeStyles({
    treeContainer: {
        padding: tokens.spacingVerticalM,
        minHeight: '200px',
        flex: 1,
        minWidth: '280px',
    },
    treeItem: {
        marginBottom: tokens.spacingVerticalXS,
    },
    treeItemContent: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        flex: 1,
    },
    itemName: {
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    itemActions: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
        opacity: 0,
        transition: 'opacity 0.15s',
    },
    treeItemHover: {
        '&:hover': {
            '& .item-actions': {
                opacity: 1,
            },
        },
    },
    managedBadge: {
        marginLeft: tokens.spacingHorizontalXS,
    },
    typeBadge: {
        marginLeft: tokens.spacingHorizontalXS,
    },
    emptyState: {
        padding: tokens.spacingVerticalL,
        textAlign: 'center',
        color: tokens.colorNeutralForeground3,
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: tokens.spacingVerticalL,
    },
    treeItemSelected: {
        backgroundColor: tokens.colorNeutralBackground1Selected,
        borderRadius: tokens.borderRadiusMedium,
    },
    treeItemClickable: {
        cursor: 'pointer',
    },
});

interface CatalogTreeViewProps {
    onCreateCategory: (parentCatalog: Catalog) => void;
    onEditCatalog: (catalog: Catalog) => void;
    onCreateAssignment: (parentCatalog: Catalog) => void;
    onEditAssignment: (assignment: CatalogAssignment, parentCatalog: Catalog) => void;
    selectedItem: SelectedTreeItem;
    onSelectItem: (item: SelectedTreeItem) => void;
}

export const CatalogTreeView: React.FC<CatalogTreeViewProps> = ({
    onCreateCategory,
    onEditCatalog,
    onCreateAssignment,
    onEditAssignment,
    selectedItem,
    onSelectItem,
}) => {
    const styles = useTreeStyles();
    const { selectedCatalogId } = useAppStore();
    const { catalogs, isFetching: isFetchingCatalogs } = useCatalogs();
    const deleteCatalog = useDeleteCatalog();
    const deleteAssignment = useDeleteCatalogAssignment();

    // Confirm dialog states
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'catalog' | 'assignment'; item: Catalog | CatalogAssignment } | null>(null);

    // Get the selected root catalog only
    const selectedCatalog = catalogs.find(c => c.catalogid === selectedCatalogId);

    const handleDeleteClick = (type: 'catalog' | 'assignment', item: Catalog | CatalogAssignment) => {
        setItemToDelete({ type, item });
        setDeleteConfirmOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!itemToDelete) return;

        try {
            if (itemToDelete.type === 'catalog') {
                await deleteCatalog.mutateAsync({ catalog: itemToDelete.item as Catalog });
            } else {
                await deleteAssignment.mutateAsync({ assignment: itemToDelete.item as CatalogAssignment });
            }
        } finally {
            setDeleteConfirmOpen(false);
            setItemToDelete(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
    };

    const categoryIds = catalogs
        .filter(c => c._parentcatalogid_value === selectedCatalogId)
        .map(c => c.catalogid);

    // All items that should be open - root + all categories
    const allOpenItems = selectedCatalog ? [selectedCatalog.catalogid, ...categoryIds] : [];

    if (isFetchingCatalogs) {
        return (
            <div className={styles.loadingContainer}>
                <Spinner size="small" label="Loading catalogs..." />
            </div>
        );
    }

    if (!selectedCatalog) {
        return (
            <div className={styles.emptyState}>
                <Text>Selected catalog not found.</Text>
                <br />
                <Text size={200}>Select a different Catalog above.</Text>
            </div>
        );
    }

    // Prevent collapsing by always keeping all items open
    const handleOpenChange = (_event: TreeOpenChangeEvent, _data: TreeOpenChangeData) => {
        // Do nothing - keep tree always expanded
    };

    return (
        <div className={styles.treeContainer}>
            <Tree 
                aria-label="Business Events Catalog Tree"
                openItems={allOpenItems}
                onOpenChange={handleOpenChange}
            >
                <RootCatalogItem
                    catalog={selectedCatalog}
                    allCatalogs={catalogs}
                    onCreateCategory={onCreateCategory}
                    onEditCatalog={onEditCatalog}
                    onDeleteCatalog={(c) => handleDeleteClick('catalog', c)}
                    onCreateAssignment={onCreateAssignment}
                    onEditAssignment={onEditAssignment}
                    onDeleteAssignment={(a) => handleDeleteClick('assignment', a)}
                    selectedItem={selectedItem}
                    onSelectItem={onSelectItem}
                />
            </Tree>

            <ConfirmDialog
                open={deleteConfirmOpen}
                title={`Delete ${itemToDelete?.type === 'catalog' ? 'Catalog' : 'Assignment'}?`}
                message={itemToDelete ? `Are you sure you want to delete "${itemToDelete.type === 'catalog' ? (itemToDelete.item as Catalog).name : (itemToDelete.item as CatalogAssignment).name}"? This action cannot be undone.` : ''}
                confirmLabel="Delete"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                isLoading={deleteCatalog.isPending || deleteAssignment.isPending}
                intent="danger"
            />
        </div>
    );
};

// Root Catalog Item Component
interface RootCatalogItemProps {
    catalog: Catalog;
    allCatalogs: Catalog[];
    onCreateCategory: (parentCatalog: Catalog) => void;
    onEditCatalog: (catalog: Catalog) => void;
    onDeleteCatalog: (catalog: Catalog) => void;
    onCreateAssignment: (parentCatalog: Catalog) => void;
    onEditAssignment: (assignment: CatalogAssignment, parentCatalog: Catalog) => void;
    onDeleteAssignment: (assignment: CatalogAssignment) => void;
    selectedItem: SelectedTreeItem;
    onSelectItem: (item: SelectedTreeItem) => void;
}

const RootCatalogItem: React.FC<RootCatalogItemProps> = ({
    catalog,
    allCatalogs,
    onCreateCategory,
    onEditCatalog,
    onDeleteCatalog,
    onCreateAssignment,
    onEditAssignment,
    onDeleteAssignment,
    selectedItem,
    onSelectItem,
}) => {
    const styles = useTreeStyles();

    // Get children of this catalog
    const children = allCatalogs.filter(c => c._parentcatalogid_value === catalog.catalogid);

    // Check if this catalog is selected
    const isSelected = selectedItem?.type === 'catalog' && selectedItem.item.catalogid === catalog.catalogid;

    const handleClick = () => {
        onSelectItem({ type: 'catalog', item: catalog, isCategory: false });
    };

    return (
        <TreeItem itemType={children.length > 0 ? 'branch' : 'leaf'} value={catalog.catalogid}>
            <TreeItemLayout
                className={mergeClasses(
                    styles.treeItem, 
                    styles.treeItemHover, 
                    styles.treeItemClickable,
                    isSelected && styles.treeItemSelected
                )}
                iconBefore={<FolderRegular />}
                onClick={handleClick}
                actions={
                    <div className={mergeClasses(styles.itemActions, 'item-actions')}>
                        {!catalog.ismanaged && (
                            <>
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<AddRegular />}
                                    onClick={(e) => { e.stopPropagation(); onCreateCategory(catalog); }}
                                    title="Add Category"
                                />
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<EditRegular />}
                                    onClick={(e) => { e.stopPropagation(); onEditCatalog(catalog); }}
                                    title="Edit"
                                />
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<DeleteRegular />}
                                    onClick={(e) => { e.stopPropagation(); onDeleteCatalog(catalog); }}
                                    title="Delete"
                                />
                            </>
                        )}
                    </div>
                }
            >
                <div className={styles.treeItemContent}>
                    <span className={styles.itemName}>{catalog.displayname || catalog.name}</span>
                    {catalog.ismanaged && (
                        <Badge appearance="outline" size="small" className={styles.managedBadge} icon={<LockClosedRegular />}>
                            Managed
                        </Badge>
                    )}
                </div>
            </TreeItemLayout>

            {/* Category children - wrapped in Tree for proper nesting */}
            {children.length > 0 && (
                <Tree>
                    {children.map(category => (
                        <CategoryItem
                            key={category.catalogid}
                            catalog={category}
                            onEditCatalog={onEditCatalog}
                            onDeleteCatalog={onDeleteCatalog}
                            onCreateAssignment={onCreateAssignment}
                            onEditAssignment={onEditAssignment}
                            onDeleteAssignment={onDeleteAssignment}
                            selectedItem={selectedItem}
                            onSelectItem={onSelectItem}
                        />
                    ))}
                </Tree>
            )}
        </TreeItem>
    );
};

// Category Item Component
interface CategoryItemProps {
    catalog: Catalog;
    onEditCatalog: (catalog: Catalog) => void;
    onDeleteCatalog: (catalog: Catalog) => void;
    onCreateAssignment: (parentCatalog: Catalog) => void;
    onEditAssignment: (assignment: CatalogAssignment, parentCatalog: Catalog) => void;
    onDeleteAssignment: (assignment: CatalogAssignment) => void;
    selectedItem: SelectedTreeItem;
    onSelectItem: (item: SelectedTreeItem) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({
    catalog,
    onEditCatalog,
    onDeleteCatalog,
    onCreateAssignment,
    onEditAssignment,
    onDeleteAssignment,
    selectedItem,
    onSelectItem,
}) => {
    const styles = useTreeStyles();
    const { assignments, isFetching } = useCatalogAssignmentsByCatalog(catalog.catalogid);

    // Check if this category is selected
    const isSelected = selectedItem?.type === 'catalog' && selectedItem.item.catalogid === catalog.catalogid;

    // Sync selected assignment with latest data from query cache
    useEffect(() => {
        if (selectedItem?.type === 'assignment') {
            const updatedAssignment = assignments.find(
                a => a.catalogassignmentid === selectedItem.item.catalogassignmentid
            );
            if (updatedAssignment && updatedAssignment !== selectedItem.item) {
                onSelectItem({ type: 'assignment', item: updatedAssignment });
            }
        }
    }, [assignments, selectedItem, onSelectItem]);

    const handleClick = () => {
        onSelectItem({ type: 'catalog', item: catalog, isCategory: true });
    };

    return (
        <TreeItem itemType={assignments.length > 0 || isFetching ? 'branch' : 'leaf'} value={catalog.catalogid}>
            <TreeItemLayout
                className={mergeClasses(
                    styles.treeItem, 
                    styles.treeItemHover, 
                    styles.treeItemClickable,
                    isSelected && styles.treeItemSelected
                )}
                iconBefore={<FolderOpenRegular />}
                onClick={handleClick}
                actions={
                    <div className={mergeClasses(styles.itemActions, 'item-actions')}>
                        {!catalog.ismanaged && (
                            <>
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<AddRegular />}
                                    onClick={(e) => { e.stopPropagation(); onCreateAssignment(catalog); }}
                                    title="Add Assignment"
                                />
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<EditRegular />}
                                    onClick={(e) => { e.stopPropagation(); onEditCatalog(catalog); }}
                                    title="Edit"
                                />
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<DeleteRegular />}
                                    onClick={(e) => { e.stopPropagation(); onDeleteCatalog(catalog); }}
                                    title="Delete"
                                />
                            </>
                        )}
                    </div>
                }
            >
                <div className={styles.treeItemContent}>
                    <span className={styles.itemName}>{catalog.displayname || catalog.name}</span>
                    {catalog.ismanaged && (
                        <Badge appearance="outline" size="small" className={styles.managedBadge} icon={<LockClosedRegular />}>
                            Managed
                        </Badge>
                    )}
                </div>
            </TreeItemLayout>

            {/* Assignment children - wrapped in Tree for proper nesting */}
            {(assignments.length > 0 || isFetching) && (
                <Tree>
                    {/* Loading state for assignments */}
                    {isFetching && (
                        <TreeItem itemType="leaf" value={`${catalog.catalogid}-loading`}>
                            <TreeItemLayout>
                                <Spinner size="tiny" label="Loading assignments..." />
                            </TreeItemLayout>
                        </TreeItem>
                    )}

                    {/* Assignment children */}
                    {assignments.map(assignment => (
                        <AssignmentItem
                            key={assignment.catalogassignmentid}
                            assignment={assignment}
                            parentCatalog={catalog}
                            onEditAssignment={onEditAssignment}
                            onDeleteAssignment={onDeleteAssignment}
                            selectedItem={selectedItem}
                            onSelectItem={onSelectItem}
                        />
                    ))}
                </Tree>
            )}
        </TreeItem>
    );
};

// Assignment Item Component
interface AssignmentItemProps {
    assignment: CatalogAssignment;
    parentCatalog: Catalog;
    onEditAssignment: (assignment: CatalogAssignment, parentCatalog: Catalog) => void;
    onDeleteAssignment: (assignment: CatalogAssignment) => void;
    selectedItem: SelectedTreeItem;
    onSelectItem: (item: SelectedTreeItem) => void;
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({
    assignment,
    parentCatalog,
    onEditAssignment,
    onDeleteAssignment,
    selectedItem,
    onSelectItem,
}) => {
    const styles = useTreeStyles();

    const typeIcon = getObjectTypeIcon(assignment);
    const typeName = getObjectTypeLabel(assignment);

    // Check if this assignment is selected
    const isSelected = selectedItem?.type === 'assignment' && selectedItem.item.catalogassignmentid === assignment.catalogassignmentid;

    const handleClick = () => {
        onSelectItem({ type: 'assignment', item: assignment });
    };

    return (
        <TreeItem itemType="leaf" value={assignment.catalogassignmentid}>
            <TreeItemLayout
                className={mergeClasses(
                    styles.treeItem, 
                    styles.treeItemHover,
                    styles.treeItemClickable,
                    isSelected && styles.treeItemSelected
                )}
                iconBefore={typeIcon || <PlugConnectedRegular />}
                onClick={handleClick}
                actions={
                    <div className={mergeClasses(styles.itemActions, 'item-actions')}>
                        {!assignment.ismanaged && (
                            <>
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<EditRegular />}
                                    onClick={(e) => { e.stopPropagation(); onEditAssignment(assignment, parentCatalog); }}
                                    title="Edit"
                                />
                                <Button
                                    appearance="subtle"
                                    size="small"
                                    icon={<DeleteRegular />}
                                    onClick={(e) => { e.stopPropagation(); onDeleteAssignment(assignment); }}
                                    title="Delete"
                                />
                            </>
                        )}
                    </div>
                }
            >
                <div className={styles.treeItemContent}>
                    <span className={styles.itemName}>
                        {assignment.name || assignment['_object_value@OData.Community.Display.V1.FormattedValue'] || 'Unnamed Assignment'}
                    </span>
                    <Badge appearance="tint" size="small" className={styles.typeBadge}>
                        {typeName}
                    </Badge>
                    {assignment.ismanaged && (
                        <Badge appearance="outline" size="small" className={styles.managedBadge} icon={<LockClosedRegular />}>
                            Managed
                        </Badge>
                    )}
                </div>
            </TreeItemLayout>
        </TreeItem>
    );
};
