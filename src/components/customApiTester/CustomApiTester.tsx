import React, { useState, useEffect, useMemo } from 'react';
import { 
    Card, 
    CardHeader,
    Divider,
    Field, 
    Input, 
    Textarea, 
    Switch, 
    Button,
    Tooltip,
    Badge
} from '@fluentui/react-components';
import { 
    Play24Regular,
    DocumentBulletList24Regular
} from '@fluentui/react-icons';
import { CustomApiSelector } from '../CustomApiSelector';
import { useAppStore } from '../../store/useAppStore';
import { useCustomApis } from '../../hooks/useCustomApis';
import { useCustomApiRequestParameters } from '../../hooks/useCustomApiRequestParameters';
import { useStyles } from '../../styles/Styles';
import { CustomApiRequestParameter, Customapirequestparameterstype } from '../../models/CustomApiRequestParameter';

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
                <Input
                    appearance='filled-darker'
                    type="datetime-local"
                    value={value as string ?? ''}
                    onChange={(e) => onChange(param.customapirequestparameterid, e.target.value || undefined)}
                    required={!param.isoptional}
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
    const { selectedCustomApiId } = useAppStore();
    const { customapis } = useCustomApis();
    const { requestParameters, isFetching } = useCustomApiRequestParameters();

    const selectedCustomApi = customapis.find(api => api.customapiid === selectedCustomApiId);

    // Store parameter values
    const [parameterValues, setParameterValues] = useState<ParameterValues>({});

    // Reset parameter values when custom API changes
    useEffect(() => {
        setParameterValues({});
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

    const handleTest = () => {
        // TODO: Implement test action
        console.log('Test clicked', { customApi: selectedCustomApi, parameterValues });
    };

    return (
        <>
            <CustomApiSelector />
            
            {selectedCustomApi && (
                <Card className={styles.card}>
                    <CardHeader 
                        header={
                            <div className={styles.cardHeaderContainer}>
                                <div className={styles.cardHeaderRow}>
                                    <h3>Test Custom API</h3>
                                    <Badge appearance="tint" color="informative" shape="rounded" icon={<DocumentBulletList24Regular />} size="large">
                                        {selectedCustomApi.uniquename}
                                    </Badge>
                                </div>
                            </div>
                        }
                        description={selectedCustomApi.description || 'Execute this Custom API with the parameters below'}
                        action={
                            <Button
                                appearance="primary"
                                icon={<Play24Regular />}
                                onClick={handleTest}
                            >
                                Test
                            </Button>
                        }
                    />
                    <Divider />
                    
                    {isFetching ? (
                        <div className={styles.infoBox}>Loading parameters...</div>
                    ) : sortedParameters.length === 0 ? (
                        <div className={styles.infoBox}>This Custom API has no request parameters.</div>
                    ) : (
                        <div className={styles.formGrid}>
                            <div className={styles.formSection}>
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
                        </div>
                    )}
                </Card>
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
