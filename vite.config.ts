import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';
import { Agent } from 'node:https';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const apiTarget = env.VITE_API_TARGET;
    const authTarget = env.VITE_AUTH_TARGET;
    const xRoadClient = env.VITE_XROAD_CLIENT;
    const clientCertificatePath = env.XROAD_CLIENT_CERT_PATH;
    const isDev = process.env.NODE_ENV === 'development';

    if (!apiTarget) {
        throw new Error('VITE_API_TARGET must be set');
    }
    if (!authTarget) {
        throw new Error('VITE_AUTH_TARGET must be set.');
    }

    const xRoadAgent = clientCertificatePath
        ? new Agent({
              pfx: readFileSync(clientCertificatePath),
              passphrase: env.XROAD_CLIENT_CERT_PASSPHRASE,
          })
        : undefined;

    return {
        plugins: [react(), tailwindcss()],
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: apiTarget,
                    changeOrigin: true,
                    secure: !isDev,
                    agent: xRoadAgent,
                    headers: {
                        'X-Road-Client': xRoadClient,
                    },
                },
                '/auth': {
                    target: authTarget,
                    changeOrigin: true,
                    secure: !isDev,
                    agent: xRoadAgent,
                    rewrite: (path) => path.replace(/^\/auth/, ''),
                    headers: {
                        'X-Road-Client': xRoadClient,
                    },
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
