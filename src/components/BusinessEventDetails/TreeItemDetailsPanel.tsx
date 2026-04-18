import React from 'react';
import {
    Field,
    Input,
    Textarea,
    Switch,
    Text,
    Badge,
    Tooltip,
    Button,
    makeStyles,
    tokens,
    mergeClasses,
} from '@fluentui/react-components';
import {
    LockClosed16Regular,
    FolderRegular,
    FolderOpenRegular,
    OpenRegular,
    PlayRegular,
} from '@fluentui/react-icons';
import { Catalog } from '../../models/Catalog';
import { 
    CatalogAssignment, 
    getObjectTypeLabel, 
    getObjectTypeIcon,
    getObjectType,
    CatalogAssignmentstatecode,
} from '../../models/CatalogAssignment';
import { useStyles } from '../../styles/Styles';
import { useAppStore } from '../../store/useAppStore';

const usePanelStyles = makeStyles({
    panel: {
        flex: 1,
        minWidth: '300px',
        padding: tokens.spacingVerticalM,
        borderLeft: `1px solid ${tokens.colorNeutralStroke2}`,
        overflowY: 'auto',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        marginBottom: tokens.spacingVerticalM,
        paddingBottom: tokens.spacingVerticalS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    headerIcon: {
        fontSize: '20px',
        color: tokens.colorBrandForeground1,
    },
    headerText: {
        fontWeight: tokens.fontWeightSemibold,
        fontSize: tokens.fontSizeBase400,
    },
    typeBadge: {
        marginLeft: 'auto',
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: tokens.colorNeutralForeground3,
        textAlign: 'center',
        padding: tokens.spacingVerticalXXL,
    },
});

export type SelectedTreeItem = 
    | { type: 'catalog'; item: Catalog; isCategory: boolean }
    | { type: 'assignment'; item: CatalogAssignment }
    | null;

interface TreeItemDetailsPanelProps {
    selectedItem: SelectedTreeItem;
}

export const TreeItemDetailsPanel: React.FC<TreeItemDetailsPanelProps> = ({
    selectedItem,
}) => {
    const panelStyles = usePanelStyles();

    if (!selectedItem) {
        return (
            <div className={panelStyles.panel}>
                <div className={panelStyles.emptyState}>
                    <Text size={300}>Select an item from the tree</Text>
                    <Text size={200}>to view its details</Text>
                </div>
            </div>
        );
    }

    if (selectedItem.type === 'catalog') {
        return (
            <div className={panelStyles.panel}>
                <CatalogDetails 
                    catalog={selectedItem.item} 
                    isCategory={selectedItem.isCategory} 
                />
            </div>
        );
    }

    return (
        <div className={panelStyles.panel}>
            <AssignmentDetails assignment={selectedItem.item} />
        </div>
    );
};

// Catalog/Category Details Component
interface CatalogDetailsProps {
    catalog: Catalog;
    isCategory: boolean;
}

const CatalogDetails: React.FC<CatalogDetailsProps> = ({ catalog, isCategory }) => {
    const styles = useStyles();
    const panelStyles = usePanelStyles();

    return (
        <>
            <div className={panelStyles.header}>
                {isCategory ? (
                    <FolderOpenRegular className={panelStyles.headerIcon} />
                ) : (
                    <FolderRegular className={panelStyles.headerIcon} />
                )}
                <span className={panelStyles.headerText}>
                    {isCategory ? 'Category' : 'Root Catalog'}
                </span>
                {catalog.ismanaged && (
                    <Badge 
                        appearance="outline" 
                        size="small" 
                        className={panelStyles.typeBadge}
                        icon={<LockClosed16Regular />}
                    >
                        Managed
                    </Badge>
                )}
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formSection}>
                    <Field
                        label={
                            <span className={styles.fieldLabelStandard}>
                                Unique Name <LockClosed16Regular />
                            </span>
                        }
                    >
                        <Input 
                            value={catalog.uniquename || ''} 
                            readOnly 
                            appearance="filled-darker" 
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label={<span className={styles.fieldLabelStandard}>Name</span>}>
                        <Input 
                            value={catalog.name || ''} 
                            readOnly 
                            appearance="filled-darker" 
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field label={<span className={styles.fieldLabelStandard}>Display Name</span>}>
                        <Input 
                            value={catalog.displayname || ''} 
                            readOnly 
                            appearance="filled-darker" 
                        />
                    </Field>
                </div>

                <div className={mergeClasses(styles.formSection, styles.fullWidth)}>
                    <Field label={<span className={styles.fieldLabelStandard}>Description</span>}>
                        <Textarea
                            value={catalog.description || ''}
                            readOnly
                            spellCheck={false}
                            appearance="filled-darker"
                            resize="vertical"
                            rows={2}
                        />
                    </Field>
                </div>

                {isCategory && catalog['_parentcatalogid_value@OData.Community.Display.V1.FormattedValue'] && (
                    <div className={styles.formSection}>
                        <Field label={<span className={styles.fieldLabelStandard}>Parent Catalog</span>}>
                            <Input 
                                value={catalog['_parentcatalogid_value@OData.Community.Display.V1.FormattedValue'] || ''} 
                                readOnly 
                                appearance="filled-darker" 
                            />
                        </Field>
                    </div>
                )}

                <div className={styles.formSection}>
                    <div className={styles.switchColumn}>
                        <Tooltip 
                            content={catalog.ismanaged ? 'True' : 'False'} 
                            relationship="description" 
                            positioning="above-end"
                        >
                            <div className={styles.switchRow}>
                                <Switch
                                    checked={catalog.ismanaged}
                                    aria-disabled={true}
                                    tabIndex={-1}
                                    className={styles.readOnlySwitch}
                                    label={
                                        <span className={styles.readOnlySwitchLabel}>
                                            <span>Is Managed</span>
                                            <LockClosed16Regular />
                                        </span>
                                    }
                                    labelPosition="before"
                                />
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </>
    );
};

