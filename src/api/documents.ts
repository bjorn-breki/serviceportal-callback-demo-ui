import { apiClient } from './client';
import type { CreateMockDocumentRequest, DocumentType, MockDocument, PagedResponse, ServiceProvider } from '../types/api';

export async function getAllMockDocuments(page = 1, pageSize = 10): Promise<PagedResponse<MockDocument>> {
    const { data } = await apiClient.get<PagedResponse<MockDocument>>('/documents', {
        params: { page, pageSize },
    });
    return data;
}

export async function createMockDocument(request: CreateMockDocumentRequest): Promise<MockDocument> {
    const { data } = await apiClient.post<MockDocument>('/documents', request);
    return data;
}

export async function deleteMockDocument(documentId: string, nationalId: string): Promise<void> {
    await apiClient.delete(`/documents/${documentId}`, {
        headers: { 'X-Param-National-Id': nationalId },
    });
}

export interface RegisterMockDocumentRequest {
    validFrom?: string;
    validTo?: string;
    issued?: string;
}

export async function registerMockDocument(
    documentId: string,
    nationalId: string,
    request: RegisterMockDocumentRequest = {},
): Promise<MockDocument> {
    const { data } = await apiClient.post<MockDocument>(
        `/documents/${documentId}/register`,
        request,
        { headers: { 'X-Param-National-Id': nationalId } },
    );
    return data;
}

export async function getAccessibleServiceProviders(): Promise<ServiceProvider[]> {
    const { data } = await apiClient.get<ServiceProvider[]>('/documents/service-providers');
    return data;
}

export async function getDocumentTypes(): Promise<DocumentType[]> {
    const { data } = await apiClient.get<DocumentType[]>('/documents/document-types');
    return data;
}

export async function getDocumentTypeSchema(documentTypeId: string): Promise<unknown> {
    const { data } = await apiClient.get<unknown>(
        `/documents/document-types/${encodeURIComponent(documentTypeId)}/schema`,
    );
    return data;
}
