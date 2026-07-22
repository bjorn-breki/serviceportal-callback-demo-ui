import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearAuth, getAuth } from '../auth/authStore';
import type { ValidationProblemDetails } from '../types/api';

const baseURL = import.meta.env.VITE_API_BASE_PATH ?? '/api/v1';

export const apiClient = axios.create({
    baseURL,
    headers: {
        Accept: 'application/json',
    },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const auth = getAuth();
    if (auth?.token) {
        config.headers.set('Authorization', `${auth.tokenType || 'Bearer'} ${auth.token}`);
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            clearAuth();
        }
        return Promise.reject(error);
    }
);


export function describeApiError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data as ValidationProblemDetails | string | undefined;

        if (data && typeof data === 'object') {
            if (data.errors && Object.keys(data.errors).length > 0) {
                const lines = Object.entries(data.errors).flatMap(([field, messages]) =>
                    messages.map((m) => `${field}: ${m}`)
                );
                return lines.join('\n');
            }
            if (data.detail) return data.detail;
            if (data.title) return data.title;
        }

        if (typeof data === 'string' && data.trim().length > 0) {
            return data;
        }

        if (status) {
            return `${status} ${error.response?.statusText ?? ''}`.trim();
        }

        return error.message;
    }

    if (error instanceof Error) return error.message;
    return String(error);
}
