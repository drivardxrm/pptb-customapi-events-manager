
import { Card, CardHeader } from '@fluentui/react-components';
import { useAppStore } from '../store/useAppStore';
import { useStyles } from '../styles/Styles';
import JsonView from '@uiw/react-json-view';
import { darkTheme } from '@uiw/react-json-view/dark';
import { lightTheme } from '@uiw/react-json-view/light';



export const DebugView = () => {
  const styles = useStyles();
  const storeState = useAppStore((state) => state);
  const {theme} = useAppStore();

  // const serializedState = useMemo(
  //   () =>
  //     JSON.stringify(
  //       storeState,
  //       (_key, value) => (typeof value === 'function' ? FUNCTION_PLACEHOLDER : value),
  //       2
  //     ),
  //   [storeState]
  // );

  return (
    <>
      <Card className={styles.card}>
        <CardHeader header="Zustand Store" />
        <JsonView
            value={storeState}
            displayDataTypes={false}
            collapsed={2}
            style={theme === 'light' ? lightTheme : darkTheme}
            shortenTextAfterLength={0}
          />
      </Card>
    </>
    
  );
};
