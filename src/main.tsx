import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
//import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';

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
    
    const root = createRoot(rootElement);

    root.render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <FluentProvider theme={webLightTheme}>
                    <App />
                </FluentProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </StrictMode>
    );
} else if (!rootElement) {
    console.error('Root element not found. Make sure the HTML contains <div id="root"></div>');
}
