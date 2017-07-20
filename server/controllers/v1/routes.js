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

    // Initialization
    const initializationAPI = v1API.api({
        title: 'Initialization'
    });

    // TODO
    const allAPI = initializationAPI.api('/all');
    allAPI.get({
        handler: allControllers.all
    });
    allAPI.post({
        handler: allControllers.import_
    });

    const allExportAPI = allAPI.api('/export');
    allExportAPI.post({
        handler: allControllers.export_
    });

    // Accesses
    const accesses = v1API.api('/accesses', {
        title: 'Accesses',
        description: 'Accesses are pairs of credentials to access bank websites. An access gives access to a given bank, and to potentially multiple bank accounts.'
    });
    accesses.post({
        title: 'Create a new access',
        handler: accessesControllers.create
    });

    const access = accesses.api('/:accessId');
    access.put({
        title: 'Edit a given access',
        handler: accessesControllers.update
    });
    access.delete({
        title: 'Delete a given access',
        handler: accessesControllers.destroy
    });

    const accessAccounts = access.api('/accounts');
    accessAccounts.get({
        title: 'Get the accounts associated with a given access',
        handler: accessesControllers.getAccounts
    });

    const accessesPoll = accesses.api('/poll');
    accessesPoll.get({
        handler: accessesControllers.poll
    });

    // TODO
    const accessFetchAPI = access.api('/fetch');
    const accessFetchOperationsAPI = accessFetchAPI.api('/operations');
    accessFetchOperationsAPI.get({
        handler: accessesControllers.fetchOperations
    });
    const accessFetchAccountsAPI = accessFetchAPI.api('/accounts');
    accessFetchAccountsAPI.get({
        handler: accessesControllers.fetchAccounts
    });

    // Accounts
    const accounts = v1API.api('/accounts', {
        title: 'Bank accounts'
    });
    accounts.get({
        title: 'List all bank accounts',
        handler: (request, reponse) => {
            // TODO
        }
    });

    const account = accounts.api(':accountId');
    account.get({
        title: 'Get a given bank account',
        handler: (request, reponse) => {
            // TODO
        }
    });
    account.delete({
        title: 'Delete a given bank account',
        handler: accountsControllers.destroy
    });

    const accountOperations = account.api('/operations');
    accountOperations.get({
        title: 'Get operations from a given bank account',
        handler: accountsControllers.getOperations
    });

    // TODO
    const accountResyncBalanceAPI = account.api('/resync-balance');
    accountResyncBalanceAPI.get({
        handler: accountsControllers.resyncBalance
    });

    // Categories
    const categories = v1API.api('/categories', {
        title: 'Categories'
    });
    categories.get({
        title: 'List all categories',
        handler: (request, reponse) => {
            // TODO
        }
    });
    categories.post({
        title: 'Create a new category',
        handler: categoriesControllers.create
    });

    const category = categories.api('/:categoryId');
    category.get({
        title: 'Get a given category',
        handler: (request, response) => {
            // TODO
        }
    });
    category.put({
        title: 'Edit a given category',
        handler: categoriesControllers.update
    });
    category.delete({
        title: 'Delete a given category',
        handler: categoriesControllers.destroy
    });

    // Operations
    const operations = v1API.api('/operations', {
        title: 'Operations'
    });
    operations.get({
        title: 'List all operations',
        handler: (request, reponse) => {
            // TODO
        }
    });
    operations.post({
        title: 'Create a new operation',
        handler: operationsControllers.create
    });

    const operation = operations.api('/:operationId');
    operation.get({
        title: 'Get a given operation',
        handler: (request, reponse) => {
            // TODO
        }
    });
    operation.put({
        title: 'Edit a given operation',
        handler: operationsControllers.update
    });
    operation.delete({
        title: 'Delete a given operation',
        handler: operationsControllers.destroy
    });

    // TODO
    const operationMergeWithAPI = operation.api('/mergeWith/:otherOperationId');
    operationMergeWithAPI.put({
        handler: operationsControllers.merge
    });

    // TODO
    const operationFileAPI = operation.api('/:file');
    operationFileAPI.get({
        handler: operationsControllers.file
    });

    // Settings
    const settings = v1API.api('/settings', {
        title: 'Settings'
    });
    settings.post({
        title: 'Update stored Kresus settings',
        handler: settingsControllers.save
    });

    // Weboob
    const weboob = v1API.api('/weboob', {
        title: 'Weboob management'
    });
    const weboobUpdate = weboob.api('/actions');
    weboob.post({
        title: 'Run some command on the Weboob daemon',
        handler: settingsControllers.updateWeboob
    });

    // Alerts
    const alerts = v1API.api('/alerts', {
        title: 'Alerts'
    });
    alerts.get({
        title: 'List all alerts',
        handler: (request, reponse) => {
            // TODO
        }
    });
    alerts.post({
        title: 'Create a new alert on your bank accounts',
        handler: alertsControllers.create
    });

    const alert = alerts.api('/:alertId');
    alert.get({
        title: 'Get a given alert',
        handler: (request, reponse) => {
            // TODO
        }
    });
    alert.put({
        title: 'Edit a given alert on your bank accounts',
        handler: alertsControllers.update
    });
    alert.delete({
        title: 'Delete a given alert on your bank accounts',
        handler: alertsControllers.destroy
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
        handler: settingsControllers.testEmail
    });

    // API reference
    const referenceAPI = v1API.api('/reference', {
        title: 'API reference'
    });
    referenceAPI.get({
        title: 'Get the API documentation',
        handler: (request, response) => {
            response.send(v1API.toHTML());
        }
    });

    // Binding on URL parameters
    app.param('accessId', accessesControllers.preloadAccess);
    app.param('accountId', accountsControllers.preloadAccount);
    app.param('alertId', alertsControllers.loadAlert);
    app.param('categoryId', categoriesControllers.preloadCategory);
    app.param('operationId', operationsControllers.preloadOperation);
    app.param('otherOperationId', operationsControllers.preloadOtherOperation);

    return v1API;
}
