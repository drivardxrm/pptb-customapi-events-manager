import React, { useState, useMemo } from 'react';
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
    Spinner,
    ToggleButton
} from '@fluentui/react-components';
import { 
    Play24Regular,
    SquareRegular,
    ArrowUploadRegular,
    CodeFilled,
    CodeRegular,
} from '@fluentui/react-icons';
import { useStyles } from '../../styles/Styles';
import { useAppStore } from '../../store/useAppStore';
import { CustomApiRequestParameter, Customapirequestparameterstype } from '../../models/CustomApiRequestParameter';
import { GenericTagPicker, SelectableItem } from '../generic/GenericTagPicker';
import { DatePicker } from '@fluentui/react-datepicker-compat';
import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';
import { buildCustomApiODataUrl, buildFunctionParamString } from '../../utils/odataUrl';
import { CustomApi } from '../../models/CustomApi';

// Type for storing parameter values
export type ParameterValues = Record<string, unknown>;

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
                    spellCheck={false}
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
                    spellCheck={false}
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

interface RequestPanelProps {
    isFetching: boolean;
    isFetchingBoundRecords: boolean;
    isBoundToEntity: boolean;
    boundEntityLogicalName: string | null;
    boundEntityCollectionName: string | null;
    boundEntityRecords: { id: string; name: string }[];
    boundRecordId: string | null;
    setBoundRecordId: (id: string | null) => void;
    sortedParameters: CustomApiRequestParameter[];
    parameterValues: ParameterValues;
    handleParameterChange: (paramId: string, value: unknown) => void;
    isExecuting: boolean;
    isExecuteDisabled: boolean;
    onExecute: () => void;
    requestPreview: Record<string, unknown> | null;
    customApi?: CustomApi;
}

export const RequestPanel: React.FC<RequestPanelProps> = ({
    isFetching,
    isFetchingBoundRecords,
    isBoundToEntity,
    boundEntityLogicalName,
    boundEntityCollectionName,
    boundEntityRecords,
    boundRecordId,
    setBoundRecordId,
    sortedParameters,
    parameterValues,
    handleParameterChange,
    isExecuting,
    isExecuteDisabled,
    onExecute,
    requestPreview,
    customApi,
}) => {
    const styles = useStyles();
    const { theme, connection } = useAppStore();
    const [showOdata, setShowOdata] = useState(false);

    // Build the OData URL
    const odataUrl = useMemo(() => {
        if (!showOdata || !customApi || !connection?.url) {
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
                requestParameters: sortedParameters,
                parameterValues,
            });
            return `${baseUrl}${paramString}`;
        }

        return baseUrl;
    }, [showOdata, customApi, connection?.url, sortedParameters, parameterValues, boundRecordId]);


    return (
        <Card className={styles.testerPanel}>
            <CardHeader
                header={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ArrowUploadRegular /> Request</span>
                }
                action={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                        <Button
                            appearance="primary"
                            icon={isExecuting ? <Spinner size="tiny" /> : <Play24Regular />}
                            onClick={onExecute}
                            disabled={isExecuting || isExecuteDisabled}
                        >
                            {isExecuting ? 'Executing...' : 'Execute'}
                        </Button>
                    </span>
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
                {showOdata && (
                    <div className={styles.testerFormSection}>
                        {/* OData URL */}
                        {odataUrl && (
                            <Field label={
                                <span className={styles.fieldLabelStandard}>
                                    <span>Custom API URL</span>
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
                        
                        {/* OData Request Parameters , only if cudtopmapi is not function*/}
                        {customApi?.isfunction === false && requestPreview && typeof requestPreview.parameters === 'object' && requestPreview.parameters !== null && (
                            <Field label="Request Parameters">
                                <div style={{ overflow: 'auto', wordBreak: 'break-all' }}>
                                    <JsonView
                                        value={requestPreview.parameters as object}
                                        style={{ ...(theme === 'dark' ? darkTheme : lightTheme), overflow: 'auto', wordBreak: 'break-all' }}
                                        displayDataTypes={false}
                                        enableClipboard={true}
                                    />
                                </div>
                            </Field>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
};
