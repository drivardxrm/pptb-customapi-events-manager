import React, { useMemo, useState, useEffect } from 'react';
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
import { Checkmark24Regular, Dismiss24Regular, FolderRegular } from '@fluentui/react-icons';
import { CustomApiCreateable, Customapisallowedcustomprocessingsteptype, Customapisbindingtype } from '../../models/CustomApi';
import { useSolutions } from '../../hooks/useSolutions';
import { useAppStore } from '../../store/useAppStore';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { useStyles } from '../../styles/Styles';

interface CreateConfirmationDialogProps {
    open: boolean;
    createData: CustomApiCreateable;
    isSaving: boolean;
    onConfirm: (solutionUniqueName: string | null) => void;
    onCancel: () => void;
}

export const CreateConfirmationDialog: React.FC<CreateConfirmationDialogProps> = ({
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

    // Filter to only unmanaged solutions
    const unmanagedSolutions = useMemo(() => {
        return solutions.filter((s) => !s.ismanaged);
    }, [solutions]);

    // Convert to SelectableItem for GenericTagPicker
    const solutionItems: SelectableItem[] = useMemo(() => {
        return unmanagedSolutions.map((s) => ({
            id: s.solutionid,
            displayText: `${s.friendlyname} (${s.uniquename})`,
            image: <FolderRegular />,
        }));
    }, [unmanagedSolutions]);

    // Pre-select the current selectedSolutionId if it's in the unmanaged list
    useEffect(() => {
        if (open) {
            const isInUnmanagedList = unmanagedSolutions.some(
                (s) => s.solutionid === selectedSolutionId
            );
            setSelectedSolutionForCreate(isInUnmanagedList ? selectedSolutionId : null);
        }
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

    // Helper to get display values
    const getAllowedProcessingStepTypeDisplay = () => {
        if (createData.allowedcustomprocessingsteptype === null) return 'Not set';
        return Customapisallowedcustomprocessingsteptype[createData.allowedcustomprocessingsteptype] || 'Unknown';
    };

    const getBindingTypeDisplay = () => {
        if (createData.bindingtype === null) return 'Not set';
        return Customapisbindingtype[createData.bindingtype] || 'Unknown';
    };

    return (
        <Dialog open={open} modalType="modal">
            <DialogSurface style={{ maxWidth: '600px' }}>
                <DialogBody>
                    <DialogTitle>Confirm Custom API Creation</DialogTitle>
                    <DialogContent>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Summary Section */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Label weight="semibold" size="large">Summary</Label>
                                <Divider />
                                
                                <div className={styles.formGrid} style={{ gap: '8px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Unique Name:</Label>
                                        <span>{createData.uniquename || '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Display Name:</Label>
                                        <span>{createData.displayname || '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Name:</Label>
                                        <span>{createData.name || '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Description:</Label>
                                        <span style={{ wordBreak: 'break-word' }}>{createData.description || '-'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Is Function:</Label>
                                        <span>{createData.isfunction ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Is Private:</Label>
                                        <span>{createData.isprivate ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Processing Step Type:</Label>
                                        <span>{getAllowedProcessingStepTypeDisplay()}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Binding Type:</Label>
                                        <span>{getBindingTypeDisplay()}</span>
                                    </div>
                                    {createData.bindingtype === 1 && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Label weight="semibold" style={{ minWidth: '150px' }}>Bound Entity:</Label>
                                            <span>{createData.boundentitylogicalname || '-'}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Label weight="semibold" style={{ minWidth: '150px' }}>Workflow Enabled:</Label>
                                        <span>{createData.workflowsdkstepenabled ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>
                            </div>

                            <Divider />

                            {/* Solution Picker Section */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <Label weight="semibold" size="large">Add to Solution (Optional)</Label>
                                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                    Select an unmanaged solution to add the Custom API to. If no solution is selected, the Custom API will be created in the default solution.
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
