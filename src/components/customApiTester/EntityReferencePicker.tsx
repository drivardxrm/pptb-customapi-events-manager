import React, { useMemo } from 'react';
import { Spinner } from '@fluentui/react-components';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { useEntityRecords } from '../../hooks/useEntityRecords';
import { useStyles } from '../../styles/Styles';

interface EntityReferenceValue {
    recordId: string;
    primaryIdAttribute: string;
}

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
                recordId: id,
                primaryIdAttribute: primaryid,
            });
        } else {
            onChange(null);
        }
    };

    if (isFetching) {
        return (
            <div className={styles.flexRowCentered}>
                <Spinner size="tiny" />
                <span>Loading {entityLogicalName} records...</span>
            </div>
        );
    }

    if (!entityLogicalName) {
        return <span>No entity type specified</span>;
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
