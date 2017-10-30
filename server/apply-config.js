import path from 'path';
import ospath from 'ospath';

import { makeLogger } from './helpers';

let log = makeLogger('apply-config');

function toBool(x) {
    return typeof x === 'string' ? x !== 'false' : !!x;
}

module.exports = function prepareProcessKresus(standalone, config) {
    process.kresus = {};

    process.kresus.standalone = standalone;

    // In cozy mode, don't set a default value, causing cwd to be used.
    let dataDir = process.env.KRESUS_DIR || (config && config.kresus && config.kresus.datadir);
    if (!dataDir && standalone) dataDir = path.join(ospath.home(), '.kresus');
    process.kresus.dataDir = dataDir;

    process.kresus.port =
        process.env.PORT || (config && config.kresus && config.kresus.port) || 9876;

    process.kresus.host =
        process.env.HOST || (config && config.kresus && config.kresus.host) || '127.0.0.1';

    process.kresus.pythonExec =
        process.env.KRESUS_PYTHON_EXEC || (config && config.kresus && config.kresus.python_exec) || 'python2';

    // In cozy mode, set the prefix url to the default path allocated by cozy.
    let urlPrefix =
        process.env.KRESUS_URL_PREFIX ||
        (config && config.kresus && config.kresus.url_prefix) ||
        (standalone ? '' : '/apps/kresus');
    process.kresus.urlPrefix = path.posix.resolve('/', urlPrefix);

    process.kresus.weboobDir =
        process.env.KRESUS_WEBOOB_DIR || (config && config.weboob && config.weboob.srcdir);

    process.kresus.weboobSourcesList =
        process.env.KRESUS_WEBOOB_SOURCES_LIST ||
        (config && config.weboob && config.weboob.sources_list);

    process.kresus.emailTransport =
        process.env.KRESUS_EMAIL_TRANSPORT ||
        (config && config.email && config.email.transport) ||
        '';

    process.kresus.emailSendmailBin =
        process.env.KRESUS_EMAIL_SENDMAIL_BIN ||
        (config && config.email && config.email.sendmail_bin) ||
        '';

    process.kresus.emailFrom =
        process.env.KRESUS_EMAIL_FROM || (config && config.email && config.email.from) || '';

    process.kresus.smtpHost =
        process.env.KRESUS_EMAIL_HOST || (config && config.email && config.email.host) || null;

    let smtpPort =
        process.env.KRESUS_EMAIL_PORT || (config && config.email && config.email.port) || null;
    process.kresus.smtpPort = +smtpPort;

    process.kresus.smtpUser =
        process.env.KRESUS_EMAIL_USER || (config && config.email && config.email.user) || null;

    process.kresus.smtpPassword =
        process.env.KRESUS_EMAIL_PASSWORD ||
        (config && config.email && config.email.password) ||
        null;

    let smtpForceTLS = false;
    if (typeof process.env.KRESUS_EMAIL_FORCE_TLS !== 'undefined') {
        smtpForceTLS = process.env.KRESUS_EMAIL_FORCE_TLS;
    } else if (config && config.email && typeof config.email.force_tls !== 'undefined') {
        smtpForceTLS = config.email.force_tls;
    }
    process.kresus.smtpForceTLS = toBool(smtpForceTLS);

    let smtpRejectUnauthorizedTLS = false;
    if (typeof process.env.KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS !== 'undefined') {
        smtpRejectUnauthorizedTLS = process.env.KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS;
    } else if (
        config &&
        config.email &&
        typeof config.email.reject_unauthorized_tls !== 'undefined'
    ) {
        smtpRejectUnauthorizedTLS = config.email.reject_unauthorized_tls;
    }
    process.kresus.smtpRejectUnauthorizedTLS = toBool(smtpRejectUnauthorizedTLS);

    let displayedPassword = process.kresus.smtpPassword === null ? null : '(hidden)';

    let mode = standalone ? 'standalone' : 'cozy';
    log.info(`Running Kresus in ${mode} mode, with the following parameters:
- KRESUS_DIR = ${process.kresus.dataDir}
- HOST = ${process.kresus.host}
- PORT = ${process.kresus.port}
- KRESUS_PYTHON_EXEC = ${process.kresus.pythonExec}
- KRESUS_URL_PREFIX = ${process.kresus.urlPrefix}
- KRESUS_WEBOOB_DIR = ${process.kresus.weboobDir}
- KRESUS_WEBOOB_SOURCES_LIST = ${process.kresus.weboobSourcesList}
- KRESUS_EMAIL_TRANSPORT = ${process.kresus.emailTransport}
- KRESUS_EMAIL_SENDMAIL_BIN = ${process.kresus.emailSendmailBin}
- KRESUS_EMAIL_FROM = ${process.kresus.emailFrom}
- KRESUS_EMAIL_HOST = ${process.kresus.smtpHost}
- KRESUS_EMAIL_PORT = ${process.kresus.smtpPort}
- KRESUS_EMAIL_USER = ${process.kresus.smtpUser}
- KRESUS_EMAIL_PASSWORD = ${displayedPassword}
- KRESUS_EMAIL_FORCE_TLS = ${process.kresus.smtpForceTLS}
- KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS = ${process.kresus.smtpRejectUnauthorizedTLS}
`);
};
