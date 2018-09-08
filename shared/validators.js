export function checkAlert(alert) {
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

export function checkBudget(budget) {
    if (Number.isNaN(budget.year) || budget.year < 1) {
        return 'invalid budget year';
    }

    if (Number.isNaN(budget.month) || budget.month < 0 || budget.month > 11) {
        return 'invalid budget month';
    }

    if (Number.isNaN(budget.threshold)) {
        return 'invalid budget threshold';
    }

    return null;
}
