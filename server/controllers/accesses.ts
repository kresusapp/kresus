import express from 'express';

import { Access, AccessField } from '../models';

import accountManager from '../lib/accounts-manager';
import { fullPoll } from '../lib/poller';
import { bankVendorByUuid } from '../lib/bank-vendors';

import * as AccountController from './accounts';
import { isDemoEnabled } from './instance';
import { IdentifiedRequest, PreloadedRequest } from './routes';

import { asyncErr, getErrorCode, KError, makeLogger } from '../helpers';
import { hasMissingField, hasForbiddenField } from '../shared/validators';

const log = makeLogger('controllers/accesses');

// Preloads a bank access (sets @access).
export async function preloadAccess(
    req: IdentifiedRequest<Access>,
    res: express.Response,
    nextHandler: Function,
    accessId: number
) {
    try {
        const { id: userId } = req.user;
        const access = await Access.find(userId, accessId);
        if (!access) {
            throw new KError('bank access not found', 404);
        }
        req.preloaded = { access };
        nextHandler();
    } catch (err) {
        asyncErr(res, err, 'when finding bank access');
    }
}

export async function destroyWithData(userId: number, access: Access) {
    log.info(`Removing access ${access.id} for bank ${access.vendorId}...`);
    await Access.destroy(userId, access.id);
    await AccountController.fixupDefaultAccount(userId);
    log.info('Done!');
}

// Destroy a given access, including accounts, alerts and operations.
export async function destroy(req: PreloadedRequest<Access>, res: express.Response) {
    try {
        const {
            user: { id: userId },
        } = req;

        if (await isDemoEnabled(userId)) {
            throw new KError("access deletion isn't allowed in demo mode", 400);
        }

        await destroyWithData(userId, req.preloaded.access);
        res.status(204).end();
    } catch (err) {
        asyncErr(res, err, 'when destroying an access');
    }
}

export async function createAndRetrieveData(userId: number, params: object) {
    const error =
        hasMissingField(params, ['vendorId', 'login', 'password']) ||
        hasForbiddenField(params, ['vendorId', 'login', 'password', 'fields', 'customLabel']);
    if (error) {
        throw new KError(`when creating a new access: ${error}`, 400);
    }

    let access: Access | null = null;
    try {
        access = await Access.create(userId, params);
        await accountManager.retrieveAndAddAccountsByAccess(userId, access, /* interactive */ true);
        const {
            accounts,
            createdTransactions: newOperations,
        } = await accountManager.retrieveOperationsByAccess(
            userId,
            access,
            /* ignoreLastFetchDate */ false,
            /* isInteractive */ true
        );
        return {
            accessId: access.id,
            accounts,
            newOperations,
            label: bankVendorByUuid(access.vendorId).name,
        };
    } catch (err) {
        log.error('The access process creation failed, cleaning up...');

        // Let sql remove all the dependent data for us.
        if (access !== null) {
            log.info('\tdeleting access...');
            await Access.destroy(userId, access.id);
        }

        // Rethrow the error
        throw err;
    }
}

// Creates a new bank access (expecting at least (vendorId / login /
// password)), and retrieves its accounts and operations.
export async function create(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const {
            user: { id: userId },
        } = req;

        if (await isDemoEnabled(userId)) {
            throw new KError("access creation isn't allowed in demo mode", 400);
        }

        const data = await createAndRetrieveData(userId, req.body);
        res.status(201).json(data);
    } catch (err) {
        asyncErr(res, err, 'when creating a bank access');
    }
}

// Fetch operations using the backend and return the operations to the client.
export async function fetchOperations(req: PreloadedRequest<Access>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const access = req.preloaded.access;
        const bankVendor = bankVendorByUuid(access.vendorId);

        if (!access.isEnabled() || bankVendor.deprecated) {
            const errcode = getErrorCode('DISABLED_ACCESS');
            throw new KError('disabled access', 403, errcode);
        }

        const {
            accounts,
            createdTransactions: newOperations,
        } = await accountManager.retrieveOperationsByAccess(
            userId,
            access,
            /* ignoreLastFetchDate */ false,
            /* isInteractive */ true
        );

        res.status(200).json({
            accounts,
            newOperations,
        });
    } catch (err) {
        asyncErr(res, err, 'when fetching operations');
    }
}

// Fetch accounts, including new accounts, and operations using the backend and
// return both to the client.
export async function fetchAccounts(req: PreloadedRequest<Access>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const access = req.preloaded.access;
        const bankVendor = bankVendorByUuid(access.vendorId);

        if (!access.isEnabled() || bankVendor.deprecated) {
            const errcode = getErrorCode('DISABLED_ACCESS');
            throw new KError('disabled access', 403, errcode);
        }

        await accountManager.retrieveAndAddAccountsByAccess(userId, access, /* interactive */ true);

        const {
            accounts,
            createdTransactions: newOperations,
        } = await accountManager.retrieveOperationsByAccess(
            userId,
            access,
            /* ignoreLastFetchDate */ true,
            /* isInteractive */ true
        );

        res.status(200).json({
            accounts,
            newOperations,
        });
    } catch (err) {
        asyncErr(res, err, 'when fetching accounts');
    }
}

// Fetch all the operations / accounts for all the accesses, as is done during
// any regular poll.
export async function poll(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        await fullPoll(userId);
        res.status(200).json({
            status: 'OK',
        });
    } catch (err) {
        log.warn(`Error when doing a full poll: ${err.message}`);
        res.status(500).json({
            status: 'error',
            message: err.message,
        });
    }
}

// Updates a bank access.
export async function update(req: PreloadedRequest<Access>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const { access } = req.preloaded;

        const attrs = req.body;

        const error = hasForbiddenField(attrs, ['enabled', 'customLabel']);
        if (error) {
            throw new KError(`when updating an access: ${error}`, 400);
        }

        if (attrs.enabled === false) {
            attrs.password = null;
            delete attrs.enabled;
        }

        if (attrs.customLabel === '') {
            attrs.customLabel = null;
        }

        await Access.update(userId, access.id, attrs);
        res.status(201).json({ status: 'OK' });
    } catch (err) {
        asyncErr(res, err, 'when updating bank access');
    }
}

export async function updateAndFetchAccounts(req: PreloadedRequest<Access>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const { access } = req.preloaded;

        const attrs = req.body;

        const error = hasForbiddenField(attrs, ['login', 'password', 'fields']);
        if (error) {
            throw new KError(`when updating and polling an access: ${error}`, 400);
        }

        if (typeof attrs.fields !== 'undefined') {
            const newFields = attrs.fields;
            delete attrs.fields;

            for (const { name, value } of newFields) {
                const previous = access.fields.find(existing => existing.name === name);
                if (value === null) {
                    // Delete the custom field if necessary.
                    if (typeof previous !== 'undefined') {
                        await AccessField.destroy(userId, previous.id);
                    }
                } else if (typeof previous !== 'undefined') {
                    // Update the custom field if necessary.
                    if (previous.value !== value) {
                        await AccessField.update(userId, previous.id, { name, value });
                    }
                } else {
                    // Create it.
                    await AccessField.create(userId, { name, value, accessId: access.id });
                }
            }
        }

        // The preloaded access needs to be updated before calling fetchAccounts.
        req.preloaded.access = await Access.update(userId, access.id, attrs);
        await fetchAccounts(req, res);
    } catch (err) {
        asyncErr(res, err, 'when updating and fetching bank access');
    }
}
