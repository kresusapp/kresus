import u from 'updeep';

import { assert, assertHas, localeComparator, NONE_CATEGORY_ID, translate as $t } from '../helpers';

import { Category } from '../models';

import DefaultCategories from '../../shared/default-categories.json';

import * as backend from './backend';

import {
    compose,
    createReducerFromMap,
    fillOutcomeHandlers,
    updateMapIf,
    SUCCESS
} from './helpers';

import { CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY } from './actions';

// Helpers
function sortCategories(items) {
    let copy = items.slice();
    copy.sort((a, b) => localeComparator(a.title, b.title));
    return copy;
}

// Basic actions creators
const basic = {
    createCategory(category) {
        return {
            type: CREATE_CATEGORY,
            category
        };
    },

    updateCategory(former, category) {
        return {
            type: UPDATE_CATEGORY,
            id: former.id,
            category
        };
    },

    deleteCategory(category, replace) {
        return {
            type: DELETE_CATEGORY,
            id: category.id,
            replaceByCategoryId: replace
        };
    }
};

const fail = {},
    success = {};
fillOutcomeHandlers(basic, fail, success);

export function create(category) {
    assertHas(category, 'title', 'CreateCategory expects an object that has a title field');
    assertHas(category, 'color', 'CreateCategory expects an object that has a color field');

    return dispatch => {
        dispatch(basic.createCategory(category));
        backend
            .addCategory(category)
            .then(created => {
                dispatch(success.createCategory(created));
            })
            .catch(err => {
                dispatch(fail.createCategory(err, category));
            });
    };
}

export function createDefault() {
    return (dispatch, getState) => {
        const defaultCategories = DefaultCategories.map(category =>
            Object.assign({}, category, {
                title: $t(category.title) // Translate category title
            })
        );
        const stateCategories = new Set(getState().categories.items.map(c => c.title));

        for (let category of defaultCategories) {
            // Do not re-add an already existing category
            if (!stateCategories.has(category.title)) {
                dispatch(create(category));
            }
        }
    };
}

export function update(former, category) {
    assert(former instanceof Category, 'UpdateCategory first arg must be a Category');
    assertHas(category, 'title', 'UpdateCategory second arg must have a title field');
    assertHas(category, 'color', 'UpdateCategory second arg must have a color field');

    if (typeof category.threshold !== 'undefined') {
        assert(
            typeof category.threshold === 'number',
            'UpdateCategory second arg threshold field must be a number'
        );
    }

    return dispatch => {
        dispatch(basic.updateCategory(former, category));
        backend
            .updateCategory(former.id, category)
            .then(updated => {
                dispatch(success.updateCategory(former, updated));
            })
            .catch(err => {
                dispatch(fail.updateCategory(err, former, category));
            });
    };
}

export function destroy(category, replace) {
    assert(category instanceof Category, 'DeleteCategory first arg must be a Category');
    assert(typeof replace === 'string', 'DeleteCategory second arg must be a String id');

    // The server expects an empty string if there's no replacement category.
    let serverReplace = replace === NONE_CATEGORY_ID ? '' : replace;

    return dispatch => {
        dispatch(basic.deleteCategory(category, replace));
        backend
            .deleteCategory(category.id, serverReplace)
            .then(() => {
                dispatch(success.deleteCategory(category, replace));
            })
            .catch(err => {
                dispatch(fail.deleteCategory(err, category, replace));
            });
    };
}

// States
const categoryState = u(
    {
        // Maps id to categories.
        map: {},
        // The categories themselves.
        items: []
    },
    {}
);

// Reducers
function reduceCreate(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let c = new Category(action.category);
        return u(
            {
                items: compose(items => [c].concat(items), sortCategories),
                map: { [c.id]: c }
            },
            state
        );
    }

    return state;
}

function reduceUpdate(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let updated = action.category;
        return u(
            {
                items: compose(
                    updateMapIf('id', updated.id, c => new Category(u(updated, c))),
                    sortCategories
                ),
                map: { [updated.id]: updated }
            },
            state
        );
    }

    return state;
}

function reduceDelete(state, action) {
    let { status } = action;

    if (status === SUCCESS) {
        let id = action.id;
        return u(
            {
                items: u.reject(c => c.id === id),
                map: u.omit(id)
            },
            state
        );
    }

    return state;
}

const reducers = {
    CREATE_CATEGORY: reduceCreate,
    UPDATE_CATEGORY: reduceUpdate,
    DELETE_CATEGORY: reduceDelete
};

export const reducer = createReducerFromMap(categoryState, reducers);

// Initial state
export function initialState(categories) {
    const NONE_CATEGORY = new Category({
        id: NONE_CATEGORY_ID,
        title: $t('client.category.none'),
        color: '#000000'
    });

    let items = sortCategories([NONE_CATEGORY].concat(categories).map(c => new Category(c)));

    let map = {};
    for (let c of items) {
        map[c.id] = c;
    }

    return u(
        {
            items,
            map
        },
        {}
    );
}

// Getters
export function all(state) {
    return state.items;
}

export function allButNone(state) {
    return all(state).filter(c => c.id !== NONE_CATEGORY_ID);
}

export function fromId(state, id) {
    let map = state.map;
    assert(typeof map[id] !== 'undefined', `fromId lookup failed for id: ${id}`);
    return map[id];
}