// Assignment Details Component
interface AssignmentDetailsProps {
    assignment: CatalogAssignment;
}

const AssignmentDetails: React.FC<AssignmentDetailsProps> = ({ assignment }) => {
    const styles = useStyles();
    const panelStyles = usePanelStyles();
    const { setSelectedNavItem, setSelectedCustomApiId } = useAppStore();
    
    const typeIcon = getObjectTypeIcon(assignment);
    const typeName = getObjectTypeLabel(assignment);
    const objectType = getObjectType(assignment);
    const isCustomApi = objectType === 'customapi';

    const handleViewCustomApi = () => {
        if (assignment._object_value) {
            setSelectedCustomApiId(assignment._object_value);
            setSelectedNavItem('customapi');
        }
    };

    const handleTestCustomApi = () => {
        if (assignment._object_value) {
            setSelectedCustomApiId(assignment._object_value);
            setSelectedNavItem('customapitester');
        }
    };

    return (
        <>
            <div className={panelStyles.header}>
                {typeIcon}
                <span className={panelStyles.headerText}>Assignment</span>
                {isCustomApi && (
                    <>
                        <Button
                            appearance="subtle"
                            size="small"
                            icon={<OpenRegular />}
                            onClick={handleViewCustomApi}
                        >
                            View Custom API
                        </Button>
                        <Button
                            appearance="subtle"
                            size="small"
                            icon={<PlayRegular />}
                            onClick={handleTestCustomApi}
                        >
                            Test Custom API
                        </Button>
                    </>
                )}
                <Badge 
                    appearance="tint" 
                    size="small" 
                    className={panelStyles.typeBadge}
                >
                    {typeName}
                </Badge>
                {assignment.ismanaged && (
                    <Badge 
                        appearance="outline" 
                        size="small"
                        icon={<LockClosed16Regular />}
                    >
                        Managed
                    </Badge>
                )}
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formSection}>
                    <Field label={<span className={styles.fieldLabelStandard}>Name</span>}>
                        <Input 
                            value={assignment.name || ''} 
                            readOnly 
                            appearance="filled-darker" 
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field
                        label={
                            <span className={styles.fieldLabelStandard}>
                                Object Type <LockClosed16Regular />
                            </span>
                        }
                    >
                        <Input 
                            contentBefore={typeIcon}
                            value={typeName} 
                            readOnly 
                            appearance="filled-darker" 
                        />
                    </Field>
                </div>

                <div className={mergeClasses(styles.formSection, styles.fullWidth)}>
                    <Field
                        label={
                            <span className={styles.fieldLabelStandard}>
                                Object <LockClosed16Regular />
                            </span>
                        }
                    >
                        <Input 
                            value={assignment['_object_value@OData.Community.Display.V1.FormattedValue'] || assignment._object_value || ''} 
                            readOnly 
                            appearance="filled-darker" 
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field
                        label={
                            <span className={styles.fieldLabelStandard}>
                                Catalog <LockClosed16Regular />
                            </span>
                        }
                    >
                        <Input 
                            value={assignment['_catalogid_value@OData.Community.Display.V1.FormattedValue'] || ''} 
                            readOnly 
                            appearance="filled-darker" 
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <Field
                        label={
                            <span className={styles.fieldLabelStandard}>
                                Status <LockClosed16Regular />
                            </span>
                        }
                    >
                        <Input 
                            value={CatalogAssignmentstatecode[assignment.statecode] || ''} 
                            readOnly 
                            appearance="filled-darker" 
                        />
                    </Field>
                </div>

                <div className={styles.formSection}>
                    <div className={styles.switchColumn}>
                        <Tooltip 
                            content={assignment.ismanaged ? 'True' : 'False'} 
                            relationship="description" 
                            positioning="above-end"
                        >
                            <div className={styles.switchRow}>
                                <Switch
                                    checked={assignment.ismanaged}
                                    aria-disabled={true}
                                    tabIndex={-1}
                                    className={styles.readOnlySwitch}
                                    label={
                                        <span className={styles.readOnlySwitchLabel}>
                                            <span>Is Managed</span>
                                            <LockClosed16Regular />
                                        </span>
                                    }
                                    labelPosition="before"
                                />
                            </div>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </>
    );
};
