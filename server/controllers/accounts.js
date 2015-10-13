let log = require('printit')({
    prefix: 'controllers/accounts',
    date: true
});

import Account   from '../models/account';
import Operation from '../models/operation';
import Access    from '../models/access';
import Alert     from '../models/alert';

import {sendErr, asyncErr} from '../helpers';

// Prefills the @account field with a queried bank account.
export async function preloadAccount(req, res, next, accountID) {
    try {
        let account = await Account.find(accountID);
        if (!account) {
            throw {status: 404, message:"Bank account not found"};
        }
        req.preloaded = {account};
        next();
    } catch(err) {
        return asyncErr(res, err, "when preloading a bank account");
    }
}


// Destroy an account and all its operations, alerts, and accesses if no other
// accounts are bound to this access.
export async function DestroyWithOperations(account) {
    log.info(`Removing account ${account.title} from database...`);

    log.info(`\t-> Destroy operations for account ${account.title}`);
    await Operation.destroyByAccount(account.accountNumber);

    log.info(`\t-> Destroy alerts for account ${account.title}`);
    await Alert.destroyByAccount(account.id);

    log.info(`\t-> Destroy account ${account.title}`);
    await account.destroy();

    let accounts = await Account.byAccess({id: account.bankAccess});
    if (accounts && accounts.length === 0) {
        log.info("\t-> No other accounts bound: destroying access.");
        await Access.destroy(account.bankAccess);
    }
}


// Delete account, operations and alerts.
export async function destroy(req, res) {
    try {
        await DestroyWithOperations(req.preloaded.account);
        res.sendStatus(204);
    } catch(err) {
        return asyncErr(res, err, "when destroying an account");
    }
}


// Get operations of a given bank account
export async function getOperations(req, res) {
    try {
        let operations = await Operation.byBankSortedByDate(req.preloaded.account);
        res.status(200).send(operations);
    } catch(err) {
        return asyncErr(res, err, "when getting operations for a given bank account");
    }
}

