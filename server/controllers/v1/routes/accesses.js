/**
 * Accesses API endpoints
 */
import selfapi from 'selfapi';

import * as accessesControllers from '../accesses';

const accesses = selfapi({
    title: 'Accesses',
    description: 'Accesses are pairs of credentials to access bank websites. An access gives access to a given bank, and to potentially multiple bank accounts.'
});

accesses.post({
    title: 'Create a new access',
    handler: accessesControllers.create,
    examples: [{
        request: {
            body: {
                bank: "fakebank1",
                login: "test",
                password: "test",
                customFields: "[]"
            }
        },
        response: {
            status: 201,
            body: {
                data: {
                    id: "932ae946e93041f6aad9a9461de9ce4c"
                }
            }
        }
    }]
});

const access = accesses.api('/:accessId');
access.put({
    title: 'Edit a given access',
    handler: accessesControllers.update,
    examples: [{
        request: {
            urlParameters: {
                accessId: "932ae946e93041f6aad9a9461de9ce4c"
            },
            body: {
                password: "tes"
            }
        },
        response: {
            status: 200,
            body: {
                data: {
                    id: "932ae946e93041f6aad9a9461de9ce4c"
                }
            }
        }
    }]
});
access.delete({
    title: 'Delete a given access',
    handler: accessesControllers.destroy,
    examples: [{
        request: {
            urlParameters: {
                accessId: "932ae946e93041f6aad9a9461de9ce4c"
            }
        },
        response: {
            status: 204
        }
    }]
});

const accessAccounts = access.api('/accounts');
accessAccounts.get({
    title: 'Get the accounts associated with a given access',
    handler: accessesControllers.getAccounts,
    examples: [{
        request: {
            urlParameters: {
                accessId: "932ae946e93041f6aad9a9461de9ce4c"
            }
        },
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

const accessOperations = access.api('/operations');
accessOperations.get({
    title: 'Get the operations associated with a given access',
    handler: accessesControllers.getOperations,
    examples: [{
        request: {
            urlParameters: {
                accessId: "932ae946e93041f6aad9a9461de9ce4c"
            }
        },
        response: {
            status: 200,
            body: {
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

const accessFetchAPI = access.api('/fetch');
// TODO: We should not fetch two times when calling /accounts and then /operations
const accessFetchAccountsAPI = accessFetchAPI.api('/accounts');
accessFetchAccountsAPI.get({
    title: 'Update and list all the available accounts',
    handler: accessesControllers.fetchAccounts,
    examples: [{
        request: {
            urlParameters: {
                accessId: "932ae946e93041f6aad9a9461de9ce4c"
            }
        },
        response: {
            status: 200,
            body: {
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
const accessFetchOperationsAPI = accessFetchAPI.api('/operations');
accessFetchOperationsAPI.get({
    title: 'Update and list all the available operations',
    handler: accessesControllers.fetchOperations,
    examples: [{
        request: {
            urlParameters: {
                accessId: "932ae946e93041f6aad9a9461de9ce4c"
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

export const paramsRoutes = {
    accessId: accessesControllers.preloadAccess
}

export default accesses
