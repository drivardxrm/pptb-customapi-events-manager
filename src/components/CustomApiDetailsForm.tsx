import React from 'react';
import { 
    Field, 
    Input,
    Textarea,
    Switch,
    Badge,
    Card,
    CardHeader,
    Divider
} from '@fluentui/react-components';
import { useAppStore } from '../store/useAppStore';
import { useCustomApis } from '../hooks/useCustomApis';
import { useStyles } from '../styles/Styles';



export const CustomApiDetailsForm: React.FC = () => {
    const styles = useStyles();
    const selectedCustomApiId = useAppStore((state) => state.selectedCustomApiId);
    const { customapis } = useCustomApis();

    const selectedCustomApi = React.useMemo(
        () => customapis.find((api) => api.customapiid === selectedCustomApiId),
        [customapis, selectedCustomApiId]
    );

    if (!selectedCustomApiId || !selectedCustomApi) {
        return (
            <Card className={styles.card}>
                <CardHeader header={<h3>Custom API Details</h3>} />
                <div className={styles.infoBox}>
                    <p>No Custom API selected</p>
                    <p>Please select a Custom API from the list above</p>
                </div>
            </Card>
        );
    }

    const getBindingTypeLabel = (type: number): string => {
        switch (type) {
            case 0: return 'Global';
            case 1: return 'Entity';
            case 2: return 'Entity Collection';
            default: return `Unknown (${type})`;
        }
    };

    const getAllowedCustomProcessingStepTypeLabel = (type: number): string => {
        switch (type) {
            case 0: return 'None';
            case 1: return 'Async Only';
            case 2: return 'Sync and Async';
            default: return `Unknown (${type})`;
        }
    };

    return (
        <Card className={styles.card}>
            <CardHeader 
                header={<h3>Custom API Details</h3>}
                description={selectedCustomApi.displayname || selectedCustomApi.uniquename}
            />
            <Divider />
            
            <div className={styles.formGrid}>
                {/* Basic Information */}
                <div className={styles.formSection}>
                    <Field label="Unique Name" required>
                        <Input 
                            value={selectedCustomApi.uniquename || ''} 
                            readOnly 
                            className={styles.readOnlyInput}
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Display Name">
                        <Input 
                            value={selectedCustomApi.displayname || ''} 
                            readOnly 
                            className={styles.readOnlyInput}
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Name">
                        <Input 
                            value={selectedCustomApi.name || ''} 
                            readOnly 
                            className={styles.readOnlyInput}
                        />
                    </Field>
                </div>

                <div className={`${styles.formSection} ${styles.fullWidth}`}>
                    <Field label="Description">
                        <Textarea 
                            value={selectedCustomApi.description || ''} 
                            readOnly 
                            className={styles.readOnlyInput}
                            resize="vertical"
                            rows={3}
                        />
                    </Field>
                </div>

                {/* Configuration */}
                <div className={styles.formSection}>
                    <Field label="Binding Type">
                        <Input 
                            value={getBindingTypeLabel(selectedCustomApi.bindingtype)} 
                            readOnly 
                            className={styles.readOnlyInput}
                        />
                    </Field>
                </div>

                {selectedCustomApi.bindingtype === 1 && (
                    <div className={styles.formSection}>
                        <Field label="Bound Entity Logical Name">
                            <Input 
                                value={selectedCustomApi.boundentitylogicalname || ''} 
                                readOnly 
                                className={styles.readOnlyInput}
                            />
                        </Field>
                    </div>
                )}

                <div className={styles.formSection}>
                    <Field label="Allowed Custom Processing Step Type">
                        <Input 
                            value={getAllowedCustomProcessingStepTypeLabel(selectedCustomApi.allowedcustomprocessingsteptype)} 
                            readOnly 
                            className={styles.readOnlyInput}
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Execute Privilege Name">
                        <Input 
                            value={selectedCustomApi.executeprivilegename || '(None)'} 
                            readOnly 
                            className={styles.readOnlyInput}
                        />
                    </Field>
                </div>

                {/* Boolean Flags */}
                <div className={styles.formSection}>
                    <Field label="Is Function">
                        <Switch 
                            checked={selectedCustomApi.isfunction} 
                            disabled 
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Is Private">
                        <Switch 
                            checked={selectedCustomApi.isprivate} 
                            disabled 
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Workflow SDK Step Enabled">
                        <Switch 
                            checked={selectedCustomApi.workflowsdkstepenabled} 
                            disabled 
                        />
                    </Field>
                </div>

                {/* System Information */}
                <div className={`${styles.formSection} ${styles.fullWidth}`}>
                    <Field label="Status">
                        <div className={styles.badgeContainer}>
                            <Badge 
                                appearance="filled" 
                                color={selectedCustomApi.ismanaged ? 'important' : 'success'}
                            >
                                {selectedCustomApi.ismanaged ? 'Managed' : 'Unmanaged'}
                            </Badge>
                            <Badge 
                                appearance="filled" 
                                color={selectedCustomApi.iscustomizable ? 'informative' : 'warning'}
                            >
                                {selectedCustomApi.iscustomizable ? 'Customizable' : 'Not Customizable'}
                            </Badge>
                            <Badge appearance="outline">
                                State: {selectedCustomApi.statecode === 0 ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </Field>
                </div>

                {/* IDs */}
                <div className={styles.formSection}>
                    <Field label="Custom API ID">
                        <Input 
                            value={selectedCustomApi.customapiid} 
                            readOnly 
                            className={styles.readOnlyInput}
                            size="small"
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Plugin Type ID">
                        <Input 
                            value={selectedCustomApi.plugintypeid || '(None)'} 
                            readOnly 
                            className={styles.readOnlyInput}
                            size="small"
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Solution ID">
                        <Input 
                            value={selectedCustomApi.solutionid} 
                            readOnly 
                            className={styles.readOnlyInput}
                            size="small"
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label="Owner ID">
                        <Input 
                            value={selectedCustomApi.ownerid} 
                            readOnly 
                            className={styles.readOnlyInput}
                            size="small"
                        />
                    </Field>
                </div>
            </div>
        </Card>
    );
};
