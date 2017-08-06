import Account from '../../models/account';
import Alert from '../../models/alert';

import { asyncErr, KError, stripPrivateFields } from '../../helpers';

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
        if (!newAlert ||
            typeof newAlert.bankAccount !== 'string' ||
            typeof newAlert.type !== 'string') {
            throw new KError('missing parameters', 400);
        }

        let account = await Account.byAccountNumber(newAlert.bankAccount);
        if (!account) {
            throw new KError('bank account not found', 404);
        }

        let alert = await Alert.create(newAlert);
        res.status(201).json({
            data: {
                id: alert.id
            }
        });
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
        let alert = await req.preloaded.alert.updateAttributes(req.body);
        res.status(200).json({
            data: {
                id: alert.id
            }
        });
    } catch (err) {
        return asyncErr(res, err, 'when updating a bank alert');
    }
}

export async function getAllAlerts(req, res) {
    try {
        let alerts = await Alert.all();
        res.status(200).json({
            data: {
                alerts: alerts.map(stripPrivateFields)
            }
        });
    } catch (err) {
        return asyncErr(res, err, 'when getting all alerts');
    }
}

export async function getAlert(req, res) {
    try {
        res.status(200).json({
            data: {
                alert: stripPrivateFields(req.preloaded.alert)
            }
        });
    } catch (err) {
        return asyncErr(res, err, 'when getting given alert');
    }
}
