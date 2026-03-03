/**
 * Mock implementation of window.toolboxAPI for E2E testing.
 * Matches the structure of ToolBoxAPI.API from @pptb/types.
 * Provides test control methods prefixed with __ for setting up mock state.
 */

interface DataverseConnection {
  id: string;
  name: string;
  url: string;
  environment: 'Dev' | 'Test' | 'UAT' | 'Production';
  createdAt: string;
  lastUsedAt?: string;
}

interface ToolContext {
  toolId: string | null;
  instanceId?: string | null;
  connectionUrl: string | null;
  connectionId?: string | null;
}

interface NotificationOptions {
  title: string;
  body: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToolBoxEventPayload {
  event: string;
  data: unknown;
  timestamp: string;
}

type EventCallback = (event: unknown, payload: ToolBoxEventPayload) => void;

export interface ToolboxAPIMock {
  // Nested API namespaces (matching ToolBoxAPI.API structure)
  connections: {
    getActiveConnection: () => Promise<DataverseConnection | null>;
    getSecondaryConnection: () => Promise<DataverseConnection | null>;
  };
  
  utils: {
    showNotification: (options: NotificationOptions) => Promise<void>;
    copyToClipboard: (text: string) => Promise<void>;
    getCurrentTheme: () => Promise<'light' | 'dark'>;
    executeParallel: <T>(...operations: Array<Promise<T>>) => Promise<T[]>;
    showLoading: (message?: string) => Promise<void>;
    hideLoading: () => Promise<void>;
  };
  
  fileSystem: {
    readText: (path: string) => Promise<string>;
    readBinary: (path: string) => Promise<Uint8Array>;
    exists: (path: string) => Promise<boolean>;
    stat: (path: string) => Promise<{ type: 'file' | 'directory'; size: number; mtime: string }>;
    readDirectory: (path: string) => Promise<Array<{ name: string; type: 'file' | 'directory' }>>;
    writeText: (path: string, content: string) => Promise<void>;
    createDirectory: (path: string) => Promise<void>;
    saveFile: (defaultPath: string, content: unknown, filters?: unknown[]) => Promise<string | null>;
    selectPath: (options?: unknown) => Promise<string | null>;
  };
  
  settings: {
    getAll: () => Promise<Record<string, unknown>>;
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown) => Promise<void>;
    setAll: (settings: Record<string, unknown>) => Promise<void>;
  };
  
  terminal: {
    create: (options: unknown) => Promise<unknown>;
    execute: (terminalId: string, command: string) => Promise<unknown>;
    close: (terminalId: string) => Promise<void>;
    get: (terminalId: string) => Promise<unknown>;
    list: () => Promise<unknown[]>;
    setVisibility: (terminalId: string, visible: boolean) => Promise<void>;
  };
  
  events: {
    getHistory: (limit?: number) => Promise<ToolBoxEventPayload[]>;
    on: (callback: EventCallback) => void;
    off: (callback: EventCallback) => void;
  };
  
  getToolContext: () => Promise<ToolContext>;
  
  // Test control methods
  __setConnection: (connection: DataverseConnection | null) => void;
  __setSecondaryConnection: (connection: DataverseConnection | null) => void;
  __setSettings: (settings: Record<string, unknown>) => void;
  __setTheme: (theme: 'light' | 'dark') => void;
  __emitEvent: (event: string, data: unknown) => void;
  __getNotifications: () => NotificationOptions[];
  __reset: () => void;
}

// E2ETestData is declared in dataverseAPI.mock.ts

