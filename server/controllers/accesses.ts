import express from 'express';

import { Access, AccessField, Account, Transaction } from '../models';

import accountManager, { GLOBAL_CONTEXT, UserActionOrValue } from '../lib/accounts-manager';
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

// Destroy a given access, including accounts, alerts and transactions.
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
        const session = GLOBAL_CONTEXT.getUserSession(userId);
        await session.reset(access);
        res.status(204).end();
    } catch (err) {
        asyncErr(res, err, 'when deleting an access session');
    }
}

export interface CreateAndRetrieveDataResult {
    accessId: number;
    accounts: Account[];
    newTransactions: Transaction[];
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

        const accountResponse = await accountManager.syncAccounts(userId, access, {
            addNewAccounts: true,
            updateProvider: false, // TODO infer from setting?
            isInteractive: true,
            userActionFields,
        });

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

        const accountInfoMap = accountResponse.value;
        const transactionResponse = await accountManager.syncTransactions(
            userId,
            access,
            accountInfoMap,
            /* ignoreLastFetchDate */ true,
            /* isInteractive */ true,
            userActionFields
        );

        assert(
            transactionResponse.kind !== 'user_action',
            'user action should have been requested when fetching accounts'
        );
        const { accounts, createdTransactions: newTransactions } = transactionResponse.value;

        return {
            kind: 'value',
            value: {
                accessId: access.id,
                accounts,
                newTransactions,
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
// password)), and retrieves its accounts and transactions.
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

// Fetch accounts, including new accounts, and transactions using the backend and
// return both to the client.
export async function fetchAccountsAndTransactions(
    req: PreloadedRequest<Access>,
    res: express.Response,
    // On transactions fetch, the accounts balance should be updated too, but we should not throw an error if it happens,
    // nor should we create new accounts, nor should we ignore the last fetch date.
    focusOnTransactionsFetch = false
) {
    try {
        const { id: userId } = req.user;
        const access = req.preloaded.access;
        const bankVendor = bankVendorByUuid(access.vendorId);

        if (!access.isEnabled() || bankVendor.deprecated) {
            const errcode = getErrorCode('DISABLED_ACCESS');
            throw new KError('disabled access', 403, errcode);
        }

        const userActionFields = extractUserActionFields(req.body);

        let accountResponse: Awaited<ReturnType<typeof accountManager.syncAccounts>> | null = null;

        // To deal with banks that often throw errors when dealing with recurrent requests,
        // we wrap the accounts update requests in a try/catch, and still fetch the transactions
        // if it fails, if addnewsAccounts is true: we likely are in a poll and the updated accounts
        // are really important: we should throw an error. Else, in a transactions fetch,
        // the balance might be out of sync with the new transactions but we consider it
        // a minor issue.
        try {
            accountResponse = await accountManager.syncAccounts(userId, access, {
                addNewAccounts: focusOnTransactionsFetch === false,
                updateProvider: false, // TODO shouldn't this be inferred from the settings?
                isInteractive: true,
                userActionFields,
            });
        } catch (err) {
            if (!focusOnTransactionsFetch) {
                throw err;
            }
        }

        if (accountResponse && accountResponse.kind === 'user_action') {
            res.status(200).json(accountResponse);
            return;
        }

        const accountInfoMap = accountResponse ? accountResponse.value : null;

        const transactionResponse = await accountManager.syncTransactions(
            userId,
            access,
            accountInfoMap,
            /* ignoreLastFetchDate */ !focusOnTransactionsFetch,
            /* isInteractive */ true,
            userActionFields
        );

        assert(
            transactionResponse.kind !== 'user_action',
            'user action should have been requested when fetching accounts'
        );
        const { accounts, createdTransactions: newTransactions } = transactionResponse.value;

        res.status(200).json({
            accounts,
            newTransactions,
        });
    } catch (err) {
        asyncErr(res, err, 'when fetching accounts and transactions');
    }
}

// Fetch accounts (for up-to-date balances) transactions using the backend and return the transactions to the client.
// Does not add new found accounts.
export async function fetchTransactions(req: PreloadedRequest<Access>, res: express.Response) {
    return fetchAccountsAndTransactions(req, res, true);
}

// Fetch all the transactions / accounts for all the accesses, as is done during
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

        await fetchAccountsAndTransactions(req, res);
    } catch (err) {
        asyncErr(res, err, 'when updating and fetching bank access');
    }
}
