import { useSyncExternalStore } from 'react';
import { requestToken, type ClientCredentials } from '../api/auth';
import { clearAuth, getAuth, setAuth, subscribe, type AuthState } from './authStore';

export interface UseAuthResult {
    auth: AuthState | null;
    isAuthenticated: boolean;
    login: (creds: ClientCredentials) => Promise<void>;
    logout: () => void;
}

async function login(creds: ClientCredentials): Promise<void> {
    setAuth(await requestToken(creds));
}

function logout(): void {
    clearAuth();
}

export function useAuth(): UseAuthResult {
    const auth = useSyncExternalStore(subscribe, getAuth, getAuth);
    return {
        auth,
        isAuthenticated: auth !== null && auth.expiresAt > Date.now(),
        login,
        logout,
    };
}
