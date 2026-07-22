import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/useAuth';
import { describeApiError } from '../api/client';

const DEFAULT_SCOPE = import.meta.env.VITE_DEFAULT_SCOPE ?? 'serviceportal-callback-api:read';

export default function LoginForm() {
    const { login } = useAuth();
    const [clientId, setClientId] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await login({ clientId: clientId.trim(), clientSecret, scope: DEFAULT_SCOPE });
        } catch (err) {
            setError(describeApiError(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="rounded-lg border border-slate-200 bg-white p-8 shadow-md"
            >
                <h1 className="text-lg font-semibold">Sign in</h1>
                <p className="mt-1 mb-4 text-sm">
                    Authenticate using your client credentials.
                </p>

                <div className="flex flex-col gap-4">
                    {error && (
                        <div
                            role="alert"
                            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                        >
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-1">
                        <label htmlFor="clientId" className="text-sm font-medium">
                            Client ID
                        </label>
                        <input
                            id="clientId"
                            type="text"
                            autoComplete="username"
                            required
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="clientSecret" className="text-sm font-medium text-slate-700">
                            Client Secret
                        </label>
                        <input
                            id="clientSecret"
                            type="password"
                            autoComplete="current-password"
                            value={clientSecret}
                            onChange={(e) => setClientSecret(e.target.value)}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="mt-1  rounded-md bg-blue-600 py-2 font-semibold text-white shadow-sm hover:bg-blue-700">
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </button>
                </div>
            </form>
        </div>
    );
}

