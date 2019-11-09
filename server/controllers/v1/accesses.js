import Accesses from '../../models/accesses';
import Accounts from '../../models/accounts';

import accountManager from '../../lib/accounts-manager';
import { fullPoll } from '../../lib/poller';
import { bankVendorByUuid } from '../../lib/bank-vendors';

import * as AccountController from './accounts';
import { isDemoEnabled } from './settings';

import { asyncErr, getErrorCode, KError, makeLogger } from '../../helpers';
import { checkHasAllFields, checkAllowedFields } from '../../shared/validators';

let log = makeLogger('controllers/accesses');

// Preloads a bank access (sets @access).
export async function preloadAccess(req, res, next, accessId) {
    try {
        let { id: userId } = req.user;
        let access = await Accesses.find(userId, accessId);
        if (!access) {
            throw new KError('bank access not found', 404);
        }
        req.preloaded = { access };
        return next();
    } catch (err) {
        return asyncErr(res, err, 'when finding bank access');
    }
}

export async function destroyWithData(userId, access) {
    log.info(`Removing access ${access.id} for bank ${access.vendorId}...`);

    // TODO arguably, this should be done in the access model.
    let accounts = await Accounts.byAccess(userId, access);
    for (let account of accounts) {
        await AccountController.destroyWithOperations(userId, account);
    }

    // The access should have been destroyed by the last account deletion.
    let stillThere = await Accesses.exists(userId, access.id);
    if (stillThere) {
        log.error('Access should have been deleted! Manually deleting.');
        await Accesses.destroy(userId, access.id);
    }

    log.info('Done!');
}

// Destroy a given access, including accounts, alerts and operations.
export async function destroy(req, res) {
    try {
        let {
            user: { id: userId }
        } = req;

        if (await isDemoEnabled(userId)) {
            throw new KError("access deletion isn't allowed in demo mode", 400);
        }

        await destroyWithData(userId, req.preloaded.access);
        res.status(204).end();
    } catch (err) {
        return asyncErr(res, err, 'when destroying an access');
    }
}

export async function createAndRetrieveData(userId, params) {
    let error =
        checkHasAllFields(params, ['vendorId', 'login', 'password']) ||
        checkAllowedFields(params, ['vendorId', 'login', 'password', 'fields', 'customLabel']);
    if (error) {
        throw new KError(`when creating a new access: ${error}`, 400);
    }

    let access = null;
    let createdAccess = false;
    let retrievedAccounts = false;

    try {
        access = await Accesses.create(userId, params);
        createdAccess = true;

        await accountManager.retrieveAndAddAccountsByAccess(userId, access);
        retrievedAccounts = true;

        let { accounts, newOperations } = await accountManager.retrieveOperationsByAccess(
            userId,
            access
        );

        return {
            accessId: access.id,
            accounts,
            newOperations
        };
    } catch (err) {
        log.error('The access process creation failed, cleaning up...');

        // Silently swallow errors here, we don't want to catch errors in error
        // code.
        if (retrievedAccounts) {
            log.info('\tdeleting accounts...');
            let accounts = await Accounts.byAccess(userId, access);
            for (let acc of accounts) {
                await Accounts.destroy(userId, acc.id);
            }
        }

        if (createdAccess) {
            log.info('\tdeleting access...');
            await Accesses.destroy(userId, access.id);
        }

        // Rethrow the error
        throw err;
    }
}

// Creates a new bank access (expecting at least (vendorId / login /
// password)), and retrieves its accounts and operations.
export async function create(req, res) {
    try {
        let {
            user: { id: userId }
        } = req;

        if (await isDemoEnabled(userId)) {
            throw new KError("access creation isn't allowed in demo mode", 400);
        }

        const data = await createAndRetrieveData(userId, req.body);
        res.status(201).json(data);
    } catch (err) {
        return asyncErr(res, err, 'when creating a bank access');
    }
}

// Fetch operations using the backend and return the operations to the client.
export async function fetchOperations(req, res) {
    try {
        let { id: userId } = req.user;
        let access = req.preloaded.access;
        let bankVendor = bankVendorByUuid(access.vendorId);

        if (!access.isEnabled() || bankVendor.deprecated) {
            let errcode = getErrorCode('DISABLED_ACCESS');
            throw new KError('disabled access', 403, errcode);
        }

        let { accounts, newOperations } = await accountManager.retrieveOperationsByAccess(
            userId,
            access
        );

        res.status(200).json({
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
        let { id: userId } = req.user;
        let access = req.preloaded.access;
        let bankVendor = bankVendorByUuid(access.vendorId);

        if (!access.isEnabled() || bankVendor.deprecated) {
            let errcode = getErrorCode('DISABLED_ACCESS');
            throw new KError('disabled access', 403, errcode);
        }

        await accountManager.retrieveAndAddAccountsByAccess(userId, access);

        let { accounts, newOperations } = await accountManager.retrieveOperationsByAccess(
            userId,
            access,
            true
        );

        res.status(200).json({
            accounts,
            newOperations
        });
    } catch (err) {
        return asyncErr(res, err, 'when fetching accounts');
    }
}

// Fetch all the operations / accounts for all the accesses, as is done during
// any regular poll.
export async function poll(req, res) {
    try {
        let { id: userId } = req.user;
        await fullPoll(userId);
        res.status(200).json({
            status: 'OK'
        });
    } catch (err) {
        log.warn(`Error when doing a full poll: ${err.message}`);
        res.status(500).json({
            status: 'error',
            message: err.message
        });
    }
}

// Updates a bank access.
export async function update(req, res) {
    try {
        let { id: userId } = req.user;
        let { access } = req.preloaded;

        let newFields = req.body;

        let error = checkAllowedFields(newFields, ['enabled', 'customLabel']);
        if (error) {
            throw new KError(`when updating an access: ${error}`, 400);
        }

        if (newFields.enabled === false) {
            newFields.password = null;
        }
        if (newFields.customLabel === '') {
            newFields.customLabel = null;
        }

        await Accesses.update(userId, access.id, newFields);
        res.status(201).json({ status: 'OK' });
    } catch (err) {
        return asyncErr(res, err, 'when updating bank access');
    }
}

export async function updateAndFetchAccounts(req, res) {
    try {
        let { id: userId } = req.user;
        let { access } = req.preloaded;

        let newFields = req.body;

        let error = checkAllowedFields(newFields, ['enabled', 'login', 'password', 'fields']);
        if (error) {
            throw new KError(`when updating and polling an access: ${error}`, 400);
        }

        // The preloaded access needs to be updated before calling fetchAccounts.
        req.preloaded.access = await Accesses.update(userId, access.id, newFields);
        await fetchAccounts(req, res);
    } catch (err) {
        return asyncErr(res, err, 'when updating and fetching bank access');
    }
}
