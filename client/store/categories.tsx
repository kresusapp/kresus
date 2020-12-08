import { Dispatch } from 'redux';
import { produce } from 'immer';

import { assert, localeComparator, NONE_CATEGORY_ID, translate as $t } from '../helpers';
import { Category } from '../models';
import DefaultCategories from '../../shared/default-categories.json';

import * as backend from './backend';

import {
    createActionCreator,
    SUCCESS,
    createReducerFromMap,
    removeInArray,
    updateInArray,
    actionStatus,
} from './new-helpers';

import { CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY } from './actions';

interface State {
    map: { [id: number]: Category };
    items: Category[];
}

// Helpers.
function sortCategories(items: Category[]) {
    const copy = items.slice();
    copy.sort((a, b) => localeComparator(a.label, b.label));
    return copy;
}

// Create a new category with the fields defined in `category`.
export function create(category: { label: string; color: string }) {
    return async (dispatch: Dispatch) => {
        const action = createAction({ category });
        dispatch(action);
        try {
            const created = (await backend.addCategory(category)) as Category;
            dispatch(actionStatus.ok(createAction({ category: created })));
            return created;
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

const createAction = createActionCreator<{ category: Partial<Category> }>(CREATE_CATEGORY);

function reduceCreate(state: State, action: ReturnType<typeof createAction>) {
    const { status } = action;
    if (status === SUCCESS) {
        return produce(state, (draft: State) => {
            const c = new Category(action.category);
            draft.items.push(c);
            draft.items = sortCategories(draft.items);
            draft.map[c.id] = c;
            return draft;
        });
    }
    return state;
}

// Update the given `former` category with the new fields defined in `category`.
export function update(former: Category, category: { label?: string; color?: string }) {
    return async (dispatch: Dispatch) => {
        const action = updateAction({ category });
        dispatch(action);
        try {
            const updated = await backend.updateCategory(former.id, category);
            dispatch(actionStatus.ok(updateAction({ category: updated })));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

const updateAction = createActionCreator<{ category: Partial<Category> }>(UPDATE_CATEGORY);

function reduceUpdate(state: State, action: ReturnType<typeof updateAction>) {
    const { status } = action;

    if (status === SUCCESS) {
        return produce(state, draft => {
            const id = action.category.id;
            const updated = new Category({
                ...draft.map[id],
                ...action.category,
            });
            draft.map[id] = updated;
            updateInArray(draft.items, id, updated);
            return draft;
        });
    }

    return state;
}

// Delete the category `categoryId`, replacing it with `replaceById` if set to
// a number, or none if the NONE_CATEGORY_ID sentinel value.
export function destroy(categoryId: number, replaceById: number) {
    const serverReplace = replaceById === NONE_CATEGORY_ID ? null : replaceById;
    return async (dispatch: Dispatch) => {
        const action = deleteAction({ id: categoryId, replaceById });
        dispatch(action);
        try {
            await backend.deleteCategory(categoryId, serverReplace);
            dispatch(actionStatus.ok(action));
        } catch (err) {
            dispatch(actionStatus.err(action, err));
            throw err;
        }
    };
}

const deleteAction = createActionCreator<{ id: number; replaceById: number }>(DELETE_CATEGORY);

function reduceDelete(state: State, action: ReturnType<typeof deleteAction>) {
    const { status } = action;

    if (status === SUCCESS) {
        const id = action.id;
        return produce(state, draft => {
            removeInArray(draft.items, id);
            delete draft.map[id];
        });
    }

    return state;
}

// Create default categories, with labels translated to the current language.
// Dispatches one request per category at the moment.
export function createDefault() {
    // TODO type getState with GlobalStore
    return (dispatch: Dispatch, getState: any) => {
        const defaultCategories = DefaultCategories.map(category =>
            Object.assign({}, category, {
                label: $t(category.label), // Translate category label.
            })
        );

        const stateCategories = new Set((getState().categories as State).items.map(c => c.label));

        for (const category of defaultCategories) {
            // Do not re-add an already existing category
            if (!stateCategories.has(category.label)) {
                create(category)(dispatch);
            }
        }
    };
}

// Reducer.
export const reducer = createReducerFromMap({
    [CREATE_CATEGORY]: reduceCreate,
    [UPDATE_CATEGORY]: reduceUpdate,
    [DELETE_CATEGORY]: reduceDelete,
});

// Initial state for the category store.
export function initialState(categories: Category[]): State {
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

// Getters
export function all(state: State): Category[] {
    return state.items;
}

export function allButNone(state: State): Category[] {
    return all(state).filter(c => c.id !== NONE_CATEGORY_ID);
}

export function allUnused(state: State, usedCategoriesSet: Set<Category>): Category[] {
    return allButNone(state).filter(c => !usedCategoriesSet.has(c.id));
}

export function fromId(state: State, id: number): Category {
    const map = state.map;
    assert(typeof map[id] !== 'undefined', `fromId lookup failed for id: ${id}`);
    return map[id];
}
