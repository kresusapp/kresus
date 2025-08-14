import express from 'express';

import { View } from '../models';
import { KError, asyncErr } from '../helpers';

import { isDemoEnabled } from './instance';
import { PreloadedRequest, IdentifiedRequest } from './routes';

// Prefills the @view field with a queried bank account.
export async function preloadView(
    req: IdentifiedRequest<View>,
    res: express.Response,
    nextHandler: () => void,
    viewId: number
) {
    try {
        const { id: userId } = req.user;
        const view = await View.find(userId, viewId);
        if (!view) {
            throw new KError('View not found', 404);
        }

        if (!req.preloaded) {
            req.preloaded = {};
        }

        req.preloaded.view = view;
        nextHandler();
    } catch (err) {
        asyncErr(res, err, 'when preloading a view');
    }
}

export async function create(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const newView = req.body;
        if (!newView || !(newView.accounts instanceof Array) || typeof newView.label !== 'string') {
            throw new KError('missing parameters', 400);
        }

        if (!newView.accounts.length) {
            throw new KError('a view should have at least one account', 400);
        }

        const view = await View.create(userId, newView);
        res.status(201).json(view);
    } catch (err) {
        asyncErr(res, err, 'when creating an alert');
    }
}

export async function update(req: PreloadedRequest<View>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const newFields = req.body;

        if (
            newFields &&
            newFields.accounts &&
            (!(newFields.accounts instanceof Array) || !newFields.accounts.length)
        ) {
            throw new KError('a view should have at least one account', 400);
        }

        const view = req.preloaded.view;
        const newView = await View.update(userId, view.id, newFields);
        res.status(200).json(newView);
    } catch (err) {
        asyncErr(res, err, 'when updating a view');
    }
}

export async function destroy(req: PreloadedRequest<View>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        if (await isDemoEnabled(userId)) {
            throw new KError("view deletion isn't allowed in demo mode", 400);
        }

        const view = req.preloaded.view;
        await View.destroy(userId, view.id);
        res.status(204).end();
    } catch (err) {
        asyncErr(res, err, 'when destroying a view');
    }
}
