/**
 * Accounts API endpoints
 */
import selfapi from 'selfapi';

import * as accountsControllers from '../accounts';

const accounts = selfapi({
    title: 'Bank accounts'
});

accounts.get({
    title: 'List all bank accounts',
    handler: accountsControllers.getAllAccounts,
    examples: [{
        response: {
            status: 200,
            body: {
                data: {
                    accounts: [{
                        bank: "fakebank1",
                        bankAccess: "932ae946e93041f6aad9a9461de9ce4c",
                        accountNumber: "102test101491",
                        importDate: "2017-07-27T13:30:58.930Z",
                        initialAmount: 245.3153113206547,
                        lastChecked: "2017-07-27T13:31:00.175Z",
                        title: "Compte chèque",
                        iban: "FR235711131719",
                        currency: "EUR",
                        id: "82dc9d2e991e42f699b89440a84cd981"
                    }]
                }
            }
        }
    }]
});

const account = accounts.api(':accountId');
account.get({
    title: 'Get a given bank account',
    handler: accountsControllers.getAccount,
    examples: [{
        request: {
            urlParameters: {
                accountId: "82dc9d2e991e42f699b89440a84cd981"
            }
        },
        response: {
            status: 200,
            body: {
                data: {
                    account: {
                        bank: "fakebank1",
                        bankAccess: "932ae946e93041f6aad9a9461de9ce4c",
                        accountNumber: "102test101491",
                        importDate: "2017-07-27T13:30:58.930Z",
                        initialAmount: 245.3153113206547,
                        lastChecked: "2017-07-27T13:31:00.175Z",
                        title: "Compte chèque",
                        iban: "FR235711131719",
                        currency: "EUR",
                        id: "82dc9d2e991e42f699b89440a84cd981"
                    }
                }
            }
        }
    }]
});
account.delete({
    title: 'Delete a given bank account',
    handler: accountsControllers.destroy,
    examples: [{
        request: {
            urlParameters: {
                accountId: "6f579d63696942cf85bdc67aaa67c243"
            }
        },
        response: {
            status: 204
        }
    }]
});

const accountOperations = account.api('/operations');
accountOperations.get({
    title: 'Get operations from a given bank account',
    handler: accountsControllers.getOperations,
    examples: [{
        request: {
            urlParameters: {
                accountId: "82dc9d2e991e42f699b89440a84cd981"
            }
        },
        response: {
            status: 200,
            body: {
                data: {
                    operations: [{
                        bankAccount: "102test101491",
                        type: "type.deposit",
                        title: "Croisement CB",
                        raw: "Courses chez Croisement",
                        date: "2017-04-12T00:00:00.000Z",
                        dateImport: "2017-07-27T13:30:59.000Z",
                        amount: -30.2,
                        id: "ddac9a0451894576803422979c2358ad"
                    }]
                }
            }
        }
    }]
});

const accountFetchOperations = account.api('/fetch/operations');
accountFetchOperations.get({
    title: 'Get updated list of operations from a given bank account',
    handler: accountsControllers.fetchOperations,
    examples: [{
        request: {
            urlParameters: {
                accountId: "82dc9d2e991e42f699b89440a84cd981"
            }
        },
        response: {
            status: 200,
            body: {
                data: {
                    operations: [{
                        bankAccount: "102test101491",
                        type: "type.deposit",
                        title: "Croisement CB",
                        raw: "Courses chez Croisement",
                        date: "2017-04-12T00:00:00.000Z",
                        dateImport: "2017-07-27T13:30:59.000Z",
                        amount: -30.2,
                        id: "ddac9a0451894576803422979c2358ad"
                    }]
                }
            }
        }
    }]
});

const accountResyncBalanceAPI = account.api('/resync-balance');
accountResyncBalanceAPI.get({
    title: 'Resync balance of a given account',
    handler: accountsControllers.resyncBalance,
    description: 'TODO'
    // TODO: Examples
});

export const paramsRoutes = {
    accountId: accountsControllers.preloadAccount
}

export default accounts;
