import express from 'express';

import { Access, AccessField, Account, Transaction } from '../models';

import accountManager, { UserActionOrValue } from '../lib/accounts-manager';
import { fullPoll } from '../lib/poller';
import { bankVendorByUuid } from '../lib/bank-vendors';

import { registerStartupTask } from './all';
import * as AccountController from './accounts';
import { isDemoEnabled } from './instance';
import { IdentifiedRequest, PreloadedRequest } from './routes';

import { assert, asyncErr, getErrorCode, KError, makeLogger } from '../helpers';
import { hasMissingField, hasForbiddenField } from '../shared/validators';

const log = makeLogger('controllers/accesses');

// Preloads a bank access (sets @access).
export async function preloadAccess(
    req: IdentifiedRequest<Access>,
    res: express.Response,
    nextHandler: () => void,
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

export async function deleteSession(req: PreloadedRequest<Access>, res: express.Response) {
    try {
        const {
            user: { id: userId },
        } = req;
        const { access } = req.preloaded;
        await Access.update(userId, access.id, { session: null });
        res.status(204).end();
    } catch (err) {
        asyncErr(res, err, 'when deleting an access session');
    }
}

export interface CreateAndRetrieveDataResult {
    accessId: number;
    accounts: Account[];
    newOperations: Transaction[];
    label: string;
}

export function extractUserActionFields(body: Record<string, string>) {
    const fields = (body.userActionFields || null) as Record<string, string> | null;
    delete body.userActionFields;
    return fields;
}

export async function createAndRetrieveData(
    userId: number,
    params: Record<string, unknown>
): Promise<UserActionOrValue<CreateAndRetrieveDataResult>> {
    const error =
        hasMissingField(params, ['vendorId', 'login', 'password']) ||
        hasForbiddenField(params, [
            'vendorId',
            'login',
            'password',
            'fields',
            'customLabel',
            'userActionFields',
        ]);
    if (error) {
        throw new KError(`when creating a new access: ${error}`, 400);
    }

    const userActionFields = extractUserActionFields(params as Record<string, string>);

    let access: Access | null = null;
    try {
        if (userActionFields !== null) {
            access = await Access.byCredentials(userId, {
                uuid: params.vendorId as string,
                login: params.login as string,
            });
        } else {
            access = await Access.create(userId, params);
        }

        const accountResponse = await accountManager.retrieveAndAddAccountsByAccess(
            userId,
            access,
            /* interactive */ true,
            userActionFields
        );

        if (accountResponse.kind === 'user_action') {
            // The whole system relies on the Access object existing (in
            // particular, the session with 2fa information is tied to the
            // Access), so we can't delete the Access object here.
            //
            // Unfortunately, because of 2fa, this means the user can abort the
            // access creation and leave an inconsistent state in the database,
            // where we have an Access but there's no Account/Transaction tied.
            //
            // So we register a special task that gets run on /api/all (= next
            // loading of Kresus), which will clean the access if it has no
            // associated accounts, as a proxy of meaning the 2fa has never
            // completed.
            const prevAccess: Access = access;

            registerStartupTask(userId, async () => {
                const accounts = await Account.byAccess(userId, prevAccess);
                if (accounts.length === 0) {
                    log.info(`Cleaning up incomplete access with id ${prevAccess.id}`);
                    await Access.destroy(userId, prevAccess.id);
                }
            });

            return accountResponse;
        }

        const transactionResponse = await accountManager.retrieveOperationsByAccess(
            userId,
            access,
            /* ignoreLastFetchDate */ false,
            /* isInteractive */ true,
            userActionFields
        );

        assert(
            transactionResponse.kind !== 'user_action',
            'user action should have been requested when fetching accounts'
        );
        const { accounts, createdTransactions: newOperations } = transactionResponse.value;

        return {
            kind: 'value',
            value: {
                accessId: access.id,
                accounts,
                newOperations,
                label: bankVendorByUuid(access.vendorId).name,
            },
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
        if (data.kind === 'user_action') {
            res.status(200).json(data);
        } else {
            res.status(201).json(data.value);
        }
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

        const userActionFields = extractUserActionFields(req.body);

        const transactionResponse = await accountManager.retrieveOperationsByAccess(
            userId,
            access,
            /* ignoreLastFetchDate */ false,
            /* isInteractive */ true,
            userActionFields
        );

        if (transactionResponse.kind === 'user_action') {
            res.status(200).json(transactionResponse);
            return;
        }

        const { accounts, createdTransactions: newOperations } = transactionResponse.value;

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

        const userActionFields = extractUserActionFields(req.body);

        const accountResponse = await accountManager.retrieveAndAddAccountsByAccess(
            userId,
            access,
            /* interactive */ true,
            userActionFields
        );
        if (accountResponse.kind === 'user_action') {
            res.status(200).json(accountResponse);
            return;
        }

        const transactionResponse = await accountManager.retrieveOperationsByAccess(
            userId,
            access,
            /* ignoreLastFetchDate */ true,
            /* isInteractive */ true,
            userActionFields
        );

        assert(
            transactionResponse.kind !== 'user_action',
            'user action should have been requested when fetching accounts'
        );
        const { accounts, createdTransactions: newOperations } = transactionResponse.value;

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

        const error = hasForbiddenField(attrs, ['login', 'password', 'fields', 'userActionFields']);
        if (error) {
            throw new KError(`when updating and polling an access: ${error}`, 400);
        }

        // Hack: temporarily remove userActionFields from the entity, so the
        // ORM accepts it. Oh well.
        const { userActionFields } = attrs;
        delete attrs.userActionFields;

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

        // Hack: reset userActionFields (see above comment).
        req.body.userActionFields = userActionFields;

        await fetchAccounts(req, res);
    } catch (err) {
        asyncErr(res, err, 'when updating and fetching bank access');
    }
}
