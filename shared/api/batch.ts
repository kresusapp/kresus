export interface BatchCategoryRequest {
    toCreate?: {
        label: string;
        color: string | null;
    }[];

    toDelete?: [number, number | null | undefined][];
}

export interface BatchRequest {
    categories?: BatchCategoryRequest;
}

export enum BatchStatus {
    SUCCESS,
    FAILURE,
}

// A success result has a status indicating success, as well as extra fields relevant for the
// operation.
export type BatchSuccessResult<T> = { status: BatchStatus.SUCCESS } & T;

// An error result has a status indicating failure, as well as an error message returned from the
// server.
export interface BatchErrorResult {
    status: BatchStatus.FAILURE;
    error: string;
}

// An individual sub-result is either a success result or an error result.
export type BatchResult<T> = BatchSuccessResult<T> | BatchErrorResult;

export interface BatchCategoryResponse {
    created: BatchResult<{ id: number; label: string; color: string | null }>[];
    deleted: BatchResult<unknown>[];
}

export interface BatchResponse {
    categories?: BatchCategoryResponse;
}
