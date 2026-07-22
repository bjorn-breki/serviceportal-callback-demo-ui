import { useCallback, useState } from 'react';
import CreateDocumentForm from './CreateDocumentForm';
import DocumentList from './DocumentList';

export default function DocumentsPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

    return (
        <main className="mx-auto w-full py-8 lg:px-8">
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
                <CreateDocumentForm onCreated={refresh} />
                <DocumentList refreshKey={refreshKey} onDeleted={refresh} />
            </div>
        </main>
    );
}
