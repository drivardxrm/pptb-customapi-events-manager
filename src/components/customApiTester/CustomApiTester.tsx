import React, { useState, useEffect, useMemo } from 'react';
import { 
    Card, 
    CardHeader,
    Field, 
    Input, 
    Textarea, 
    Switch, 
    Button,
    Tooltip,
    Badge,
    Spinner
} from '@fluentui/react-components';
import { 
    Play24Regular,
    SquareRegular,
    ArrowUploadRegular,
    ArrowDownloadRegular
} from '@fluentui/react-icons';
import { CustomApiSelector } from '../CustomApiSelector';
import { useAppStore } from '../../store/useAppStore';
import { useCustomApis } from '../../hooks/useCustomApis';
import { useCustomApiRequestParameters } from '../../hooks/useCustomApiRequestParameters';
import { useEntityRecords } from '../../hooks/useEntityRecords';
import { useStyles } from '../../styles/Styles';
import { CustomApiRequestParameter, Customapirequestparameterstype } from '../../models/CustomApiRequestParameter';
import { Customapisbindingtype } from '../../models/CustomApi';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { ComponentStateBadge } from '../generic/ComponentStateBadge';
import { PowerFxBadge } from '../generic/PowerFxBadge';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';

// Type for storing parameter values
type ParameterValues = Record<string, unknown>;

// Render appropriate input based on parameter type
const renderParameterInput = (
    param: CustomApiRequestParameter,
    value: unknown,
    onChange: (paramId: string, value: unknown) => void,
    styles: ReturnType<typeof useStyles>
): React.ReactNode => {
    const paramType = Customapirequestparameterstype[param.type];

    switch (paramType) {
        case 'Boolean':
            return (
                <Tooltip content={value ? 'True' : 'False'} relationship='description' positioning='above-end'>
                    <Switch
                        checked={value as boolean ?? false}
                        onChange={(_, data) => onChange(param.customapirequestparameterid, data.checked)}
                    />
                </Tooltip>
            );

        case 'Integer':
        case 'Picklist':
            return (
                <Input
                    appearance='filled-darker'
                    type="number"
                    value={value?.toString() ?? ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange(param.customapirequestparameterid, val === '' ? undefined : parseInt(val, 10));
                    }}
                    required={!param.isoptional}
                />
            );

        case 'Float':
        case 'Decimal':
        case 'Money':
            return (
                <Input
                    appearance='filled-darker'
                    type="number"
                    step="any"
                    value={value?.toString() ?? ''}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange(param.customapirequestparameterid, val === '' ? undefined : parseFloat(val));
                    }}
                    required={!param.isoptional}
                />
            );

        case 'DateTime':
            return (
                <DatePicker
                    appearance='filled-darker'
                    value={value as Date | null ?? null}
                    onSelectDate={(date) => onChange(param.customapirequestparameterid, date ?? undefined)}
                    placeholder="Select a date..."
                />
            );

        case 'Guid':
            return (
                <Input
                    appearance='filled-darker'
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    value={value as string ?? ''}
                    onChange={(e) => onChange(param.customapirequestparameterid, e.target.value || undefined)}
                    required={!param.isoptional}
                />
            );

        case 'String':
            return (
                <Input
                    appearance='filled-darker'
                    value={value as string ?? ''}
                    onChange={(e) => onChange(param.customapirequestparameterid, e.target.value || undefined)}
                    required={!param.isoptional}
                />
            );

        case 'StringArray':
            return (
                <Textarea
                    appearance='filled-darker'
                    placeholder='["value1", "value2"]'
                    value={value as string ?? ''}
                    onChange={(e) => onChange(param.customapirequestparameterid, e.target.value || undefined)}
                    resize="vertical"
                    rows={3}
                />
            );

        case 'Entity':
        case 'EntityCollection':
            return (
                <Textarea
                    appearance='filled-darker'
                    placeholder={paramType === 'Entity' ? '{ "@odata.type": "...", ... }' : '[{ "@odata.type": "...", ... }]'}
                    value={value as string ?? ''}
                    onChange={(e) => onChange(param.customapirequestparameterid, e.target.value || undefined)}
                    resize="vertical"
                    rows={4}
                />
            );

        case 'EntityReference':
            return (
                <div className={styles.flexRow}>
                    <Input
                        appearance='filled-darker'
                        placeholder={param.logicalentityname || 'logicalname'}
                        value={(value as { logicalname?: string })?.logicalname ?? ''}
                        onChange={(e) => {
                            const current = (value as { logicalname?: string; id?: string }) ?? {};
                            onChange(param.customapirequestparameterid, {
                                ...current,
                                logicalname: e.target.value || undefined
                            });
                        }}
                        required={!param.isoptional}
                    />
                    <Input
                        appearance='filled-darker'
                        placeholder="Record ID (GUID)"
                        value={(value as { id?: string })?.id ?? ''}
                        onChange={(e) => {
                            const current = (value as { logicalname?: string; id?: string }) ?? {};
                            onChange(param.customapirequestparameterid, {
                                ...current,
                                id: e.target.value || undefined
                            });
                        }}
                        required={!param.isoptional}
                    />
                </div>
            );

        default:
            return (
                <Input
                    appearance='filled-darker'
                    value={value as string ?? ''}
                    onChange={(e) => onChange(param.customapirequestparameterid, e.target.value || undefined)}
                    required={!param.isoptional}
                />
            );
    }
};

