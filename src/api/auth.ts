import axios from 'axios';
import type { AuthState } from '../auth/authStore';
import type { TokenResponse } from '../types/api';

const tokenPath = import.meta.env.VITE_TOKEN_PATH ?? '/auth/connect/token';

export interface ClientCredentials {
    clientId: string;
    clientSecret: string;
    scope: string;
}

export async function requestToken(creds: ClientCredentials): Promise<AuthState> {
    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    body.append('client_id', creds.clientId);
    body.append('client_secret', creds.clientSecret);
    body.append('scope', creds.scope.trim());

    const { data } = await axios.post<TokenResponse>(tokenPath, body, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
        },
    });

    if (!data.access_token) {
        throw new Error('Token endpoint returned no access_token.');
    }

    return {
        token: data.access_token,
        tokenType: data.token_type || 'Bearer',
        scope: data.scope ?? creds.scope,
        expiresAt: Date.now() + Math.max(0, (data.expires_in ?? 0) * 1000),
    };
}
