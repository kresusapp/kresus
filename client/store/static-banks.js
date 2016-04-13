import u from 'updeep';

import { maybeHas, localeComparator } from '../helpers';
import { Bank } from '../models';

function sortSelectFields(field) {
    if (maybeHas(field, 'values')) {
        field.values.sort((a, b) => localeComparator(a.label, b.label));
    }
}

function sort(banks) {
    banks.sort((a, b) => localeComparator(a.name, b.name));

    // Sort the selects of customFields by alphabetical order.
    banks.forEach(bank => {
        if (bank.customFields)
            bank.customFields.forEach(sortSelectFields);
    });

    return banks;
}

export function initialState(banksPOD) {
    let banks = banksPOD.map(b => new Bank(b));
    return u({}, sort(banks));
}

export function all(state) {
    return state;
}
