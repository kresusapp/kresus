let log = require('printit')({
    prefix: 'controllers/banks',
    date: true
});

import Bank    from '../models/bank';
import Access  from '../models/access';
import Account from '../models/account';

import * as AccountController from './accounts';

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
        let accounts = await Account.byBank(req.preloaded.bank);
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

        let accesses = await Access.byBank(req.preloaded.bank);
        for (let access of accesses) {
            log.info(`Removing access ${access.id} for bank ${access.bank} from database...`);
            let accounts = await Account.byAccess(access);
            for (let account of accounts) {
                await AccountController.DestroyWithOperations(account);
            }
        }

        res.sendStatus(204);
    } catch(err) {
        return asyncErr(res, err, "when destroying an account")
    }
}
