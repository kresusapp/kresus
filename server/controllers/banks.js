let log = require('printit')({
    prefix: 'controllers/banks',
    date: true
});

import Bank                  from '../models/bank';
import BankAccess            from '../models/access';
import BankAccount           from '../models/account';
import BankOperation         from '../models/operation';

import * as BankAccountController from './accounts';

import {sendErr, asyncErr}             from '../helpers';

// Preloads @bank in a request
export async function preloadBank(req, res, next, bankID) {
    try {
        let bank = await Bank.find(bankID);
        req.preloaded = {bank};
        next();
    } catch(err) {
        return asyncErr(err, res, "when preloading a bank");
    }
}

// Returns accounts of the queried bank.
export async function getAccounts(req, res) {
    try {
        let accounts = await BankAccount.allFromBank(req.preloaded.bank);
        res.status(200).send(accounts);
    } catch(err) {
        return asyncErr(err, res, "when getting accounts for a bank");
    }
}

// Erase all accesses bounds to the queried bank (triggering deletion of
// accounts as well).
export async function destroy(req, res) {
    try {
        log.info(`Deleting all accesses for bank ${req.preloaded.bank.uuid}`);

        let accesses = await BankAccess.allFromBank(req.preloaded.bank);
        for (let access of accesses) {
            log.info(`Removing access ${access.id} for bank ${access.bank} from database...`);
            let accounts = await BankAccount.allFromBankAccess(access);
            for (let account of accounts) {
                await BankAccountController.DestroyWithOperations(account);
            }
        }

        res.sendStatus(204);
    } catch(err) {
        return asyncErr(res, err, "when destroying an account")
    }
}
