import React from 'react';
import { Badge } from '@fluentui/react-components';
import { EyeLinesRegular, EditLineHorizontal3Regular, AddSquareRegular } from '@fluentui/react-icons';

export type Mode = 'read' | 'edit' | 'create';

interface ModeChipBadgeProps {
    mode: Mode;
    size?: 'small' | 'medium' | 'large' | 'extra-large';
}

const getModeConfig = (mode: Mode) => {
    switch (mode) {
        case 'edit':
            return { label: 'Edit mode', color: 'warning' as const, icon: <EditLineHorizontal3Regular /> };
        case 'create':
            return { label: 'Create mode', color: 'success' as const, icon: <AddSquareRegular /> };
        default:
            return { label: 'Read mode', color: 'informative' as const, icon: <EyeLinesRegular /> };
    }
};

export const ModeChipBadge: React.FC<ModeChipBadgeProps> = ({ mode, size = 'large' }) => {
    const config = getModeConfig(mode);
    
    return (
        <Badge 
            appearance="tint" 
            color={config.color} 
            shape="rounded" 
            icon={config.icon}
            size={size}
        >
            {config.label}
        </Badge>
    );
};
