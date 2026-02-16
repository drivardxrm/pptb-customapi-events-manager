import React, { useMemo, useState } from 'react';
import { 
    Card, 
    CardHeader,
    Field, 
    Input, 
    Textarea, 
    Badge,
    ToggleButton
} from '@fluentui/react-components';
import { ArrowDownloadRegular, CodeFilled, CodeRegular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { useAppStore } from '../../store/useAppStore';
import { CustomApiResponseProperty, Customapiresponsepropertiestype } from '../../models/CustomApiResponseProperty';
import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';

interface ResponsePanelProps {
    executionResult: { success: boolean; data?: unknown; error?: string } | null;
    responseProperties: CustomApiResponseProperty[];
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({
    executionResult,
    responseProperties,
}) => {
    const styles = useStyles();
    const { theme } = useAppStore();
    const [showOdata, setShowOdata] = useState(false);

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
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowDownloadRegular /> Response</span>
                }
                action={
                    executionResult?.success && executionResult.data !== undefined ? (
                        <ToggleButton
                            size="small"
                            appearance={showOdata ? 'primary' : 'secondary'}
                    
                            shape="circular"
                            icon={showOdata ? <CodeFilled /> : <CodeRegular />}
                        
                            checked={showOdata}
                            onClick={() => setShowOdata(prev => !prev)}
                        >
                            OData
                        </ToggleButton>
                    ) : undefined
                }
            />
            <div className={styles.testerPanelContent}>
                {!executionResult ? (
                    <div className={styles.infoBox}>Execute the Custom API to see the response</div>
                ) : !executionResult.success ? (
                    <div className={styles.infoBox}>Execution failed. See the message above for details.</div>
                ) : (
                    <>
                        {showOdata && executionResult.data !== undefined && (
                            <div className={styles.testerFormSection}>
                                <Field
                                    label={
                                        <span className={styles.semiBoldLabel}>OData Response</span>
                                    }
                                >
                                    <JsonView
                                        value={typeof executionResult.data === 'object' && executionResult.data !== null ? executionResult.data as object : { result: executionResult.data }}
                                        displayDataTypes={false}
                                        collapsed={2}
                                        style={{
                                            ...(theme === 'light' ? lightTheme : darkTheme),
                                            wordBreak: 'break-all',
                                            overflow: 'auto',
                                            padding: '2px',
                                        }}
                                        shortenTextAfterLength={0}
                                    />
                                </Field>
                            </div>
                        )}
                        {/* Response Properties */}
                        {!showOdata && executionResult.success && sortedResponseProperties.length > 0 && (
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
                    </>
                )}
            </div>
        </Card>
    );
};
