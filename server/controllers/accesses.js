let log = require('printit')({
    prefix: 'controllers/accesses',
    date: true
});

let BankAccess     = require('../models/access');
let BankAccount    = require('../models/account');

let AccountManager = require('../lib/accounts-manager');

let Errors         = require('./errors');
let h              = require('../helpers');

let commonAccountManager = new AccountManager;

// Preloads a bank access (sets @access).
export function preloadBankAccess(req, res, next, accessId) {
    BankAccess.find(accessId, (err, access) => {
        if (err)
            return h.sendErr(res, `when finding bank access: ${err}`);

        if (!access)
            return h.sendErr(res, "bank access not found", 404, "bank access not found");

        req.preloaded = {
            access
        };
        next();
    });
}

// Creates a new bank access (expecting at least (bank / login / password)), and
// retrieves its accounts and operations.
export function create(req, res) {
    let access = req.body;

    if (!access.bank || !access.login || !access.password)
        return h.sendErr(res, "missing parameters", 400, "missing parameters");

    BankAccess.allLike(access, (err, accesses) => {
        if (err)
            return h.sendErr(res, `couldn't retrieve all bank accesses like ${err}`);

        if (accesses.length) {
            log.error("Bank already exists!");
            res.status(409).send({
                code: Errors('BANK_ALREADY_EXISTS')
            })
            return;
        }

        BankAccess.create(access, (err, access) => {
            if (err)
                return h.sendErr(res, "when creating bank access");

            // For account creation, use your own instance of account manager, to
            // make sure not to perturbate other operations.
            let manager = new AccountManager;

            manager.retrieveAccountsByBankAccess(access, err => {
                if (err) {
                    access.destroy(err => {
                        if (err)
                            log.error(`after error on retrieveAccounts, when destroying the access: ${err.toString()}`);
                    });

                    if (typeof err.code !== 'undefined') {
                        log.error(`when loading accounts for the first time: ${JSON.stringify(err)}`);
                        res.status(400).send(err);
                        return;
                    }
                    return h.sendErr(res, `when loading accounts for the first time: ${JSON.stringify(err)}`, 500, err);
                }

                manager.retrieveOperationsByBankAccess(access, err => {
                    if (err) {
                        access.destroy(err => {
                            if (err)
                                log.error(`after error on retrieveOperations, when destroying the access: ${err.toString()}`);
                        });

                        if (typeof err.code !== 'undefined') {
                            log.error(`when loading operations for the first time: ${JSON.stringify(err)}`);
                            res.status(400).send(err);
                            return;
                        }
                        return h.sendErr(res, `when loading operations for the first time: ${JSON.stringify(err)}`, 500, err);
                    }

                    res.sendStatus(201);
                });
            });
        });
    });
}


// Fetch operations using the backend. Note: client needs to get the operations
// back.
export function fetchOperations(req, res) {
    // Fetch operations
    commonAccountManager.retrieveOperationsByBankAccess(req.preloaded.access, err => {

        if (err) {
            if (typeof err.code !== 'undefined') {
                log.error(`when fetching operations: ${JSON.stringify(err)}`);
                res.status(400).send(err);
                return;
            }
            return h.sendErr(res, `when fetching operations: ${JSON.stringify(err)}`, 500, `Manager error when importing operations:\n${err}`);
        }

        res.sendStatus(200);
    });
}


// Ditto but for accounts. Accounts and operations should be retrieved from the
// client as well.
export function fetchAccounts(req, res) {
    // Fetch accounts
    commonAccountManager.retrieveAccountsByBankAccess(req.preloaded.access, err => {
        if (err) {
            if (typeof err.code !== 'undefined') {
                log.error(`when fetching accounts: ${JSON.stringify(err)}`);
                res.status(400).send(err);
                return;
            }
            return h.sendErr(res, `when fetching accounts: ${JSON.stringify(err)}`, 500, `Manager error when importing accounts:\n${err}`);
        }

        fetchOperations(req, res);
    });
}


// Deletes a bank access.
export function destroy(req, res) {
    req.preloaded.access.destroy(err => {
        if (err)
            return h.sendErr(res, `couldn't delete bank access: ${err}`);
        res.status(204).send({success: true});
    });
}


// Updates the bank access
export function update(req, res) {

    let access = req.body;

    if (!access.password)
        return h.sendErr(res, "missing password", 400, "missing password");

    req.preloaded.access.updateAttributes(access, (err, access) => {
        if (err)
            return h.sendErr(res, `couldn't update bank access: ${err}`);
        res.sendStatus(200);
    });
}

