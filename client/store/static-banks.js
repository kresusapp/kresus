import Immutable from 'immutable';

import { maybeHas, localeComparator } from '../helpers';
import { OperationType } from '../models';

// FIXME
const data = { settings:{locale:'en'} };

function sortSelectFields(field) {
    if (maybeHas(field, 'values')) {
        field.values.sort((a, b) => localeComparator(a.label, b.label, data.settings.locale));
    }
}

function sort(banks) {
    banks.sort((a, b) => localeComparator(a.name, b.name, data.settings.locale));

    // Sort the selects of customFields by alphabetical order.
    banks.forEach(bank => {
        if (bank.customFields)
            bank.customFields.forEach(sortSelectFields);
    });

    return banks;
}

export function initialState(banks) {
    return Immutable.List(sort(banks));
}

export function all(state) {
    return state;
}
