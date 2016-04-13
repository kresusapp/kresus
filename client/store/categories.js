import Immutable from 'immutable';

import { has, assert, localeComparator, NONE_CATEGORY_ID, translate as $t } from '../helpers';
import { Category } from '../models';

import * as backend from './backend';
import { makeStatusHandlers, SUCCESS, FAIL } from './helpers';

// FIXME
var data = {settings:{locale: 'en'}};

// Helpers
function sortCategories(items) {
    return items.sort((a, b) => localeComparator(a.title, b.title, data.settings.locale));
}

// Actions
const CREATE_CATEGORY = "CREATE_CATEGORY";
const UPDATE_CATEGORY = "UPDATE_CATEGORY";
const DELETE_CATEGORY = "DELETE_CATEGORY";

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
}

const [ failCreateCategory, successCreateCategory ] = makeStatusHandlers(basic.createCategory);
const [ failUpdateCategory, successUpdateCategory ] = makeStatusHandlers(basic.updateCategory);
const [ failDeleteCategory, successDeleteCategory ] = makeStatusHandlers(basic.deleteCategory);

export function create(category) {
    has(category, 'title', 'CreateCategory expects an object that has a title field');
    has(category, 'color', 'CreateCategory expects an object that has a color field');

    return dispatch => {
        dispatch(basic.createCategory(category));
        backend.addCategory(category).then(created => {
            dispatch(successCreateCategory(created));
        }).catch(err => {
            dispatch(failCreateCategory(err, category));
        });
    };
}

export function update(former, category) {
    assert(former instanceof Category, 'UpdateCategory first arg must be a Category');
    has(category, 'title', 'UpdateCategory second arg must have a title field');
    has(category, 'color', 'UpdateCategory second arg must have a color field');

    return dispatch => {
        dispatch(basic.updateCategory(former, category));
        backend.updateCategory(former.id, category).then(updated => {
            dispatch(successUpdateCategory(former, updated));
        }).catch(err => {
            dispatch(failUpdateCategory(err, former, category));
        });
    }
}

export function destroy(category, replace) {
    assert(category instanceof Category, 'DeleteCategory first arg must be a Category');
    assert(typeof replace === 'string', 'DeleteCategory second arg must be a String id');

    // The server expects an empty string if there's no replacement category.
    let serverReplace = replace === NONE_CATEGORY_ID ? '' : replace;

    return dispatch => {
        dispatch(basic.deleteCategory(category, replace));
        backend.deleteCategory(category.id, serverReplace).then(() => {
            dispatch(successDeleteCategory(category, replace));
        }).catch(err => {
            dispatch(failDeleteCategory(err, category, replace));
        });
    }
}

// States
const categoryState = Immutable.Map({
    // Maps id to categories.
    map: Immutable.Map(),
    // The categories themselves.
    items: Immutable.List()
});

// Reducers
function reduceCreate(state, action) {
    let { status } = action;
    if (status === SUCCESS) {
        console.log("Category successfully created", action.category.id);
        let c = new Category(action.category);
        let items = sortCategories(state.get('items').push(c));
        let map = state.get('map').set(c.id, c);
        return state.merge({ items, map });
    }

    if (status === FAIL) {
        console.log("Error when creating category", action.error);
    } else {
        console.log('Starting category creation...');
    }

    return state;
}

function reduceUpdate(state, action) {
    let { status } = action;
    if (status === SUCCESS) {
        console.log("Category successfully updated", action.category.id);
        let updated = action.category;
        let id = updated.id;
        let items = state.get('items');
        for (let i = 0; i < items.size; i++) {
            let c = items.get(i);
            if (c.id === id) {
                c.mergeOwnProperties(updated);
                updated = c;
                items = sortCategories(items.set(i, updated));
                break;
            }
        }
        let map = state.get('map').set(id, updated);
        return state.merge({ map, items });
    }

    if (status === FAIL) {
        console.log("Error when updating category", action.error);
    } else {
        console.log("Starting category update...");
    }

    return state;
}

function reduceDelete(state, action) {
    let { status } = action;
    if (status === SUCCESS) {
        console.log("Successfully deleted category", action.id);
        let id = action.id;
        let items = state.get('items').filter(c => c.id !== id);
        let map = state.get('map').delete(id);
        return state.merge({ items, map });
    }

    if (status === FAIL) {
        console.log("Error when deleting category:", action.error, action.error.message);
    } else {
        console.log("Starting category deletion...");
    }

    return state;
}

const reducers = {
    CREATE_CATEGORY: reduceCreate,
    UPDATE_CATEGORY: reduceUpdate,
    DELETE_CATEGORY: reduceDelete
};

export function reducer(state = categoryState, action) {
    if (action.type in reducers)
        return reducers[action.type](state, action);
    return state;
}

// Initial state
export function initialState(categories) {
    const NONE_CATEGORY = new Category({
        id: NONE_CATEGORY_ID,
        title: $t('client.category.none'),
        color: '#000000'
    });

    let items = sortCategories(
        Immutable.List.of(NONE_CATEGORY)
                      .concat(categories)
                      .map(c => new Category(c))
    );

    let map = Immutable.Map();
    for (let c of items) {
        map = map.set(c.id, c);
    }

    return Immutable.Map({ items, map });
};

// Getters
export function all(state) {
    return state.get('items');
}

export function fromId(state, id) {
    let map = state.get('map');
    assert(map.has(id), `fromId lookup failed for id: ${id}`);
    return map.get(id);
}
