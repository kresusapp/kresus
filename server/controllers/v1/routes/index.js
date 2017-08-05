import selfapi from 'selfapi';

// Import API endpoints definitions
import accessesAPI, { paramsRoutes as accessesParamsRoutes } from './accesses';
import accountsAPI, { paramsRoutes as accountsParamsRoutes } from './accounts';
import alertsAPI, { paramsRoutes as alertsParamsRoutes } from './alerts';
import categoriesAPI, { paramsRoutes as categoriesParamsRoutes } from './categories';
import operationsAPI, { paramsRoutes as operationsParamsRoutes } from './operations';
import referenceAPI from './reference';
import settingsAPI from './settings';
import testsAPI from './tests';
import weboobAPI from './weboob';

// Create API
export const api = selfapi({
    title: 'Kresus API v1',
    description: `This is the documentation for the Kresus API, v1.

Note that whenever a \`PUT\` request is used to update values, the sent object is merged with the existing one. Then, you do not need to send the whole object at every time, but only the updated fields.`
});

api.api('/accesses', accessesAPI);
api.api('/accounts', accountsAPI);
api.api('/alerts', alertsAPI);
api.api('/categories', categoriesAPI);
api.api('/operations', operationsAPI);
api.api('/reference', referenceAPI);
api.api('/settings', settingsAPI);
api.api('/tests', testsAPI);
api.api('/weboob', weboobAPI);

// Automatically build index routes
api.get({
    title: 'Get API index',
    handler: (request, response) => {
        response.json(api.toAPIIndex(), null, 2);
    },
    examples: [{
        response: {
            status: 200,
            body: api.toAPIIndex()
        }
    }]
});

/*
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
        handler: controllers.all.all
    });
    allAPI.post({
        title: 'Import data in the Kresus',
        handler: controllers.all.import_
    });

    const allExportAPI = allAPI.api('/export');
    allExportAPI.post({
        title: 'Export everything from the Kresus',
        handler: controllers.all.export_
    });
*/

export default function mountAPI(app) {
    // Binding on URL parameters
    // FIXME: We should not have to load all the controllers in this file.
    const paramsRoutes = Object.assign(
        {},
        accessesParamsRoutes, accountsParamsRoutes, alertsParamsRoutes,
        categoriesParamsRoutes, operationsParamsRoutes
    );
    for (let paramRoute of Object.keys(paramsRoutes)) {
        app.param(paramRoute, paramsRoutes[paramRoute]);
    }

    // Mount the API to the app
    selfapi(app, '/api/v1', api);
}
