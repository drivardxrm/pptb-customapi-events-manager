import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Hook to initialize and sync connection
 */
export const useConnectionSync = () => {
    const {refreshConnection} = useAppStore();
    
    // Fetch initial connection on mount
    useEffect(() => {
        refreshConnection();
    }, []);

};
