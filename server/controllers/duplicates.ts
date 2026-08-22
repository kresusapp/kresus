import type express from 'express';
import { asyncErr, KError } from '../helpers';
import {
    findIgnoredDuplicates,
    findRedundantPairs,
    getDuplicatePairScore,
} from '../lib/duplicates-manager';
import { Account, DuplicatesIgnored, Setting, Transaction, User } from '../models';
import { DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS, DUPLICATE_THRESHOLD } from '../shared/settings';
import type { Duplicates } from '../shared/types';
import type { IdentifiedRequest } from './routes';

export async function getDuplicates(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const user = await User.find(userId);

        if (!user) {
            res.status(403).end();
            return;
        }

        const threshold = await Setting.findOrCreateDefault(userId, DUPLICATE_THRESHOLD);
        const thresholdValue = parseInt(threshold.value, 10);
        const ignoreDuplicatesWithDifferentCustomFields =
            await Setting.findOrCreateDefaultBooleanValue(
                userId,
                DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS
            );

        const ignored = await findIgnoredDuplicates(userId);

        // The two transactions of a pair always belong to the same account, so the pairs of the
        // other accounts can't match anything here: no need to filter them out per account.
        const pairsToIgnore = ignored.flatMap(item => item.duplicates);

        const allDuplicates: Duplicates = {
            new: [],
            ignored,
        };

        const accounts = await Account.all(userId);
        for (const account of accounts) {
            const transactions = await Transaction.byAccount(userId, account.id);

            const duplicates = findRedundantPairs(
                transactions,
                thresholdValue,
                ignoreDuplicatesWithDifferentCustomFields,
                pairsToIgnore
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

export async function getIgnoredDuplicates(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const ignored = await findIgnoredDuplicates(userId);
        res.status(200).json(ignored);
    } catch (err) {
        asyncErr(res, err, 'when retrieving ignored duplicates');
    }
}

// Reads and validates the pair of transactions referenced in the request's body.
async function readPair(
    userId: number,
    body: any
): Promise<[transaction: Transaction, otherTransaction: Transaction]> {
    const { transactionId, otherTransactionId } = body || {};

    if (typeof transactionId !== 'number' || typeof otherTransactionId !== 'number') {
        throw new KError('missing or invalid transaction ids', 400);
    }

    if (transactionId === otherTransactionId) {
        throw new KError('a transaction cannot be a duplicate of itself', 400);
    }

    // Make sure both transactions exist and belong to the user.
    const pair = [];
    for (const id of [transactionId, otherTransactionId]) {
        const transaction = await Transaction.find(userId, id);
        if (transaction === null) {
            throw new KError(`transaction ${id} not found`, 404);
        }
        pair.push(transaction);
    }

    return [pair[0], pair[1]];
}

export async function ignoreDuplicate(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const [transaction, otherTransaction] = await readPair(userId, req.body);

        await DuplicatesIgnored.create(userId, transaction.id, otherTransaction.id);

        res.status(201).end();
    } catch (err) {
        asyncErr(res, err, 'when ignoring a pair of duplicates');
    }
}

export async function unignoreDuplicate(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const [transaction, otherTransaction] = await readPair(userId, req.body);

        await DuplicatesIgnored.destroy(userId, transaction.id, otherTransaction.id);

        // Let the client know whether the pair is detected as a duplicate again, so that it can
        // add it back to the list of duplicates without refetching the whole list.
        const threshold = await Setting.findOrCreateDefault(userId, DUPLICATE_THRESHOLD);
        const ignoreDuplicatesWithDifferentCustomFields =
            await Setting.findOrCreateDefaultBooleanValue(
                userId,
                DUPLICATE_IGNORE_DIFFERENT_CUSTOM_FIELDS
            );

        // The threshold setting is in hours, transform it to days.
        const thresholdInDays = Math.round(parseInt(threshold.value, 10) / 24);
        const isDuplicate =
            getDuplicatePairScore(
                transaction,
                otherTransaction,
                thresholdInDays,
                ignoreDuplicatesWithDifferentCustomFields
            ) > 0;

        res.status(200).json({ isDuplicate });
    } catch (err) {
        asyncErr(res, err, 'when unignoring a pair of duplicates');
    }
}