export const CustomApiTester: React.FC = () => {
    const styles = useStyles();
    const { selectedCustomApiId, addLog, theme } = useAppStore();
    const { customapis } = useCustomApis();
    const { requestParameters, isFetching } = useCustomApiRequestParameters();

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

    const handleTest = async () => {
        if (!selectedCustomApi) return;

        // Validate bound entity record is selected for bound APIs
        if (isBoundToEntity && !boundRecordId) {
            setExecutionResult({ success: false, error: 'Please select a target record for this bound Custom API' });
            return;
        }

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

            // Add parameters if any
            if (Object.keys(parameters).length > 0) {
                request.parameters = parameters;
            }

            addLog(`Executing Custom API '${selectedCustomApi.uniquename}'...`, 'info');
            const result = await window.dataverseAPI.execute(request);

            setExecutionResult({ success: true, data: result });
            addLog(`Custom API '${selectedCustomApi.uniquename}' executed successfully`, 'success');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setExecutionResult({ success: false, error: errorMessage });
            addLog(`Custom API '${selectedCustomApi.uniquename}' execution failed: ${errorMessage}`, 'error');
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
                        {/* REQUEST PANEL */}
                        <Card className={styles.testerPanel}>
                            <CardHeader
                                header={
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowUploadRegular /> Request</span>
                                }
                                action={
                                    <Button
                                        appearance="primary"
                                        icon={isExecuting ? <Spinner size="tiny" /> : <Play24Regular />}
                                        onClick={handleTest}
                                        disabled={isExecuting}
                                    >
                                        {isExecuting ? 'Executing...' : 'Test'}
                                    </Button>
                                }
                            />
                            <div className={styles.testerPanelContent}>
                                {isFetching || isFetchingBoundRecords ? (
                                    <div className={styles.infoBox}>Loading...</div>
                                ) : !isBoundToEntity && sortedParameters.length === 0 ? (
                                    <div className={styles.infoBox}>This Custom API has no request parameters.</div>
                                ) : (
                                    <div className={styles.testerFormSection}>
                                        {/* Bound Entity Record Selector */}
                                        {isBoundToEntity && boundEntityLogicalName && (
                                        <Field
                                                label={
                                                    <span className={styles.fieldLabelStandard}>
                                                        <span className={styles.semiBoldLabel}>
                                                            Target Record
                                                        </span>
                                                        <Badge 
                                                            appearance="outline" 
                                                            size="small"
                                                            color="severe"
                                                            icon={<SquareRegular />}
                                                        >
                                                            {boundEntityLogicalName}
                                                        </Badge>
                                                    </span>
                                                }
                                                hint={`Select a ${boundEntityLogicalName} record to execute this bound Custom API against`}
                                                required
                                            >
                                                <GenericTagPicker
                                                    items={boundEntityRecords.map(record => ({
                                                        id: record.id,
                                                        displayText: record.name,
                                                    } as SelectableItem)).sort((a, b) => (a.displayText || '').localeCompare(b.displayText || ''))}
                                                    initialValue={boundRecordId ?? ''}
                                                    onSelect={(id) => setBoundRecordId(id)}
                                                />
                                            </Field>
                                        )}
                                        
                                        {/* Request Parameters */}
                                        {sortedParameters.map(param => (
                                            <Field
                                                key={param.customapirequestparameterid}
                                                label={
                                                    <span className={styles.fieldLabelStandard}>
                                                        <span className={styles.semiBoldLabel}>
                                                            {param.displayname || param.name}
                                                        </span>
                                                        <Badge 
                                                            appearance="outline" 
                                                            size="small"
                                                            color="informative"
                                                        >
                                                            {Customapirequestparameterstype[param.type]}
                                                        </Badge>
                                                    </span>
                                                }
                                                hint={param.description}
                                                required={!param.isoptional}
                                            >
                                                {renderParameterInput(
                                                    param,
                                                    parameterValues[param.customapirequestparameterid],
                                                    handleParameterChange,
                                                    styles
                                                )}
                                            </Field>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* RESPONSE PANEL */}
                        <Card className={styles.testerPanel}>
                            <CardHeader
                                header={
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowDownloadRegular /> Response</span>
                                }
                            />
                            <div className={styles.testerPanelContent}>
                                {!executionResult ? (
                                    <div className={styles.infoBox}>Execute the Custom API to see the response</div>
                                ) : (
                                    <>
                                        <div className={executionResult.success ? styles.successBox : styles.errorBox}>
                                            <h4>{executionResult.success ? 'Execution Successful' : 'Execution Failed'}</h4>
                                            {executionResult.error && <p>{executionResult.error}</p>}
                                        </div>
                                        {executionResult.data !== undefined && (
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
                                        )}
                                    </>
                                )}
                            </div>
                        </Card>
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
