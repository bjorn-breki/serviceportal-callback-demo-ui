import { Fragment, useEffect, useMemo, useState } from 'react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { deleteMockDocument, getAllMockDocuments, getDocumentTypes, registerMockDocument } from '../api/documents';
import { describeApiError } from '../api/client';
import type { DocumentType, MockDocument } from '../types/api';

interface DocumentListProps {
    refreshKey: number;
    onDeleted: () => void;
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
const DEFAULT_PAGE_SIZE = 10;

function formatJson(data: unknown): string {
    let value: unknown = data;
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                value = JSON.parse(trimmed);
            } catch {

            }
        }
    }
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(data);
    }
}

function ChevronIcon({ open }: { open: boolean }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
        >
            {open ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden="true"
        >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
    );
}

function getPageNumbers(current: number, total: number): number[] {
    if (total <= 5) {
        var pageNumbers = []

        for (var i = 1; i <= total; i++) {
            pageNumbers.push(i)
        }

        return pageNumbers
    }

    const pages: number[] = [1];
    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);

    if (left > 2) pages.push(-1);
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < total - 1) pages.push(-1);

    pages.push(total);
    return pages;
}

export default function DocumentList({ refreshKey, onDeleted }: DocumentListProps) {
    const [documents, setDocuments] = useState<MockDocument[]>([]);
    const [types, setTypes] = useState<DocumentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [registeringId, setRegisteringId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        Promise.all([
            getAllMockDocuments(page, pageSize),
            getDocumentTypes().catch(() => [] as DocumentType[]),
        ])
            .then(([result, t]) => {
                if (cancelled) return;
                setDocuments(result.items);
                setTotalCount(result.totalCount);
                setTypes(t);

                const newTotalPages = Math.max(1, Math.ceil(result.totalCount / pageSize));
                if (page > newTotalPages) setPage(newTotalPages);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(describeApiError(err));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [refreshKey, page, pageSize]);

    const typeNameById = useMemo(() => {
        const map = new Map<string, string>();
        for (const t of types) map.set(t.id, t.name);
        return map;
    }, [types]);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const safePage = Math.min(page, totalPages);
    const startIndex = totalCount === 0 ? 0 : (safePage - 1) * pageSize;
    const endIndex = Math.min(startIndex + documents.length, totalCount);

    function goToPage(next: number) {
        const clamped = Math.min(Math.max(1, next), totalPages);
        if (clamped !== page) setPage(clamped);
    }

    function handlePageSizeChange(next: number) {
        const firstItemIndex = (safePage - 1) * pageSize;
        setPageSize(next);
        setPage(Math.floor(firstItemIndex / next) + 1);
    }

    async function handleDelete(doc: MockDocument) {
        if (doc.externalId) return;
        const confirmed = window.confirm(
            `Delete document ${doc.id} for national id ${doc.nationalId}? This cannot be undone.`
        );
        if (!confirmed) return;

        setError(null);
        setDeletingId(doc.id);
        try {
            await deleteMockDocument(doc.id, doc.nationalId);
            onDeleted();
        } catch (err) {
            setError(describeApiError(err));
        } finally {
            setDeletingId(null);
        }
    }

    async function handleRegister(doc: MockDocument) {
        if (doc.externalId) return;
        if (!doc.serviceProviderId) {
            setError('This document has no ServiceProvider assigned and cannot be registered.');
            return;
        }
        if (!window.confirm(`Register document ${doc.id} with the ServicePortal?`)) return;

        setError(null);
        setRegisteringId(doc.id);
        try {
            await registerMockDocument(doc.id, doc.nationalId);
            onDeleted();
        } catch (err) {
            setError(describeApiError(err));
        } finally {
            setRegisteringId(null);
        }
    }

    return (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex justify-between border-b border-slate-200 px-2 py-3">
                <h2 className="text-base font-semibold">Mock documents</h2>
                <span className="text-xs text-slate-500">
                    {loading
                        ? 'Loading…'
                        : totalCount === 0
                            ? '0 documents'
                            : `Showing ${startIndex + 1}–${endIndex} of ${totalCount}`}
                </span>
            </div>

            {error && (
                <div
                    role="alert"
                    className="m-4 whitespace-pre-line rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                >
                    {error}
                </div>
            )}

            <div>
                <table className="w-full table-fixed divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                        <tr>
                            <th scope="col" className="px-3 py-2">Id</th>
                            <th scope="col" className="px-3 py-2">Type</th>
                            <th scope="col" className="px-3 py-2">National ID</th>
                            <th scope="col" className="px-3 py-2">Version</th>
                            <th scope="col" className="px-3 py-2">Created</th>
                            <th scope="col" className="px-3 py-2">Data</th>
                            <th scope="col" className="px-3 py-2 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {!loading && totalCount === 0 && (
                            <tr>
                                <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                                    No mock documents yet.
                                </td>
                            </tr>
                        )}

                        {documents.map((doc) => {
                            const isOpen = expanded[doc.id] ?? false;
                            const typeName = typeNameById.get(doc.documentTypeId);
                            return (
                                <Fragment key={doc.id}>
                                    <tr className="align-top">
                                        <td className="px-3 py-2 font-mono text-xs">
                                            <span className="block " title={doc.id}>{doc.id}</span>
                                        </td>
                                        <td className="px-3 py-2 font-mono">
                                            {typeName ?? (
                                                <span className="text-xs text-slate-500">{doc.documentTypeId}</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 font-mono text-xs">{doc.nationalId}</td>
                                        <td className="px-3 py-2 font-mono text-xs">{doc.version}</td>
                                        <td className="px-3 py-2 font-mono text-xs">
                                            {(() => {
                                                const date = parseISO(doc.created);
                                                return (
                                                    <span title={format(date, 'PPpp')}>
                                                        {formatDistanceToNow(date, { addSuffix: true })}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="py-2">
                                            <button
                                                type="button"
                                                aria-expanded={isOpen}
                                                aria-controls={`doc-json-${doc.id}`}
                                                onClick={() =>
                                                    setExpanded((prev) => ({ ...prev, [doc.id]: !isOpen }))
                                                }
                                                className="inline-flex gap-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                                            >
                                                <ChevronIcon open={isOpen} />
                                                {isOpen ? 'Hide JSON' : 'View JSON'}
                                            </button>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                {!doc.externalId && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRegister(doc)}
                                                        disabled={registeringId === doc.id}
                                                        className="inline-flex items-center rounded-md border border-blue-200 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {registeringId === doc.id ? 'Registering…' : 'Register'}
                                                    </button>
                                                )}
                                                {doc.externalId && (
                                                    <span
                                                        className="font-mono text-[10px] text-slate-500"
                                                        title={`Registered as ${doc.externalId}`}
                                                    >
                                                        Registered
                                                    </span>
                                                )}
                                                <button
                                                    type="button"
                                                    aria-label="Delete document"
                                                    onClick={() => handleDelete(doc)}
                                                    disabled={deletingId === doc.id || !!doc.externalId}
                                                    title={doc.externalId ? 'Cannot delete a registered document' : 'Delete document'}
                                                    className="inline-flex items-center justify-center rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {isOpen && (
                                        <tr>
                                            <td colSpan={7} className="px-3 pb-4 pt-0">
                                                <pre
                                                    id={`doc-json-${doc.id}`}
                                                    className="max-h-96 overflow-auto bg-slate-900 p-3 text-[11px] text-slate-100"
                                                >
                                                    {formatJson(doc.data)}
                                                </pre>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {totalCount > 0 && (
                <div className="flex gap-3 border-t border-slate-200 px-3 py-3 text-xs sm:flex-row sm:justify-between">
                    <div className="flex items-center gap-2">
                        <label htmlFor="page-size" className="text-slate-500">
                            Rows per page
                        </label>
                        <select
                            id="page-size"
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs"
                        >
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>

                    <nav aria-label="Pagination" className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => goToPage(safePage - 1)}
                            disabled={safePage <= 1}
                            className="rounded-md border border-slate-300 px-2 py-1 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Previous
                        </button>
                        {getPageNumbers(safePage, totalPages).map((item, idx) =>
                            item === -1 ? (
                                <span key={`e-${idx}`} className="px-2 text-slate-400">
                                    …
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => goToPage(item)}
                                    aria-current={item === safePage ? 'page' : undefined}
                                    className={
                                        item === safePage
                                            ? 'rounded-md border border-blue-500 bg-blue-50 px-2.5 py-1 font-semibold text-blue-700'
                                            : 'rounded-md border border-slate-300 px-2.5 py-1 hover:bg-slate-50'
                                    }
                                >
                                    {item}
                                </button>
                            ),
                        )}
                        <button
                            type="button"
                            onClick={() => goToPage(safePage + 1)}
                            disabled={safePage >= totalPages}
                            className="rounded-md border border-slate-300 px-2 py-1 font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </section>
    );
}
