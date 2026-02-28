import React from 'react';
import { ToggleButton } from '@fluentui/react-components';
import {
    LockClosed16Regular,
    LockClosed16Filled,
    LockOpen16Regular,
    LockOpen16Filled,
    SelectAllOffRegular,
    SelectAllOffFilled
} from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';

export type ManagedStateFilter = 'all' | 'unmanaged' | 'managed';

interface ManagedStateToggleProps {
    value: ManagedStateFilter;
    onChange: (value: ManagedStateFilter) => void;
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
}

export const ManagedStateToggle: React.FC<ManagedStateToggleProps> = ({
    value,
    onChange,
    size = 'small',
    disabled = false,
}) => {
    const styles = useStyles();
    
    const options: Array<{
        key: ManagedStateFilter;
        label: string;
        iconSelected: React.ReactElement;
        iconUnselected: React.ReactElement;
    }> = [
        {
            key: 'all',
            label: 'All',
            iconSelected: <SelectAllOffFilled />,
            iconUnselected: <SelectAllOffRegular />,
        },
        {
            key: 'unmanaged',
            label: 'Unmanaged',
            iconSelected: <LockOpen16Filled />,
            iconUnselected: <LockOpen16Regular />,
        },
        {
            key: 'managed',
            label: 'Managed',
            iconSelected: <LockClosed16Filled />,
            iconUnselected: <LockClosed16Regular />,
        },
    ];

    return (
        <div className={styles.toggleGroup}>
            {options.map(option => {
                const isSelected = value === option.key;
                return (
                    <ToggleButton
                        key={option.key}
                        appearance={isSelected ? 'primary' : 'secondary'}
                        size={size}
                        shape="circular"
                        icon={isSelected ? option.iconSelected : option.iconUnselected}
                        checked={isSelected}
                        onClick={() => onChange(option.key)}
                        title={option.label}
                        disabled={disabled}
                    >
                        {option.label}
                    </ToggleButton>
                );
            })}
        </div>
    );
};
