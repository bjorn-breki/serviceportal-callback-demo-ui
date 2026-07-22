const STORAGE_KEY = 'spcb_auth';

export interface AuthState {
    token: string;
    tokenType: string;
    scope: string;
    expiresAt: number; // epoch ms
}

type Listener = (state: AuthState | null) => void;

let current: AuthState | null = readFromStorage();
const listeners = new Set<Listener>();

function readFromStorage(): AuthState | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as AuthState;
        if (!parsed?.token || typeof parsed.expiresAt !== 'number') return null;

        if (parsed.expiresAt <= Date.now() + 1000) return null;
        return parsed;
    } catch {
        return null;
    }
}

function writeToStorage(state: AuthState | null): void {
    if (typeof window === 'undefined') return;
    try {
        if (state) {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    } catch {

    }
}

function notify(): void {
    for (const listener of listeners) listener(current);
}

export function getAuth(): AuthState | null {
    return current;
}

export function setAuth(state: AuthState): void {
    current = state;
    writeToStorage(state);
    notify();
}

export function clearAuth(): void {
    if (current === null) return;
    current = null;
    writeToStorage(null);
    notify();
}

export function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
