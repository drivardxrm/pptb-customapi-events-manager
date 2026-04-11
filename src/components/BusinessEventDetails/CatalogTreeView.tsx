import React, { useState } from 'react';
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
} from '@fluentui/react-components';
import {
    FolderRegular,
    FolderOpenRegular,
    PlugConnectedRegular,
    AddRegular,
    EditRegular,
    DeleteRegular,
    LockClosedRegular,
    TableRegular,
    PlayRegular,
} from '@fluentui/react-icons';
import { useCatalogs, useDeleteCatalog } from '../../hooks/useCatalogs';
import { useCatalogAssignmentsByCatalog, useDeleteCatalogAssignment } from '../../hooks/useCatalogAssignments';
import { Catalog } from '../../models/Catalog';
import { CatalogAssignment, CatalogAssignmentTypeOptions } from '../../models/CatalogAssignment';
import { ConfirmDialog } from './ConfirmDialog';

const useTreeStyles = makeStyles({
    treeContainer: {
        padding: tokens.spacingVerticalM,
        minHeight: '200px',
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
});

interface CatalogTreeViewProps {
    onCreateCategory: (parentCatalog: Catalog) => void;
    onEditCatalog: (catalog: Catalog) => void;
    onCreateAssignment: (parentCatalog: Catalog) => void;
    onEditAssignment: (assignment: CatalogAssignment, parentCatalog: Catalog) => void;
}

export const CatalogTreeView: React.FC<CatalogTreeViewProps> = ({
    onCreateCategory,
    onEditCatalog,
    onCreateAssignment,
    onEditAssignment,
}) => {
    const styles = useTreeStyles();
    const { catalogs, isFetching: isFetchingCatalogs } = useCatalogs();
    const deleteCatalog = useDeleteCatalog();
    const deleteAssignment = useDeleteCatalogAssignment();

    // Confirm dialog states
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'catalog' | 'assignment'; item: Catalog | CatalogAssignment } | null>(null);

    // Get root catalogs (no parent)
    const rootCatalogs = catalogs.filter(c => !c._parentcatalogid_value);

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

    if (isFetchingCatalogs) {
        return (
            <div className={styles.loadingContainer}>
                <Spinner size="small" label="Loading catalogs..." />
            </div>
        );
    }

    if (rootCatalogs.length === 0) {
        return (
            <div className={styles.emptyState}>
                <Text>No Business Event catalogs found in this solution.</Text>
                <br />
                <Text size={200}>Create a Root Catalog to get started.</Text>
            </div>
        );
    }

    return (
        <div className={styles.treeContainer}>
            <Tree aria-label="Business Events Catalog Tree">
                {rootCatalogs.map(rootCatalog => (
                    <RootCatalogItem
                        key={rootCatalog.catalogid}
                        catalog={rootCatalog}
                        allCatalogs={catalogs}
                        onCreateCategory={onCreateCategory}
                        onEditCatalog={onEditCatalog}
                        onDeleteCatalog={(c) => handleDeleteClick('catalog', c)}
                        onCreateAssignment={onCreateAssignment}
                        onEditAssignment={onEditAssignment}
                        onDeleteAssignment={(a) => handleDeleteClick('assignment', a)}
                    />
                ))}
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
}) => {
    const styles = useTreeStyles();

    // Get children of this catalog
    const children = allCatalogs.filter(c => c._parentcatalogid_value === catalog.catalogid);

    return (
        <TreeItem itemType={children.length > 0 ? 'branch' : 'leaf'} value={catalog.catalogid}>
            <TreeItemLayout
                className={mergeClasses(styles.treeItem, styles.treeItemHover)}
                iconBefore={<FolderRegular />}
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

            {/* Category children */}
            {children.map(category => (
                <CategoryItem
                    key={category.catalogid}
                    catalog={category}
                    onEditCatalog={onEditCatalog}
                    onDeleteCatalog={onDeleteCatalog}
                    onCreateAssignment={onCreateAssignment}
                    onEditAssignment={onEditAssignment}
                    onDeleteAssignment={onDeleteAssignment}
                />
            ))}
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
}

const CategoryItem: React.FC<CategoryItemProps> = ({
    catalog,
    onEditCatalog,
    onDeleteCatalog,
    onCreateAssignment,
    onEditAssignment,
    onDeleteAssignment,
}) => {
    const styles = useTreeStyles();
    const { assignments, isFetching } = useCatalogAssignmentsByCatalog(catalog.catalogid);

    return (
        <TreeItem itemType={assignments.length > 0 || isFetching ? 'branch' : 'leaf'} value={catalog.catalogid}>
            <TreeItemLayout
                className={mergeClasses(styles.treeItem, styles.treeItemHover)}
                iconBefore={<FolderOpenRegular />}
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
                />
            ))}
        </TreeItem>
    );
};

// Assignment Item Component
interface AssignmentItemProps {
    assignment: CatalogAssignment;
    parentCatalog: Catalog;
    onEditAssignment: (assignment: CatalogAssignment, parentCatalog: Catalog) => void;
    onDeleteAssignment: (assignment: CatalogAssignment) => void;
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({
    assignment,
    parentCatalog,
    onEditAssignment,
    onDeleteAssignment,
}) => {
    const styles = useTreeStyles();

    const getTypeIcon = () => {
        switch (assignment.catalogassignmenttype) {
            case 0: return <TableRegular />;
            case 1: return <PlugConnectedRegular />;
            case 2: return <PlayRegular />;
            default: return <PlugConnectedRegular />;
        }
    };

    const getTypeName = () => {
        if (assignment.catalogassignmenttype !== null && assignment.catalogassignmenttype !== undefined) {
            return CatalogAssignmentTypeOptions[assignment.catalogassignmenttype as keyof typeof CatalogAssignmentTypeOptions] || 'Unknown';
        }
        return 'Unknown';
    };

    return (
        <TreeItem itemType="leaf" value={assignment.catalogassignmentid}>
            <TreeItemLayout
                className={mergeClasses(styles.treeItem, styles.treeItemHover)}
                iconBefore={getTypeIcon()}
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
                        {getTypeName()}
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
