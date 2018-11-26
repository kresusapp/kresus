import Accesses from '../../models/accesses';
import Accounts from '../../models/accounts';
import Operation from '../../models/operation';
import Alert from '../../models/alert';
import Config from '../../models/config';
import accountManager from '../../lib/accounts-manager';

import { makeLogger, KError, asyncErr } from '../../helpers';

let log = makeLogger('controllers/accounts');

// Prefills the @account field with a queried bank account.
export async function preloadAccount(req, res, next, accountID) {
    try {
        let { id: userId } = req.user;
        let account = await Accounts.find(userId, accountID);
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
export async function destroyWithOperations(userId, account) {
    log.info(`Removing account ${account.title} from database...`);

    log.info(`\t-> Destroy operations for account ${account.title}`);
    await Operation.destroyByAccount(userId, account.id);

    log.info(`\t-> Destroy alerts for account ${account.title}`);
    await Alert.destroyByAccount(userId, account.id);

    log.info(`\t-> Checking if ${account.title} is the default account`);
    let found = await Config.findOrCreateDefault(userId, 'defaultAccountId');
    if (found && found.value === account.id) {
        log.info('\t\t-> Removing the default account');
        await Config.update(userId, found.id, { value: '' });
    }

    log.info(`\t-> Destroy account ${account.title}`);
    await Accounts.destroy(userId, account.id);

    let accounts = await Accounts.byAccess(userId, { id: account.bankAccess });
    if (accounts && accounts.length === 0) {
        log.info('\t-> No other accounts bound: destroying access.');
        await Accesses.destroy(userId, account.bankAccess);
    }
}

// Update an account.
export async function update(req, res) {
    try {
        let { id: userId } = req.user;
        let attr = req.body;

        // We can only update the flag excludeFromBalance
        // and the custom label of an account.
        if (
            typeof attr.excludeFromBalance === 'undefined' &&
            typeof attr.customLabel === 'undefined'
        ) {
            throw new KError('Missing parameter', 400);
        }

        let account = req.preloaded.account;
        let newAccount = await Accounts.update(userId, account.id, attr);
        res.status(200).json(newAccount);
    } catch (err) {
        return asyncErr(res, err, 'when updating an account');
    }
}

// Delete account, operations and alerts.
export async function destroy(req, res) {
    try {
        let { id: userId } = req.user;
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
        let updatedAccount = await accountManager.resyncAccountBalance(userId, account);
        res.status(200).json(updatedAccount);
    } catch (err) {
        return asyncErr(res, err, 'when getting balance of a bank account');
    }
}
