import React from 'react';
import { useStyles } from '../../styles/Styles';
import { CustomApiCreateable } from '../../models/CustomApi';

interface CustomApiDetailsCreateProps {
    template: CustomApiCreateable;
    onChange: (updater: (current: CustomApiCreateable) => CustomApiCreateable) => void;
}

export const CustomApiDetailsCreate: React.FC<CustomApiDetailsCreateProps> = ({ template }) => {
    const styles = useStyles();
    const previewName = template.displayname || template.name || 'New Custom API';

    return (
        <div className={styles.infoBox}>
            <p style={{ margin: 0, fontWeight: 600 }}>{previewName}</p>
            <p style={{ margin: '4px 0 0' }}>
                Create mode is coming soon. Use the Edit and Read tabs while the creation workflow is being prepared.
            </p>
        </div>
    );
};
