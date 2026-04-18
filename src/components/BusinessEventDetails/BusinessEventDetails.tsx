import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Divider, Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import { AddCircleColor, FolderRegular, FolderOpenRegular, PlugConnectedRegular } from '@fluentui/react-icons';
import { useAppStore } from '../../store/useAppStore';
import { useStyles } from '../../styles/Styles';
import { CatalogSelector } from '../CatalogSelector';
import { CatalogTreeView } from './CatalogTreeView';
import { CatalogModal, CatalogModalMode } from './CatalogModal';
import { CatalogAssignmentModal } from './CatalogAssignmentModal';
import { TreeItemDetailsPanel, SelectedTreeItem } from './TreeItemDetailsPanel';
import { useCatalogs } from '../../hooks/useCatalogs';
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
    const { selectedCatalogId, selectedSolutionId, clearGlobalMessage } = useAppStore();
    const { catalogs } = useCatalogs();

    // Selection state for tree items
    const [selectedTreeItem, setSelectedTreeItem] = useState<SelectedTreeItem>(null);

    // Modal states
    const [catalogModalOpen, setCatalogModalOpen] = useState(false);
    const [catalogModalMode, setCatalogModalMode] = useState<CatalogModalMode>('create-root');
    const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
    const [parentCatalogForCreate, setParentCatalogForCreate] = useState<Catalog | null>(null);

    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
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

    // Clear message when component unmounts
    useEffect(() => {
        return () => {
            clearGlobalMessage('businessevent-coming-soon');
        };
    }, [clearGlobalMessage]);

    // Handlers for catalog operations
    const handleCreateRoot = () => {
        setCatalogModalMode('create-root');
        setEditingCatalog(null);
        setParentCatalogForCreate(null);
        setCatalogModalOpen(true);
    };

    const handleCreateCategory = (parentCatalog: Catalog) => {
        setCatalogModalMode('create-category');
        setEditingCatalog(null);
        setParentCatalogForCreate(parentCatalog);
        setCatalogModalOpen(true);
    };

    const handleEditCatalog = (catalog: Catalog) => {
        setCatalogModalMode('edit');
        setEditingCatalog(catalog);
        setParentCatalogForCreate(null);
        setCatalogModalOpen(true);
    };

    const handleCatalogModalClose = () => {
        setCatalogModalOpen(false);
        setEditingCatalog(null);
        setParentCatalogForCreate(null);
    };

    // Handlers for assignment operations
    const handleCreateAssignment = (parentCatalog: Catalog) => {
        setEditingAssignment(null);
        setParentCatalogForAssignment(parentCatalog);
        setAssignmentModalOpen(true);
    };

    const handleEditAssignment = (assignment: CatalogAssignment, parentCatalog: Catalog) => {
        setEditingAssignment(assignment);
        setParentCatalogForAssignment(parentCatalog);
        setAssignmentModalOpen(true);
    };

    const handleAssignmentModalClose = () => {
        setAssignmentModalOpen(false);
        setEditingAssignment(null);
        setParentCatalogForAssignment(null);
    };

    const headerAction = (
        <div className={styles.headerActionGroup}>
            {selectedSolutionId && (
                <>
                    <Button
                        appearance="secondary"
                        icon={<AddCircleColor />}
                        onClick={handleCreateRoot}
                        className={styles.headerActionButton}
                    >
                        New Root Catalog
                    </Button>
                </>
            )}
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
                        <p>No Catalog selected</p>
                        <p>Select a Catalog above to view its hierarchy</p>
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

            {/* Catalog Create/Edit Modal */}
            <CatalogModal
                open={catalogModalOpen}
                mode={catalogModalMode}
                catalog={editingCatalog}
                parentCatalog={parentCatalogForCreate}
                onClose={handleCatalogModalClose}
            />

            {/* Assignment Create/Edit Modal */}
            <CatalogAssignmentModal
                open={assignmentModalOpen}
                assignment={editingAssignment}
                parentCatalog={parentCatalogForAssignment}
                onClose={handleAssignmentModalClose}
            />
        </>
    );
};
