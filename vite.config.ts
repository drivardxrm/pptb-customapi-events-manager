import { defineConfig, type ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

/**
 * Plugin to fix HTML for PPTB compatibility (build only)
 * - Removes type="module" and crossorigin attributes since we're using IIFE format
 * - Moves script tags from head to end of body so DOM is ready when IIFE executes
 */
function fixHtmlForPPTB(): Plugin {
    return {
        name: 'fix-html-for-pptb',
        enforce: 'post',
        apply: 'build', // Only apply during build, not dev
        transformIndexHtml(html) {
            // Remove type="module" and crossorigin from script tags
            // IIFE format doesn't need module type, and file:// URLs don't need crossorigin
            html = html.replace(/\s*type="module"/g, '');
            html = html.replace(/\s*crossorigin/g, '');
            // Clean up extra spaces around attributes
            html = html.replace(/\s+>/g, '>');
            
            // Move script tags from head to end of body
            // IIFE executes immediately, so DOM must be ready
            const scriptRegex = /(<script[^>]*src="[^"]*"[^>]*><\/script>)/g;
            const scripts: string[] = [];
            
            // Extract all script tags
            html = html.replace(scriptRegex, (match) => {
                scripts.push(match);
                return ''; // Remove from current position
            });
            
            // Insert scripts before closing body tag
            if (scripts.length > 0) {
                const scriptsHtml = '\n  ' + scripts.join('\n  ');
                html = html.replace('</body>', scriptsHtml + '\n</body>');
            }
            
            return html;
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
    const isTestMode = mode === 'test';

    return {
        plugins: [
            react(),
            // In test mode, transform index.html to load test-main.tsx instead of main.tsx
            isTestMode && {
                name: 'use-test-entry',
                transformIndexHtml(html: string) {
                    return html.replace('/src/main.tsx', '/src/test-main.tsx');
                },
            },
            fixHtmlForPPTB(),
        ].filter(Boolean),
        base: './',
        build: {
            outDir: 'dist',
            assetsDir: 'assets',
            sourcemap: true,
            rollupOptions: {
                output: {
                    // Use IIFE format for compatibility with iframe srcdoc loading
                    // ES modules can have issues when loaded via file:// URLs in iframes
                    format: 'iife',
                    // Bundle everything into a single file to avoid module loading issues
                    inlineDynamicImports: true,
                    // Disable chunking since we're bundling everything
                    manualChunks: undefined,
                },
            },
        },
    };
});
