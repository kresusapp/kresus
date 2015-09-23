let async = require('async');
let log   = require('printit')({
    prefix: 'controllers/banks',
    date: true
});

let h                     = require('../helpers');

let Bank                  = require('../models/bank');
let BankAccess            = require('../models/access');
let BankAccount           = require('../models/account');
let BankOperation         = require('../models/operation');

let BankAccountController = require('./accounts');

// Preloads @bank in a request
export function preloadBank(req, res, next, bankID) {
    Bank.find(bankID, (err, bank) => {
        if (err)
            return h.sendErr(res, `when loading bank: ${err}`);

        if (!bank)
            return h.sendErr(res, "bank not found", 404, "bank not found");

        req.preloaded = {bank};
        next();
    });
}

// Returns accounts of the queried bank.
export function getAccounts(req, res) {
    BankAccount.allFromBank(req.preloaded.bank, (err, accounts) => {
        if (err)
            return h.sendErr(res, `when retrieving accounts by bank: ${err}`);
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
            return h.sendErr(res, `could not retrieve accesses for bank: ${err}`);

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
                return h.sendErr(res, `when deleting access: ${err}`);
            res.status(204).send({success: true});
        });
    });
}
