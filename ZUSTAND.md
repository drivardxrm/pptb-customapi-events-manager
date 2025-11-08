# Zustand State Management - Quick Reference

## Overview
Your app now uses **Zustand** for global state management instead of React Context. Zustand is lightweight, fast, and doesn't require providers.

## Store Structure

### Location
`src/store/useAppStore.ts`

### State
```typescript
{
  connection: ToolBoxAPI.DataverseConnection | null;
  isLoadingConnection: boolean;
  instanceId: string;
  logs: LogEntry[];
}
```

### Actions
```typescript
{
  setConnection: (connection) => void;
  setIsLoadingConnection: (isLoading) => void;
  refreshConnection: () => Promise<void>;
  addLog: (message, type?) => void;
  clearLogs: () => void;
}
```

## Usage Examples

### 1. Read State (React Component)

```typescript
import { useAppStore } from '../store/useAppStore';

function MyComponent() {
  // Select only the state you need
  const connection = useAppStore((state) => state.connection);
  const isLoading = useAppStore((state) => state.isLoadingConnection);
  
  // Or select multiple
  const { logs, instanceId } = useAppStore((state) => ({
    logs: state.logs,
    instanceId: state.instanceId
  }));
  
  return <div>{connection?.name}</div>;
}
```

### 2. Call Actions

```typescript
function MyComponent() {
  const addLog = useAppStore((state) => state.addLog);
  const refreshConnection = useAppStore((state) => state.refreshConnection);
  
  const handleClick = () => {
    addLog('Button clicked', 'info');
    refreshConnection();
  };
  
  return <button onClick={handleClick}>Refresh</button>;
}
```

### 3. Read State Outside React

```typescript
// In any file, not just components
import { useAppStore } from '../store/useAppStore';

const currentConnection = useAppStore.getState().connection;
const instanceId = useAppStore.getState().instanceId;

// Call actions
useAppStore.getState().addLog('Something happened', 'success');
```

### 4. Subscribe to Changes

```typescript
import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

useEffect(() => {
  const unsubscribe = useAppStore.subscribe(
    (state) => state.connection,
    (connection) => {
      console.log('Connection changed:', connection);
    }
  );
  
  return unsubscribe;
}, []);
```

## Connection Sync

### Hook: `useConnectionSync`
Located in `src/hooks/useConnectionSync.ts`

This hook:
- Fetches initial connection on mount
- Listens to connection events (`connection:created`, `connection:updated`, `connection:deleted`)
- Automatically refreshes connection state
- Logs connection/disconnection events

**Usage:** Call once in your root component (App.tsx)
```typescript
import { useConnectionSync } from './hooks/useConnectionSync';

function App() {
  useConnectionSync(); // That's it!
  // ...
}
```

## Benefits Over Context

✅ **No Provider Needed** - Just import and use  
✅ **Better Performance** - Only re-renders components using changed state  
✅ **DevTools Support** - Use Redux DevTools to inspect state  
✅ **Simpler Code** - Less boilerplate than Context  
✅ **Works Outside React** - Access state in utility functions  
✅ **TypeScript Friendly** - Full type inference  

## Migration Complete

### Removed
- ❌ `src/contexts/AppContext.tsx` (no longer needed, but kept for reference)
- ❌ `AppProvider` from `main.tsx`
- ❌ `useAppContext` hook
- ❌ `useEventLog` hook (integrated into store)

### Added
- ✅ `src/store/useAppStore.ts` - Main Zustand store
- ✅ `src/hooks/useConnectionSync.ts` - Connection event handler
- ✅ All components now use `useAppStore` directly

## Adding New State

To add new state to the store:

```typescript
// 1. Add to interface
interface AppState {
  myNewState: string;
  setMyNewState: (value: string) => void;
}

// 2. Add to store
export const useAppStore = create<AppState>((set) => ({
  myNewState: 'initial value',
  
  setMyNewState: (value) => set({ myNewState: value }),
}));
```

## Common Patterns

### Computed Values
```typescript
const hasConnection = useAppStore((state) => !!state.connection);
const logCount = useAppStore((state) => state.logs.length);
```

### Async Actions
```typescript
const myAsyncAction = async () => {
  useAppStore.getState().setIsLoadingConnection(true);
  try {
    const data = await fetchData();
    useAppStore.getState().setConnection(data);
  } finally {
    useAppStore.getState().setIsLoadingConnection(false);
  }
};
```

## Resources

- [Zustand Docs](https://docs.pmnd.rs/zustand/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
