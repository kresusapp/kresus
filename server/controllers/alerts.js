import Account from '../models/account';
import Alert from '../models/alert';

import { asyncErr, sendErr } from '../helpers';

export async function loadAlert(req, res, next, alertId) {
    try {
        let alert = await Alert.find(alertId);
        if (!alert) {
            throw { status: 404, message: 'bank alert not found' };
        }
        req.preloaded = req.preloaded || {};
        req.preloaded.alert = alert;
        next();
    } catch (err) {
        return asyncErr(res, err, 'when preloading alert');
    }
}

export async function create(req, res) {

    let newAlert = req.body;
    if (!newAlert ||
        typeof newAlert.bankAccount !== 'string' ||
        typeof newAlert.type !== 'string') {
        return sendErr(res, 'when creating an alert', 400,
                       'missing parameters');
    }

    try {
        let alert = await Alert.create(newAlert);
        let account = await Account.byAccountNumber(newAlert.bankAccount);
        if (!account) {
            throw { status: 404, message: 'bank account not found' };
        }
        res.status(201).send(alert);
    } catch (err) {
        return asyncErr(res, err, 'when creating an alert');
    }
}

export async function destroy(req, res) {
    try {
        await req.preloaded.alert.destroy();
        res.sendStatus(204);
    } catch (err) {
        return asyncErr(res, err, 'when deleting a bank alert');
    }
}

export async function update(req, res) {
    try {
        let alert = await req.preloaded.alert.updateAttributes(req.body);
        res.status(200).send(alert);
    } catch (err) {
        return asyncErr(res, err, 'when updating a bank alert');
    }
}
