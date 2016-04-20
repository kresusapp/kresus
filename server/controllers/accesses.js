import Access         from '../models/access';
import Account        from '../models/account';
import AccountManager from '../lib/accounts-manager';

import { makeLogger, KError, getErrorCode, asyncErr } from '../helpers';

let log = makeLogger('controllers/accesses');

let commonAccountManager = new AccountManager;

// Preloads a bank access (sets @access).
export async function preloadAccess(req, res, next, accessId) {
    try {
        let access = await Access.find(accessId);
        if (!access) {
            throw new KError('bank access not found', 404);
        }
        req.preloaded = { access };
        next();
    } catch (err) {
        return asyncErr(res, err, 'when finding bank access');
    }
}

// Creates a new bank access (expecting at least (bank / login / password)), and
// retrieves its accounts and operations.
export async function create(req, res) {
    let access;
    let createdAccess = false, retrievedAccounts = false;
    try {
        let params = req.body;

        if (!params.bank || !params.login || !params.password)
            throw new KError('missing parameters', 400);

        let similarAccesses = await Access.allLike(params);
        if (similarAccesses.length) {
            let errcode = getErrorCode('BANK_ALREADY_EXISTS');
            throw new KError('bank already exists', 409, errcode);
        }

        access = await Access.create(params);
        createdAccess = true;

        // For account creation, use your own instance of account manager, to
        // make sure not to perturbate other operations.
        let manager = new AccountManager;
        await manager.retrieveAndAddAccountsByAccess(access);
        retrievedAccounts = true;

        await manager.retrieveOperationsByAccess(access);
        res.sendStatus(201);
    } catch (err) {
        log.error('The access process creation failed, cleaning up...');

        // Silently swallow errors here, we don't want to catch errors in error
        // code.
        if (retrievedAccounts) {
            log.info('\tdeleting accounts...');
            let accounts = await Account.byAccess(access);
            for (let acc of accounts) {
                await acc.destroy();
            }
        }

        if (createdAccess) {
            log.info('\tdeleting access...');
            await access.destroy();
        }

        return asyncErr(res, err, 'when creating a bank access');
    }
}


// Fetch operations using the backend. Note: client needs to get the operations
// back.
export async function fetchOperations(req, res) {
    try {
        let access = req.preloaded.access;
        // Fetch operations
        await commonAccountManager.retrieveOperationsByAccess(access);
        res.sendStatus(200);
    } catch (err) {
        return asyncErr(res, err, 'when fetching operations');
    }
}

// Ditto but for accounts. Accounts and operations should be retrieved from the
// client as well.
export async function fetchAccounts(req, res) {
    try {
        let access = req.preloaded.access;
        await commonAccountManager.retrieveAndAddAccountsByAccess(access);
        await fetchOperations(req, res);
    } catch (err) {
        return asyncErr(res, err, 'when fetching accounts');
    }
}


// Deletes a bank access.
export async function destroy(req, res) {
    try {
        await req.preloaded.access.destroy();
        res.sendStatus(204);
    } catch (err) {
        return asyncErr(res, err, 'when deleting bank access');
    }
}


// Updates the bank access
export async function update(req, res) {
    try {
        let access = req.body;
        if (!access.password)
            throw new KError('missing password', 400);

        await req.preloaded.access.updateAttributes(access);
        await fetchAccounts(req, res);
    } catch (err) {
        return asyncErr(res, err, 'when updating bank access');
    }
}
