import React from 'react';
import { Badge } from '@fluentui/react-components';
import { LockClosed16Regular, LockOpen16Regular } from '@fluentui/react-icons';

interface ComponentStateBadgeProps {
    isManaged: boolean;
}

export const ComponentStateBadge: React.FC<ComponentStateBadgeProps> = ({ isManaged }) => {
    return (
        <Badge
            appearance="outline"
            color={isManaged ? 'informative' : 'subtle'}
            shape="rounded"
            icon={isManaged ? <LockClosed16Regular /> : <LockOpen16Regular />}
            size="large"
        >
            {isManaged ? 'Managed' : 'Unmanaged'}
        </Badge>
    );
};
