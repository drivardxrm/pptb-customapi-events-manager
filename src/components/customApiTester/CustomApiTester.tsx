import React, { useState, useEffect, useMemo } from 'react';
import { 
    Card, 
    CardHeader,
    ToggleButton
} from '@fluentui/react-components';
import { CodeFilled, CodeRegular } from '@fluentui/react-icons';
import { CustomApiSelector } from '../CustomApiSelector';
import { useAppStore } from '../../store/useAppStore';
import { useCustomApis } from '../../hooks/useCustomApis';
import { useCustomApiRequestParameters } from '../../hooks/useCustomApiRequestParameters';
import { useCustomApiResponseProperties } from '../../hooks/useCustomApiResponseProperties';
import { useEntityRecords } from '../../hooks/useEntityRecords';
import { useMetadata } from '../../hooks/useMetadata';
import { useStyles } from '../../styles/Styles';
import { Customapirequestparameterstype } from '../../models/CustomApiRequestParameter';
import { Customapisbindingtype } from '../../models/CustomApi';
import { ComponentStateBadge } from '../generic/ComponentStateBadge';
import { PowerFxBadge } from '../generic/PowerFxBadge';
import { RequestPanel, ParameterValues } from './RequestPanel';
import { ResponsePanel } from './ResponsePanel';
import { ODataCard } from './ODataCard';
import { notify } from '../../utils/notify';

export const CustomApiTester: React.FC = () => {
    const styles = useStyles();
    const { selectedCustomApiId, addLog, setGlobalMessage, clearGlobalMessage, selectedNavItem } = useAppStore();
    const { customapis } = useCustomApis();
    const { requestParameters, isFetching } = useCustomApiRequestParameters();
    const { responseProperties } = useCustomApiResponseProperties();

    const selectedCustomApi = customapis.find(api => api.customapiid === selectedCustomApiId);

    // Check if API is bound to an entity
    const isBoundToEntity = selectedCustomApi?.bindingtype === 1 as Customapisbindingtype;
    const isBoundToEntityCollection = selectedCustomApi?.bindingtype === 2 as Customapisbindingtype;
    const boundEntityLogicalName = isBoundToEntity || isBoundToEntityCollection ? selectedCustomApi?.boundentitylogicalname : null;

    // Fetch metadata and records from the bound entity
    const metadata = useMetadata(boundEntityLogicalName ?? '');
    const boundEntityCollectionName: string | null = metadata.collectionname ? String(metadata.collectionname) : null;
    const { records: boundEntityRecords, isFetching: isFetchingBoundRecords } = useEntityRecords(boundEntityLogicalName);

    // Store parameter values
    const [parameterValues, setParameterValues] = useState<ParameterValues>({});
    // Store bound entity record ID
    const [boundRecordId, setBoundRecordId] = useState<string | null>(null);
    // Execution state
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<{ success: boolean; data?: unknown; error?: string } | null>(null);
    // OData visibility state
    const [showOdata, setShowOdata] = useState(false);

    // Reset parameter values and bound record when custom API changes
    useEffect(() => {
        setParameterValues({});
        setBoundRecordId(null);
        setExecutionResult(null);
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

    // Show global message for missing required fields when user selects an API
    useEffect(() => {
        if (selectedCustomApi && isRequiredMissing) {
            setGlobalMessage('tester-required-fields', {
                intent: 'warning',
                title: 'Required Fields',
                body: 'Please provide all required parameters before testing.',
                dismissable: true,
            });
        } else {
            clearGlobalMessage('tester-required-fields');
        }
    }, [selectedCustomApi?.customapiid, isRequiredMissing, setGlobalMessage, clearGlobalMessage]);

    // Clear global message when navigating away from tester
    useEffect(() => {
        return () => clearGlobalMessage('tester-required-fields');
    }, [selectedNavItem, clearGlobalMessage]);

    // Clear results when the request form becomes dirty after execution
    useEffect(() => {
        if (executionResult) {
            setExecutionResult(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parameterValues, boundRecordId]);

    // Build a reactive preview of the request object as it would be sent
    const requestPreview = useMemo(() => {
        if (!selectedCustomApi) return null;

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
                case 'DateTime':
                    params[paramName] = value;
                    break;
                
                case 'StringArray':
                    if (typeof value === 'string') {
                        try { params[paramName] = JSON.parse(value); } catch { params[paramName] = value; }
                    }
                    break;
                case 'Entity':
                case 'EntityCollection':
                    if (typeof value === 'string') {
                        try { params[paramName] = JSON.parse(value); } catch { params[paramName] = value; }
                    }
                    break;
                case 'EntityReference': {
                    const entityRef = value as { logicalname?: string; id?: string };
                    if (entityRef.logicalname && entityRef.id) {
                        params[paramName] = { entityLogicalName: entityRef.logicalname, id: entityRef.id };
                    }
                    break;
                }
                default:
                    params[paramName] = value;
            }
        }


        // TODO - URL of the call can be constructed here as well for better preview, currently only parameters are shown in the preview panel

        const operationType = selectedCustomApi.isfunction ? 'function' : 'action';
        const request: Record<string, unknown> = {
            operationName: selectedCustomApi.uniquename,
            operationType,
        };

        if (isBoundToEntity && boundEntityLogicalName && boundRecordId) {
            request.entityName = boundEntityLogicalName;
            request.entityId = boundRecordId; // Will be null if Bound to EntityCollection, which is fine as it indicates the API should be executed in the context of the collection
        }

        if (isBoundToEntityCollection && boundEntityLogicalName) {
            request.entityName = boundEntityLogicalName;
        }
       

        if (Object.keys(params).length > 0) {
            request.parameters = params;
        }

        return request;
    }, [selectedCustomApi, isBoundToEntity, isBoundToEntityCollection, boundEntityLogicalName, boundRecordId, parameterValues, requestParameters]);

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
                case 'DateTime':
                    params[paramName] = value;
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

            if (isBoundToEntityCollection && boundEntityLogicalName) {
                request.entityName = boundEntityLogicalName;
            }

            // Add parameters if any
            if (Object.keys(parameters).length > 0) {
                request.parameters = parameters;
            }

            addLog(`Executing Custom API '${selectedCustomApi.uniquename}'...`, 'info');
            const result = await window.dataverseAPI.execute(request);

            setExecutionResult({ success: true, data: result });
            addLog(`Custom API '${selectedCustomApi.uniquename}' executed successfully`, 'success');
            notify({
                title: 'Execution Successful',
                body: `Custom API '${selectedCustomApi.uniquename}' executed successfully`,
                type: 'success',
                duration: 3000,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setExecutionResult({ success: false, error: errorMessage });
            addLog(`Custom API '${selectedCustomApi.uniquename}' execution failed: ${errorMessage}`, 'error');
            notify({
                title: 'Execution Failed',
                body: `Custom API '${selectedCustomApi.uniquename}': ${errorMessage}`,
                type: 'error',
                duration: 5000,
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
                            action={
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

                    {/* OData Card - shown when OData toggle is enabled */}
                    {showOdata && (
                        <ODataCard
                            customApi={selectedCustomApi}
                            requestParameters={sortedParameters}
                            parameterValues={parameterValues}
                            boundEntityCollectionName={boundEntityCollectionName}
                            boundRecordId={boundRecordId}
                            requestPreview={requestPreview}
                            executionResult={executionResult}
                        />
                    )}
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
