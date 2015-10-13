let log = require('printit')({
    prefix: 'controllers/accesses',
    date: true
});

import Access         from '../models/access';
import Account        from '../models/account';
import AccountManager from '../lib/accounts-manager';

import Errors         from './errors';

import {sendErr, asyncErr}      from '../helpers';

let commonAccountManager = new AccountManager;

// Preloads a bank access (sets @access).
export async function preloadAccess(req, res, next, accessId) {
    try {
        let access = await Access.find(accessId);
        if (!access) {
            throw { status: 404, message: "bank access not found" };
        }
        req.preloaded = { access };
        next();
    } catch (err) {
        return asyncErr(res, err, "when finding bank access");
    }
}

// Creates a new bank access (expecting at least (bank / login / password)), and
// retrieves its accounts and operations.
export async function create(req, res) {
    let params = req.body;

    if (!params.bank || !params.login || !params.password)
        return sendErr(res, "missing parameters", 400, "missing parameters");

    let access;
    let createdAccess = false, retrievedAccounts = false;
    try {
        let similarAccesses = await Access.allLike(params);
        if (similarAccesses.length) {
            throw { status: 409, code: Errors('BANK_ALREADY_EXISTS') }
        }

        access = await Access.create(params);
        createdAccess = true;

        // For account creation, use your own instance of account manager, to
        // make sure not to perturbate other operations.
        let manager = new AccountManager;
        await manager.retrieveAccountsByAccess(access);
        retrievedAccounts = true;

        await manager.retrieveOperationsByAccess(access);
        res.sendStatus(201);
    } catch (err) {
        log.error("The access process creation failed, cleaning up...");

        // Silently swallow errors here, we don't want to catch errors in error
        // code.
        if (retrievedAccounts) {
            log.info("\tdeleting accounts...");
            let accounts = await Account.byAccess(access);
            for (let acc of accounts) {
                await acc.destroy();
            }
        }

        if (createdAccess) {
            log.info("\tdeleting access...");
            await access.destroy();
        }

        return asyncErr(res, err, "when creating a bank access");
    }
}


// Fetch operations using the backend. Note: client needs to get the operations
// back.
export async function fetchOperations(req, res) {
    try {
        // Fetch operations
        await commonAccountManager.retrieveOperationsByAccess(req.preloaded.access);
        res.sendStatus(200);
    } catch(err) {
        return asyncErr(res, err, "when fetching operations");
    }
}

// Ditto but for accounts. Accounts and operations should be retrieved from the
// client as well.
export async function fetchAccounts(req, res) {
    try {
        await commonAccountManager.retrieveAccountsByAccess(req.preloaded.access);
        fetchOperations(req, res);
    } catch (err) {
        return asyncErr(res, err, "when fetching accounts");
    }
}


// Deletes a bank access.
export async function destroy(req, res) {
    try {
        await req.preloaded.access.destroy();
        res.sendStatus(204);
    } catch(err) {
        return asyncErr(res, err, "when deleting bank access");
    }
}


// Updates the bank access
export async function update(req, res) {

    let access = req.body;
    if (!access.password)
        return sendErr(res, "missing password", 400, "missing password");

    try {
        await req.preloaded.access.updateAttributes(access);
        res.sendStatus(200);
    } catch(err) {
        return asyncErr(res, err, "when updating bank access");
    }
}

