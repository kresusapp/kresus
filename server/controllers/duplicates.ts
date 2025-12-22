import express from 'express';

import { Account, Setting, Transaction, User } from '../models';
import { asyncErr } from '../helpers';
import { IdentifiedRequest } from './routes';
import { findRedundantPairs } from '../lib/duplicates-manager';
import { DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS, DUPLICATE_THRESHOLD } from '../shared/settings';

import type { Duplicates } from '../shared/types';

export async function getDuplicates(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const user = await User.find(userId);

        if (!user) {
            res.status(403).end();
            return;
        }

        const allDuplicates: Duplicates = {
            new: [],
        };

        const threshold = await Setting.findOrCreateDefault(userId, DUPLICATE_THRESHOLD);
        const thresholdValue = parseInt(threshold.value, 10);
        const ignoreDuplicatesWithDifferentCustomFields =
            await Setting.findOrCreateDefaultBooleanValue(
                userId,
                DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS
            );

        const accounts = await Account.all(userId);
        for (const account of accounts) {
            const transactions = await Transaction.byAccount(userId, account.id);
            const duplicates = findRedundantPairs(
                transactions,
                thresholdValue,
                ignoreDuplicatesWithDifferentCustomFields
            );

            if (duplicates.length > 0) {
                allDuplicates.new.push({
                    accountId: account.id,
                    duplicates,
                });
            }
        }

        res.status(200).json(allDuplicates);
    } catch (err) {
        asyncErr(res, err, `when retrieving duplicates`);
    }
}
