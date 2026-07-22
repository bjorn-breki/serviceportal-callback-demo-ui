import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { createMockDocument, getAccessibleServiceProviders, getDocumentTypeSchema, getDocumentTypes } from '../api/documents';
import { describeApiError } from '../api/client';
import type { DocumentType, ServiceProvider } from '../types/api';

interface CreateDocumentFormProps {
    onCreated: () => void;
}

const DEFAULT_DATA = '{\n  \n}';

const inputClasses =
    'rounded-md border border-slate-300 bg-white px-3 py-1.5 shadow-sm disabled:cursor-not-allowed';

export default function CreateDocumentForm({ onCreated }: CreateDocumentFormProps) {
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [typesLoading, setTypesLoading] = useState(true);
    const [typesError, setTypesError] = useState<string | null>(null);

    const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
    const [providersLoading, setProvidersLoading] = useState(true);
    const [providersError, setProvidersError] = useState<string | null>(null);

    const [documentTypeId, setDocumentTypeId] = useState('');
    const [serviceProviderId, setServiceProviderId] = useState('');
    const [nationalId, setNationalId] = useState('');
    const [dataText, setDataText] = useState(DEFAULT_DATA);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [schemaLoading, setSchemaLoading] = useState(false);
    const [schemaError, setSchemaError] = useState<string | null>(null);
    const lastAutofillRef = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setTypesLoading(true);
        setTypesError(null);
        getDocumentTypes()
            .then((types) => {
                if (cancelled) return;
                setDocumentTypes(types);
                if (types.length > 0) setDocumentTypeId(types[0].id);
            })
            .catch((err) => {
                if (cancelled) return;
                setTypesError(describeApiError(err));
            })
            .finally(() => {
                if (!cancelled) setTypesLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setProvidersLoading(true);
        setProvidersError(null);
        getAccessibleServiceProviders()
            .then((providers) => {
                if (cancelled) return;
                setServiceProviders(providers);
                if (providers.length > 0) setServiceProviderId(providers[0].id);
            })
            .catch((err) => {
                if (cancelled) return;
                setProvidersError(describeApiError(err));
            })
            .finally(() => {
                if (!cancelled) setProvidersLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!documentTypeId) return;

        const currentIsPristine =
            dataText === DEFAULT_DATA || dataText === lastAutofillRef.current;
        if (!currentIsPristine) return;

        let cancelled = false;
        setSchemaLoading(true);
        setSchemaError(null);
        getDocumentTypeSchema(documentTypeId)
            .then((schema) => {
                if (cancelled) return;
                const pretty = JSON.stringify(schema ?? {}, null, 2);
                lastAutofillRef.current = pretty;
                setDataText(pretty);
            })
            .catch((err) => {
                if (cancelled) return;
                setSchemaError(describeApiError(err));
            })
            .finally(() => {
                if (!cancelled) setSchemaLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [documentTypeId]);

    async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!documentTypeId) {
            setError('Please select a document type.');
            return;
        }
        if (!serviceProviderId) {
            setError('Please select a service provider.');
            return;
        }
        if (!nationalId.trim()) {
            setError('National ID is required.');
            return;
        }

        let parsedData: unknown;
        try {
            parsedData = dataText.trim() === '' ? {} : JSON.parse(dataText);
        } catch (err) {
            setError(`Data is not valid JSON: ${(err as Error).message}`);
            return;
        }

        setSubmitting(true);
        try {
            const created = await createMockDocument({
                documentTypeId,
                serviceProviderId,
                nationalId: nationalId.trim(),
                data: parsedData,
            });
            setSuccess(`Created document ${created.id}.`);
            setNationalId('');
            setDataText(DEFAULT_DATA);
            lastAutofillRef.current = null;
            onCreated();
        } catch (err) {
            setError(describeApiError(err));
        } finally {
            setSubmitting(false);
        }
    }

    const selectDisabled = typesLoading || documentTypes.length === 0;
    const providerSelectDisabled = providersLoading || serviceProviders.length === 0;

    return (
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold">Create a mock document</h2>

            {typesError && (
                <div
                    role="alert"
                    className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                >
                    Could not load document types: {typesError}
                </div>
            )}

            {providersError && (
                <div
                    role="alert"
                    className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                >
                    Could not load service providers: {providersError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label htmlFor="documentTypeId" className="text-sm font-medium">
                        Document type
                    </label>
                    <select
                        id="documentTypeId"
                        value={selectDisabled ? '' : documentTypeId}
                        onChange={(e) => setDocumentTypeId(e.target.value)}
                        disabled={selectDisabled}
                        className={inputClasses}
                    >
                        {typesLoading && (
                            <option value="" disabled>
                                Loading…
                            </option>
                        )}
                        {!typesLoading && documentTypes.length === 0 && (
                            <option value="" disabled>
                                (no document types available)
                            </option>
                        )}
                        {documentTypes.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} — {t.description}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="serviceProviderId" className="text-sm font-medium">
                        Service provider
                    </label>
                    <select
                        id="serviceProviderId"
                        value={providerSelectDisabled ? '' : serviceProviderId}
                        onChange={(e) => setServiceProviderId(e.target.value)}
                        disabled={providerSelectDisabled}
                        className={inputClasses}
                    >
                        {providersLoading && (
                            <option value="" disabled>
                                Loading…
                            </option>
                        )}
                        {!providersLoading && serviceProviders.length === 0 && (
                            <option value="" disabled>
                                (no accessible service providers)
                            </option>
                        )}
                        {serviceProviders.map((sp) => (
                            <option key={sp.id} value={sp.id}>
                                {sp.name}
                                {sp.regNo ? ` (${sp.regNo})` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="nationalId" className="text-sm font-medium">
                        National ID
                    </label>
                    <input
                        id="nationalId"
                        type="text"
                        required
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        className={inputClasses}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="data" className="text-sm font-medium">
                        Data (JSON)
                    </label>
                    <textarea
                        id="data"
                        rows={8}
                        spellCheck={false}
                        value={dataText}
                        onChange={(e) => setDataText(e.target.value)}
                        className={`${inputClasses} font-mono text-xs`}
                    />
                    <p className="text-xs">
                        Must be valid JSON matching the schema for the selected document type.
                        {schemaLoading && ' Loading schema…'}
                    </p>
                    {schemaError && (
                        <p className="text-xs text-red-700">
                            Could not load schema template: {schemaError}
                        </p>
                    )}
                </div>

                {error && (
                    <div
                        role="alert"
                        className="whitespace-pre-line rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                    >
                        {error}
                    </div>
                )}
                {success && (
                    <div
                        role="status"
                        className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
                    >
                        {success}
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={submitting || typesLoading || providersLoading}
                        className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        {submitting ? 'Creating…' : 'Create document'}
                    </button>
                </div>
            </form>
        </section>
    );
}

