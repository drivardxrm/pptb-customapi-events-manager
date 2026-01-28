import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';
//import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';
import { useAppStore } from './store/useAppStore';
import { useAppSettings } from './hooks/useAppSettings';



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

// Conditional devtools component
const ConditionalDevtools = () => {
  const { appsettings } = useAppSettings();
  
  if (!appsettings?.showDebug) {
    return null;
  }
  
  return <ReactQueryDevtools initialIsOpen={false} />;
};

// Ensure DOM is ready and root element exists
const rootElement = document.getElementById('root');
if (rootElement && !rootElement.hasAttribute('data-reactroot-initialized')) {
    // Mark as initialized to prevent double rendering
    rootElement.setAttribute('data-reactroot-initialized', 'true');
    
    const root = createRoot(rootElement);


    const RootApp = () => {
      const { theme, initTheme } = useAppStore();

      // execute initTheme only once when RootApp mounts
      useEffect(() => {
        initTheme();
      }, []);
      


      return (
          <StrictMode>
              <QueryClientProvider client={queryClient}>
                  <FluentProvider theme={theme === 'light' ? webLightTheme : webDarkTheme}>
                      <App />
                  </FluentProvider>
                  <ConditionalDevtools />
              </QueryClientProvider>
          </StrictMode>
      );
  };

  root.render(<RootApp />);
} else if (!rootElement) {
    console.error('Root element not found. Make sure the HTML contains <div id="root"></div>');
}
