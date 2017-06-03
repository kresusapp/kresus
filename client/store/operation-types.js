import u from 'updeep';
import { createSelector } from 'reselect';

import { localeComparator, translate as $t } from '../helpers';

import { Type } from '../models';

import OperationTypes from '../../shared/operation-types.json';

export function initialState() {
    let types = OperationTypes.map(type => new Type(type));
    types.sort((type1, type2) => {
        return localeComparator($t(`client.${type1.name}`), $t(`client.${type2.name}`));
    });
    return u({}, types);
}

export function all(state) {
    return state;
}

export function allIds(state) {
    return createSelector(
        [
            st => all(st)
        ],
        types => types.map(type => type.id)
    )(state);
}

export function mapAllIdToDescriptor(state) {
    return createSelector(
        [
            st => all(st)
        ],
        types => types.reduce((map, type) => {
            map[type.id] = {
                label: $t(`client.${type.name}`),
            };
            return map;
        }, {})
    )(state);
}
