import { makeStyles,  tokens } from '@fluentui/react-components';

export const useStyles = makeStyles({
  container: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    height: '100vh',
    padding: tokens.spacingVerticalS,
  },
  appWrapper: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  nav: {
    minWidth: "200px",
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    '& .fui-NavItem__content::after': {
      borderLeftWidth: '2px',
    },
    '& .fui-NavDrawer': {
      height: '100%',
    },
  },
  content: {
      flex: 1,
      overflowY: 'auto',
      paddingBottom: tokens.spacingVerticalXXL,
      backgroundColor: 'white',
  },
  card: {
      width: '100%',
      maxWidth: '1200px',
      marginTop: tokens.spacingVerticalM,
  },
  formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: tokens.spacingVerticalM,
      padding: tokens.spacingVerticalL,
  },
  formSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacingVerticalS,
  },
  fullWidth: {
      gridColumn: '1 / -1',
  },
  readOnlyInput: {
      backgroundColor: tokens.colorNeutralBackground3,
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
});