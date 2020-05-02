import express from 'express';

import { Account, Alert } from '../models';
import { asyncErr, KError } from '../helpers';
import { checkAlert } from '../shared/validators';

import { IdentifiedRequest, PreloadedRequest } from './routes';

export async function loadAlert(
    req: IdentifiedRequest<Alert>,
    res: express.Response,
    next: Function,
    alertId: number
) {
    try {
        const { id: userId } = req.user;
        const alert = await Alert.find(userId, alertId);
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

export async function create(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const newAlert = req.body;
        if (
            !newAlert ||
            typeof newAlert.accountId !== 'number' ||
            typeof newAlert.type !== 'string'
        ) {
            throw new KError('missing parameters', 400);
        }

        const validationError = checkAlert(newAlert);
        if (validationError) {
            throw new KError(validationError, 400);
        }

        const account = await Account.find(userId, newAlert.accountId);
        if (!account) {
            throw new KError('bank account not found', 404);
        }

        const alert = await Alert.create(userId, newAlert);
        res.status(201).json(alert);
    } catch (err) {
        return asyncErr(res, err, 'when creating an alert');
    }
}

export async function destroy(req: PreloadedRequest<Alert>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        await Alert.destroy(userId, req.preloaded.alert.id);
        res.status(204).end();
    } catch (err) {
        return asyncErr(res, err, 'when deleting a bank alert');
    }
}

export async function update(req: PreloadedRequest<Alert>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const { alert } = req.preloaded;
        let newAlert = req.body;

        if (typeof newAlert.type !== 'undefined') {
            throw new KError("can't update an alert type", 400);
        }

        newAlert = Object.assign({}, alert, newAlert);

        const validationError = checkAlert(newAlert);
        if (validationError) {
            throw new KError(validationError, 400);
        }

        newAlert = await Alert.update(userId, alert.id, req.body);
        res.status(200).json(newAlert);
    } catch (err) {
        return asyncErr(res, err, 'when updating a bank alert');
    }
}
