"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDuplicates = getDuplicates;
exports.getIgnoredDuplicates = getIgnoredDuplicates;
exports.ignoreDuplicate = ignoreDuplicate;
exports.unignoreDuplicate = unignoreDuplicate;
const helpers_1 = require("../helpers");
const duplicates_manager_1 = require("../lib/duplicates-manager");
const models_1 = require("../models");
const settings_1 = require("../shared/settings");
async function getDuplicates(req, res) {
    try {
        const { id: userId } = req.user;
        const user = await models_1.User.find(userId);
        if (!user) {
            res.status(403).end();
            return;
        }
        const threshold = await models_1.Setting.findOrCreateDefault(userId, settings_1.DUPLICATE_THRESHOLD);
        const thresholdValue = parseInt(threshold.value, 10);
        const ignoreDuplicatesWithDifferentCustomFields = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, settings_1.DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS);
        const ignored = await (0, duplicates_manager_1.findIgnoredDuplicates)(userId);
        // The two transactions of a pair always belong to the same account, so the pairs of the
        // other accounts can't match anything here: no need to filter them out per account.
        const pairsToIgnore = ignored.flatMap(item => item.duplicates);
        const allDuplicates = {
            new: [],
            ignored,
        };
        const accounts = await models_1.Account.all(userId);
        for (const account of accounts) {
            const transactions = await models_1.Transaction.byAccount(userId, account.id);
            const duplicates = (0, duplicates_manager_1.findRedundantPairs)(transactions, thresholdValue, ignoreDuplicatesWithDifferentCustomFields, pairsToIgnore);
            if (duplicates.length > 0) {
                allDuplicates.new.push({
                    accountId: account.id,
                    duplicates,
                });
            }
        }
        res.status(200).json(allDuplicates);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, `when retrieving duplicates`);
    }
}
async function getIgnoredDuplicates(req, res) {
    try {
        const { id: userId } = req.user;
        const ignored = await (0, duplicates_manager_1.findIgnoredDuplicates)(userId);
        res.status(200).json(ignored);
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when retrieving ignored duplicates');
    }
}
// Reads and validates the pair of transactions referenced in the request's body.
async function extractPairFromRequest(userId, body) {
    const { transactionId, otherTransactionId } = body || {};
    if (typeof transactionId !== 'number' || typeof otherTransactionId !== 'number') {
        throw new helpers_1.KError('missing or invalid transaction ids', 400);
    }
    if (transactionId === otherTransactionId) {
        throw new helpers_1.KError('a transaction cannot be a duplicate of itself', 400);
    }
    // Make sure both transactions exist and belong to the user.
    const pair = [];
    for (const id of [transactionId, otherTransactionId]) {
        const transaction = await models_1.Transaction.find(userId, id);
        if (transaction === null) {
            throw new helpers_1.KError(`transaction ${id} not found`, 404);
        }
        pair.push(transaction);
    }
    if (pair[0].accountId !== pair[1].accountId) {
        throw new helpers_1.KError(`transaction ${pair[0].id} and ${pair[1].id} don't belong to the same account`, 400);
    }
    return [pair[0], pair[1]];
}
async function ignoreDuplicate(req, res) {
    try {
        const { id: userId } = req.user;
        const [transaction, otherTransaction] = await extractPairFromRequest(userId, req.body);
        await models_1.DuplicatesIgnored.create(userId, transaction.id, otherTransaction.id);
        res.status(201).end();
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when ignoring a pair of duplicates');
    }
}
async function unignoreDuplicate(req, res) {
    try {
        const { id: userId } = req.user;
        const [transaction, otherTransaction] = await extractPairFromRequest(userId, req.body);
        const deleted = await models_1.DuplicatesIgnored.destroy(userId, transaction.id, otherTransaction.id);
        let isDuplicate = false;
        if (deleted) {
            // Let the client know whether the pair is detected as a duplicate again, so that it can
            // add it back to the list of duplicates without refetching the whole list.
            const threshold = await models_1.Setting.findOrCreateDefault(userId, settings_1.DUPLICATE_THRESHOLD);
            const ignoreDuplicatesWithDifferentCustomFields = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, settings_1.DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS);
            // The threshold setting is in hours, transform it to days.
            const thresholdInDays = Math.round(parseInt(threshold.value, 10) / 24);
            isDuplicate =
                (0, duplicates_manager_1.getDuplicatePairScore)(transaction, otherTransaction, thresholdInDays, ignoreDuplicatesWithDifferentCustomFields) > 0;
        }
        res.status(200).json({ isDuplicate });
    }
    catch (err) {
        (0, helpers_1.asyncErr)(res, err, 'when unignoring a pair of duplicates');
    }
}
