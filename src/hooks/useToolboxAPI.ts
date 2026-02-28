import { useCallback, useState } from 'react';

export type LogEntry = {
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
};



export function useEventLog() {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    // Use useCallback without dependencies since we're using the functional update form of setState
    // This ensures the functions are stable across renders and won't cause infinite loops
    const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
        setLogs((prev) => [
            {
                timestamp: new Date(),
                message,
                type,
            },
            ...prev.slice(0, 49), // Keep last 50 entries
        ]);
        console.log(`[${type.toUpperCase()}] ${message}`);
    }, []); // Empty deps is safe because we use functional setState

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []); // Empty deps is safe because we use functional setState

    return { logs, addLog, clearLogs };
}
