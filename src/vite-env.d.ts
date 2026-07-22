/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_PATH?: string;
    readonly VITE_TOKEN_PATH?: string;
    readonly VITE_DEFAULT_SCOPE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
