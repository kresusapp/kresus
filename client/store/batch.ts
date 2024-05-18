import { createAsyncThunk } from '@reduxjs/toolkit';
import { BatchRequest } from '../../shared/api/batch';
import { NONE_CATEGORY_ID } from '../helpers';
import * as backend from './backend';

// Run a batch operation on categories.
export type BatchParams = {
    categories?: {
        toCreate?: { label: string; color: string | null }[];
        toDelete?: [number, number][];
    };
};

export const batch = createAsyncThunk('categories/batch', async (params: BatchParams) => {
    const request: BatchRequest = {};

    if (params.categories) {
        request.categories = {};

        if (params.categories.toCreate) {
            request.categories.toCreate = [...params.categories.toCreate];
        }

        if (params.categories.toDelete) {
            request.categories.toDelete = params.categories.toDelete.map(pair => {
                // Replace NONE_CATEGORY_ID by null for the server, if needs be.
                const newPair: [number, number | null] = [pair[0], pair[1]];
                if (newPair[1] === NONE_CATEGORY_ID) {
                    newPair[1] = null;
                }
                return newPair;
            });
        }
    }

    return await backend.batch(request);
});
