let log = require('printit')({
    prefix: 'controllers/accounts',
    date: true
});

import async from 'async';

import BankAccount   from '../models/account';
import BankOperation from '../models/operation';
import BankAccess    from '../models/access';
import BankAlert     from '../models/alert';

import {sendErr} from '../helpers';

// Prefills the @account field with a queried bank account.
export function preloadBankAccount(req, res, next, accountID) {
    BankAccount.find(accountID, (err, account) => {
        if (err)
            return sendErr(res, `when finding a bank account: ${err}`);

        if (!account)
            return sendErr(res, "bank account not found", 404, "bank account not found");

        req.preloaded = {account};
        next();
    });
}


// Destroy an account and all its operations, alerts, and accesses if no other
// accounts are bound to this access.
export function DestroyWithOperations(account, callback) {
    log.info(`Removing account ${account.title} from database...`);
    let requests = [];

    // Destroy operations
    requests.push(callback => {
        log.info(`\t-> Destroying operations for account ${account.title}`);
        BankOperation.destroyByAccount(account.accountNumber, err => {
            if (err)
                return callback(`Could not remove operations: ${err}`, null);
            callback(null, true);
        });
    });

    // Destroy alerts
    requests.push(callback => {
        log.info(`\t-> Destroy alerts for account ${account.title}`);
        BankAlert.destroyByAccount(account.id, err => {
            if (err)
                return callback(`Could not remove alerts -- ${err}`, null);
            callback(null, true);
        });
    });

    // Destroy account
    requests.push(callback => {
        account.destroy(err => {
            if (err)
                return callback(`Could not delete account -- ${err}`, null);
            callback(null, true);
        });
    });

    // Find bank accounts for this access and destroy access if it has no
    // accounts.
    requests.push(callback => {
        log.info("\t-> Destroying access if no other accounts are bound");
        // Fake a bankAccess object by providing an id...
        // TODO clean this up
        BankAccount.allFromBankAccess({id: account.bankAccess}, (err, accounts) => {
                if (err || !accounts)
                    return callback(`Couldn't retrieve accounts by bank -- ${err}`)

                if (accounts.length === 0) {
                    log.info('\t\tNo other bank account bound to this access!');
                    BankAccess.find(account.bankAccess, (err, access) => {
                        if (err)
                            return callback(err);

                        if (!access) {
                            log.error('\t\tAccess not found?');
                            return callback();
                        }

                        access.destroy(err => {
                            if (err)
                                return callback(`\t\tError when destroying the access: ${err.toString()}`);
                            log.info("\t\t-> Access destroyed");
                            callback();
                        });
                    });
                } else {
                    log.info('\t\tAt least one other bank account bound to this access.');
                    callback();
                }
        });
    });

    async.series(requests, callback);
}


// Delete account, operations and alerts.
export function destroy(req, res) {
    DestroyWithOperations(req.preloaded.account, err => {
        if (err)
            return sendErr(res, `when destroying account: ${err}`);
        res.status(204).send({success: true});
    });
}


// Get operations of a given bank account
export function getOperations(req, res) {
    BankOperation.allFromBankAccountDate(req.preloaded.account, (err, operations) => {
        if (err)
            return sendErr(res, `when retrieving operations for a bank account: ${err}`);
        res.status(200).send(operations);
    });
}

