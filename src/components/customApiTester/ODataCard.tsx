import React, { useMemo } from 'react';
import { 
    Card, 
    CardHeader,
    Field, 
    Textarea, 
    Badge,
} from '@fluentui/react-components';
import { CodeRegular } from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { useAppStore } from '../../store/useAppStore';
import { buildCustomApiODataUrl, buildFunctionParamString } from '../../utils/odataUrl';
import { CustomApi } from '../../models/CustomApi';
import { CustomApiRequestParameter } from '../../models/CustomApiRequestParameter';
import { ParameterValues } from './RequestPanel';
import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { darkTheme } from '@uiw/react-json-view/dark';

interface ODataCardProps {
    customApi: CustomApi;
    requestParameters: CustomApiRequestParameter[];
    parameterValues: ParameterValues;
    boundEntityCollectionName: string | null;
    boundRecordId: string | null;
    requestPreview: Record<string, unknown> | null;
    executionResult: { success: boolean; data?: unknown; error?: string } | null;
}

export const ODataCard: React.FC<ODataCardProps> = ({
    customApi,
    requestParameters,
    parameterValues,
    boundEntityCollectionName,
    boundRecordId,
    requestPreview,
    executionResult,
}) => {
    const styles = useStyles();
    const { theme, connection } = useAppStore();

    // Build the OData URL
    const odataUrl = useMemo(() => {
        if (!customApi || !connection?.url) {
            return null;
        }

        const baseUrl = buildCustomApiODataUrl({
            customApi,
            instanceUrl: connection.url,
            boundEntityCollectionName,
            boundRecordId,
        });

        if (!baseUrl) {
            return null;
        }

        // Append function parameters only for functions
        if (customApi.isfunction) {
            const paramString = buildFunctionParamString({
                requestParameters,
                parameterValues,
            });
            return `${baseUrl}${paramString}`;
        }

        return baseUrl;
    }, [customApi, connection?.url, requestParameters, parameterValues, boundEntityCollectionName, boundRecordId]);

    return (
        <Card className={styles.card}>
            <CardHeader
                header={
                    <span className={styles.flexRowCentered}>
                        <CodeRegular />
                        OData Details
                    </span>
                }
            />
            <div className={styles.testerPanelContent}>
                <div className={styles.testerFormSection}>
                    {/* OData URL */}
                    {odataUrl && (
                        <Field label={
                            <span className={styles.fieldLabelStandard}>
                                <span className={styles.semiBoldLabel}>Request URL</span>
                                <Badge
                                    appearance="filled"
                                    size="small"
                                    color={customApi?.isfunction ? 'informative' : 'severe'}
                                >
                                    {customApi?.isfunction ? 'GET' : 'POST'}
                                </Badge>
                            </span>
                        }>
                            <Textarea
                                value={odataUrl}
                                readOnly
                                spellCheck={false}
                                appearance='filled-darker'
                                rows={2}
                                resize='vertical'
                            />
                        </Field>
                    )}

                    {/* Request Parameters for Actions (POST body) */}
                    {customApi?.isfunction === false && requestPreview && typeof requestPreview.parameters === 'object' && requestPreview.parameters !== null && (
                        <Field label={
                            <span className={styles.semiBoldLabel}>Request Body</span>
                        }>
                            <div className={styles.jsonViewerWrapper}>
                                <JsonView
                                    value={requestPreview.parameters as object}
                                    style={theme === 'dark' ? darkTheme : lightTheme}    
                                    displayDataTypes={false}
                                    enableClipboard={true}
                                />
                            </div>
                        </Field>
                    )}

                    {/* Response JSON */}
                    {executionResult?.success && executionResult.data !== undefined && (
                        <Field label={
                            <span className={styles.semiBoldLabel}>Response JSON</span>
                        }>
                            <div className={styles.jsonViewerWrapper}>
                                <JsonView
                                    value={typeof executionResult.data === 'object' && executionResult.data !== null ? executionResult.data as object : { result: executionResult.data }}
                                    displayDataTypes={false}
                                    collapsed={2}
                                    style={theme === 'dark' ? darkTheme : lightTheme}                       
                                    shortenTextAfterLength={0}
                                    enableClipboard={true}
                                />
                            </div>
                        </Field>
                    )}

                    {/* No response yet message */}
                    {(!executionResult || !executionResult.success) && (
                        <div className={styles.infoBox}>
                            {!executionResult 
                                ? 'Execute the Custom API to see the OData response' 
                                : 'Execution failed. See the response panel for details.'}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
