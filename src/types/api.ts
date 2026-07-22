export interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope?: string;
}

export interface DocumentType {
    id: string;
    name: string;
    description: string;
    endpoint: string;
    scopeName?: string | null;
    created: string;
}

export interface MockDocument {
    id: string;
    documentTypeId: string;
    nationalId: string;
    providerGroupId: string;
    serviceProviderId?: string | null;
    version: string;
    created: string;
    data: unknown;
    externalId?: string | null;
}

export interface CreateMockDocumentRequest {
    documentTypeId: string;
    serviceProviderId: string;
    nationalId: string;
    data: unknown;
}

export interface ServiceProvider {
    id: string;
    name: string;
    serviceProviderGroupId?: string | null;
    serviceProviderGroupName?: string | null;
    regNo?: string;
}

export interface PagedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface ValidationProblemDetails {
    title?: string;
    status?: number;
    detail?: string;
    errors?: Record<string, string[]>;
}
