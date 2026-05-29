import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Divider, Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import { AddCircleColor, FolderRegular, FolderOpenRegular, PlugConnectedRegular } from '@fluentui/react-icons';
import { useAppStore } from '../../store/useAppStore';
import { useStyles } from '../../styles/Styles';
import { CatalogSelector } from '../CatalogSelector';
import { CatalogTreeView } from './CatalogTreeView';
import { CatalogDialog, CatalogDialogMode } from './CatalogModal';
import { CatalogAssignmentDialog } from './CatalogAssignmentModal';
import { TreeItemDetailsPanel, SelectedTreeItem } from './TreeItemDetailsPanel';
import { useCatalogs } from '../../hooks/useCatalogs';
import { useCatalogAssignments } from '../../hooks/useCatalogAssignments';
import { Catalog } from '../../models/Catalog';
import { CatalogAssignment } from '../../models/CatalogAssignment';

const useLocalStyles = makeStyles({
    contentLayout: {
        display: 'flex',
        flexDirection: 'row',
        gap: tokens.spacingHorizontalL,
        minHeight: '400px',
        padding: tokens.spacingVerticalM,
    },
    treeSection: {
        flex: '0 0 400px',
        minWidth: '400px',
        maxWidth: '500px',
        overflowX: 'hidden',
        overflowY: 'auto',
    },
    detailsSection: {
        flex: 1,
        minWidth: '300px',
        overflowY: 'auto',
    },
});

