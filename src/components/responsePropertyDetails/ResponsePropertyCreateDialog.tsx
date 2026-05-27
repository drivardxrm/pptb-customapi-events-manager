import React, { useMemo, useState, useEffect, useRef } from 'react';
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
} from '@fluentui/react-components';
import { Checkmark24Regular, Dismiss24Regular, LockOpen16Regular } from '@fluentui/react-icons';
import { useSolutions } from '../../hooks/useSolutions';
import { useAppStore } from '../../store/useAppStore';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { useStyles } from '../../styles/Styles';
import { CustomApiResponsePropertyCreateable, Customapiresponsepropertiestype } from '../../models/CustomApiResponseProperty';

interface ResponsePropertyCreateDialogProps {
    open: boolean;
    createData: CustomApiResponsePropertyCreateable;
    isSaving: boolean;
    onConfirm: (solutionUniqueName: string | null) => void;
    onCancel: () => void;
}

export const ResponsePropertyCreateDialog: React.FC<ResponsePropertyCreateDialogProps> = ({
    open,
    createData,
    isSaving,
    onConfirm,
    onCancel,
}) => {
    const styles = useStyles();
    const { solutions, isFetching: isFetchingSolutions } = useSolutions();
    const { selectedSolutionId } = useAppStore();
    
    const [selectedSolutionForCreate, setSelectedSolutionForCreate] = useState<string | null>(null);
    const wasOpenRef = useRef(false);

    // Filter to only unmanaged solutions
    const unmanagedSolutions = useMemo(() => {
        return solutions.filter((s) => !s.ismanaged);
    }, [solutions]);

    // Convert to SelectableItem for GenericTagPicker
    const solutionItems: SelectableItem[] = useMemo(() => {
        return unmanagedSolutions.map((s) => ({
            id: s.solutionid,
            displayText: `${s.friendlyname} (${s.uniquename})`,
            image: <LockOpen16Regular />,
        })).sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''));
    }, [unmanagedSolutions]);

    // Pre-select the current selectedSolutionId if it's in the unmanaged list
    useEffect(() => {
        if (open && !wasOpenRef.current) {
            const isInUnmanagedList = unmanagedSolutions.some(
                (s) => s.solutionid === selectedSolutionId
            );
            setSelectedSolutionForCreate(isInUnmanagedList ? selectedSolutionId : null);
        } else if (!open && wasOpenRef.current) {
            setSelectedSolutionForCreate(null);
        }

        wasOpenRef.current = open;
    }, [open, selectedSolutionId, unmanagedSolutions]);

    const handleSolutionSelect = (id: string | null) => {
        setSelectedSolutionForCreate(id);
    };

    const handleConfirm = () => {
        // Get the solution unique name if a solution is selected
        const solution = unmanagedSolutions.find(
            (s) => s.solutionid === selectedSolutionForCreate
        );
        onConfirm(solution?.uniquename ?? null);
    };

   

    const getTypeDisplay = () => {
        if (createData.type === null) return 'Not set';
        return Customapiresponsepropertiestype[createData.type] || 'Unknown';
    };

    return (
        <Dialog open={open} modalType="modal">
            <DialogSurface className={styles.dialogSurface}>
                <DialogBody>
                    <DialogTitle>Confirm Response Property Creation</DialogTitle>
                    <DialogContent>
                        <div className={styles.dialogContentColumn}>
                            {/* Summary Section */}
                            <div className={styles.dialogSection}>
                                <Label weight="semibold" size="large">Summary</Label>
                                <Divider />
                                
                                <div className={styles.formGrid}>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Unique Name:</Label>
                                        <span>{createData.uniquename || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Display Name:</Label>
                                        <span>{createData.displayname || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Name:</Label>
                                        <span>{createData.name || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Description:</Label>
                                        <span className={styles.summaryValue}>{createData.description || '-'}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <Label weight="semibold" className={styles.summaryLabel}>Type:</Label>
                                        <span>{getTypeDisplay()}</span>
                                    </div>
                                    {(createData.type === 3 || createData.type === 4) && (
                                        <div className={styles.summaryRow}>
                                            <Label weight="semibold" className={styles.summaryLabel}>Bound Entity:</Label>
                                            <span>{createData.logicalentityname || 'expando'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Divider />

                            {/* Solution Picker Section */}
                            <div className={styles.dialogSection}>
                                <Label weight="semibold" size="large">Add to Solution (Optional)</Label>
                                <p className={styles.hintText}>
                                    Select an unmanaged solution to add the Response Property to. If no solution is selected, the Response Property will be created in the default solution.
                                </p>
                                {isFetchingSolutions ? (
                                    <Spinner size="small" label="Loading solutions..." />
                                ) : (
                                    <GenericTagPicker
                                        items={solutionItems}
                                        initialValue={selectedSolutionForCreate ?? undefined}
                                        onSelect={handleSolutionSelect}
                                    />
                                )}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            appearance="secondary"
                            icon={<Dismiss24Regular />}
                            onClick={onCancel}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            icon={isSaving ? <Spinner size="tiny" /> : <Checkmark24Regular />}
                            onClick={handleConfirm}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Creating...' : 'Confirm'}
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
