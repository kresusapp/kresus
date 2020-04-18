import { Access, Account, Setting } from '../models';
import { makeLogger, KError, asyncErr } from '../helpers';
import { checkAllowedFields } from '../shared/validators';
import accountManager from '../lib/accounts-manager';

import { isDemoEnabled } from './settings';

let log = makeLogger('controllers/accounts');

// Prefills the @account field with a queried bank account.
export async function preloadAccount(req, res, next, accountID) {
    try {
        let { id: userId } = req.user;
        let account = await Account.find(userId, accountID);
        if (!account) {
            throw new KError('Bank account not found', 404);
        }
        req.preloaded = { account };
        return next();
    } catch (err) {
        return asyncErr(res, err, 'when preloading a bank account');
    }
}

export async function fixupDefaultAccount(userId) {
    let found = await Setting.findOrCreateDefault(userId, 'default-account-id');
    if (found && found.value !== '') {
        let accountFound = await Account.find(userId, found.value);
        if (!accountFound) {
            log.info(
                "-> Removing the default account setting since the account doesn't exist anymore."
            );
            await Setting.update(userId, found.id, { value: '' });
        }
    }
}

// Destroy an account and all its operations, alerts, and accesses if no other
// accounts are bound to this access.
export async function destroyWithOperations(userId, account) {
    log.info(`Removing account ${account.label} from database...`);

    log.info(`\t-> Destroy account ${account.label}`);
    await Account.destroy(userId, account.id);

    await fixupDefaultAccount(userId);

    let accounts = await Account.byAccess(userId, { id: account.accessId });
    if (accounts && accounts.length === 0) {
        log.info('\t-> No other accounts bound: destroying access.');
        await Access.destroy(userId, account.accessId);
    }
}

export async function update(req, res) {
    try {
        let { id: userId } = req.user;

        let newFields = req.body;
        let error = checkAllowedFields(newFields, ['excludeFromBalance', 'customLabel']);
        if (error) {
            throw new KError(`when updating an account: ${error}`, 400);
        }

        let account = req.preloaded.account;
        let newAccount = await Account.update(userId, account.id, newFields);
        res.status(200).json(newAccount);
    } catch (err) {
        return asyncErr(res, err, 'when updating an account');
    }
}

// Delete account, operations and alerts.
export async function destroy(req, res) {
    try {
        let { id: userId } = req.user;

        if (await isDemoEnabled(userId)) {
            throw new KError("account deletion isn't allowed in demo mode", 400);
        }

        await destroyWithOperations(userId, req.preloaded.account);
        res.status(204).end();
    } catch (err) {
        return asyncErr(res, err, 'when destroying an account');
    }
}

export async function resyncBalance(req, res) {
    try {
        let { id: userId } = req.user;
        let account = req.preloaded.account;
        let updatedAccount = await accountManager.resyncAccountBalance(
            userId,
            account,
            /* interactive */ true
        );
        res.status(200).json(updatedAccount);
    } catch (err) {
        return asyncErr(res, err, 'when getting balance of a bank account');
    }
}
