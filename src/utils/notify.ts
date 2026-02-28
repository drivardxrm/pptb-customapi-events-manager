/**
 * Fire-and-forget wrapper around the PPTB platform notification API.
 * Displays a toast notification to the user via the host application.
 */
export const notify = (options: {
    title: string;
    body: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
}): Promise<void> => window.toolboxAPI.utils.showNotification(options);
