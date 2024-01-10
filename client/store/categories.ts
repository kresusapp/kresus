import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import {
    assert,
    assertDefined,
    localeComparator,
    NONE_CATEGORY_ID,
    translate as $t,
} from '../helpers';
import { Category } from '../models';
import DefaultCategories from '../../shared/default-categories.json';

import * as backend from './backend';

import { removeInArrayById, replaceInArray } from './helpers';

export interface CategoryState {
    map: { [id: number]: Category };
    items: Category[];
}

export type DeleteCategoryParams = { id: number; replaceById: number };

// Helpers.
function sortCategories(items: Category[]) {
    const copy = items.slice();
    copy.sort((a, b) => localeComparator(a.label, b.label));
    return copy;
}

// Initial state for the category store.
export function makeInitialState(categories: Category[]): CategoryState {
    const NONE_CATEGORY = new Category({
        id: NONE_CATEGORY_ID,
        label: $t('client.category.none'),
        color: '#000000',
    });

    const items = sortCategories([NONE_CATEGORY].concat(categories).map(c => new Category(c)));

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

// Create default categories, with labels translated to the current language.
// Dispatches one request per category at the moment.
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

        return await Promise.all(categoriesToCreate.map(cat => thunkApi.dispatch(create(cat))));
    }
);

const categoriesSlice = createSlice({
    name: 'categories',
    initialState: makeInitialState([]),
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(create.fulfilled, (state, action) => {
                const c = new Category(action.payload);
                state.items.push(c);
                state.items = sortCategories(state.items);
                state.map[c.id] = c;
            })
            .addCase(update.fulfilled, (state, action) => {
                const id = action.payload.id;
                assertDefined(id);
                const updated = new Category({
                    ...state.map[id],
                    ...action.payload,
                });
                state.map[id] = updated;
                replaceInArray(state.items, id, updated);
            })
            .addCase(destroy.fulfilled, (state, action) => {
                const id = action.payload.id;
                removeInArrayById(state.items, id);
                delete state.map[id];
            });
    },
});

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
