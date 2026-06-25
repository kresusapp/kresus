"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDuplicates = getDuplicates;
const models_1 = require("../models");
const helpers_1 = require("../helpers");
const duplicates_manager_1 = require("../lib/duplicates-manager");
const settings_1 = require("../shared/settings");
async function getDuplicates(req, res) {
    try {
        const { id: userId } = req.user;
        const user = await models_1.User.find(userId);
        if (!user) {
            res.status(403).end();
            return;
        }
        const allDuplicates = {
            new: [],
        };
        const threshold = await models_1.Setting.findOrCreateDefault(userId, settings_1.DUPLICATE_THRESHOLD);
        const thresholdValue = parseInt(threshold.value, 10);
        const ignoreDuplicatesWithDifferentCustomFields = await models_1.Setting.findOrCreateDefaultBooleanValue(userId, settings_1.DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS);
        const accounts = await models_1.Account.all(userId);
        for (const account of accounts) {
            const transactions = await models_1.Transaction.byAccount(userId, account.id);
            const duplicates = (0, duplicates_manager_1.findRedundantPairs)(transactions, thresholdValue, ignoreDuplicatesWithDifferentCustomFields);
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
