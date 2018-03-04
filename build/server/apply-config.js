'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ospath = require('ospath');

var _ospath2 = _interopRequireDefault(_ospath);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = (0, _helpers.makeLogger)('apply-config');

function toBool(x) {
    return typeof x === 'string' ? x !== 'false' : !!x;
}

module.exports = function prepareProcessKresus(standalone, config) {
    process.kresus = {};

    process.kresus.standalone = standalone;

    // In cozy mode, don't set a default value, causing cwd to be used.
    var dataDir = process.env.KRESUS_DIR || config && config.kresus && config.kresus.datadir;
    if (!dataDir && standalone) dataDir = _path2.default.join(_ospath2.default.home(), '.kresus');
    process.kresus.dataDir = dataDir;

    process.kresus.port = process.env.PORT || config && config.kresus && config.kresus.port || 9876;

    process.kresus.host = process.env.HOST || config && config.kresus && config.kresus.host || '127.0.0.1';

    process.kresus.pythonExec = process.env.KRESUS_PYTHON_EXEC || config && config.kresus && config.kresus.python_exec || 'python2';

    // In cozy mode, set the prefix url to the default path allocated by cozy.
    var urlPrefix = process.env.KRESUS_URL_PREFIX || config && config.kresus && config.kresus.url_prefix || (standalone ? '' : '/apps/kresus');
    process.kresus.urlPrefix = _path2.default.posix.resolve('/', urlPrefix);

    process.kresus.weboobDir = process.env.KRESUS_WEBOOB_DIR || config && config.weboob && config.weboob.srcdir;

    process.kresus.weboobSourcesList = process.env.KRESUS_WEBOOB_SOURCES_LIST || config && config.weboob && config.weboob.sources_list;

    process.kresus.emailFrom = process.env.KRESUS_EMAIL_FROM || config && config.email && config.email.from || '';

    process.kresus.smtpHost = process.env.KRESUS_EMAIL_HOST || config && config.email && config.email.host || null;

    var smtpPort = process.env.KRESUS_EMAIL_PORT || config && config.email && config.email.port || null;
    process.kresus.smtpPort = +smtpPort;

    process.kresus.smtpUser = process.env.KRESUS_EMAIL_USER || config && config.email && config.email.user || null;

    process.kresus.smtpPassword = process.env.KRESUS_EMAIL_PASSWORD || config && config.email && config.email.password || null;

    var smtpForceTLS = false;
    if (typeof process.env.KRESUS_EMAIL_FORCE_TLS !== 'undefined') {
        smtpForceTLS = process.env.KRESUS_EMAIL_FORCE_TLS;
    } else if (config && config.email && typeof config.email.force_tls !== 'undefined') {
        smtpForceTLS = config.email.force_tls;
    }
    process.kresus.smtpForceTLS = toBool(smtpForceTLS);

    var smtpRejectUnauthorizedTLS = false;
    if (typeof process.env.KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS !== 'undefined') {
        smtpRejectUnauthorizedTLS = process.env.KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS;
    } else if (config && config.email && typeof config.email.reject_unauthorized_tls !== 'undefined') {
        smtpRejectUnauthorizedTLS = config.email.reject_unauthorized_tls;
    }
    process.kresus.smtpRejectUnauthorizedTLS = toBool(smtpRejectUnauthorizedTLS);

    var displayedPassword = process.kresus.smtpPassword === null ? null : '(hidden)';

    var mode = standalone ? 'standalone' : 'cozy';
    log.info('Running Kresus in ' + mode + ' mode, with the following parameters:\n- KRESUS_DIR = ' + process.kresus.dataDir + '\n- HOST = ' + process.kresus.host + '\n- PORT = ' + process.kresus.port + '\n- KRESUS_PYTHON_EXEC = ' + process.kresus.pythonExec + '\n- KRESUS_URL_PREFIX = ' + process.kresus.urlPrefix + '\n- KRESUS_WEBOOB_DIR = ' + process.kresus.weboobDir + '\n- KRESUS_WEBOOB_SOURCES_LIST = ' + process.kresus.weboobSourcesList + '\n- KRESUS_EMAIL_FROM = ' + process.kresus.emailFrom + '\n- KRESUS_EMAIL_HOST = ' + process.kresus.smtpHost + '\n- KRESUS_EMAIL_PORT = ' + process.kresus.smtpPort + '\n- KRESUS_EMAIL_USER = ' + process.kresus.smtpUser + '\n- KRESUS_EMAIL_PASSWORD = ' + displayedPassword + '\n- KRESUS_EMAIL_FORCE_TLS = ' + process.kresus.smtpForceTLS + '\n- KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS = ' + process.kresus.smtpRejectUnauthorizedTLS + '\n');
};