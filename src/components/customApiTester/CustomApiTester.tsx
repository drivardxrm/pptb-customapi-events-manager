import React, { useState, useEffect, useMemo } from 'react';
import { 
    Card, 
    CardHeader
} from '@fluentui/react-components';
import { CustomApiSelector } from '../CustomApiSelector';
import { useAppStore } from '../../store/useAppStore';
import { useCustomApis } from '../../hooks/useCustomApis';
import { useCustomApiRequestParameters } from '../../hooks/useCustomApiRequestParameters';
import { useCustomApiResponseProperties } from '../../hooks/useCustomApiResponseProperties';
import { useEntityRecords } from '../../hooks/useEntityRecords';
import { useStyles } from '../../styles/Styles';
import { Customapirequestparameterstype } from '../../models/CustomApiRequestParameter';
import { Customapisbindingtype } from '../../models/CustomApi';
import { ComponentStateBadge } from '../generic/ComponentStateBadge';
import { PowerFxBadge } from '../generic/PowerFxBadge';
import { RequestPanel, ParameterValues } from './RequestPanel';
import { ResponsePanel } from './ResponsePanel';

export const CustomApiTester: React.FC = () => {
    const styles = useStyles();
    const { selectedCustomApiId, addLog, setGlobalMessage, clearGlobalMessage } = useAppStore();
    const { customapis } = useCustomApis();
    const { requestParameters, isFetching } = useCustomApiRequestParameters();
    const { responseProperties } = useCustomApiResponseProperties();

    const selectedCustomApi = customapis.find(api => api.customapiid === selectedCustomApiId);

    // Check if API is bound to an entity
    const isBoundToEntity = selectedCustomApi?.bindingtype === 1 as Customapisbindingtype;
    const boundEntityLogicalName = isBoundToEntity ? selectedCustomApi?.boundentitylogicalname : null;

    // Fetch records from the bound entity using metadata
    const { records: boundEntityRecords, isFetching: isFetchingBoundRecords } = useEntityRecords(boundEntityLogicalName);

    // Store parameter values
    const [parameterValues, setParameterValues] = useState<ParameterValues>({});
    // Store bound entity record ID
    const [boundRecordId, setBoundRecordId] = useState<string | null>(null);
    // Execution state
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<{ success: boolean; data?: unknown; error?: string } | null>(null);

    // Reset parameter values and bound record when custom API changes
    useEffect(() => {
        setParameterValues({});
        setBoundRecordId(null);
        setExecutionResult(null);
        clearGlobalMessage('test-execution');
        clearGlobalMessage('test-validation');
    }, [selectedCustomApiId]);

    // Sort parameters: required first, then by name
    const sortedParameters = useMemo(() => {
        return [...requestParameters].sort((a, b) => {
            // Required (isoptional = false) first
            if (a.isoptional !== b.isoptional) {
                return a.isoptional ? 1 : -1;
            }
            // Then alphabetically by name
            return (a.displayname || a.name || '').localeCompare(b.displayname || b.name || '');
        });
    }, [requestParameters]);

    // Check if all required fields are provided
    const isRequiredMissing = useMemo(() => {
        // Check bound entity record
        if (isBoundToEntity && !boundRecordId) return true;
        // Check required parameters
        return requestParameters.some(param => {
            if (param.isoptional) return false;
            const value = parameterValues[param.customapirequestparameterid];
            return value === undefined || value === null || value === '';
        });
    }, [isBoundToEntity, boundRecordId, requestParameters, parameterValues]);

    // Show/clear AppMessage for missing required fields
    useEffect(() => {
        if (selectedCustomApi && isRequiredMissing) {
            setGlobalMessage('test-validation', {
                intent: 'warning',
                title: 'Required Fields',
                body: 'Please provide all required parameters before testing.',
                dismissable: true,
            });
        } else {
            clearGlobalMessage('test-validation');
        }
    }, [isRequiredMissing, selectedCustomApi, setGlobalMessage, clearGlobalMessage]);

    // Clear results when the request form becomes dirty after execution
    useEffect(() => {
        if (executionResult) {
            setExecutionResult(null);
            clearGlobalMessage('test-execution');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parameterValues, boundRecordId]);

    const handleParameterChange = (paramId: string, value: unknown) => {
        setParameterValues(prev => ({
            ...prev,
            [paramId]: value
        }));
    };

    // Build the parameters object for execution
    const buildExecutionParameters = (): Record<string, unknown> => {
        const params: Record<string, unknown> = {};

        for (const param of requestParameters) {
            const value = parameterValues[param.customapirequestparameterid];
            if (value === undefined || value === null || value === '') continue;

            const paramType = Customapirequestparameterstype[param.type];
            const paramName = param.uniquename;

            switch (paramType) {
                case 'Boolean':
                case 'Integer':
                case 'Float':
                case 'Decimal':
                case 'Money':
                case 'Picklist':
                case 'Guid':
                case 'String':
                    params[paramName] = value;
                    break;

                case 'DateTime':
                    // Convert Date object to ISO format
                    if (value instanceof Date) {
                        params[paramName] = value.toISOString();
                    }
                    break;

                case 'StringArray':
                    // Parse JSON array string
                    if (typeof value === 'string') {
                        try {
                            params[paramName] = JSON.parse(value);
                        } catch {
                            params[paramName] = value;
                        }
                    }
                    break;

                case 'Entity':
                case 'EntityCollection':
                    // Parse JSON object/array string
                    if (typeof value === 'string') {
                        try {
                            params[paramName] = JSON.parse(value);
                        } catch {
                            params[paramName] = value;
                        }
                    }
                    break;

                case 'EntityReference':
                    // Format as EntityReference
                    const entityRef = value as { logicalname?: string; id?: string };
                    if (entityRef.logicalname && entityRef.id) {
                        params[paramName] = {
                            entityLogicalName: entityRef.logicalname,
                            id: entityRef.id
                        };
                    }
                    break;

                default:
                    params[paramName] = value;
            }
        }

        return params;
    };

    const handleExecute = async () => {
        if (!selectedCustomApi) return;

        setIsExecuting(true);
        setExecutionResult(null);
        clearGlobalMessage('test-execution');

        try {
            const parameters = buildExecutionParameters();
            const operationType = selectedCustomApi.isfunction ? 'function' : 'action';

            const request: {
                operationName: string;
                operationType: 'action' | 'function';
                entityName?: string;
                entityId?: string;
                parameters?: Record<string, unknown>;
            } = {
                operationName: selectedCustomApi.uniquename,
                operationType,
            };

            // Add bound entity info if applicable
            if (isBoundToEntity && boundEntityLogicalName && boundRecordId) {
                request.entityName = boundEntityLogicalName;
                request.entityId = boundRecordId;
            }

            // Add parameters if any
            if (Object.keys(parameters).length > 0) {
                request.parameters = parameters;
            }

            addLog(`Executing Custom API '${selectedCustomApi.uniquename}'...`, 'info');
            const result = await window.dataverseAPI.execute(request);

            setExecutionResult({ success: true, data: result });
            addLog(`Custom API '${selectedCustomApi.uniquename}' executed successfully`, 'success');
            setGlobalMessage('test-execution', {
                intent: 'success',
                title: 'Execution Successful',
                body: `Custom API '${selectedCustomApi.uniquename}' executed successfully`,
                dismissable: true,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setExecutionResult({ success: false, error: errorMessage });
            addLog(`Custom API '${selectedCustomApi.uniquename}' execution failed: ${errorMessage}`, 'error');
            setGlobalMessage('test-execution', {
                intent: 'error',
                title: 'Execution Failed',
                body: `Custom API '${selectedCustomApi.uniquename}': ${errorMessage}`,
                dismissable: true,
            });
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <>
            <CustomApiSelector />
            
            {selectedCustomApi && (
                <>
                    {/* Main Card Header */}
                    <Card className={styles.card}>
                        <CardHeader 
                            header={
                                <div className={styles.cardHeaderContainer}>
                                    <div className={styles.cardHeaderRow}>
                                        <h3>Test Custom API</h3>
                                        <div className={styles.headerBadgeGroup}>
                                            {selectedCustomApi && (
                                                <ComponentStateBadge isManaged={selectedCustomApi.ismanaged} />
                                            )}
                                            {selectedCustomApi?._fxexpressionid_value && (
                                                <PowerFxBadge />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            }
                            description={
                                <div className={styles.flexColumn}>
                                    <h2 className={styles.headingNoMargin}>{selectedCustomApi?.displayname || selectedCustomApi?.uniquename}</h2>
                                    {selectedCustomApi?.description && (
                                        <p >{selectedCustomApi.description}</p>
                                    )}
                                </div>
                            }
                        />
                    </Card>

                    {/* Side by Side Request/Response */}
                    <div className={styles.testerContainer}>
                        <RequestPanel
                            isFetching={isFetching}
                            isFetchingBoundRecords={isFetchingBoundRecords}
                            isBoundToEntity={isBoundToEntity}
                            boundEntityLogicalName={boundEntityLogicalName}
                            boundEntityRecords={boundEntityRecords}
                            boundRecordId={boundRecordId}
                            setBoundRecordId={setBoundRecordId}
                            sortedParameters={sortedParameters}
                            parameterValues={parameterValues}
                            handleParameterChange={handleParameterChange}
                            isExecuting={isExecuting}
                            isExecuteDisabled={isRequiredMissing}
                            onExecute={handleExecute}
                        />
                        <ResponsePanel
                            executionResult={executionResult}
                            responseProperties={responseProperties}
                        />
                    </div>
                </>
            )}
            
            {!selectedCustomApi && (
                <Card className={styles.card}>
                    <div className={styles.infoBox}>
                        <p>No Custom API selected</p>
                        <p>Please select a Custom API above to test it</p>
                    </div>
                </Card>
            )}
        </>
    );
};
