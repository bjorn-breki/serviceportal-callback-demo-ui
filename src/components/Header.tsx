import { useEffect, useState } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useAuth } from '../auth/useAuth';

export default function Header() {
    const { auth, logout } = useAuth();
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const expiresAt = auth?.expiresAt ?? 0;
    const isExpired = auth ? expiresAt - now <= 0 : false;

    return (
        <header className="border-slate-200 bg-white shadow-sm">
            <div className="mx-auto flex w-full py-3 lg:px-4">
                <div className="min-w-0 flex-grow">
                    <h1 className="font-semibold">
                        ServicePortal — Mock Documents
                    </h1>
                    {auth && (
                        <div className="mt-0.5">
                            <span className="text-xs text-slate-500">
                                Token{' '}
                                <span className="font-semibold">
                                    {isExpired
                                        ? 'expired'
                                        : `expires in ${formatDistanceToNowStrict(expiresAt)}`}
                                </span>
                            </span>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={logout}
                    className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 font-medium hover:bg-slate-50"
                >
                    Sign out
                </button>
            </div>
        </header>
    );
}

