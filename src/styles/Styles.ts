import { makeStyles, tokens } from '@fluentui/react-components';

export const useStyles = makeStyles({
    // ===========================================
    // LAYOUT - App Container & Navigation
    // ===========================================
    container: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        height: '100vh',
        overflow: 'hidden',
    },
    appWrapper: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        height: '100%',
        width: '100%',
        borderRadius: tokens.borderRadiusMedium,
        overflow: 'hidden',
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        height: '100%',
        minHeight: 0,
        paddingBottom: tokens.spacingVerticalXXL,
    },
    sticky: {
        position: 'sticky',
        top: '0',
        zIndex: 1000,
        backgroundColor: tokens.colorNeutralBackground1,
    },

    // ===========================================
    // NAVIGATION
    // ===========================================
    nav: {
        minWidth: '200px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '& .fui-NavDrawer': {
            flex: 1,
            '--fui-NavDrawer-width': '280px',
            width: 'var(--fui-NavDrawer-width)',
            minWidth: 'var(--fui-NavDrawer-width)',
        },
        '& .fui-NavItem[data-selected="false"] .fui-NavItem__icon svg[data-slot="filled"]': {
            display: 'none',
        },
        '& .fui-NavItem[data-selected="true"] .fui-NavItem__icon svg[data-slot="regular"]': {
            display: 'none',
        },
    },
    navCollapsed: {
        width: '72px',
        minWidth: '72px',
        '& .fui-NavDrawer': {
            '--fui-NavDrawer-width': '72px',
            width: '72px',
            minWidth: '72px',
        },
    },
    navIcon: {
        fontSize: '24px',
    },
    navIconSelected: {
        fontSize: '24px',
        color: tokens.colorBrandForeground1,
    },
    themeSwitcher: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingHorizontalM,
        paddingLeft: tokens.spacingHorizontalL,
        marginTop: 'auto',
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    themeSwitcherCollapsed: {
        justifyContent: 'center',
        paddingLeft: tokens.spacingHorizontalM,
    },

    // ===========================================
    // FLEX UTILITIES
    // ===========================================
    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },
    flexColumnM: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
    },
    flexRow: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
    },
    flexRowCentered: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    flexRowSpaceBetween: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
    },
    toggleGroup: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
    },

    // ===========================================
    // MESSAGES & NOTIFICATIONS
    // ===========================================
    messageBarContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        width: '100%',
    },
    messageBarGroup: {
        padding: tokens.spacingHorizontalSNudge,
        display: 'flex',
        flexDirection: 'column',
        marginTop: '5px',
        gap: '5px',
        overflow: 'auto',
        flex: 1,
    },
    connectionTag: {
        marginLeft: 'auto',
        marginRight: tokens.spacingHorizontalM,
        marginTop: tokens.spacingHorizontalSNudge,
        flexShrink: 0,
    },

    // ===========================================
    // CARDS
    // ===========================================
    card: {
        width: '100%',
        maxWidth: '1200px',
        marginTop: tokens.spacingVerticalM,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    cardBody: {
        flex: 1,
        minHeight: 0,
        display: 'flex',
        height: '100%',
    },
    cardHeaderContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },
    cardHeaderRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
    },
    headerBadgeGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    headerActionGroup: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
        flexWrap: 'nowrap',
        alignItems: 'center',
    },
    headerActionButton: {
        whiteSpace: 'nowrap',
    },
    lockedSection: {
        pointerEvents: 'none',
        opacity: 0.5,
        filter: 'blur(1px)',
        userSelect: 'none',
    },

    // ===========================================
    // SELECTOR LAYOUT (Two-column: picker left, filters right)
    // ===========================================
    selectorGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacingHorizontalL,
        alignItems: 'start',
    },
    selectorColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },
    subtleBorderedBox: {
        border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingHorizontalM,
    },
    filterSubsection: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
        paddingLeft: tokens.spacingHorizontalM,
    },
    filterSubsectionLabel: {
        fontWeight: tokens.fontWeightSemibold,
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground2,
    },    filterToggleButton: {
        width: '100%',
        justifyContent: 'flex-start',
    },
    // ===========================================
    // FORMS
    // ===========================================
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: tokens.spacingVerticalS,
        padding: tokens.spacingVerticalXS,
        flex: 1,
        minHeight: 0,
        height: '100%',
        alignContent: 'start',
    },
    formGridBig: {
        display: 'grid',
        gridTemplateColumns: 'minmax(340px, 1fr) minmax(420px, 1fr)',
        gap: tokens.spacingVerticalS,
        padding: tokens.spacingVerticalXS,
        alignItems: 'start',
    },
    formSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
        flex: 1,
        minHeight: 0,
    },
    fullWidth: {
        gridColumn: '1 / -1',
    },
    twoColumn: {
        gridColumn: 'span 2',
    },
    switchColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
        gridColumn: '1 / -1',
        alignItems: 'flex-start',
    },
    switchRow: {
        display: 'flex',
        alignItems: 'center',
    },
    fieldLabelWithToggle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        flexWrap: 'wrap',
        minHeight: '32px',
    },
    fieldLabelStandard: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
        minHeight: '32px',
    },
    fieldLabelClickable: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
        minHeight: '32px',
        cursor: 'pointer',
        '&:hover': {
            color: tokens.colorBrandForeground1,
        },
    },
    disabledInput: {
        backgroundColor: tokens.colorNeutralBackground6,
    },

    // ===========================================
    // TEXT & LABELS
    // ===========================================
    label: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
    },
    semiBoldLabel: {
        fontWeight: tokens.fontWeightSemibold,
    },
    readOnlySwitchLabel: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
    },
    hintText: {
        margin: 0,
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    hintTextItalic: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
        fontSize: tokens.fontSizeBase200,
        fontStyle: 'italic',
        color: tokens.colorNeutralForeground3,
    },
    headingNoMargin: {
        margin: 0,
    },
    headingActionRow: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        flexWrap: 'wrap',
    },
    required: {
        color: tokens.colorPaletteRedForeground1,
    },

    // ===========================================
    // BADGES & TAGS
    // ===========================================
    badgeContainer: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        flexWrap: 'wrap',
        marginTop: tokens.spacingVerticalXS,
    },
    tag: {
        border: 'none',
    },
    tagSelected: {
        backgroundColor: tokens.colorNeutralBackground1Selected,
    },
    tagDisabled: {
        opacity: 1,
        color: tokens.colorNeutralForeground1,
    },
    tagOverflow: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    tagOverflowLink: {
        maxWidth: '100%',
        display: 'inline-block',
    },

    // ===========================================
    // TAG PICKER
    // ===========================================
    tagpicker: {
        height: '32px',
    },
    tagPickerControl: {
        minWidth: '200px',
        paddingLeft: '3px',
        height: '32px',
    },
    tagPickerControlDisabled: {
        backgroundColor: tokens.colorNeutralBackground3,
        color: tokens.colorNeutralForeground1,
        border: 'none',
    },
    tagPickerControlEmpty: {
        paddingLeft: '10px',
    },
    tagPickerGroup: {
        padding: 0,
    },
    tagPickerGroupVisible: {
        display: 'block',
    },
    tagPickerGroupHidden: {
        display: 'none',
    },
    tagPickerInput: {
        padding: 0,
    },
    tagPickerOption: {
        display: 'flex',
        alignItems: 'center',
    },
    clearButton: {
        paddingLeft: 0,
        paddingRight: 0,
        minWidth: '10px',
    },

    // ===========================================
    // SWITCHES
    // ===========================================
    readOnlySwitch: {
        pointerEvents: 'none',
        opacity: 1,
        columnGap: tokens.spacingHorizontalXS,
        '& span': {
            opacity: 1,
        },
    },

    // ===========================================
    // SPLIT PANE
    // ===========================================
    splitContainer: {
        minHeight: '400px',
        display: 'flex',
    },
    splitPaneContent: {
        flex: '1 1 50%',
        paddingLeft: tokens.spacingVerticalM,
        paddingRight: tokens.spacingVerticalM,
    },

    // ===========================================
    // TESTER PANELS
    // ===========================================
    testerContainer: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacingHorizontalS,
        minHeight: '300px',
    },
    testerPanel: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        padding: '0 !important',
    },
    testerPanelHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    },
    testerPanelContent: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: tokens.spacingHorizontalM,
        wordBreak: 'break-all' as const,
    },
    testerFormSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },

    // ===========================================
    // DIALOGS
    // ===========================================
    dialogSurface: {
        maxWidth: '600px',
    },
    dialogContentColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalL,
    },
    dialogSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },
    catalogPathContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    summaryRow: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
    },
    summaryLabel: {
        minWidth: '150px',
    },
    summaryValue: {
        wordBreak: 'break-word',
    },
    dialogChoiceList: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },
    dialogChoiceButton: {
        width: '100%',
        justifyContent: 'flex-start',
        height: 'auto',
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    },
    dialogChoiceContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: tokens.spacingVerticalXXS,
        textAlign: 'left',
    },
    dialogChoiceTitle: {
        fontWeight: tokens.fontWeightSemibold,
    },
    dialogChoiceMeta: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground2,
    },
    dialogChoicePath: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
        flexWrap: 'wrap',
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },

    // ===========================================
    // STATUS BOXES
    // ===========================================
    infoBox: {
        padding: tokens.spacingVerticalS,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
        textAlign: 'center',
        color: tokens.colorNeutralForeground3,
    },
    successBox: {
        padding: tokens.spacingVerticalS,
        backgroundColor: tokens.colorPaletteGreenBackground1,
        borderLeft: `4px solid ${tokens.colorPaletteGreenBorder1}`,
        borderRadius: tokens.borderRadiusMedium,
    },
    errorBox: {
        padding: tokens.spacingVerticalS,
        backgroundColor: tokens.colorPaletteRedBackground1,
        borderLeft: `4px solid ${tokens.colorPaletteRedBorder1}`,
        borderRadius: tokens.borderRadiusMedium,
    },
    loadingContainer: {
        padding: tokens.spacingVerticalS,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
    },
    errorContainer: {
        padding: tokens.spacingVerticalM,
        backgroundColor: tokens.colorPaletteRedBackground1,
        borderLeft: `4px solid ${tokens.colorPaletteRedBorder1}`,
        borderRadius: tokens.borderRadiusMedium,
    },
    errorTitle: {
        margin: 0,
        fontWeight: tokens.fontWeightSemibold,
    },
    errorMessage: {
        margin: `${tokens.spacingVerticalS} 0 0 0`,
    },

    // ===========================================
    // EVENT LOG
    // ===========================================
    eventLogContainer: {
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        padding: tokens.spacingVerticalM,
        borderRadius: tokens.borderRadiusMedium,
        fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
        fontSize: '13px',
        maxHeight: '300px',
        overflowY: 'auto',
        minHeight: '50px',
    },
    eventLogEntry: {
        padding: tokens.spacingVerticalS,
        margin: `${tokens.spacingVerticalXS} 0`,
        borderRadius: tokens.borderRadiusSmall,
    },
    eventLogTimestamp: {
        color: '#858585',
        fontSize: '11px',
        marginRight: '10px',
    },
    eventLogEmpty: {
        color: '#666',
        fontStyle: 'italic',
    },

    // ===========================================
    // BUTTONS
    // ===========================================
    deleteButton: {
        backgroundColor: tokens.colorPaletteRedBackground3,
        ':hover': {
            backgroundColor: tokens.colorPaletteRedBackground3,
        },
    },

    // ===========================================
    // DATA GRID
    // ===========================================
    dataGridMinWidth: {
        minWidth: '550px',
    },
    listContainer: {
        width: '450px',
        overflow: 'auto',
    },

    // ===========================================
    // VISIBILITY
    // ===========================================
    elementVisible: {
        visibility: 'visible',
    },
    elementHidden: {
        visibility: 'hidden',
        display: 'none',
    },

    // ===========================================
    // OPTION SET
    // ===========================================
    optionLabel: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalSNudge,
    },

    // ===========================================
    // ICONS
    // ===========================================
    icon12: { fontSize: '12px' },
    icon24: { fontSize: '24px' },
    icon32: { fontSize: '32px' },

    // ===========================================
    // JSON VIEWER
    // ===========================================
    jsonViewerWrapper: {
        overflow: 'auto',
        wordBreak: 'break-all',
    },
});