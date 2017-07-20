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
    const accessesAPI = v1API.api({
        title: 'Accesses'
    });

    app.param('accessId', accessesControllers.preloadAccess);

    const accessesEndpointAPI = accessesAPI.api('/accesses');
    accessesEndpointAPI.post({
        handler: accessesControllers.create
    });

    const accessesPollAPI = accessesEndpointAPI.api('/poll');
    accessesPollAPI.get({
        handler: accessesControllers.poll
    });

    const accessAPI = accessesEndpointAPI.api('/:accessId');
    accessAPI.put({
        handler: accessesControllers.update
    });
    accessAPI.delete({
        handler: accessesControllers.destroy
    });

    const accessGetAccountsAPI = accessAPI.api('/accounts');
    accessGetAccountsAPI.get({
        handler: accessesControllers.getAccounts
    });
    const accessFetchAPI = accessAPI.api('/fetch');

    const accessFetchOperationsAPI = accessFetchAPI.api('/operations');
    accessFetchOperationsAPI.get({
        handler: accessesControllers.fetchOperations
    });
    const accessFetchAccountsAPI = accessFetchAPI.api('/accounts');
    accessFetchAccountsAPI.get({
        handler: accessesControllers.fetchAccounts
    });

    // Accounts
    const accountsAPI = v1API.api({
        title: 'Accounts'
    });

    app.param('accountId', accountsControllers.preloadAccount);

    const accountsEndpointAPI = accountsAPI.api('/accounts');

    const accountAPI = accountsEndpointAPI.api(':accountId');
    accountAPI.delete({
        handler: accountsControllers.destroy
    });

    const accountOperationsAPI = accountAPI.api('/operations');
    accountOperationsAPI.get({
        handler: accountsControllers.getOperations
    });

    const accountResyncBalanceAPI = accountAPI.api('/resync-balance');
    accountResyncBalanceAPI.get({
        handler: accountsControllers.resyncBalance
    });

    // Categories
    const categoriesAPI = v1API.api({
        title: 'Categories'
    });

    const categoriesEndpointAPI = categoriesAPI.api('/categories');
    categoriesEndpointAPI.post({
        handler: categoriesControllers.create
    });

    app.param('categoryId', categoriesControllers.preloadCategory);

    const categoryAPI = categoriesAPI.api('/:categoryId');
    categoryAPI.put({
        handler: categoriesControllers.update
    });
    categoryAPI.delete({
        handler: categoriesControllers.destroy
    });

    // Operations
    const operationsAPI = v1API.api({
        title: 'Operations'
    });

    app.param('operationID', operationsControllers.preloadOperation);

    app.param('otherOperationID', operationsControllers.preloadOtherOperation);

    const operationsEndpointAPI = operationsAPI.api('operations');
    operationsEndpointAPI.post({
        handler: operationsControllers.create
    });

    const operationAPI = operationsEndpointAPI.api('/:operationID');
    operationAPI.put({
        handler: operationsControllers.update
    });
    operationAPI.delete({
        handler: operationsControllers.destroy
    });

    const operationMergeWithAPI = operationAPI.api('/mergeWith/:otherOperationID');
    operationMergeWithAPI.put({
        handler: operationsControllers.merge
    });

    const operationFileAPI = operationAPI.api('/:file');
    operationFileAPI.get({
        handler: operationsControllers.file
    });

    // Settings
    const settings = v1API.api('/settings', {
        title: 'Settings'
    });
    settings.post({
        handler: settingsControllers.save
    });

    const weboobSettings = settings.api('/weboob');
    weboobSettings.put({
        handler: settingsControllers.updateWeboob
    });

    const testEmailSettings = settings.api('/test-email');
    testEmailSettings.post({
        handler: settingsControllers.testEmail
    });

    // Alerts
    const alerts = v1API.api('/alerts', {
        title: 'Alerts'
    });
    alerts.post({
        handler: alertsControllers.create
    });

    const alert = alerts.api('/:alertId');
    alert.put({
        handler: alertsControllers.update
    });
    alert.delete({
        handler: alertsControllers.destroy
    });

    app.param('alertId', alertsControllers.loadAlert);

    // API reference
    const referenceAPI = v1API.api('/reference');
    referenceAPI.get({
        handler: (request, response) => {
            response.send(v1API.toHTML());
        }
    });

    return v1API;
}
