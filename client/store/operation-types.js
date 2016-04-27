import Immutable from 'immutable';

import { has, assert, localeComparator, translate as $t } from '../helpers';
import { OperationType } from '../models';

export function initialState(operationtypes) {
    let state = {};

    state.items = Immutable.List(operationtypes.map(type => new OperationType(type)));

    // Sort operation types by names
    state.items = state.items.sort((a, b) => {
        let al = $t(`client.${a.name}`);
        let bl = $t(`client.${b.name}`);
        return localeComparator(al, bl);
    });

    state.labels = Immutable.Map();

    for (let c of operationtypes) {
        has(c, 'id');
        has(c, 'name');
        state.labels = state.labels.set(c.id, $t(`client.${c.name}`));
    }

    return Immutable.Map(state);
};

// Getters
export function all(state) {
    return state.get('items');
}

export function idToLabel(state, id) {
    assert(state.get('labels').has(id), `idTolabel lookup failed for id: ${id}`);
    return state.get('labels').get(id);
}

let cachedUnknown = null;
export function unknown(state) {
    if (cachedUnknown)
        return cachedUnknown;

    for (let t of state.get('items')) {
        if (t.name === 'type.unknown') {
            return cachedUnknown = t;
        }
    }

    assert(false, 'OperationTypes should have an Unknown type!');
}
