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

interface DeleteConfirmationDialogProps {
    open: boolean;
    customApi: CustomApi | null;
    isDeleting: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
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
            <DialogSurface style={{ maxWidth: '600px' }}>
                <DialogBody>
                    <DialogTitle>Delete Custom API</DialogTitle>
                    <DialogContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Warning Message */}
                            <MessageBar intent="warning">
                                <MessageBarBody>
                                    <MessageBarTitle>Warning</MessageBarTitle>
                                    This action cannot be undone. All associated request parameters and response properties will also be deleted.
                                </MessageBarBody>
                            </MessageBar>

                            {/* Summary Section */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Label weight="semibold" size="large">Custom API Details</Label>
                                <Divider />
                                
                                <div className={styles.formGrid} style={{ gap: '8px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Unique Name:</Label>
                                        <span>{customApi.uniquename || '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Display Name:</Label>
                                        <span>{customApi.displayname || '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Name:</Label>
                                        <span>{customApi.name || '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Description:</Label>
                                        <span style={{ wordBreak: 'break-word' }}>{customApi.description || '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Is Function:</Label>
                                        <span>{customApi.isfunction ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Is Private:</Label>
                                        <span>{customApi.isprivate ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Processing Step Type:</Label>
                                        <span>{getAllowedProcessingStepTypeDisplay()}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Binding Type:</Label>
                                        <span>{getBindingTypeDisplay()}</span>
                                    </div>
                                    {customApi.bindingtype === 1 && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Label weight="semibold" style={{ minWidth: '150px' }}>Bound Entity:</Label>
                                            <span>{customApi.boundentitylogicalname || '-'}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Workflow Enabled:</Label>
                                        <span>{customApi.workflowsdkstepenabled ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Is Managed:</Label>
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
