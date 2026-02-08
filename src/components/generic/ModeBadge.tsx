import React from 'react';
import { Badge } from '@fluentui/react-components';
import { EyeRegular, EditLineHorizontal3Regular, AddSquareRegular } from '@fluentui/react-icons';

export type Mode = 'read' | 'edit' | 'create';

interface ModeBadgeProps {
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
            return { label: 'Read mode', color: 'informative' as const, icon: <EyeRegular /> };
    }
};

export const ModeBadge: React.FC<ModeBadgeProps> = ({ mode, size = 'large' }) => {
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
