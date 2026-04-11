import React from 'react';
import {
    Tree,
    TreeItem,
    TreeItemLayout,
    Badge,
    tokens,
    makeStyles,
    Image,
    Tooltip,
    Button,
} from '@fluentui/react-components';
import {
    CheckmarkCircleFilled,
    DismissCircleFilled,
    LockClosedRegular,
    DeveloperBoardLightningFilled,
    Edit20Regular
} from '@fluentui/react-icons';
import { CustomApi, Customapisallowedcustomprocessingsteptype, Customapisbindingtype } from '../../models/CustomApi';
import { CustomApiRequestParameter, Customapirequestparameterstype } from '../../models/CustomApiRequestParameter';
import { CustomApiResponseProperty, Customapiresponsepropertiestype } from '../../models/CustomApiResponseProperty';
import inputImage from '../../assets/input.png';
import outputImage from '../../assets/output.png';

interface CustomApiTreeViewProps {
    api: CustomApi;
    requestParameters: CustomApiRequestParameter[];
    responseProperties: CustomApiResponseProperty[];
    onEdit?: () => void;
    onDelete?: () => void;
}

const useTreeStyles = makeStyles({
    treeContainer: {
        padding: tokens.spacingVerticalS,
    },
    parameterItem: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    typeLabel: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    optionalBadge: {
        marginLeft: tokens.spacingHorizontalXS,
    },
    subtleText: {
        color: tokens.colorNeutralForeground3,
    },
    treeItemContent: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    sectionHeader: {
        fontWeight: tokens.fontWeightSemibold,
    },
    lockIcon: {
        color: tokens.colorNeutralForeground3,
        fontSize: '12px',
        marginLeft: tokens.spacingHorizontalXXS,
    },
    booleanValue: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXXS,
    },
});

const BooleanValue: React.FC<{ value: boolean }> = ({ value }) => {
    const styles = useTreeStyles();
    return (
        <span className={styles.booleanValue}>
            {value ? (
                <CheckmarkCircleFilled primaryFill={tokens.colorPaletteGreenForeground1} />
            ) : (
                <DismissCircleFilled primaryFill={tokens.colorNeutralForeground3} />
            )}
            <span style={{ color: value ? tokens.colorPaletteGreenForeground1 : tokens.colorNeutralForeground3 }}>
                {value ? 'Yes' : 'No'}
            </span>
        </span>
    );
};

const LockIcon: React.FC = () => {
    const styles = useTreeStyles();
    return (
        <Tooltip content="Cannot be changed after creation" relationship="label">
            <LockClosedRegular className={styles.lockIcon} />
        </Tooltip>
    );
};



