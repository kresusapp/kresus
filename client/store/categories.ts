import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import {
    assert,
    assertDefined,
    localeComparator,
    NONE_CATEGORY_ID,
    translate as $t,
} from '../helpers';
import { Category, createValidCategory } from '../models';
import DefaultCategories from '../../shared/default-categories.json';

import * as backend from './backend';

import { removeInArrayById, replaceInArray, removeInArrayById, replaceInArray } from './helpers';
import { BatchStatus } from '../../shared/api/batch';
import { batch } from './batch';

export interface CategoryState {
    map: { [id: number]: Category };
    items: Category[];
}

export type DeleteCategoryParams = {
    id: number;
    // The id of the category that replaces this one, or `NONE_CATEGORY_ID` if there's no
    // replacement.
    replaceById: number;
};

// Helpers.
function sortCategories(items: Category[]) {
    const copy = items.slice();
    copy.sort((a, b) => localeComparator(a.label, b.label));
    return copy;
}

// Initial state for the category store.
function makeInitialState(categories: Category[]): CategoryState {
    const NONE_CATEGORY = createValidCategory({
        id: NONE_CATEGORY_ID,
        label: $t('client.category.none'),
        color: '#000000',
    });

    const items = sortCategories(
        [NONE_CATEGORY].concat(categories).map(c => createValidCategory(c))
    );

    const map: Record<number, Category> = {};
    for (const c of items) {
        map[c.id] = c;
    }

    return {
        items,
        map,
    };
}

// Create a new category with the fields defined in `category`.
export type CreateCategoryFields = { label: string; color: string };
export const create = createAsyncThunk(
    'categories/create',
    async (category: CreateCategoryFields) => {
        const created = (await backend.addCategory(category)) as Category;
        return created;
    }
);

// Update the given `former` category with the new fields defined in `category`.
export const update = createAsyncThunk(
    'categories/update',
    async (params: { former: Category; category: { label?: string; color?: string } }) => {
        const updated = (await backend.updateCategory(
            params.former.id,
            params.category
        )) as Category;
        return updated;
    }
);

// Delete the category `categoryId`, replacing it with `replaceById` if set to
// a number, or none if the NONE_CATEGORY_ID sentinel value.
export const destroy = createAsyncThunk(
    'categories/destroy',
    async (params: DeleteCategoryParams) => {
        const serverReplace = params.replaceById === NONE_CATEGORY_ID ? null : params.replaceById;
        await backend.deleteCategory(params.id, serverReplace);
        return params;
    }
);

// Delete all the given categories at once.
export const batchDestroy = createAsyncThunk(
    'categories/batchDestroy',
    async (params: DeleteCategoryParams[], thunkApi: any) => {
        return thunkApi.dispatch(
            batch({
                categories: {
                    toDelete: params.map(param => [param.id, param.replaceById]),
                },
            })
        );
    }
);

// Create default categories, with labels translated to the current language.
export const createDefault = createAsyncThunk(
    'categories/createDefault',
    async (_params: undefined, thunkApi: any) => {
        const defaultCategories = DefaultCategories.map(category =>
            Object.assign({}, category, {
                label: $t(category.label), // Translate category label.
            })
        );

        const state = thunkApi.getState() as { categories: CategoryState };
        const stateCategories = new Set(state.categories.items.map(c => c.label));

        const categoriesToCreate: { label: string; color: string }[] = [];
        for (const category of defaultCategories) {
            // Do not re-add an already existing category
            if (!stateCategories.has(category.label)) {
                categoriesToCreate.push(category);
            }
        }

        return thunkApi.dispatch(
            batch({
                categories: {
                    toCreate: categoriesToCreate,
                },
            })
        );
    }
);

const categoriesSlice = createSlice({
    name: 'categories',
    initialState: makeInitialState([]),
    reducers: {
        reset(_state, action) {
            // This is meant to be used as a redux toolkit reducer, using immutable under the hood.
            // Returning a value here will overwrite the state.
            return makeInitialState(action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(create.fulfilled, (state, action) => {
                const c = createValidCategory(action.payload);
                state.items.push(c);
                state.items = sortCategories(state.items);
                state.map[c.id] = c;
            })
            .addCase(batch.fulfilled, (state, action) => {
                const batchResponse = action.payload;

                const { categories } = batchResponse;
                if (typeof categories === 'undefined') {
                    return;
                }

                if (categories.created.length > 0) {
                    for (const serverCategory of categories.created) {
                        if (serverCategory.status === BatchStatus.SUCCESS) {
                            const c = createValidCategory(serverCategory);
                            state.items.push(c);
                            state.map[c.id] = c;
                        } else {
                            const { error } = serverCategory;
                            alert(`error when creating category in batch: ${error}`);
                        }
                    }
                    state.items.sort();
                }

                if (categories.deleted.length > 0) {
                    const inputs = action.meta.arg.categories?.toDelete;
                    assert(
                        typeof inputs !== 'undefined',
                        'missing inputs for a deleted category result'
                    );

                    for (let i = 0; i < inputs.length; i++) {
                        const result = categories.deleted[i];
                        if (result.status === BatchStatus.SUCCESS) {
                            const id = inputs[i][0];
                            removeInArrayById(state.items, id);
                            delete state.map[id];
                        } else {
                            const { error } = result;
                            alert(`error when deleting category in batch: ${error}`);
                        }
                    }

                    // Note: categories are still sorted, because they were sorted before the
                    // deletion.
                }
            })
            .addCase(update.fulfilled, (state, action) => {
                const id = action.payload.id;
                assertDefined(id);
                const updated = createValidCategory({
                    ...state.map[id],
                    ...action.payload,
                });
                state.map[id] = updated;
                replaceInArray(state.items, id, updated);

                if (action.payload.label !== action.meta.arg.former.label) {
                    state.items = sortCategories(state.items);
                }
            })
            .addCase(destroy.fulfilled, (state, action) => {
                const id = action.payload.id;
                removeInArrayById(state.items, id);
                delete state.map[id];
            });
    },
});

export const name = categoriesSlice.name;

export const actions = categoriesSlice.actions;

export const reducer = categoriesSlice.reducer;

// Getters
export function all(state: CategoryState): Category[] {
    return state.items;
}

export function allButNone(state: CategoryState): Category[] {
    return all(state).filter(c => c.id !== NONE_CATEGORY_ID);
}

export function allUnused(state: CategoryState, usedCategoriesSet: Set<number>): Category[] {
    return allButNone(state).filter(c => !usedCategoriesSet.has(c.id));
}

export function fromId(state: CategoryState, id: number): Category {
    const map = state.map;
    assert(typeof map[id] !== 'undefined', `fromId lookup failed for id: ${id}`);
    return map[id];
}
