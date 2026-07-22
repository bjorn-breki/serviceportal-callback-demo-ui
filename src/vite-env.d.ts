/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_PATH?: string;
    readonly VITE_TOKEN_PATH?: string;
    readonly VITE_DEFAULT_SCOPE?: string;
    readonly VITE_API_TARGET?: string;
    readonly VITE_AUTH_TARGET?: string;
    readonly VITE_XROAD_CLIENT?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
