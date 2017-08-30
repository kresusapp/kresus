import path from 'path';
import ospath from 'ospath';

import { makeLogger } from './helpers';

let log = makeLogger('apply-config');

module.exports = function prepareProcessKresus(standalone, config) {
    process.kresus = {};

    process.kresus.standalone = standalone;

    // In cozy mode, don't set a default value, causing cwd to be used.
    let dataDir = process.env.KRESUS_DIR ||
                  (config && config.kresus && config.kresus.datadir);
    if (!dataDir && standalone)
        dataDir = path.join(ospath.home(), '.kresus');
    process.kresus.dataDir = dataDir;

    process.kresus.port = process.env.PORT ||
                          (config && config.kresus && config.kresus.port) ||
                          9876;

    process.kresus.host = process.env.HOST ||
                          (config && config.kresus && config.kresus.host) ||
                          '127.0.0.1';

    process.kresus.pythonExec = process.env.KRESUS_PYTHON_EXEC ||
                                (config && config.weboob.python_exec) ||
                                'python2';

    // In cozy mode, set the prefix url to the default path allocated by cozy.
    let urlPrefix = process.env.KRESUS_URL_PREFIX ||
                    (config && config.kresus && config.kresus.url_prefix) ||
                    (standalone ? '' : '/apps/kresus');
    process.kresus.urlPrefix = path.posix.resolve('/', urlPrefix);

    process.kresus.weboobDir = process.env.KRESUS_WEBOOB_DIR ||
                               (config && config.weboob && config.weboob.srcdir);

    process.kresus.weboobSourcesList = process.env.KRESUS_WEBOOB_SOURCES_LIST ||
                                       (config && config.weboob && config.weboob.sources_list);

    let mode = standalone ? 'standalone' : 'cozy';
    log.info(`Running Kresus in ${mode} mode, with the following parameters:
- KRESUS_DIR = ${process.kresus.dataDir}
- HOST = ${process.kresus.host}
- PORT = ${process.kresus.port}
- KRESUS_PYTHON_EXEC = ${process.kresus.pythonExec}
- KRESUS_URL_PREFIX = ${process.kresus.urlPrefix}
- KRESUS_WEBOOB_DIR = ${process.kresus.weboobDir}
- KRESUS_WEBOOB_SOURCES_LIST = ${process.kresus.weboobSourcesList}
`);
};
