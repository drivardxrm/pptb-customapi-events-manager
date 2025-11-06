import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { v4 as uuidv4 } from 'uuid';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

// Ensure DOM is ready and root element exists
const rootElement = document.getElementById('root');
if (rootElement && !rootElement.hasAttribute('data-reactroot-initialized')) {
    // Mark as initialized to prevent double rendering
    rootElement.setAttribute('data-reactroot-initialized', 'true');
    
    const root = createRoot(rootElement, {
        identifierPrefix: `pptb-customapi-manager-${uuidv4()}`, // Unique prefix 
    });

    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <FluentProvider theme={webLightTheme}> // TODO : get theme from settings
                    <App />
                </FluentProvider>        
            </QueryClientProvider>
        </StrictMode>
    );
} else if (!rootElement) {
    console.error('Root element not found. Make sure the HTML contains <div id="root"></div>');
}
