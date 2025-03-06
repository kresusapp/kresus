import express from 'express';
import { asyncErr, KError } from '../helpers';
import { Account, RecurringTransaction } from '../models';
import { hasForbiddenOrMissingField } from '../shared/validators';
import { IdentifiedRequest, PreloadedRequest } from './routes';

export async function preload(
    req: IdentifiedRequest<RecurringTransaction>,
    res: express.Response,
    nextHandler: () => void,
    recurringTransactionId: number
) {
    try {
        const { id: userId } = req.user;
        const recurringTransaction = await RecurringTransaction.find(
            userId,
            recurringTransactionId
        );
        if (!recurringTransaction) {
            throw new KError('Recurring Transaction not found', 404);
        }
        req.preloaded = { recurringTransaction };
        nextHandler();
    } catch (err) {
        asyncErr(res, err, 'when preloading a recurringTransaction');
    }
}

export async function getByAccountId(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const userId = req.user.id;
        const accountId = parseInt(req.params.accountId, 10);
        if (isNaN(accountId)) {
            throw new KError('Invalid account id', 400);
        }

        const accountExists = await Account.exists(userId, accountId);
        if (!accountExists) {
            throw new KError(`Account ${accountId} not found`, 404);
        }

        const recurringTransactions = await RecurringTransaction.byAccountId(userId, accountId);
        res.status(200).json(recurringTransactions);
    } catch (err) {
        asyncErr(res, err, 'when retrieving recurringTransactions');
    }
}

export async function create(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const userId = req.user.id;
        const accountId = parseInt(req.params.accountId, 10);
        if (isNaN(accountId)) {
            throw new KError('Invalid account id', 400);
        }
        const error = hasForbiddenOrMissingField(req.body, [
            'label',
            'type',
            'amount',
            'dayOfMonth',
            'listOfMonths',
        ]);
        if (error) {
            throw new KError(error, 400);
        }

        if (!RecurringTransaction.isValidListOfMonths(req.body.listOfMonths)) {
            throw new KError('Invalid listOfMonths attribute', 400);
        }

        const recurringTransaction = {
            ...req.body,
            accountId,
        };

        const created = await RecurringTransaction.create(userId, recurringTransaction);
        res.status(200).json(created);
    } catch (err) {
        asyncErr(res, err, 'when creating a recurringTransaction');
    }
}

export async function update(req: PreloadedRequest<RecurringTransaction>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const { recurringTransaction } = req.preloaded;
        const newAccountRecurringTransaction = await RecurringTransaction.update(
            userId,
            recurringTransaction.id,
            req.body
        );

        res.status(200).json(newAccountRecurringTransaction);
    } catch (err) {
        asyncErr(res, err, 'when updating a recurringTransaction');
    }
}

export async function destroy(req: PreloadedRequest<RecurringTransaction>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const { recurringTransaction } = req.preloaded;
        await RecurringTransaction.destroy(userId, recurringTransaction.id);
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when deleting a recurringTransaction');
    }
}
