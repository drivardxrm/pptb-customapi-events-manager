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
import { useStyles } from '../../styles/Styles';
import { CustomApiRequestParameter, Customapirequestparameterstype } from '../../models/CustomApiRequestParameter';

interface RequestParameterDeleteDialogProps {
    open: boolean;
    requestParameter: CustomApiRequestParameter | null;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const RequestParameterDeleteDialog: React.FC<RequestParameterDeleteDialogProps> = ({
    open,
    requestParameter,
    isDeleting,
    onConfirm,
    onCancel,
}) => {
    const styles = useStyles();

    if (!requestParameter) {
        return null;
    }

    // Helper to get display values
    const getTypeDisplay = () => {
        if (requestParameter.type === null) return 'Not set';
        return Customapirequestparameterstype[requestParameter.type] || 'Unknown';
    };


    return (
        <Dialog open={open} modalType="modal">
            <DialogSurface className={styles.dialogSurface}>
                <DialogBody>
                    <DialogTitle>Delete Request Parameter</DialogTitle>
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
                                <Label weight="semibold" size="large">Request Parameter Details</Label>
                                <Divider />
                                
                                <div className={styles.formGrid}>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Unique Name:</Label>
                                        <span>{requestParameter.uniquename || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Display Name:</Label>
                                        <span>{requestParameter.displayname || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Name:</Label>
                                        <span>{requestParameter.name || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Description:</Label>
                                        <span className={styles.summaryValue}>{requestParameter.description || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Type:</Label>
                                        <span>{getTypeDisplay()}</span>
                                    </div>
                                   
                                    {(requestParameter.type === 3 || requestParameter.type === 4) && (
                                        <div className={styles.summaryRow}>
                                            <Label weight="semibold" className={styles.summaryLabel}>Bound Entity:</Label>
                                            <span>{requestParameter.logicalentityname || 'expando'}</span>
                                        </div>
                                    )}

                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Is Optional:</Label>
                                        <span>{requestParameter.isoptional ? 'Yes' : 'No'}</span>
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
                            style={{ backgroundColor: isDeleting ? undefined : '#d13438' }}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