export const BusinessEventDetails: React.FC = () => {
    const styles = useStyles();
    const localStyles = useLocalStyles();
    const {
        selectedCatalogId,
        selectedNavItem,
        pendingBusinessEventAssignmentId,
        pendingBusinessEventCatalogId,
        setGlobalMessage,
        setPendingBusinessEventAssignmentId,
        setPendingBusinessEventCatalogId,
        setSelectedCatalogId,
        clearGlobalMessage,
    } = useAppStore();
    const { catalogs, isFetching: isFetchingCatalogs } = useCatalogs();
    const { catalogAssignments, isFetching: isFetchingAssignments } = useCatalogAssignments();

    // Selection state for tree items
    const [selectedTreeItem, setSelectedTreeItem] = useState<SelectedTreeItem>(null);

    // Dialog state
    const [catalogDialogOpen, setCatalogDialogOpen] = useState(false);
    const [catalogDialogMode, setCatalogDialogMode] = useState<CatalogDialogMode>('create-root');
    const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
    const [parentCatalogForCreate, setParentCatalogForCreate] = useState<Catalog | null>(null);

    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<CatalogAssignment | null>(null);
    const [parentCatalogForAssignment, setParentCatalogForAssignment] = useState<Catalog | null>(null);

    const selectedCatalog = catalogs.find(c => c.catalogid === selectedCatalogId);

    // Clear selection when catalog changes
    useEffect(() => {
        setSelectedTreeItem(null);
    }, [selectedCatalogId]);

    // Sync selected catalog with latest data from query cache
    useEffect(() => {
        if (selectedTreeItem?.type === 'catalog') {
            const updatedCatalog = catalogs.find(c => c.catalogid === selectedTreeItem.item.catalogid);
            if (updatedCatalog && updatedCatalog !== selectedTreeItem.item) {
                setSelectedTreeItem({
                    type: 'catalog',
                    item: updatedCatalog,
                    isCategory: selectedTreeItem.isCategory,
                });
            }
        }
    }, [catalogs, selectedTreeItem]);

    useEffect(() => {
        if (selectedNavItem !== 'businessevent' || !pendingBusinessEventCatalogId) {
            return;
        }

        if (isFetchingCatalogs) {
            return;
        }

        const pendingCatalog = catalogs.find(
            catalog => catalog.catalogid === pendingBusinessEventCatalogId
        );

        if (!pendingCatalog) {
            return;
        }

        const rootCatalogId = pendingCatalog._parentcatalogid_value || pendingCatalog.catalogid;

        if (selectedCatalogId !== rootCatalogId) {
            setSelectedCatalogId(rootCatalogId);
            return;
        }

        setSelectedTreeItem({
            type: 'catalog',
            item: pendingCatalog,
            isCategory: Boolean(pendingCatalog._parentcatalogid_value),
        });
        setPendingBusinessEventCatalogId(null);
    }, [
        catalogs,
        isFetchingCatalogs,
        pendingBusinessEventCatalogId,
        selectedCatalogId,
        selectedNavItem,
        setPendingBusinessEventCatalogId,
        setSelectedCatalogId,
    ]);

    useEffect(() => {
        if (selectedNavItem !== 'businessevent' || !pendingBusinessEventAssignmentId) {
            return;
        }

        if (isFetchingCatalogs || isFetchingAssignments) {
            return;
        }

        const pendingAssignment = catalogAssignments.find(
            assignment => assignment.catalogassignmentid === pendingBusinessEventAssignmentId
        );

        if (!pendingAssignment) {
            return;
        }

        const category = catalogs.find(catalog => catalog.catalogid === pendingAssignment._catalogid_value);

        if (!category) {
            return;
        }

        const rootCatalogId = category._parentcatalogid_value || category.catalogid;

        if (selectedCatalogId !== rootCatalogId) {
            setSelectedCatalogId(rootCatalogId);
            return;
        }

        setSelectedTreeItem({ type: 'assignment', item: pendingAssignment });
        setPendingBusinessEventAssignmentId(null);
    }, [
        catalogAssignments,
        catalogs,
        isFetchingAssignments,
        isFetchingCatalogs,
        pendingBusinessEventAssignmentId,
        selectedCatalogId,
        selectedNavItem,
        setPendingBusinessEventAssignmentId,
        setSelectedCatalogId,
    ]);

    // Handlers for catalog operations
    const handleCreateRoot = () => {
        setCatalogDialogMode('create-root');
        setEditingCatalog(null);
        setParentCatalogForCreate(null);
        setCatalogDialogOpen(true);
    };

    const handleCreateCategory = (parentCatalog: Catalog) => {
        setCatalogDialogMode('create-category');
        setEditingCatalog(null);
        setParentCatalogForCreate(parentCatalog);
        setCatalogDialogOpen(true);
    };

    const handleEditCatalog = (catalog: Catalog) => {
        setCatalogDialogMode('edit');
        setEditingCatalog(catalog);
        setParentCatalogForCreate(null);
        setCatalogDialogOpen(true);
    };

    const handleCatalogDialogClose = () => {
        setCatalogDialogOpen(false);
        setEditingCatalog(null);
        setParentCatalogForCreate(null);
    };

    // Handlers for assignment operations
    const handleCreateAssignment = (parentCatalog: Catalog) => {
        setEditingAssignment(null);
        setParentCatalogForAssignment(parentCatalog);
        setAssignmentDialogOpen(true);
    };

    const handleEditAssignment = (assignment: CatalogAssignment, parentCatalog: Catalog) => {
        setEditingAssignment(assignment);
        setParentCatalogForAssignment(parentCatalog);
        setAssignmentDialogOpen(true);
    };

    const handleAssignmentDialogClose = () => {
        setAssignmentDialogOpen(false);
        setEditingAssignment(null);
        setParentCatalogForAssignment(null);
    };

    useEffect(() => {
        if (selectedNavItem === 'businessevent' && !selectedCatalogId) {
            setGlobalMessage('no-root-catalog-selected', {
                intent: 'info',
                title: 'No Root Catalog selected. Select a Root Catalog below or create a new one.',
                dismissable: false,
                action: {
                    label: 'New Root Catalog',
                    icon: <AddCircleColor />,
                    onClick: handleCreateRoot,
                },
            });
        } else {
            clearGlobalMessage('no-root-catalog-selected');
        }
    }, [selectedCatalogId, selectedNavItem, setGlobalMessage, clearGlobalMessage]);

    // Clear messages when component unmounts
    useEffect(() => {
        return () => {
            clearGlobalMessage('businessevent-coming-soon');
            clearGlobalMessage('no-root-catalog-selected');
        };
    }, [clearGlobalMessage]);

    const headerAction = (
        <div className={styles.headerActionGroup}>
            <Button
                appearance="secondary"
                icon={<AddCircleColor />}
                onClick={handleCreateRoot}
                className={styles.headerActionButton}
            >
                New Root Catalog
            </Button>
        </div>
    );

    return (
        <>
            <CatalogSelector />

            <Card className={styles.card}>
                <CardHeader
                    header={
                        <div className={styles.cardHeaderContainer}>
                            <div className={styles.cardHeaderRow}>
                                <h3>Business Events</h3>
                                <div className={styles.headerBadgeGroup}>
                                    {selectedCatalog && (
                                        <Text size={200}>
                                            Selected: {selectedCatalog.displayname || selectedCatalog.name}
                                        </Text>
                                    )}
                                </div>
                            </div>
                        </div>
                    }
                    description={
                        <div className={styles.flexColumn}>
                            <div className={styles.hintTextItalic}>
                                <FolderRegular />
                                <span>Root Catalog</span>
                                <FolderOpenRegular />
                                <span>Category</span>
                                <PlugConnectedRegular />
                                <span>Assignment</span>
                            </div>
                        </div>
                    }
                    action={headerAction}
                />
                <Divider />

                {!selectedCatalogId ? (
                    <div className={styles.infoBox}>
                        <p>No Root Catalog selected</p>
                        <p>Select a Root Catalog below or create a new one.</p>
                    </div>
                ) : (
                    <div className={localStyles.contentLayout}>
                        <div className={localStyles.treeSection}>
                            <CatalogTreeView
                                onCreateCategory={handleCreateCategory}
                                onEditCatalog={handleEditCatalog}
                                onCreateAssignment={handleCreateAssignment}
                                onEditAssignment={handleEditAssignment}
                                selectedItem={selectedTreeItem}
                                onSelectItem={setSelectedTreeItem}
                            />
                        </div>
                        <div className={localStyles.detailsSection}>
                            <TreeItemDetailsPanel selectedItem={selectedTreeItem} />
                        </div>
                    </div>
                )}
            </Card>

            {/* Catalog create/edit dialog */}
            <CatalogDialog
                open={catalogDialogOpen}
                mode={catalogDialogMode}
                catalog={editingCatalog}
                parentCatalog={parentCatalogForCreate}
                onClose={handleCatalogDialogClose}
            />

            {/* Assignment create/edit dialog */}
            <CatalogAssignmentDialog
                open={assignmentDialogOpen}
                assignment={editingAssignment}
                parentCatalog={parentCatalogForAssignment}
                onClose={handleAssignmentDialogClose}
            />
        </>
    );
};
