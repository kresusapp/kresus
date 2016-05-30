import u from 'updeep';

import { has, assert, localeComparator, translate as $t } from '../helpers';
import { OperationType } from '../models';

export function initialState(operationtypes) {
    let state = {};

    state.items = operationtypes.map(type => new OperationType(type));

    // Sort operation types by names
    state.items.sort((a, b) => {
        let al = $t(`client.${a.name}`);
        let bl = $t(`client.${b.name}`);
        return localeComparator(al, bl);
    });

    state.labels = {};

    for (let c of operationtypes) {
        has(c, 'id');
        has(c, 'name');
        state.labels[c.id] = $t(`client.${c.name}`);
    }

    return u({}, state);
};

// Getters
export function all(state) {
    return state.items;
}

export function idToLabel(state, id) {
    assert(typeof state.labels[id] !== undefined, `idTolabel lookup failed for id: ${id}`);
    return state.labels[id];
}

let cachedUnknown = null;
export function unknown(state) {
    if (cachedUnknown)
        return cachedUnknown;

    for (let t of state.items) {
        if (t.name === 'type.unknown') {
            return cachedUnknown = t;
        }
    }

    assert(false, 'OperationTypes should have an Unknown type!');
}
