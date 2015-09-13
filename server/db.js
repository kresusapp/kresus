let isStandalone = typeof process.kresus.standalone !== 'undefined' &&
                   !!process.kresus.standalone;
export let name = isStandalone ? 'cozy-db-pouchdb' : 'cozydb';

export let module = require(name);
