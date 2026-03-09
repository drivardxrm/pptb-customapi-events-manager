import React, { useMemo, useCallback } from 'react';
import { Spinner, Input, Button } from '@fluentui/react-components';
import { ArrowSyncRegular } from '@fluentui/react-icons';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { useEntityRecords } from '../../hooks/useEntityRecords';
import { useStyles } from '../../styles/Styles';
import { EntityReferenceValue } from '../../models/Entity';

const generateGuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

interface EntityReferencePickerProps {
    entityLogicalName: string | null | undefined;
    value: EntityReferenceValue | null | undefined;
    onChange: (value: EntityReferenceValue | null) => void;
}

export const EntityReferencePicker: React.FC<EntityReferencePickerProps> = ({
    entityLogicalName,
    value,
    onChange,
}) => {
    const styles = useStyles();
    const { records, primaryid, isFetching } = useEntityRecords(entityLogicalName);

    const items: SelectableItem[] = useMemo(() => {
        return records.map(record => ({
            id: record.id,
            displayText: record.name,
            image: null,
        }));
    }, [records]);

    const handleSelect = (id: string | null) => {
        if (id && primaryid) {
            onChange({
                entityLogicalName: entityLogicalName || 'expando',
                recordId: id,
                primaryIdAttribute: primaryid,
            });
        } else {
            onChange(null);
        }
    };

    const handleExpandoGuidChange = useCallback((guid: string) => {
        if (guid) {
            onChange({
                entityLogicalName: 'expando',
                recordId: guid,
                primaryIdAttribute: 'expandoid',
                isExpando: true,
            });
        } else {
            onChange(null);
        }
    }, [onChange]);

    const handleGenerateGuid = useCallback(() => {
        const newGuid = generateGuid();
        handleExpandoGuidChange(newGuid);
    }, [handleExpandoGuidChange]);

    if (isFetching) {
        return (
            <div className={styles.flexRowCentered}>
                <Spinner size="tiny" />
                <span>Loading {entityLogicalName} records...</span>
            </div>
        );
    }

    // Show GUID input for expando when no entity type is specified
    if (!entityLogicalName) {
        return (
            <div className={styles.flexRowCentered}>
                <Input
                    appearance="filled-darker"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={value?.recordId ?? ''}
                    onChange={(e) => handleExpandoGuidChange(e.target.value)}
                    style={{ flex: 1 }}
                />
                <Button
                    appearance="subtle"
                    icon={<ArrowSyncRegular />}
                    onClick={handleGenerateGuid}
                    title="Generate GUID"
                >
                    Generate
                </Button>
            </div>
        );
    }

    return (
        <GenericTagPicker
            items={items}
            initialValue={value?.recordId}
            onSelect={handleSelect}
            isDisabled={!entityLogicalName}
        />
    );
};
