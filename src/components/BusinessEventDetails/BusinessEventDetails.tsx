import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Divider, Button, Text } from '@fluentui/react-components';
import { AddCircleColor, FolderRegular, FolderOpenRegular, PlugConnectedRegular } from '@fluentui/react-icons';
import { useAppStore } from '../../store/useAppStore';
import { useStyles } from '../../styles/Styles';
import { CatalogSelector } from '../CatalogSelector';
import { CatalogTreeView } from './CatalogTreeView';
import { CatalogModal, CatalogModalMode } from './CatalogModal';
import { CatalogAssignmentModal } from './CatalogAssignmentModal';
import { useCatalogs } from '../../hooks/useCatalogs';
import { Catalog } from '../../models/Catalog';
import { CatalogAssignment } from '../../models/CatalogAssignment';


export const BusinessEventDetails: React.FC = () => {
    const styles = useStyles();
    const { selectedCatalogId, selectedSolutionId, clearGlobalMessage } = useAppStore();
    const { catalogs } = useCatalogs();

    // Modal states
    const [catalogModalOpen, setCatalogModalOpen] = useState(false);
    const [catalogModalMode, setCatalogModalMode] = useState<CatalogModalMode>('create-root');
    const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
    const [parentCatalogForCreate, setParentCatalogForCreate] = useState<Catalog | null>(null);

    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<CatalogAssignment | null>(null);
    const [parentCatalogForAssignment, setParentCatalogForAssignment] = useState<Catalog | null>(null);

    const selectedCatalog = catalogs.find(c => c.catalogid === selectedCatalogId);

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
                    <CatalogTreeView
                        onCreateCategory={handleCreateCategory}
                        onEditCatalog={handleEditCatalog}
                        onCreateAssignment={handleCreateAssignment}
                        onEditAssignment={handleEditAssignment}
                    />
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
