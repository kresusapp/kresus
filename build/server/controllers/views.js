"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preloadView = preloadView;
exports.create = create;
exports.update = update;
exports.destroy = destroy;
const models_1 = require("../models");
const helpers_1 = require("../helpers");
const instance_1 = require("./instance");
// Prefills the @view field with a queried bank account.
async function preloadView(req, res, nextHandler, viewId) {
    try {
        const { id: userId } = req.user;
        const view = await models_1.View.find(userId, viewId);
        if (!view) {
            throw new helpers_1.KError('View not found', 404);
        }
        if (!req.preloaded) {
            req.preloaded = {};
        }
        req.preloaded.view = view;
        nextHandler();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when preloading a view');
    }
}
async function create(req, res) {
    try {
        const { id: userId } = req.user;
        const newView = req.body;
        if (!newView || !(newView.accounts instanceof Array) || typeof newView.label !== 'string') {
            throw new helpers_1.KError('missing parameters', 400);
        }
        if (!newView.accounts.length) {
            throw new helpers_1.KError('a view should have at least one account', 400);
        }
        const view = await models_1.View.create(userId, newView);
        res.status(201).json(view);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when creating an alert');
    }
}
async function update(req, res) {
    try {
        const { id: userId } = req.user;
        const newFields = req.body;
        if (newFields &&
            newFields.accounts &&
            (!(newFields.accounts instanceof Array) || !newFields.accounts.length)) {
            throw new helpers_1.KError('a view should have at least one account', 400);
        }
        const view = req.preloaded.view;
        const newView = await models_1.View.update(userId, view.id, newFields);
        res.status(200).json(newView);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when updating a view');
    }
}
async function destroy(req, res) {
    try {
        const { id: userId } = req.user;
        if (await (0, instance_1.isDemoEnabled)(userId)) {
            throw new helpers_1.KError("view deletion isn't allowed in demo mode", 400);
        }
        const view = req.preloaded.view;
        await models_1.View.destroy(userId, view.id);
        res.status(204).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when destroying a view');
    }
}
