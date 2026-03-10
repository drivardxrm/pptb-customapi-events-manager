import React, { useState, useCallback, useMemo } from 'react';
import {
    Button,
    Textarea,
    Badge,
} from '@fluentui/react-components';
import { Edit24Regular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { EntityDataDialog } from './EntityDataDialog';

interface EntityPickerProps {
    entityLogicalName: string | null;
    value: Record<string, unknown> | null;
    onChange: (value: Record<string, unknown> | null) => void;
}

export const EntityPicker: React.FC<EntityPickerProps> = ({
    entityLogicalName,
    value,
    onChange,
}) => {
    const styles = useStyles();
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleOpenDialog = useCallback(() => {
        setDialogOpen(true);
    }, []);

    const handleConfirm = useCallback((data: Record<string, unknown>) => {
        onChange(data);
        setDialogOpen(false);
    }, [onChange]);

    const handleCancel = useCallback(() => {
        setDialogOpen(false);
    }, []);

    const displayValue = useMemo(() => {
        if (!value) return '';
        return JSON.stringify(value, null, 2);
    }, [value]);

    // If no entity type is specified, show a message
    if (!entityLogicalName) {
        return (
            <div className={styles.flexColumn}>
                <Badge appearance="outline" color="warning">
                    No entity type specified for this parameter
                </Badge>
                <Textarea
                    appearance="filled-darker"
                    resize="vertical"
                    rows={4}
                    placeholder="Enter JSON entity data manually..."
                    value={displayValue}
                    onChange={(e) => {
                        try {
                            const parsed = JSON.parse(e.target.value);
                            onChange(parsed);
                        } catch {
                            // Allow invalid JSON while typing
                        }
                    }}
                />
            </div>
        );
    }

    return (
        <div className={styles.flexColumn}>
            <div className={styles.flexRowCentered}>
                <Button
                    appearance="subtle"
                    icon={<Edit24Regular />}
                    onClick={handleOpenDialog}
                >
                    Set Entity Data
                </Button>
                {value && Object.keys(value).length > 1 && (
                    <Badge appearance="filled" color="success">
                        {Object.keys(value).length - 1} field(s) set
                    </Badge>
                )}
            </div>
            <Textarea
                appearance="filled-darker"
                resize="vertical"
                rows={Math.min(Math.max((displayValue.match(/\n/g) || []).length + 1, 3), 12)}
                readOnly
                value={displayValue}
                placeholder="Click 'Set Entity Data' to configure..."
            />
            <EntityDataDialog
                open={dialogOpen}
                entityLogicalName={entityLogicalName}
                initialData={value ?? {}}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </div>
    );
};
