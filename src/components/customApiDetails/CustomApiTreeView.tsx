import React from 'react';
import {
    Tree,
    TreeItem,
    TreeItemLayout,
    Badge,
    tokens,
    makeStyles,
} from '@fluentui/react-components';
import {
    BoxFilled,
    ArrowDownloadFilled,
    ArrowUploadFilled,
    CheckmarkCircleFilled,
    DismissCircleFilled,
    GlobeRegular,
    SquareRegular,
    SquareMultipleRegular,
    PlugConnectedRegular,
} from '@fluentui/react-icons';
import { CustomApi, Customapisbindingtype } from '../../models/CustomApi';
import { CustomApiRequestParameter, Customapirequestparameterstype } from '../../models/CustomApiRequestParameter';
import { CustomApiResponseProperty, Customapiresponsepropertiestype } from '../../models/CustomApiResponseProperty';

interface CustomApiTreeViewProps {
    api: CustomApi;
    requestParameters: CustomApiRequestParameter[];
    responseProperties: CustomApiResponseProperty[];
}

const useTreeStyles = makeStyles({
    treeContainer: {
        padding: tokens.spacingVerticalS,
    },
    flagsContainer: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
        marginLeft: tokens.spacingHorizontalS,
    },
    flagBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXXS,
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
});

const BooleanFlag: React.FC<{ value: boolean; label: string }> = ({ value, label }) => {
    const styles = useTreeStyles();
    return (
        <span className={styles.flagBadge}>
            {value ? (
                <CheckmarkCircleFilled primaryFill={tokens.colorPaletteGreenForeground1} />
            ) : (
                <DismissCircleFilled primaryFill={tokens.colorNeutralForeground3} />
            )}
            <span style={{ color: value ? tokens.colorPaletteGreenForeground1 : tokens.colorNeutralForeground3 }}>
                {label}
            </span>
        </span>
    );
};

const getBindingTypeIcon = (bindingType: number | null) => {
    switch (bindingType) {
        case 0:
            return <GlobeRegular />;
        case 1:
            return <SquareRegular />;
        case 2:
            return <SquareMultipleRegular />;
        default:
            return <GlobeRegular />;
    }
};

export const CustomApiTreeView: React.FC<CustomApiTreeViewProps> = ({
    api,
    requestParameters,
    responseProperties,
}) => {
    const styles = useTreeStyles();

    const bindingTypeLabel = Customapisbindingtype[api.bindingtype!] || 'Unknown';
    const pluginName = api['_plugintypeid_value@OData.Community.Display.V1.FormattedValue'] || 'None';

    return (
        <div className={styles.treeContainer}>
            <Tree aria-label="Custom API Tree View" defaultOpenItems={['api-root', 'api-details', 'parameters-section', 'properties-section']}>
                {/* Root: Custom API */}
                <TreeItem itemType="branch" value="api-root">
                    <TreeItemLayout iconBefore={<BoxFilled primaryFill={tokens.colorBrandForeground1} />}>
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
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                {/* Binding */}
                                <TreeItem itemType="leaf" value="binding">
                                    <TreeItemLayout iconBefore={getBindingTypeIcon(api.bindingtype)}>
                                        <span className={styles.treeItemContent}>
                                            <span>Binding:</span>
                                            <span className={styles.subtleText}>
                                                {bindingTypeLabel}
                                                {(api.bindingtype === 1 || api.bindingtype === 2) && api.boundentitylogicalname && (
                                                    <> → {api.boundentitylogicalname}</>
                                                )}
                                            </span>
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                {/* Plugin */}
                                <TreeItem itemType="leaf" value="plugin">
                                    <TreeItemLayout iconBefore={<PlugConnectedRegular />}>
                                        <span className={styles.treeItemContent}>
                                            <span>Plugin:</span>
                                            <span className={styles.subtleText}>{pluginName}</span>
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>

                                {/* Flags */}
                                <TreeItem itemType="leaf" value="flags">
                                    <TreeItemLayout>
                                        <span className={styles.treeItemContent}>
                                            <span>Flags:</span>
                                            <span className={styles.flagsContainer}>
                                                <BooleanFlag value={api.isfunction} label="Function" />
                                                <BooleanFlag value={api.isprivate} label="Private" />
                                                <BooleanFlag value={api.workflowsdkstepenabled} label="Workflow" />
                                            </span>
                                        </span>
                                    </TreeItemLayout>
                                </TreeItem>
                            </Tree>
                        </TreeItem>

                        {/* Request Parameters Branch */}
                        <TreeItem itemType="branch" value="parameters-section">
                            <TreeItemLayout iconBefore={<ArrowDownloadFilled primaryFill={tokens.colorPaletteBlueForeground2} />}>
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
                                            itemType="leaf"
                                            value={`param-${param.customapirequestparameterid}`}
                                        >
                                            <TreeItemLayout>
                                                <span className={styles.parameterItem}>
                                                    <span>{param.uniquename}</span>
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
                                        </TreeItem>
                                    ))
                                )}
                            </Tree>
                        </TreeItem>

                        {/* Response Properties Branch */}
                        <TreeItem itemType="branch" value="properties-section">
                            <TreeItemLayout iconBefore={<ArrowUploadFilled primaryFill={tokens.colorPaletteGreenForeground2} />}>
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
                                            itemType="leaf"
                                            value={`prop-${prop.customapiresponsepropertyid}`}
                                        >
                                            <TreeItemLayout>
                                                <span className={styles.parameterItem}>
                                                    <span>{prop.uniquename}</span>
                                                    <span className={styles.typeLabel}>
                                                        ({Customapiresponsepropertiestype[prop.type] || 'Unknown'})
                                                    </span>
                                                </span>
                                            </TreeItemLayout>
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
