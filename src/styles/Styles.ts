import { makeStyles,  tokens } from '@fluentui/react-components';

export const useStyles = makeStyles({
  container: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    height: '100vh',
    //padding: tokens.spacingVerticalS,
    //boxSizing: 'border-box',
    overflow: 'hidden',
  },
  label :{
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '4px'
  },
  appWrapper: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    height: '100%',
    width: '100%',
    //backgroundColor: 'white',
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
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
  content: {
      flex: 1,
      overflowY: 'auto',
      height: '100%',
      minHeight: 0,
      paddingBottom: tokens.spacingVerticalXXL,
      //backgroundColor: 'white',
  },
  navIcon: {
    fontSize: "24px",
  },
  navIconSelected: {
    fontSize: "24px",
    color: tokens.colorBrandForeground1,
  },
  messageBarContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    width: '100%',
  },
  messageBarGroup: {
    padding: tokens.spacingHorizontalSNudge,
    display: "flex",
    flexDirection: "column",
    marginTop: "5px",
    gap: "5px",
    overflow: "auto",
    flex: 1,
  },
  connectionTag: {
    marginLeft: 'auto',
    marginRight: tokens.spacingHorizontalM,
    marginTop: tokens.spacingHorizontalSNudge,
    flexShrink: 0,
  },
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
  formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: tokens.spacingVerticalM,
      padding: tokens.spacingVerticalS,
      flex: 1,
      minHeight: 0,
      height: '100%',
      alignContent: 'start',
  },
  formGridBig: {
      display: 'grid',
      gridTemplateColumns: 'minmax(340px, 1fr) minmax(420px, 1fr)',
      gap: tokens.spacingVerticalM,
      padding: tokens.spacingVerticalS,
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
    semiBoldLabel: {
      fontWeight: tokens.fontWeightSemibold,
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
    readOnlySwitchLabel: {
      display: 'inline-flex',
      alignItems: 'center',
        gap: '4px',
    },
  badgeContainer: {
      display: 'flex',
      gap: tokens.spacingHorizontalS,
      flexWrap: 'wrap',
      marginTop: tokens.spacingVerticalXS,
  },
  infoBox: {
      padding: tokens.spacingVerticalM,
      backgroundColor: tokens.colorNeutralBackground3,
      borderRadius: tokens.borderRadiusMedium,
      textAlign: 'center',
      color: tokens.colorNeutralForeground3,
  },
    headerActionGroup: {
      display: 'flex',
      gap: '4px',
      flexWrap: 'nowrap',
      alignItems: 'center',
    },
    headerActionButton: {
      whiteSpace: 'nowrap',
    },
  readOnlySwitch: {
      pointerEvents: 'none',
      opacity: 1,
      columnGap: tokens.spacingHorizontalXS,
      '& span': {
        opacity: 1,
      },
  },
  tagPickerControl: {
    minWidth: '200px',
    paddingLeft: '3px',
    height: '32px'
  },
  tagPickerControlDisabled: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground1,
    border: 'none'
  },
  tagDisabled: {
    opacity: 1,
    color: tokens.colorNeutralForeground1
  },
  tagPickerControlEmpty: {
    paddingLeft: '10px',
  },
  tagPickerGroup: {
    padding: '0 0 0 0',
  },
  
  tagPickerGroupVisible: {
    display: 'block'
  },
  tagPickerGroupHidden: {
    display: 'none'
  },
  tagPickerInput: {
   padding: '0 0 0 0'
  },
  tagPickerOption : {
    display: 'flex',
    alignItems: 'center' /* This centers the content vertically */
  },
  clearButton: {
    paddingLeft: '0',
    paddingRight: '0',
    minWidth: '10px'
  },
  splitContainer: {
    minHeight: '400px',
    display: 'flex',
  },
  splitPaneContent: {
      flex: '1 1 50%',
      paddingLeft: tokens.spacingVerticalM,
      paddingRight: tokens.spacingVerticalM,
      // display: 'flex',
      // flexDirection: 'column',
      // minHeight: 0,
      
  },
  elementVisible: {
    visibility: 'visible'
  },
  elementHidden: {
    visibility: 'hidden',
    display: 'none'     // gives back the space
  },
  icon12: { fontSize: "12px" },
  tagSelected: {
     backgroundColor: tokens.colorNeutralBackground1Selected,
  },
  tagpicker: {
    height: '32px',
  },
  tag: {
    border: 'none'
  },
  tagOverflow: {
    whiteSpace: 'nowrap', /* Prevents the text from wrapping to the next line */
    overflow: 'hidden', /* Hides the overflow text */
    textOverflow: 'ellipsis', /* Adds an ellipsis to indicate text cut off */
  },
  tagOverflowLink: {
    maxWidth: '100%',
    display: 'inline-block',
  },
  required: {
    color: tokens.colorPaletteRedForeground1,
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
  disabledInput: {
    backgroundColor: tokens.colorNeutralBackground6,
  },
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
  hintText: {
    margin: 0,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  sticky: {
    position: 'sticky',
    top: '0',
    zIndex: 1000,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  fieldLabelWithToggle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        minHeight: '32px',
    },
  fieldLabelStandard: {
        display: 'inline-flex',  // Changed from 'flex' to 'inline-flex'
        alignItems: 'center',
        gap: '4px',
        minHeight: '32px',
    },
  icon24: { fontSize: "24px" },
  icon32: { fontSize: "32px" },
});