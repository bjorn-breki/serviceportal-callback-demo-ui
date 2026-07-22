import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const apiTarget = env.VITE_API_TARGET ?? 'http://localhost:5184';
    const authTarget = env.VITE_AUTH_TARGET ?? 'https://serviceprovider-identity-api.staging.tr.is';

    return {
        plugins: [react(), tailwindcss()],
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: apiTarget,
                    changeOrigin: true,
                    secure: false,
                },
                '/auth': {
                    target: authTarget,
                    changeOrigin: true,
                    secure: true,
                    rewrite: (path) => path.replace(/^\/auth/, ''),
                    configure: (proxy) => {
                        proxy.on('proxyRes', (proxyRes) => {
                            delete proxyRes.headers['www-authenticate'];
                        });
                    },
                },
            },
        },
    };
});
