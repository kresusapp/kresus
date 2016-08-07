import u from 'updeep';

import { assertHas, assert, localeComparator, translate as $t } from '../helpers';
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
        assertHas(c, 'id');
        assertHas(c, 'name');
        state.labels[c.id] = $t(`client.${c.name}`);
    }

    // Cache unknown operation type id.
    state.cachedUnknown = null;
    for (let t of state.items) {
        if (t.name === 'type.unknown') {
            state.cachedUnknown = t;
        }
    }
    assert(state.cachedUnknown, 'should have an "unknown" operation type');

    return u({}, state);
}

// Getters
export function all(state) {
    return state.items;
}

export function idToLabel(state, id) {
    assert(typeof state.labels[id] !== 'undefined', `idTolabel lookup failed for id: ${id}`);
    return state.labels[id];
}

export function unknown(state) {
    return state.cachedUnknown;
}
