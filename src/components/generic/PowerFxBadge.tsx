import React from 'react';
import { Badge } from '@fluentui/react-components';
import { MathFormulaRegular } from '@fluentui/react-icons';

export const PowerFxBadge: React.FC = () => {
    return (
        <Badge
            appearance="tint"
            color="brand"
            shape="rounded"
            icon={<MathFormulaRegular />}
            size="large"
        >
            Power Fx
        </Badge>
    );
};
