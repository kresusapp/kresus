import * as accessesControllers from '../accesses';
import * as accountsControllers from '../accounts';
import * as operationsControllers from '../operations';
import * as alertsControllers from '../alerts';
import * as categoriesControllers from '../categories';
import * as settingsControllers from '../settings';
import * as allControllers from '../all';

// Note: We need to put routes definitions in a separate file to be able to
// import them and run tests without having to spawn the whole controllers
// ecosysem.
import routesDefinitions from './definitions';

/**
 * Route builder for the v1 API
 */
export default function (app) {
    const controllers = {
        accesses: accessesControllers,
        accounts: accountsControllers,
        operations: operationsControllers,
        alerts: alertsControllers,
        categories: categoriesControllers,
        settings: settingsControllers,
        all: allControllers
    };
    return routesDefinitions(app, controllers);
}
