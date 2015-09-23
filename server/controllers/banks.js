let log = require('printit')({
    prefix: 'controllers/banks',
    date: true
});

import async from 'async';

import Bank                  from '../models/bank';
import BankAccess            from '../models/access';
import BankAccount           from '../models/account';
import BankOperation         from '../models/operation';

import * as BankAccountController from './accounts';

import {sendErr}             from '../helpers';

// Preloads @bank in a request
export function preloadBank(req, res, next, bankID) {
    Bank.find(bankID, (err, bank) => {
        if (err)
            return sendErr(res, `when loading bank: ${err}`);

        if (!bank)
            return sendErr(res, "bank not found", 404, "bank not found");

        req.preloaded = {bank};
        next();
    });
}

// Returns accounts of the queried bank.
export function getAccounts(req, res) {
    BankAccount.allFromBank(req.preloaded.bank, (err, accounts) => {
        if (err)
            return sendErr(res, `when retrieving accounts by bank: ${err}`);
        res.status(200).send(accounts);
    });
}


// Erase all accesses bounds to the queried bank (triggering deletion of
// accounts as well).
export function destroy(req, res) {
    log.info(`Deleting all accesses for bank ${req.preloaded.bank.uuid}`);
    // 1. Retrieve all accesses
    BankAccess.allFromBank(req.preloaded.bank, (err, accesses) => {
        if (err)
            return sendErr(res, `could not retrieve accesses for bank: ${err}`);

        // 2. for each access,
        function process(access, callback) {
            log.info(`Removing access ${access.id} for bank ${access.bank} from database...`);
            // 2.1. retrieve all accounts bounds to this access
            BankAccount.allFromBankAccess(access, (err, accounts) => {
                // 2.1.1 Delete account and operations, and maybe the access
                async.eachSeries(accounts, BankAccountController.DestroyWithOperations, callback);
            });
        }

        // Note that the access will be deleted by DestroyWithOperations, when
        // there are no more bounds accounts.
        async.eachSeries(accesses, process, err => {
            if (err)
                return sendErr(res, `when deleting access: ${err}`);
            res.status(204).send({success: true});
        });
    });
}
