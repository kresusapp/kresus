import Accounts from '../../models/accounts';
import Alerts from '../../models/alerts';

import { asyncErr, KError } from '../../helpers';
import { checkAlert } from '../../shared/validators';

export async function loadAlert(req, res, next, alertId) {
    try {
        let { id: userId } = req.user;
        let alert = await Alerts.find(userId, alertId);
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
        let { id: userId } = req.user;

        let newAlert = req.body;
        if (
            !newAlert ||
            typeof newAlert.accountId !== 'string' ||
            typeof newAlert.type !== 'string'
        ) {
            throw new KError('missing parameters', 400);
        }

        let validationError = checkAlert(newAlert);
        if (validationError) {
            throw new KError(validationError, 400);
        }

        let account = await Accounts.find(userId, newAlert.accountId);
        if (!account) {
            throw new KError('bank account not found', 404);
        }

        let alert = await Alerts.create(userId, newAlert);
        res.status(201).json(alert);
    } catch (err) {
        return asyncErr(res, err, 'when creating an alert');
    }
}

export async function destroy(req, res) {
    try {
        let { id: userId } = req.user;

        await Alerts.destroy(userId, req.preloaded.alert.id);
        res.status(204).end();
    } catch (err) {
        return asyncErr(res, err, 'when deleting a bank alert');
    }
}

export async function update(req, res) {
    try {
        let { id: userId } = req.user;
        let { alert } = req.preloaded;
        let newAlert = req.body;

        if (typeof newAlert.type !== 'undefined') {
            throw new KError("can't update an alert type", 400);
        }

        newAlert = Object.assign({}, alert, newAlert);

        let validationError = checkAlert(newAlert);
        if (validationError) {
            throw new KError(validationError, 400);
        }

        newAlert = await Alerts.update(userId, alert.id, req.body);
        res.status(200).json(newAlert);
    } catch (err) {
        return asyncErr(res, err, 'when updating a bank alert');
    }
}
