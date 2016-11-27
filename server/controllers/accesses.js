import Access         from '../models/access';
import Account        from '../models/account';
import AccountManager from '../lib/accounts-manager';

import * as AccountController from './accounts';

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

// Returns accounts bound to a given access.
export async function getAccounts(req, res) {
    try {
        let accounts = await Account.byAccess(req.preloaded.access);
        res.status(200).send(accounts);
    } catch (err) {
        return asyncErr(err, res, 'when getting accounts for a bank');
    }
}

// Destroy a given access, including accounts, alerts and operations.
export async function destroy(req, res) {
    try {
        let access = req.preloaded.access;
        log.info(`Removing access ${access.id} for bank ${access.bank}...`);

        // TODO arguably, this should be done in the access model.
        let accounts = await Account.byAccess(access);
        for (let account of accounts) {
            await AccountController.destroyWithOperations(account);
        }

        // The access should have been destroyed by the last account deletion.
        let stillThere = await Access.exists(access.id);
        if (stillThere) {
            log.error('Access should have been deleted! Manually deleting.');
            await access.destroy();
        }

        log.info('Done!');
        res.sendStatus(204);
    } catch (err) {
        return asyncErr(res, err, 'when destroying an access');
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

        let { accounts, newOperations } = await manager.retrieveOperationsByAccess(access);

        res.status(201).send({
            accessId: access.id,
            accounts,
            newOperations
        });
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

// Fetch operations using the backend and return the operations to the client.
export async function fetchOperations(req, res) {
    try {
        let access = req.preloaded.access;

        let {
            accounts,
            newOperations
        } = await commonAccountManager.retrieveOperationsByAccess(access);

        res.status(200).send({
            accounts,
            newOperations
        });
    } catch (err) {
        return asyncErr(res, err, 'when fetching operations');
    }
}

// Fetch accounts, including new accounts, and operations using the backend and
// return both to the client.
export async function fetchAccounts(req, res) {
    try {
        let access = req.preloaded.access;

        await commonAccountManager.retrieveAndAddAccountsByAccess(access);

        let {
            accounts,
            newOperations
        } = await commonAccountManager.retrieveOperationsByAccess(access);

        res.status(200).send({
            accounts,
            newOperations
        });
    } catch (err) {
        return asyncErr(res, err, 'when fetching accounts');
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
