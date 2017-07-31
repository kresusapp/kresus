import selfapi from 'selfapi';

import * as accessesControllers from './accesses';
import * as accountsControllers from './accounts';
import * as operationsControllers from './operations';
import * as alertsControllers from './alerts';
import * as categoriesControllers from './categories';
import * as settingsControllers from './settings';
import * as allControllers from './all';

export default function (app) {
    const v1API = selfapi(app, 'api/v1', 'Kresus API v1');
    v1API.description = `This is the documentation for the Kresus API, v1.

Note that whenever a \`PUT\` request is used to update values, the sent object is merged with the existing one. Then, you do not need to send the whole object at every time, but only the updated fields.`

    // Initialization
    const initializationAPI = v1API.api({
        title: 'Initialization',
        description: `These routes are dedicated to interacting with as much data as possible in the Kresus.

Important: These routes will likely be refactored in an upcoming version and soon be deprecated.`
    });

    // All
    const allAPI = initializationAPI.api('/all');
    allAPI.get({
        title: 'Get all the available data from the Kresus',
        handler: allControllers.all
    });
    allAPI.post({
        title: 'Import data in the Kresus',
        handler: allControllers.import_
    });

    const allExportAPI = allAPI.api('/export');
    allExportAPI.post({
        title: 'Export everything from the Kresus',
        handler: allControllers.export_
    });

    // Accesses
    const accesses = v1API.api('/accesses', {
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
                    password:"tes"
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
                status: 200
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
        handler: (request, response) => {
            // TODO
        },
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

    // Accounts
    const accounts = v1API.api('/accounts', {
        title: 'Bank accounts'
    });
    accounts.get({
        title: 'List all bank accounts',
        handler: (request, reponse) => {
            // TODO
        },
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
        handler: (request, reponse) => {
            // TODO
        },
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
        handler: (request, response) => {
            // TODO
        },
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

    // Categories
    const categories = v1API.api('/categories', {
        title: 'Categories'
    });
    categories.get({
        title: 'List all categories',
        handler: (request, reponse) => {
            // TODO
        },
        examples: [{
            response: {
                status: 200,
                body: {
                    data: {
                        categories: [{
                            title: "toto",
                            color: "#fd3b2f",
                            threshold: 0,
                            id: "f04ea1953b6a4959aff2161325a722b4"
                        }]
                    }
                }
            }
        }]
    });
    categories.post({
        title: 'Create a new category',
        handler: categoriesControllers.create,
        examples: [{
            request: {
                body: {
                    title: "foobar",
                    color: "#a31c70"
                }
            },
            response: {
                status: 201,
                body: {
                    data: {
                        id: "d7d50ad4bca04545809ebaa466b44028"
                    }
                }
            }
        }]
    });

    const category = categories.api('/:categoryId');
    category.get({
        title: 'Get a given category',
        handler: (request, response) => {
            // TODO
        },
        examples: [{
            request: {
                urlParameters: {
                    categoryId: "d7d50ad4bca04545809ebaa466b44028"
                }
            },
            response: {
                status: 200,
                body: {
                    data: {
                        category: {
                            title: "foobar",
                            color: "#a31c70",
                            threshold: 0,
                            id: "d7d50ad4bca04545809ebaa466b44028"
                        }
                    }
                }
            }
        }]
    });
    category.put({
        title: 'Edit a given category',
        handler: categoriesControllers.update,
        examples: [{
            request: {
                body: {
                    title: "foobar2"
                },
                urlParameters: {
                    categoryId: "d7d50ad4bca04545809ebaa466b44028"
                }
            },
            response: {
                status: 200,
                body: {
                    data: {
                        id: "d7d50ad4bca04545809ebaa466b44028"
                    }
                }
            }
        }]
    });
    category.delete({
        title: 'Delete a given category',
        handler: categoriesControllers.destroy,
        examples: [{
            request: {
                urlParameters: {
                    categoryId: "d7d50ad4bca04545809ebaa466b44028"
                }
            },
            response: {
                status: 204
            }
        }]
    });

    // Operations
    const operations = v1API.api('/operations', {
        title: 'Operations'
    });
    operations.get({
        title: 'List all operations',
        handler: (request, reponse) => {
            // TODO
        },
        examples: [{
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
    operations.post({
        title: 'Create a new operation',
        handler: operationsControllers.create,
        examples: [{
            request: {
                body: {
                    date: "2017-07-27T00:00:00.000Z",
                    title: "I lose money",
                    amount: -30,
                    categoryId: "-1",
                    type: "type.card",
                    bankAccount: "102test101491"
                }
            },
            response: {
                status: 201,
                body: {
                    data: {
                        id: "c38fc2d60d254e7d8331f87f342d907a"
                    }
                }
            }
        }]
    });

    const operation = operations.api('/:operationId');
    operation.get({
        title: 'Get a given operation',
        handler: (request, reponse) => {
            // TODO
        },
        examples: [{
            request: {
                urlParameters: {
                    operationId: "ddac9a0451894576803422979c2358ad"
                }
            },
            response: {
                status: 200,
                body: {
                    data: {
                        operation: {
                            bankAccount: "102test101491",
                            type: "type.deposit",
                            title: "Croisement CB",
                            raw: "Courses chez Croisement",
                            date: "2017-04-12T00:00:00.000Z",
                            dateImport: "2017-07-27T13:30:59.000Z",
                            amount: -30.2,
                            id: "ddac9a0451894576803422979c2358ad"
                        }
                    }
                }
            }
        }]
    });
    operation.put({
        title: 'Edit a given operation',
        handler: operationsControllers.update,
        examples: [{
            request: {
                urlParameters: {
                    operationId: "c38fc2d60d254e7d8331f87f342d907a"
                },
                body: {
                    title: "I win money",
                    amount: 30
                }
            },
            response: {
                status: 201,
                body: {
                    data: {
                        id: "c38fc2d60d254e7d8331f87f342d907a"
                    }
                }
            }
        }]
    });
    operation.delete({
        title: 'Delete a given operation',
        handler: operationsControllers.destroy,
        examples: [{
            request: {
                urlParameters: {
                    operationId: "ddac9a0451894576803422979c2358ad"
                }
            },
            response: {
                status: 204
            }
        }]
    });

    const operationMergeWithAPI = operation.api('/mergeWith/:otherOperationId');
    operationMergeWithAPI.put({
        title: 'Merge two operations together',
        handler: operationsControllers.merge,
        examples: [{
            request: {
                urlParameters: {
                    operationId: "ddac9a0451894576803422979c2358ad",
                    otherOperationId: "c38fc2d60d254e7d8331f87f342d907a"
                }
            },
            response: {
                status: 200,
                body: {
                    data: {
                        id: "ddac9a0451894576803422979c2358ad"
                    }
                }
            }
        }]
    });

    const operationFileAPI = operation.api('/:file');
    operationFileAPI.get({
        title: 'TODO',
        handler: operationsControllers.file
    });

    // Settings
    const settings = v1API.api('/settings', {
        title: 'Settings'
    });
    settings.get({
        title: 'Get stored Kresus settings',
        handler: (request, response) => {
            // TODO
        },
        examples: [{
            response: {
                status: 200,
                body: {
                    data: {
                        settings: [
                            {
                                name: "weboob-auto-merge-accounts",
                                value: true
                            }
                        ]
                    }
                }
            }
        }]
    });
    settings.put({
        title: 'Update stored Kresus settings',
        handler: settingsControllers.save,
        examples: [{
            request: {
                body: {
                    "weboob-auto-merge-accounts": false
                }
            },
            response: {
                status: 200,
                body: {
                    data: {
                        settings: [
                            {
                                name: "weboob-auto-merge-accounts",
                                value: false
                            }
                        ]
                    }
                }
            }
        }]
    });

    // Weboob
    const weboob = v1API.api('/weboob', {
        title: 'Weboob management'
    });
    const weboobUpdate = weboob.api('/actions');
    weboob.post({
        title: 'Run some command on the Weboob daemon',
        handler: settingsControllers.updateWeboob,
        examples: [{
            request: {
                body: {
                    action: 'update'
                }
            },
            response: {
                status: 200,
                body: {
                    data: {
                        status: "OK"
                    }
                }
            }
        }]
    });

    // Alerts
    const alerts = v1API.api('/alerts', {
        title: 'Alerts'
    });
    alerts.get({
        title: 'List all alerts',
        handler: (request, reponse) => {
            // TODO
        },
        examples: [{
            response: {
                status: 200,
                body: {
                    data: {
                        alerts: [
                            {
                                bankAccount: "102test101494",
                                type: "balance",
                                limit: 100,
                                order: "gt",
                                id: "bb90aae4d61e4fdd9c2cee8190e1ba4b"
                            }
                        ]
                    }
                }
            }
        }]
    });
    alerts.post({
        title: 'Create a new alert on your bank accounts',
        handler: alertsControllers.create,
        examples: [{
            request: {
                body: {
                    type: "balance",
                    limit: 200,
                    order: "lt",
                    bankAccount: "102test101491"
                }
            },
            response: {
                status: 201,
                body: {
                    data: {
                        id: "93d99bfaa2284e889c4a17ebc6d5498a"
                    }
                }
            }
        }]
    });

    const alert = alerts.api('/:alertId');
    alert.get({
        title: 'Get a given alert',
        handler: (request, reponse) => {
            // TODO
        },
        examples: [{
            request: {
                urlParameters: {
                    alertId: "bb90aae4d61e4fdd9c2cee8190e1ba4b"
                }
            },
            response: {
                status: 200,
                body: {
                    data: {
                        alert: {
                            bankAccount: "102test101494",
                            type: "balance",
                            limit: 100,
                            order: "gt",
                            id: "bb90aae4d61e4fdd9c2cee8190e1ba4b"
                        }
                    }
                }
            }
        }]
    });
    alert.put({
        title: 'Edit a given alert on your bank accounts',
        handler: alertsControllers.update,
        examples: [{
            request: {
                urlParameters: {
                    alertId: "bb90aae4d61e4fdd9c2cee8190e1ba4b"
                },
                body: {
                    limit: 150
                }
            },
            response: {
                status: 200,
                body: {
                    data: {
                        id: "bb90aae4d61e4fdd9c2cee8190e1ba4b"
                    }
                }
            }
        }]
    });
    alert.delete({
        title: 'Delete a given alert on your bank accounts',
        handler: alertsControllers.destroy,
        examples: [{
            request: {
                urlParameters: {
                    alertId: "bb90aae4d61e4fdd9c2cee8190e1ba4b"
                }
            },
            response: {
                status: 204
            }
        }]
    });

    // Tests
    const tests = v1API.api('/tests', {
        title: 'Tests'
    });
    // TODO
    const testSendMail = tests.api('/send-email');
    testSendMail.post({
        title: 'Test email sending',
        description: 'Check that the Kresus instance can send email',
        handler: settingsControllers.testEmail,
        examples: [{
            request: {
                body: {
                    config: {
                        fromEmail: "kresus@example.com",
                        toEmail: "myself@example.com",
                        host: "localhost",
                        port: "587",
                        secure: true,
                        auth: {
                            user: "some_login",
                            pass: "123456"
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    }
                }
            },
            response: {
                status: 200,
                body: {
                    data: {
                        status: 'OK'
                    }
                }
            }
        }]
    });

    // API reference
    const referenceAPI = v1API.api('/reference', {
        title: 'API reference'
    });
    referenceAPI.get({
        title: 'Get the API documentation',
        handler: (request, response) => {
            var html = `
<!doctype html>
<html lang="en">
<head><link href="https://janitor.technology/css/bootstrap.min.css" rel="stylesheet"><link rel="stylesheet" type="text/css" href="https://janitor.technology/css/janitor.css"></head>
<body><section class="reference"><div class="container">
`;
            html += v1API.toHTML();
            html += '</div></section></body></html>';
            response.send(html);
        }
    });

    // Binding on URL parameters
    app.param('accessId', accessesControllers.preloadAccess);
    app.param('accountId', accountsControllers.preloadAccount);
    app.param('alertId', alertsControllers.loadAlert);
    app.param('categoryId', categoriesControllers.preloadCategory);
    app.param('operationId', operationsControllers.preloadOperation);
    app.param('otherOperationId', operationsControllers.preloadOtherOperation);

    // Automatically build index routes
    v1API.get({
        title: 'Get API index',
        handler: (request, response) => {
            response.json(v1API.toAPIIndex(), null, 2);
        },
        examples: [{
            response: {
                status: 200,
                body: v1API.toAPIIndex()
            }
        }]
    });

    return v1API;
}
