/**
 * Initialization endpoints
 */
import selfapi from 'selfapi';

import * as allControllers from '../all';

const initializationAPI = selfapi({
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

export default initializationAPI;
