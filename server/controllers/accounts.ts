import express from 'express';

import { Access, Account, Setting } from '../models';
import { makeLogger, KError, asyncErr } from '../helpers';
import { DEFAULT_ACCOUNT_ID } from '../../shared/settings';
import { hasForbiddenField } from '../shared/validators';
import accountManager from '../lib/accounts-manager';

import { isDemoEnabled } from './instance';
import { PreloadedRequest, IdentifiedRequest } from './routes';
import { extractUserActionFields } from './accesses';

const log = makeLogger('controllers/accounts');

// Prefills the @account field with a queried bank account.
export async function preloadAccount(
    req: IdentifiedRequest<Account>,
    res: express.Response,
    nextHandler: () => void,
    accountID: number
) {
    try {
        const { id: userId } = req.user;
        const account = await Account.find(userId, accountID);
        if (!account) {
            throw new KError('Bank account not found', 404);
        }

        if (!req.preloaded) {
            req.preloaded = {};
        }

        req.preloaded.account = account;
        nextHandler();
    } catch (err) {
        asyncErr(res, err, 'when preloading a bank account');
    }
}

// Prefills the @targetAccount field with a queried bank account.
export async function preloadTargetAccount(
    req: IdentifiedRequest<Account>,
    res: express.Response,
    nextHandler: () => void,
    targetAccountID: number
) {
    try {
        const { id: userId } = req.user;
        const account = await Account.find(userId, targetAccountID);
        if (!account) {
            throw new KError('Bank account not found', 404);
        }

        if (!req.preloaded) {
            req.preloaded = {};
        }

        req.preloaded.targetAccount = account;
        nextHandler();
    } catch (err) {
        asyncErr(res, err, 'when preloading a target bank account');
    }
}

export async function fixupDefaultAccount(userId: number) {
    const found = await Setting.findOrCreateDefault(userId, DEFAULT_ACCOUNT_ID);
    if (found && found.value !== '') {
        const accountId = parseInt(found.value, 10);
        const accountFound = await Account.find(userId, accountId);
        if (!accountFound) {
            log.info(
                "-> Removing the default account setting since the account doesn't exist anymore."
            );
            await Setting.update(userId, found.id, { value: '' });
        }
    }
}

// Destroy an account and all its transactions, alerts, and accesses if no other
// accounts are bound to this access.
export async function destroyWithTransactions(userId: number, account: Account) {
    log.info(`Removing account ${account.label} from database...`);

    log.info(`\t-> Destroy account ${account.label}`);
    await Account.destroy(userId, account.id);

    await fixupDefaultAccount(userId);

    const accounts = await Account.byAccess(userId, { id: account.accessId });
    if (accounts && accounts.length === 0) {
        log.info('\t-> No other accounts bound: destroying access.');
        await Access.destroy(userId, account.accessId);
    }
}

export async function update(req: PreloadedRequest<Account>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const newFields = req.body;
        const error = hasForbiddenField(newFields, [
            'excludeFromBalance',
            'customLabel',
            'balance',
            'gracePeriod',
        ]);
        if (error) {
            throw new KError(`when updating an account: ${error}`, 400);
        }

        const account = req.preloaded.account;
        const newAccount = await Account.update(userId, account.id, newFields);
        res.status(200).json(newAccount);
    } catch (err) {
        asyncErr(res, err, 'when updating an account');
    }
}

// Delete account, transactions and alerts.
export async function destroy(req: PreloadedRequest<Account>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        if (await isDemoEnabled(userId)) {
            throw new KError("account deletion isn't allowed in demo mode", 400);
        }

        await destroyWithTransactions(userId, req.preloaded.account);
        res.status(204).end();
    } catch (err) {
        asyncErr(res, err, 'when destroying an account');
    }
}

export async function resyncBalance(req: PreloadedRequest<Account>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const account = req.preloaded.account;

        const userActionFields = extractUserActionFields(req.body);
        const response = await accountManager.resyncAccountBalance(
            userId,
            account,
            /* interactive */ true,
            userActionFields
        );

        if (response.kind === 'user_action') {
            res.status(200).json(response);
        } else {
            const updatedAccount = response.value;
            res.status(200).json(updatedAccount);
        }
    } catch (err) {
        asyncErr(res, err, 'when getting balance of a bank account');
    }
}

export async function mergeInto(req: PreloadedRequest<Account>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const account = req.preloaded.account;
        const targetAccount = req.preloaded.targetAccount;

        if (!account || !targetAccount || account.id === targetAccount.id) {
            throw new KError('invalid accounts');
        }

        // Check that both account are owned by the same access.
        if (account.accessId !== targetAccount.accessId) {
            throw new KError('accounts merge is only possible for accounts of a same access', 400);
        }

        const success = await accountManager.mergeExistingAccounts(userId, account, targetAccount);
        if (!success) {
            throw new KError('accounts could not be merged');
        }

        res.status(200).json({ newId: targetAccount.id });
    } catch (err) {
        asyncErr(res, err, 'when merging accounts');
    }
}
