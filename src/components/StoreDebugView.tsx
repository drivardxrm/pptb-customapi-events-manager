import { useMemo } from 'react';
import { Card, CardHeader } from '@fluentui/react-components';
import { useAppStore } from '../store/useAppStore';
import { useStyles } from '../styles/Styles';

const FUNCTION_PLACEHOLDER = '[Function]';

export const StoreDebugView = () => {
  const styles = useStyles();
  const storeState = useAppStore((state) => state);

  const serializedState = useMemo(
    () =>
      JSON.stringify(
        storeState,
        (_key, value) => (typeof value === 'function' ? FUNCTION_PLACEHOLDER : value),
        2
      ),
    [storeState]
  );

  return (
    <Card className={styles.card}>
      <CardHeader header="Zustand Store Debug" />
      <pre style={{ maxHeight: '60vh', overflow: 'auto', marginTop: '8px' }}>{serializedState}</pre>
    </Card>
  );
};
