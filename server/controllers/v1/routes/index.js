import selfapi from 'selfapi';

// Import API endpoints definitions
import accessesAPI, { paramsRoutes as accessesParamsRoutes } from './accesses';
import accountsAPI, { paramsRoutes as accountsParamsRoutes } from './accounts';
import alertsAPI, { paramsRoutes as alertsParamsRoutes } from './alerts';
import categoriesAPI, { paramsRoutes as categoriesParamsRoutes } from './categories';
import initializationAPI from './initialization';
import operationsAPI, { paramsRoutes as operationsParamsRoutes } from './operations';
import referenceAPI from './reference';
import settingsAPI from './settings';
import testsAPI from './tests';
import weboobAPI from './weboob';

import { JSON_SPACES } from '../../../index';

export const API_PREFIX = '/api/v1';

// TODO: Error codes

selfapi.options.jsonStringifySpaces = JSON_SPACES;

// Create API
export const api = selfapi({
    title: 'Kresus API v1',
    description: `This is the documentation for the Kresus API, v1.

Note that whenever a \`PUT\` request is used to update values, the sent object is merged with the existing one. Then, you do not need to send the whole object at every time, but only the updated fields.`
});

api.api('/', initializationAPI);
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
        // FIXME: Use full URLs instead of relative ones
        // FIXME: Remove "null" route
        response.json(api.toAPIIndex(), null, 2);
    },
    examples: [{
        response: {
            status: 200,
            body: api.toAPIIndex()
        }
    }]
});

// FIXME: Can we just ignore this and do the stuff in server/index.js?
export default function mountAPI(app) {
    // Binding on URL parameters
    const paramsRoutes = Object.assign(
        {},
        accessesParamsRoutes, accountsParamsRoutes, alertsParamsRoutes,
        categoriesParamsRoutes, operationsParamsRoutes
    );
    for (let paramRoute of Object.keys(paramsRoutes)) {
        app.param(paramRoute, paramsRoutes[paramRoute]);
    }

    // Mount the API to the app
    selfapi(app, API_PREFIX, api);
}
