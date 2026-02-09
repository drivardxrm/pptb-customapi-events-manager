import React from 'react';
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button,
    Divider,
    Label,
    Spinner,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
} from '@fluentui/react-components';
import { Delete24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { CustomApi, Customapisallowedcustomprocessingsteptype, Customapisbindingtype } from '../../models/CustomApi';
import { useStyles } from '../../styles/Styles';

interface CustomApiDeleteDialogProps {
    open: boolean;
    customApi: CustomApi | null;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const CustomApiDeleteDialog: React.FC<CustomApiDeleteDialogProps> = ({
    open,
    customApi,
    isDeleting,
    onConfirm,
    onCancel,
}) => {
    const styles = useStyles();

    if (!customApi) {
        return null;
    }

    // Helper to get display values
    const getAllowedProcessingStepTypeDisplay = () => {
        if (customApi.allowedcustomprocessingsteptype === null) return 'Not set';
        return Customapisallowedcustomprocessingsteptype[customApi.allowedcustomprocessingsteptype] || 'Unknown';
    };

    const getBindingTypeDisplay = () => {
        if (customApi.bindingtype === null) return 'Not set';
        return Customapisbindingtype[customApi.bindingtype] || 'Unknown';
    };

    return (
        <Dialog open={open} modalType="modal">
            <DialogSurface className={styles.dialogSurface}>
                <DialogBody>
                    <DialogTitle>Delete Custom API</DialogTitle>
                    <DialogContent>
                        <div className={styles.dialogContentColumn}>
                            {/* Warning Message */}
                            <MessageBar intent="warning">
                                <MessageBarBody>
                                    <MessageBarTitle>Warning</MessageBarTitle>
                                    This action cannot be undone. All associated request parameters and response properties will also be deleted.
                                </MessageBarBody>
                            </MessageBar>

                            {/* Summary Section */}
                            <div className={styles.dialogSection}>
                                <Label weight="semibold" size="large">Custom API Details</Label>
                                <Divider />
                                
                                <div className={styles.formGrid}>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Unique Name:</Label>
                                        <span>{customApi.uniquename || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Display Name:</Label>
                                        <span>{customApi.displayname || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Name:</Label>
                                        <span>{customApi.name || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Description:</Label>
                                        <span className={styles.summaryValue}>{customApi.description || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Processing Step Type:</Label>
                                        <span>{getAllowedProcessingStepTypeDisplay()}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Binding Type:</Label>
                                        <span>{getBindingTypeDisplay()}</span>
                                    </div>
                                    {customApi.bindingtype === 1 && (
                                        <div className={styles.summaryRow}>
                                            <Label weight="semibold" className={styles.summaryLabel}>Bound Entity:</Label>
                                            <span>{customApi.boundentitylogicalname || '-'}</span>
                                        </div>
                                    )}
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Is Function:</Label>
                                        <span>{customApi.isfunction ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Is Private:</Label>
                                        <span>{customApi.isprivate ? 'Yes' : 'No'}</span>
                                    </div>
                                    
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Workflow Enabled:</Label>
                                        <span>{customApi.workflowsdkstepenabled ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Is Managed:</Label>
                                        <span>{customApi.ismanaged ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            appearance="secondary"
                            icon={<Dismiss24Regular />}
                            onClick={onCancel}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            icon={isDeleting ? <Spinner size="tiny" /> : <Delete24Regular />}
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className={!isDeleting ? styles.deleteButton : undefined}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
