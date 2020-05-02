import { SharedAlert, SharedBudget } from './types';

// Checks that the given object fields match all the names specified in
// allowedFieldNames. Returns an error if there's one, or nothing otherwise.
export function checkHasAllFields(object: any, allowedFieldNames: string[]): boolean | string {
    for (const name of allowedFieldNames) {
        if (!object.hasOwnProperty(name)) {
            return `missing field ${name}`;
        }
    }
    return true;
}

// Checks that the given object fields belong to the list of allowedFieldNames.
// Returns an error if there's one, or nothing otherwise.
export function checkAllowedFields(object: any, allowedFieldNames: string[]): boolean | string {
    for (const key of Object.keys(object)) {
        if (!allowedFieldNames.includes(key)) {
            return `unexpected property on object: ${key}`;
        }
    }
    return true;
}

// Checks that the fields in object exactly match those provided by
// allowedFieldNames. Returns an error if there's one, or nothing otherwise.
export function checkExactFields(object: any, allowedFieldNames: string[]): boolean | string {
    return (
        checkHasAllFields(object, allowedFieldNames) ||
        checkAllowedFields(object, allowedFieldNames)
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
