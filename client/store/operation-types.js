import u from 'updeep';

import { localeComparator, translate as $t } from '../helpers';

import OperationTypes from '../../shared/operation-types.json';

export function initialState() {
    let types = OperationTypes.slice();
    types.sort((type1, type2) => {
        return localeComparator($t(`client.${type1.name}`), $t(`client.${type2.name}`));
    });
    // Define an id for each type
    types.forEach(type => {
        type.id = type.name;
    });
    console.log(types);
    return u({}, types);
}

export function all(state) {
    return state;
}
