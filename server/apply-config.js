import path from 'path';
import ospath from 'ospath';

import { makeLogger } from './helpers';

let log = makeLogger('apply-config');

module.exports = function prepareProcessKresus(standalone, config) {
    process.kresus = {};

    process.kresus.standalone = standalone;

    // In cozy mode, don't set a default value, causing cwd to be used.
    let dataDir = process.env.KRESUS_DIR ||
                  (config && config.dataDir);
    if (!dataDir && standalone)
        dataDir = path.join(ospath.home(), '.kresus');
    process.kresus.dataDir = dataDir;

    process.kresus.port = process.env.PORT ||
                          (config && config.port) ||
                          9876;

    process.kresus.host = process.env.HOST ||
                          (config && config.host) ||
                          '127.0.0.1';

    // In cozy mode, set the prefix url to the default path allocated by cozy.
    let urlPrefix = process.env.KRESUS_URL_PREFIX ||
                    (config && config.urlPrefix) ||
                    (standalone ? '' : '/apps/kresus');
    process.kresus.urlPrefix = path.posix.resolve('/', urlPrefix);

    process.kresus.weboobDir = process.env.WEBOOB_DIR ||
                               (config && config.weboobDir);

    process.kresus.execjsRuntime = process.env.EXECJS_RUNTIME ||
                                   (config && config.execjsRuntime) ||
                                   'Node';

    let mode = standalone ? 'standalone' : 'cozy';
    log.info(`Running Kresus in ${mode} mode, with the following parameters:
- KRESUS_DIR = ${process.kresus.dataDir}
- HOST = ${process.kresus.host}
- PORT = ${process.kresus.port}
- URL_PREFIX = ${process.kresus.urlPrefix}
- WEBOOB_DIR = ${process.kresus.weboobDir}
- EXECJS_RUNTIME = ${process.kresus.execjsRuntime}
`);
};
