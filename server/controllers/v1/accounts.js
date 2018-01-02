import Accesses from '../../models/accesses';
import Accounts from '../../models/accounts';
import Settings from '../../models/settings';

import Operation from '../../models/operation';
import Alert from '../../models/alert';
import accountManager from '../../lib/accounts-manager';

import { makeLogger, KError, asyncErr } from '../../helpers';

let log = makeLogger('controllers/accounts');

// Prefills the @account field with a queried bank account.
export async function preloadAccount(req, res, next, accountId) {
    try {
        let userId = req.user.id;
        let account = await Accounts.byId(userId, accountId);
        if (!account) {
            throw new KError('Bank account not found', 404);
        }
        req.preloaded = { account };
        return next();
    } catch (err) {
        return asyncErr(res, err, 'when preloading a bank account');
    }
}

// Destroy an account and all its operations, alerts, and accesses if no other
// accounts are bound to this access.
async function destroyWithOperations(userId, account) {
    log.info(`Removing account ${account.title} from database...`);

    log.info(`\t-> Destroy operations for account ${account.title}`);
    await Operation.destroyByAccount(userId, account.id);

    log.info(`\t-> Destroy alerts for account ${account.title}`);
    await Alert.destroyByAccount(userId, account.id);

    log.info(`\t-> Checking if ${account.title} is the default account`);
    let defaultAccountId = await Settings.getOrCreate(userId, 'defaultAccountId');
    if (defaultAccountId === account.id) {
        log.info('\t\t-> Removing the default account');
        await Settings.upsert(userId, 'defaultAccountId', '');
    }

    log.info(`\t-> Destroy account ${account.title}`);
    await Accounts.remove(userId, account.id);

    let accounts = await Accounts.byAccess(userId, { id: account.bankAccess });
    if (accounts && accounts.length === 0) {
        log.info('\t-> No other accounts bound: destroying access.');
        await Accesses.remove(userId, account.bankAccess);
    }
}

// Update an account.
export async function update(req, res) {
    try {
        let attr = req.body;

        // We can only update the flag excludeFromBalance
        // of an account.
        if (typeof attr.excludeFromBalance === 'undefined') {
            throw new KError('Missing parameter', 400);
        }

        let userId = req.user.id;
        let { account } = req.preloaded;
        let newAccount = await Accounts.update(userId, account.id, attr);
        res.status(200).json(newAccount);
    } catch (err) {
        return asyncErr(res, err, 'when updating an account');
    }
}

// Delete account, operations and alerts.
export async function destroy(req, res) {
    try {
        let userId = req.user.id;
        await destroyWithOperations(userId, req.preloaded.account);
        res.status(204).end();
    } catch (err) {
        return asyncErr(res, err, 'when destroying an account');
    }
}

// Get operations of a given bank account
export async function getOperations(req, res) {
    try {
        let userId = req.user.id;
        let account = req.preloaded.account;
        let operations = await Operation.byBankSortedByDate(userId, account);
        res.status(200).json(operations);
    } catch (err) {
        return asyncErr(res, err, 'when getting operations for a bank account');
    }
}

export async function resyncBalance(req, res) {
    try {
        let userId = req.user.id;
        let account = req.preloaded.account;
        let updatedAccount = await accountManager.resyncAccountBalance(userId, account);
        res.status(200).json(updatedAccount);
    } catch (err) {
        return asyncErr(res, err, 'when getting balance of a bank account');
    }
}