function createToolboxAPIMock(): ToolboxAPIMock {
  let connection: DataverseConnection | null = null;
  let secondaryConnection: DataverseConnection | null = null;
  let settings: Record<string, unknown> = {};
  let theme: 'light' | 'dark' = 'light';
  let notifications: NotificationOptions[] = [];
  let eventListeners: Set<EventCallback> = new Set();
  let toolContext: ToolContext = {
    toolId: 'test-tool',
    instanceId: 'test-instance',
    connectionUrl: null,
    connectionId: null,
  };
  let initialized = false;

  // Lazy initialization - reads from window.__E2E_TEST_DATA__ on first method call
  const ensureInitialized = () => {
    if (initialized) return;
    initialized = true;
    
    if (typeof window !== 'undefined' && window.__E2E_TEST_DATA__?.connection) {
      const conn = window.__E2E_TEST_DATA__.connection;
      connection = {
        id: conn.id,
        name: conn.name,
        url: conn.url,
        environment: (conn.environment || 'Test') as 'Dev' | 'Test' | 'UAT' | 'Production',
        createdAt: conn.createdAt || new Date().toISOString(),
      };
      toolContext.connectionUrl = conn.url;
      toolContext.connectionId = conn.id;
    }
  };

  const mock: ToolboxAPIMock = {
    connections: {
      getActiveConnection: async () => {
        ensureInitialized();
        return connection;
      },
      getSecondaryConnection: async () => {
        ensureInitialized();
        return secondaryConnection;
      },
    },

    utils: {
      showNotification: async (options: NotificationOptions) => {
        notifications.push(options);
      },
      copyToClipboard: async () => {},
      getCurrentTheme: async () => theme,
      executeParallel: async <T>(...operations: Array<Promise<T>>) => Promise.all(operations),
      showLoading: async () => {},
      hideLoading: async () => {},
    },

    fileSystem: {
      readText: async () => '',
      readBinary: async () => new Uint8Array([]),
      exists: async () => false,
      stat: async () => ({ type: 'file', size: 0, mtime: new Date().toISOString() }),
      readDirectory: async () => [],
      writeText: async () => {},
      createDirectory: async () => {},
      saveFile: async () => null,
      selectPath: async () => null,
    },

    settings: {
      getAll: async () => settings,
      get: async (key: string) => settings[key],
      set: async (key: string, value: unknown) => {
        settings[key] = value;
      },
      setAll: async (newSettings: Record<string, unknown>) => {
        settings = newSettings;
      },
    },

    terminal: {
      create: async () => ({ id: 'mock-terminal', name: 'Mock Terminal' }),
      execute: async () => ({ terminalId: 'mock-terminal', commandId: 'cmd-1' }),
      close: async () => {},
      get: async () => undefined,
      list: async () => [],
      setVisibility: async () => {},
    },

    events: {
      getHistory: async () => [],
      on: (callback: EventCallback) => {
        eventListeners.add(callback);
      },
      off: (callback: EventCallback) => {
        eventListeners.delete(callback);
      },
    },

    getToolContext: async () => {
      ensureInitialized();
      return toolContext;
    },

    // Test control methods
    __setConnection: (conn: DataverseConnection | null) => {
      connection = conn;
      if (conn) {
        toolContext.connectionUrl = conn.url;
        toolContext.connectionId = conn.id;
      }
    },

    __setSecondaryConnection: (conn: DataverseConnection | null) => {
      secondaryConnection = conn;
    },

    __setSettings: (newSettings: Record<string, unknown>) => {
      settings = newSettings;
    },

    __setTheme: (newTheme: 'light' | 'dark') => {
      theme = newTheme;
    },

    __emitEvent: (event: string, data: unknown) => {
      const payload: ToolBoxEventPayload = {
        event,
        data,
        timestamp: new Date().toISOString(),
      };
      eventListeners.forEach(callback => callback(event, payload));
    },

    __getNotifications: () => [...notifications],

    __reset: () => {
      connection = null;
      secondaryConnection = null;
      settings = {};
      theme = 'light';
      notifications = [];
      eventListeners.clear();
      toolContext = {
        toolId: 'test-tool',
        instanceId: 'test-instance',
        connectionUrl: null,
        connectionId: null,
      };
    },
  };

  return mock;
}

export const toolboxAPIMock = createToolboxAPIMock();
