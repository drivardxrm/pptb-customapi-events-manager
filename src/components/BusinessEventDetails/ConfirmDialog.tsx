import React from 'react';
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogContent,
    DialogActions,
    Button,
    Spinner,
} from '@fluentui/react-components';
import { useStyles } from '../../styles/Styles';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    intent?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false,
    intent = 'info',
}) => {
    const styles = useStyles();

    const getConfirmAppearance = (): 'primary' | 'secondary' => {
        return 'primary';
    };

    return (
        <Dialog open={open} onOpenChange={(_, data) => !data.open && onCancel()}>
            <DialogSurface className={styles.dialogSurface}>
                <DialogBody>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogContent className={styles.dialogContentColumn}>
                        <p>{message}</p>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            appearance="secondary"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            appearance={getConfirmAppearance()}
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={intent === 'danger' ? styles.deleteButton : undefined}
                            icon={isLoading ? <Spinner size="tiny" /> : undefined}
                        >
                            {isLoading ? 'Processing...' : confirmLabel}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
