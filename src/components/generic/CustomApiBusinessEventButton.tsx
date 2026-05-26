import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Text,
} from '@fluentui/react-components';
import { ChevronRightRegular, FlashFlowRegular, FolderOpenRegular, FolderRegular, OpenRegular } from '@fluentui/react-icons';
import { useCustomApiCatalogAssignments, CustomApiCatalogAssignmentTarget } from '../../hooks/useCatalogAssignments';
import { useAppStore } from '../../store/useAppStore';
import { useStyles } from '../../styles/Styles';

interface CustomApiBusinessEventButtonProps {
    customApiId: string | null | undefined;
}

export const CustomApiBusinessEventButton: React.FC<CustomApiBusinessEventButtonProps> = ({ customApiId }) => {
    const styles = useStyles();
    const { businessEventAssignments, isFetching } = useCustomApiCatalogAssignments(customApiId);
    const {
        addLog,
        currentCustomApiSelectionInit,
        setPendingBusinessEventAssignmentId,
        setPendingManagedFilterHandoff,
        setSelectedCatalogId,
        setSelectedNavItem,
    } = useAppStore();
    const [dialogOpen, setDialogOpen] = useState(false);

    if (!customApiId || isFetching || businessEventAssignments.length === 0) {
        return null;
    }

    const navigateToBusinessEvent = (target: CustomApiCatalogAssignmentTarget) => {
        const targetCatalogId = target.rootCatalog?.catalogid || target.category?.catalogid || target.assignment._catalogid_value;

        setPendingBusinessEventAssignmentId(target.assignment.catalogassignmentid);
        setPendingManagedFilterHandoff({
            target: 'businessevent',
            value: currentCustomApiSelectionInit,
        });
        setSelectedCatalogId(targetCatalogId);
        setSelectedNavItem('businessevent');
        addLog(`Opened Business Event '${target.pathLabel}' for Custom API`, 'info');
        setDialogOpen(false);
    };

    const handleClick = () => {
        if (businessEventAssignments.length === 1) {
            navigateToBusinessEvent(businessEventAssignments[0]);
            return;
        }

        setDialogOpen(true);
    };

    return (
        <>
            <Button
                appearance="secondary"
                size="small"
                icon={<FlashFlowRegular />}
                onClick={handleClick}
                className={styles.headerActionButton}
            >
                {businessEventAssignments.length === 1 ? 'Open Business Event' : `Open Business Event (${businessEventAssignments.length})`}
            </Button>

            <Dialog open={dialogOpen} onOpenChange={(_, data) => setDialogOpen(data.open)}>
                <DialogSurface className={styles.dialogSurface}>
                    <DialogBody>
                        <DialogTitle>Choose Business Event</DialogTitle>
                        <DialogContent className={styles.dialogContentColumn}>
                            <Text>
                                This Custom API is assigned to multiple Business Events. Select the catalog you want to open.
                            </Text>
                            <div className={styles.dialogChoiceList}>
                                {businessEventAssignments.map((target) => {
                                    const assignmentKey = target.assignment.catalogassignmentid;

                                    return (
                                        <Button
                                            key={assignmentKey}
                                            appearance="subtle"
                                            icon={<OpenRegular />}
                                            className={styles.dialogChoiceButton}
                                            onClick={() => navigateToBusinessEvent(target)}
                                        >
                                            <div className={styles.dialogChoiceContent}>
                                                <span className={styles.dialogChoiceTitle}>{target.assignmentLabel}</span>
                                                <span className={styles.dialogChoiceMeta}>
                                                    {target.assignment['_catalogid_value@OData.Community.Display.V1.FormattedValue'] || 'Business Event'}
                                                </span>
                                                <span className={styles.dialogChoicePath}>
                                                    <FolderRegular />
                                                    <span>{target.rootCatalog ? (target.rootCatalog.displayname || target.rootCatalog.name) : 'Unknown Catalog'}</span>
                                                    {target.category && target.rootCatalog?.catalogid !== target.category.catalogid && (
                                                        <>
                                                            <ChevronRightRegular />
                                                            <FolderOpenRegular />
                                                            <span>{target.category.displayname || target.category.name}</span>
                                                        </>
                                                    )}
                                                </span>
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </>
    );
};
