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
import { CustomApiResponseProperty, Customapiresponsepropertiestype } from '../../models/CustomApiResponseProperty';

interface ResponsePropertyDeleteDialogProps {
    open: boolean;
    responseProperty: CustomApiResponseProperty | null;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ResponsePropertyDeleteDialog: React.FC<ResponsePropertyDeleteDialogProps> = ({
    open,
    responseProperty,
    isDeleting,
    onConfirm,
    onCancel,
}) => {
    const styles = useStyles();

    if (!responseProperty) {
        return null;
    }

    // Helper to get display values
    const getTypeDisplay = () => {
        if (responseProperty.type === null) return 'Not set';
        return Customapiresponsepropertiestype[responseProperty.type] || 'Unknown';
    };


    return (
        <Dialog open={open} modalType="modal">
            <DialogSurface className={styles.dialogSurface}>
                <DialogBody>
                    <DialogTitle>Delete Response Property</DialogTitle>
                    <DialogContent>
                        <div className={styles.dialogContentColumn}>
                            {/* Warning Message */}
                            <MessageBar intent="warning">
                                <MessageBarBody>
                                    <MessageBarTitle>Warning</MessageBarTitle>
                                    This action cannot be undone.
                                </MessageBarBody>
                            </MessageBar>

                            {/* Summary Section */}
                            <div className={styles.dialogSection}>
                                <Label weight="semibold" size="large">Response Property Details</Label>
                                <Divider />
                                
                                <div className={styles.formGrid}>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Unique Name:</Label>
                                        <span>{responseProperty.uniquename || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Display Name:</Label>
                                        <span>{responseProperty.displayname || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Name:</Label>
                                        <span>{responseProperty.name || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Description:</Label>
                                        <span className={styles.summaryValue}>{responseProperty.description || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Type:</Label>
                                        <span>{getTypeDisplay()}</span>
                                    </div>
                                   
                                    {(responseProperty.type === 3 || responseProperty.type === 4) && (
                                        <div className={styles.summaryRow}>
                                            <Label weight="semibold" className={styles.summaryLabel}>Bound Entity:</Label>
                                            <span>{responseProperty.logicalentityname || 'expando'}</span>
                                        </div>
                                    )}
                                    
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
