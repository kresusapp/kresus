import Account from '../../models/account';
import Alert from '../../models/alert';

import { asyncErr, KError } from '../../helpers';

export async function loadAlert(req, res, next, alertId) {
    try {
        let alert = await Alert.find(alertId);
        if (!alert) {
            throw new KError('bank alert not found', 404);
        }
        req.preloaded = req.preloaded || {};
        req.preloaded.alert = alert;
        return next();
    } catch (err) {
        return asyncErr(res, err, 'when preloading alert');
    }
}

export async function create(req, res) {
    try {
        let newAlert = req.body;
        if (
            !newAlert ||
            typeof newAlert.bankAccount !== 'string' ||
            typeof newAlert.type !== 'string'
        ) {
            throw new KError('missing parameters', 400);
        }

        if (newAlert.type === 'report') {
            if (
                typeof newAlert.frequency !== 'string' ||
                !['daily', 'weekly', 'monthly'].includes(newAlert.frequency)
            ) {
                throw new KError('invalid report parameters', 400);
            }
        } else if (newAlert.type === 'balance' || newAlert.type === 'transaction') {
            if (
                typeof newAlert.limit !== 'number' ||
                Number.isNaN(newAlert.limit) ||
                typeof newAlert.order !== 'string' ||
                !['gt', 'lt'].includes(newAlert.order)
            ) {
                throw new KError('invalid balance/transaction parameters', 400);
            }
        } else {
            throw new KError('invalid alert type', 400);
        }

        let account = await Account.byAccountNumber(newAlert.bankAccount);
        if (!account) {
            throw new KError('bank account not found', 404);
        }

        let alert = await Alert.create(newAlert);
        res.status(201).json(alert);
    } catch (err) {
        return asyncErr(res, err, 'when creating an alert');
    }
}

export async function destroy(req, res) {
    try {
        await req.preloaded.alert.destroy();
        res.status(204).end();
    } catch (err) {
        return asyncErr(res, err, 'when deleting a bank alert');
    }
}

export async function update(req, res) {
    try {
        let newAlert = req.body;

        if (typeof newAlert.type !== 'undefined') {
            throw new KError("can't update an alert type", 400);
        }

        let { alert } = req.preloaded;
        if (alert.type === 'report') {
            if (
                typeof newAlert.frequency !== 'undefined' &&
                (typeof newAlert.frequency !== 'string' ||
                    !['daily', 'weekly', 'monthly'].includes(newAlert.frequency))
            ) {
                throw new KError('invalid report parameters', 400);
            }
        } else {
            if (typeof newAlert.limit !== 'undefined') {
                if (typeof newAlert.limit !== 'number' || Number.isNaN(newAlert.limit)) {
                    throw new KError('invalid limit parameter', 400);
                }
            }

            if (typeof newAlert.order !== 'undefined') {
                if (typeof newAlert.order !== 'string' || !['gt', 'lt'].includes(newAlert.order)) {
                    throw new KError('invalid balance/transaction parameters', 400);
                }
            }
        }

        newAlert = await req.preloaded.alert.updateAttributes(req.body);
        res.status(200).json(newAlert);
    } catch (err) {
        return asyncErr(res, err, 'when updating a bank alert');
    }
}
