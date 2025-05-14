import { SharedAlert, SharedBudget } from './types';

// Checks that the given object has at least all the properties which names are listed in
// allowedFieldNames.
// Returns an error description if a property is missing, or null if all the properties exist.
export function hasMissingField(
    object: Record<string, unknown>,
    allowedFieldNames: string[]
): null | string {
    for (const name of allowedFieldNames) {
        if (!object.hasOwnProperty(name)) {
            return `missing field ${name}`;
        }
    }
    return null;
}

// Checks that the given object properties belong to the list of allowedFieldNames.
// Returns an error description if a property is not allowed,
// or null if all the properties of the object are allowed.
export function hasForbiddenField(
    object: Record<string, unknown>,
    allowedFieldNames: string[]
): null | string {
    for (const key of Object.keys(object)) {
        if (!allowedFieldNames.includes(key)) {
            return `unexpected property on object: ${key}`;
        }
    }
    return null;
}

// Checks that the fields in object exactly match those provided by
// allowedFieldNames. Returns an error description if there's one, or null otherwise.
export function hasForbiddenOrMissingField(
    object: Record<string, unknown>,
    allowedFieldNames: string[]
): null | string {
    return (
        hasMissingField(object, allowedFieldNames) || hasForbiddenField(object, allowedFieldNames)
    );
}

export function checkAlert(alert: SharedAlert) {
    if (alert.type === 'report') {
        if (
            typeof alert.frequency !== 'string' ||
            !['daily', 'weekly', 'monthly'].includes(alert.frequency)
        ) {
            return 'invalid report parameters';
        }
    } else if (alert.type === 'balance' || alert.type === 'transaction') {
        if (
            typeof alert.limit !== 'number' ||
            Number.isNaN(alert.limit) ||
            typeof alert.order !== 'string' ||
            !['gt', 'lt'].includes(alert.order)
        ) {
            return 'invalid balance/transaction parameters';
        }
    } else {
        return 'invalid alert type';
    }
    return null;
}

export function checkBudget(budget: SharedBudget) {
    if (Number.isNaN(budget.viewId)) {
        return 'invalid budget viewId';
    }

    if (Number.isNaN(budget.year) || budget.year < 1) {
        return 'invalid budget year';
    }

    if (Number.isNaN(budget.month) || budget.month < 0 || budget.month > 11) {
        return 'invalid budget month';
    }

    if (budget.threshold !== null && Number.isNaN(budget.threshold)) {
        return 'invalid budget threshold';
    }

    return null;
}
