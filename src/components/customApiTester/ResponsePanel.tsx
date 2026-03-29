import React, { useMemo } from 'react';
import { 
    Card, 
    CardHeader,
    Field, 
    Input, 
    Textarea, 
    Badge,
} from '@fluentui/react-components';
import { ArrowDownloadRegular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { CustomApiResponseProperty, Customapiresponsepropertiestype } from '../../models/CustomApiResponseProperty';

interface ResponsePanelProps {
    executionResult: { success: boolean; data?: unknown; error?: string; elapsedMs?: number } | null;
    responseProperties: CustomApiResponseProperty[];
}

const formatElapsedTime = (ms: number): string => {
    if (ms < 1000) {
        return `${Math.round(ms)} ms`;
    }
    return `${(ms / 1000).toFixed(1)} s`;
};

export const ResponsePanel: React.FC<ResponsePanelProps> = ({
    executionResult,
    responseProperties,
}) => {
    const styles = useStyles();

    // Sort response properties by name
    const sortedResponseProperties = useMemo(() => {
        return [...responseProperties].sort((a, b) => 
            (a.displayname || a.name || '').localeCompare(b.displayname || b.name || '')
        );
    }, [responseProperties]);

    // Extract response property value from execution result
    const getResponsePropertyValue = (uniquename: string): string => {
        if (!executionResult?.data || typeof executionResult.data !== 'object') return '';
        const data = executionResult.data as Record<string, unknown>;
        const value = data[uniquename];
        if (value === undefined || value === null) return '';
        if (typeof value === 'object') return JSON.stringify(value, null, 2);
        return String(value);
    };

    return (
        <Card className={styles.testerPanel}>
            <CardHeader
                header={
                    <span className={styles.flexRowCentered}><ArrowDownloadRegular /> Response</span>
                }
                action={
                    executionResult?.success && executionResult.elapsedMs !== undefined
                        ? <Badge appearance="outline" size="medium" color="informative">{formatElapsedTime(executionResult.elapsedMs)}</Badge>
                        : undefined
                }
            />
            <div className={styles.testerPanelContent}>
                {!executionResult ? (
                    <div className={styles.infoBox}>Execute the Custom API to see the response</div>
                ) : !executionResult.success ? (
                    <div className={styles.infoBox}>Execution failed. See the message above for details.</div>
                ) : (
                    <>
                        {/* Response Properties */}
                        {executionResult.success && sortedResponseProperties.length > 0 && (
                            <div className={styles.testerFormSection}>
                                {sortedResponseProperties.map(prop => {
                                    const propType = Customapiresponsepropertiestype[prop.type];
                                    const value = getResponsePropertyValue(prop.uniquename);
                                    const isComplexType = propType === 'Entity' || propType === 'EntityCollection' || propType === 'StringArray' || propType === 'EntityReference';

                                    return (
                                        <Field
                                            key={prop.customapiresponsepropertyid}
                                            label={
                                                <span className={styles.fieldLabelStandard}>
                                                    <span className={styles.semiBoldLabel}>
                                                        {prop.displayname || prop.name}
                                                    </span>
                                                    <Badge 
                                                        appearance="outline" 
                                                        size="small"
                                                        color="informative"
                                                    >
                                                        {propType}
                                                    </Badge>
                                                </span>
                                            }
                                            hint={prop.description}
                                        >
                                            {isComplexType ? (
                                                <Textarea
                                                    appearance="filled-darker"
                                                    spellCheck={false}
                                                    value={value}
                                                    readOnly
                                                    resize="vertical"
                                                    rows={3}
                                                />
                                            ) : (
                                                <Input
                                                    appearance="filled-darker"
                                                    value={value}
                                                    readOnly
                                                />
                                            )}
                                        </Field>
                                    );
                                })}
                            </div>
                        )}
                        {/* No response properties message */}
                        {executionResult.success && sortedResponseProperties.length === 0 && (
                            <div className={styles.infoBox}>This Custom API has no defined response properties.</div>
                        )}
                    </>
                )}
            </div>
        </Card>
    );
};