export const CustomApiTreeView: React.FC<CustomApiTreeViewProps> = ({
    api,
    requestParameters,
    responseProperties,
    onEdit,
    onDelete
}) => {
    const styles = useTreeStyles();

    const allowedProcessingStepTypeLabel = Customapisallowedcustomprocessingsteptype[api.allowedcustomprocessingsteptype!] || 'Unknown';
    const pluginName = api['_plugintypeid_value@OData.Community.Display.V1.FormattedValue'] || 'None';

    return (
        <div className={styles.treeContainer}>
            <Tree aria-label="Custom API Tree View" defaultOpenItems={['api-root', 'api-details', 'parameters-section', 'properties-section']}>
                {/* Root: Custom API */}
                <TreeItem itemType="branch" value="api-root">
                    <TreeItemLayout 
                        iconBefore={
                            <DeveloperBoardLightningFilled 
                                primaryFill={tokens.colorBrandForeground1} 
                            />
                        }
                        actions={
                            <>
                                <Button
                                    aria-label="Edit"
                                    appearance="subtle"
                                    icon={<Edit20Regular />}
                                    onClick={onEdit}
                                />
                                {!api.ismanaged && !api._fxexpressionid_value  && 
                                    <Button
                                        aria-label="Delete"
                                        appearance="subtle"
                                        icon={<DismissCircleFilled />}
                                        onClick={onDelete}
                                    />
                                }

                            </>
                            }
                    >
                        <span className={styles.sectionHeader}>
                            Custom API: {api.displayname || api.uniquename}
                        </span>
                    </TreeItemLayout>

                    <Tree>
                        {/* API Details Branch */}
                        <TreeItem itemType="branch" value="api-details">
                            <TreeItemLayout>Details</TreeItemLayout>
                            <Tree>
                                {/* Unique Name */}
                                <TreeItem itemType="leaf" value="unique-name">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Unique Name:</span>
                                            <span className={styles.subtleText}>{api.uniquename}</span>
                                            <LockIcon />
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                {/* Name (Logical) */}
                                <TreeItem itemType="leaf" value="name">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Name:</span>
                                            <span className={styles.subtleText}>{api.name || '—'}</span>
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                
                                {/* Display Name */}
                                <TreeItem itemType="leaf" value="display-name">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Display Name:</span>
                                            <span className={styles.subtleText}>{api.displayname || '—'}</span>
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>


                                {/* Description */}
                                <TreeItem itemType="leaf" value="description">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Description:</span>
                                            <span className={styles.subtleText}>{api.description || '—'}</span>
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                 {/* Allowed Custom Processing Step Type */}
                                <TreeItem itemType="leaf" value="allowed-processing-step-type">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Allowed Processing Step Type:</span>
                                            <span className={styles.subtleText}>{allowedProcessingStepTypeLabel}</span>
                                            <LockIcon />
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                {/* Binding */}
                                <TreeItem itemType="leaf" value="binding">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Binding Type:</span>
                                            <span className={styles.subtleText}>
                                                {Customapisbindingtype[api.bindingtype!]}
                                            </span>
                                            <LockIcon />
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                {/* Bound Entity Logical Name */}
                                {(api.bindingtype === 1 || api.bindingtype === 2) && api.boundentitylogicalname && (
                                    <TreeItem itemType="leaf" value="binding">
                                        <TreeItemLayout>
                                            <span className={styles.treeItemContent}>
                                                <span>Bound Entity Logical Name:</span>
                                                <span className={styles.subtleText}>
                                                    {api.boundentitylogicalname}
                                                </span>
                                                <LockIcon />
                                            </span>
                                        </TreeItemLayout>
                                    </TreeItem>
                                )}

                               

                                {/* Plugin */}
                                <TreeItem itemType="leaf" value="plugin">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Plugin:</span>
                                            <span className={styles.subtleText}>{pluginName}</span>
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                {/* Execute Privilege Name */}
                                <TreeItem itemType="leaf" value="execute-privilege">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Execute Privilege Name:</span>
                                            <span className={styles.subtleText}>{api.executeprivilegename || '—'}</span>
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                {/* Is Function */}
                                <TreeItem itemType="leaf" value="is-function">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Is Function:</span>
                                            <BooleanValue value={api.isfunction} />
                                            <LockIcon />
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                {/* Is Private */}
                                <TreeItem itemType="leaf" value="is-private">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Is Private:</span>
                                            <BooleanValue value={api.isprivate} />
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                {/* Workflow SDK Step Enabled */}
                                <TreeItem itemType="leaf" value="workflow-enabled">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Workflow SDK Step Enabled:</span>
                                            <BooleanValue value={api.workflowsdkstepenabled} />
                                            <LockIcon />
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                {/* Is Managed */}
                                <TreeItem itemType="leaf" value="is-managed">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Is Managed:</span>
                                            <BooleanValue value={api.ismanaged} />
                                            <LockIcon />
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>
                            </Tree>
                        </TreeItem>

                        {/* Request Parameters Branch */}
                        <TreeItem itemType="branch" value="parameters-section">
                            <TreeItemLayout iconBefore={<Image alt="Request Parameters" src={inputImage} height={24} width={24} />}>
                                <span className={styles.sectionHeader}>
                                    Request Parameters ({requestParameters.length})
                                </span>
                            </TreeItemLayout>
                            <Tree>
                                {requestParameters.length === 0 ? (
                                    <TreeItem itemType="leaf" value="no-params">
                                        <TreeItemLayout>
                                            <span className={styles.subtleText}>No request parameters</span>
                                        </TreeItemLayout>
                                    </TreeItem>
                                ) : (
                                    requestParameters.map((param) => (
                                        <TreeItem
                                            key={param.customapirequestparameterid}
                                            itemType="branch"
                                            value={`param-${param.customapirequestparameterid}`}
                                        >
                                            <TreeItemLayout>
                                                <span className={styles.parameterItem}>
                                                    <span>{param.displayname || param.uniquename}</span>
                                                    <span className={styles.typeLabel}>
                                                        ({Customapirequestparameterstype[param.type] || 'Unknown'})
                                                    </span>
                                                    {param.isoptional && (
                                                        <Badge
                                                            appearance="outline"
                                                            size="small"
                                                            className={styles.optionalBadge}
                                                        >
                                                            Optional
                                                        </Badge>
                                                    )}
                                                </span>
                                            </TreeItemLayout>
                                            <Tree>
                                                <TreeItem itemType="leaf" value={`param-${param.customapirequestparameterid}-uniquename`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Unique Name:</span>
                                                            <span className={styles.subtleText}>{param.uniquename}</span>
                                                            <LockIcon />
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>
                                                
                                                <TreeItem itemType="leaf" value={`param-${param.customapirequestparameterid}-name`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Name:</span>
                                                            <span className={styles.subtleText}>{param.name || '—'}</span>
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>

                                                <TreeItem itemType="leaf" value={`param-${param.customapirequestparameterid}-name`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Display Name:</span>
                                                            <span className={styles.subtleText}>{param.displayname || '—'}</span>
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>
                                                
                                                <TreeItem itemType="leaf" value={`param-${param.customapirequestparameterid}-desc`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Description:</span>
                                                            <span className={styles.subtleText}>{param.description || '—'}</span>
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>
                                                <TreeItem itemType="leaf" value={`param-${param.customapirequestparameterid}-type`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Type:</span>
                                                            <span className={styles.subtleText}>
                                                                {Customapirequestparameterstype[param.type] || 'Unknown'}
                                                            </span>
                                                            <LockIcon />
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>
                                                {(Customapirequestparameterstype[param.type] === 'Entity' ||
                                                                    Customapirequestparameterstype[param.type] === 'EntityReference')  && (
                                                    <TreeItem itemType="leaf" value={`param-${param.customapirequestparameterid}-entity`}>
                                                        <TreeItemLayout>
                                                            <span className={styles.treeItemContent}>
                                                                <span>Logical Entity Name:</span>
                                                                <span className={styles.subtleText}>{param.logicalentityname || 'expando'}</span>
                                                                <LockIcon />
                                                            </span>
                                                        </TreeItemLayout>
                                                    </TreeItem>
                                                )}
                                                <TreeItem itemType="leaf" value={`param-${param.customapirequestparameterid}-optional`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Is Optional:</span>
                                                            <BooleanValue value={param.isoptional} />
                                                            <LockIcon />
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>
                                                <TreeItem itemType="leaf" value={`param-${param.customapirequestparameterid}-managed`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Is Managed:</span>
                                                            <BooleanValue value={param.ismanaged} />
                                                            <LockIcon />
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>
                                            </Tree>
                                        </TreeItem>
                                    ))
                                )}
                            </Tree>
                        </TreeItem>

                        {/* Response Properties Branch */}
                        <TreeItem itemType="branch" value="properties-section">
                            <TreeItemLayout iconBefore={<Image alt="Response Properties" src={outputImage} height={24} width={24} />}>
                                <span className={styles.sectionHeader}>
                                    Response Properties ({responseProperties.length})
                                </span>
                            </TreeItemLayout>
                            <Tree>
                                {responseProperties.length === 0 ? (
                                    <TreeItem itemType="leaf" value="no-props">
                                        <TreeItemLayout>
                                            <span className={styles.subtleText}>No response properties</span>
                                        </TreeItemLayout>
                                    </TreeItem>
                                ) : (
                                    responseProperties.map((prop) => (
                                        <TreeItem
                                            key={prop.customapiresponsepropertyid}
                                            itemType="branch"
                                            value={`prop-${prop.customapiresponsepropertyid}`}
                                        >
                                            <TreeItemLayout>
                                                <span className={styles.parameterItem}>
                                                    <span>{prop.displayname || prop.uniquename}</span>
                                                    <span className={styles.typeLabel}>
                                                        ({Customapiresponsepropertiestype[prop.type] || 'Unknown'})
                                                    </span>
                                                </span>
                                            </TreeItemLayout>
                                            <Tree>
                                                
                                                <TreeItem itemType="leaf" value={`prop-${prop.customapiresponsepropertyid}-uniquename`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Unique Name:</span>
                                                            <span className={styles.subtleText}>{prop.uniquename}</span>
                                                            <LockIcon />
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>

                                                <TreeItem itemType="leaf" value={`prop-${prop.customapiresponsepropertyid}-name`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Name:</span>
                                                            <span className={styles.subtleText}>{prop.name || '—'}</span>
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>

                                                <TreeItem itemType="leaf" value={`prop-${prop.customapiresponsepropertyid}-name`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Display Name:</span>
                                                            <span className={styles.subtleText}>{prop.displayname || '—'}</span>
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>

                                                <TreeItem itemType="leaf" value={`prop-${prop.customapiresponsepropertyid}-desc`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Description:</span>
                                                            <span className={styles.subtleText}>{prop.description || '—'}</span>
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>
                                                <TreeItem itemType="leaf" value={`prop-${prop.customapiresponsepropertyid}-type`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Type:</span>
                                                            <span className={styles.subtleText}>
                                                                {Customapiresponsepropertiestype[prop.type] || 'Unknown'}
                                                            </span>
                                                            <LockIcon />
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>
                                                {(Customapiresponsepropertiestype[prop.type] === 'Entity' ||
                                                                    Customapiresponsepropertiestype[prop.type] === 'EntityReference') && (
                                                    <TreeItem itemType="leaf" value={`prop-${prop.customapiresponsepropertyid}-entity`}>
                                                        <TreeItemLayout>
                                                            <span className={styles.treeItemContent}>
                                                                <span>Logical Entity Name:</span>
                                                                <span className={styles.subtleText}>{prop.logicalentityname || 'expando'}</span>
                                                                <LockIcon />
                                                            </span>
                                                        </TreeItemLayout>
                                                    </TreeItem>
                                                )}
                                                <TreeItem itemType="leaf" value={`prop-${prop.customapiresponsepropertyid}-managed`}>
                                                    <TreeItemLayout>
                                                        <span className={styles.treeItemContent}>
                                                            <span>Is Managed:</span>
                                                            <BooleanValue value={prop.ismanaged} />
                                                            <LockIcon />
                                                        </span>
                                                    </TreeItemLayout>
                                                </TreeItem>
                                            </Tree>
                                        </TreeItem>
                                    ))
                                )}
                            </Tree>
                        </TreeItem>
                    </Tree>
                </TreeItem>
            </Tree>
        </div>
    );
};
