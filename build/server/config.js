"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generate = generate;
exports.apply = apply;

var _path = _interopRequireDefault(require("path"));

var _ospath = _interopRequireDefault(require("ospath"));

var _helpers = require("./helpers");

var _logger = require("./lib/logger.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let log = (0, _helpers.makeLogger)('apply-config');

function toBool(strOrBool) {
  let ret = typeof strOrBool === 'string' ? strOrBool !== 'false' : strOrBool;
  (0, _helpers.assert)(typeof ret === 'boolean');
  return ret;
}

function checkPort(portStr, errorMessage) {
  (0, _helpers.assert)(typeof portStr === 'string');
  (0, _helpers.assert)(typeof errorMessage === 'string');
  let port = Number.parseInt(portStr, 10);

  if (Number.isNaN(port) || port <= 0 || port > 65535) {
    log.error(`Invalid value for port: ${portStr}`);
    throw new Error(errorMessage);
  }

  return port;
}

let OPTIONS = [{
  envName: 'KRESUS_DIR',
  configPath: 'config.kresus.datadir',
  defaultVal: _path.default.join(_ospath.default.home(), '.kresus'),
  processPath: 'dataDir',
  doc: `This is where Kresus stores additional data, as the latest bank
        scrapping modules. It should be writeable by the user which launches
        the Kresus executable.`,
  defaultDoc: 'HOME_DIR/.kresus',
  docExample: '/home/ben/.kresus'
}, {
  envName: 'PORT',
  configPath: 'config.kresus.port',
  defaultVal: '9876',
  processPath: 'port',
  cleanupAction: uncheckedPort => {
    let port = uncheckedPort;

    if (process.env.NODE_ENV === 'development') {
      log.warn('In development mode, forcing port to 9876 for webpack-dev-server.');
      port = 9876;
    } else {
      port = checkPort(port, 'Invalid Kresus port provided.');
    }

    return port;
  },
  doc: `This is the port that Kresus will run on. It is recommended not
        to expose it on port 80 directly but to use a reverse-proxy
        configuration like Nginx, Caddy or Apache.`
}, {
  envName: 'HOST',
  configPath: 'config.kresus.host',
  defaultVal: '127.0.0.1',
  processPath: 'host',
  doc: 'The host on which the Kresus server will listen to.'
}, {
  envName: 'KRESUS_PYTHON_EXEC',
  configPath: 'config.kresus.python_exec',
  defaultVal: 'python2',
  processPath: 'pythonExec',
  doc: `The executable version of Python that is going to get used when
        interacting with Python scripts. This can be python, python2 or
        python3.`
}, {
  envName: 'KRESUS_URL_PREFIX',
  configPath: 'config.kresus.url_prefix',
  defaultVal: '',
  processPath: 'urlPrefix',
  cleanupAction: prefix => _path.default.posix.resolve('/', prefix),
  doc: `The directory prefix in the URL, if Kresus is to be served from a
        subdirectory. For instance, if your website is hosted at example.com
        and the url prefix is "money", then Kresus will be reachable at
        example.com/money. By default, it's '', meaning that Kresus has its own
        subdomain.`,
  docExample: '/money'
}, {
  envName: 'KRESUS_SALT',
  configPath: 'config.kresus.salt',
  defaultVal: null,
  processPath: 'salt',
  cleanupAction: val => {
    if (val !== null && val.length < 16) {
      throw new Error('Please provide a salt value with at least 16 characters.');
    }

    return val;
  },
  doc: `A salt value used in encryption algorithms (used for instance to
            encrypt/decrypt exports). It should be a random string value with
            at least 16 characters if you decide to provide it.`,
  docExample: 'gj4J89fkjf4h29aDi0f{}fu4389sejk`9osk`'
}, {
  envName: 'KRESUS_WEBOOB_DIR',
  configPath: 'config.weboob.srcdir',
  defaultVal: null,
  processPath: 'weboobDir',
  doc: `The directory in which Weboob core is stored. If empty, indicates
        that weboob is already in the PYTHON_PATH (e.g. installed at the global
        level)`,
  docExample: '/home/ben/code/weboob'
}, {
  envName: 'KRESUS_WEBOOB_SOURCES_LIST',
  configPath: 'config.weboob.sources_list',
  defaultVal: null,
  processPath: 'weboobSourcesList',
  doc: `Path to a file containing a valid Weboob's source list directory.
        If empty (the default), indicates that Kresus will generate its own
        source list file and will store it in
        DATA_DIR/weboob-data/sources.list.`,
  docExample: '/home/ben/code/weboob/sources.list'
}, {
  envName: 'KRESUS_EMAIL_TRANSPORT',
  configPath: 'config.email.transport',
  defaultVal: null,
  processPath: 'emailTransport',
  cleanupAction: val => {
    if (val !== null && val !== 'smtp' && val !== 'sendmail') {
      throw new Error('Invalid email transport provided.');
    }

    return val;
  },
  doc: `The transport method you want to use. Can be either:
            * "sendmail": relies on sendmail executable to be available on your
            system and only sendmail-specific parameters are used,

            * "smtp": you should provide proper SMTP credentials to use, in the
            dedicated configuration entries.

            If empty, no emails will be sent by Kresus.`,
  docExample: 'smtp'
}, {
  envName: 'KRESUS_EMAIL_SENDMAIL_BIN',
  configPath: 'config.email.sendmail_bin',
  defaultVal: null,
  processPath: 'emailSendmailBin',
  doc: `The path to the sendmail executable to use. If empty, indicates
        that the default sendmail executable will be used.`,
  docExample: '/usr/bin/sendmail'
}, {
  envName: 'KRESUS_EMAIL_FROM',
  configPath: 'config.email.from',
  defaultVal: null,
  processPath: 'emailFrom',
  doc: `The email address from which email alerts will be sent. Make sure
        that your domain DNS is correctly configured and that you've done
        what's needed to prevent email alerts from landing in the spam folder.`,
  docExample: 'kresus@domain.tld'
}, {
  envName: 'KRESUS_EMAIL_HOST',
  configPath: 'config.email.host',
  defaultVal: null,
  processPath: 'smtpHost',
  doc: 'The network address (ipv4, ipv6 or FQDN) of the SMTP server.',
  docExample: 'mail.domain.tld'
}, {
  envName: 'KRESUS_EMAIL_PORT',
  configPath: 'config.email.port',
  defaultVal: null,
  processPath: 'smtpPort',
  cleanupAction: val => {
    return val !== null ? checkPort(val, 'Invalid SMTP port provided') : null;
  },
  doc: `The port to which the SMTP server listens. Default values tend to
        be: 25 (server to server), or 587 (clients to server), or 465
        (nonstandard).`,
  docExample: '465'
}, {
  envName: 'KRESUS_EMAIL_USER',
  configPath: 'config.email.user',
  defaultVal: null,
  processPath: 'smtpUser',
  doc: `The username used during authentication to the SMTP server. If
        empty, indicates an anonymous connection will be used.`,
  docExample: 'login'
}, {
  envName: 'KRESUS_EMAIL_PASSWORD',
  configPath: 'config.email.password',
  defaultVal: null,
  processPath: 'smtpPassword',
  doc: `The password used during authentication to the SMTP server. If
        empty, indicates no password will be used.`,
  docExample: 'hunter2'
}, {
  envName: 'KRESUS_EMAIL_FORCE_TLS',
  configPath: 'config.email.force_tls',
  defaultVal: 'false',
  processPath: 'smtpForceTLS',
  cleanupAction: toBool,
  doc: `If set to true, will force using a TLS connection. By default,
        emails are sent with STARTTLS, i.e. using TLS if available.`
}, {
  envName: 'KRESUS_EMAIL_REJECT_UNAUTHORIZED_TLS',
  configPath: 'config.email.reject_unauthorized_tls',
  defaultVal: 'true',
  processPath: 'smtpRejectUnauthorizedTLS',
  cleanupAction: toBool,
  doc: 'If set to false, will allow self-signed TLS certificates.'
}, {
  envName: 'KRESUS_LOG_FILE',
  configPath: 'config.logs.log_file',
  defaultVal: null,
  processPath: 'logFilePath',
  cleanupAction: maybePath => {
    let checkedPath = maybePath;

    if (checkedPath === null) {
      checkedPath = _path.default.join(process.kresus.dataDir, 'kresus.log');
    }

    (0, _logger.setLogFilePath)(checkedPath);
    return checkedPath;
  },
  doc: `The path to the log file to use. If empty, defaults to kresus.log
        in datadir.`,
  docExample: '/var/log/kresus.log'
}];

function extractValue(config, {
  envName,
  defaultVal,
  configPath
})
/* -> string */
{
  let value = process.env[envName];

  if (typeof value === 'undefined') {
    let stack = configPath.split('.');
    stack.shift(); // Remove 'config'.

    value = config;

    while (stack.length && typeof value !== 'undefined') {
      value = value[stack.shift()];
    }
  }

  if (typeof value === 'undefined' || typeof value === 'string' && value.length === 0) {
    value = defaultVal;
  }

  return value === null ? null : `${value}`;
}

function processOption(config, {
  envName,
  defaultVal,
  configPath,
  cleanupAction,
  processPath
}) {
  (0, _helpers.assert)(typeof envName === 'string');
  (0, _helpers.assert)(typeof defaultVal === 'string' || defaultVal === null);
  (0, _helpers.assert)(typeof configPath === 'string');
  (0, _helpers.assert)(typeof processPath === 'string');
  let value = extractValue(config, {
    envName,
    defaultVal,
    configPath
  });

  if (typeof cleanupAction !== 'undefined') {
    (0, _helpers.assert)(typeof cleanupAction === 'function');
    value = cleanupAction(value);
  }

  process.kresus[processPath] = value;
}

function comment(x) {
  return `${x.split('\n').map(string => `; ${string.trim()}`).join('\n')}\n`;
}

function generate() {
  let map = new Map();
  let keys = []; // Remember order of keys.

  for (var _i = 0; _i < OPTIONS.length; _i++) {
    let opt = OPTIONS[_i];
    let configPath = opt.configPath;
    configPath = configPath.split('.');
    configPath.shift(); // remove 'config';

    let sectionName = configPath.shift();
    let optionName = configPath.shift();

    if (!map.has(sectionName)) {
      keys.push(sectionName);
      map.set(sectionName, []);
    }

    let section = map.get(sectionName);
    section.push({
      name: optionName,
      opt
    });
    map.set(sectionName, section);
  }

  let preamble = comment(`Hi there! This is the configuration file for
        Kresus. Please make sure to read all the options before setting up
        Kresus for the first time.
`);
  let ret = preamble;

  for (var _i2 = 0; _i2 < keys.length; _i2++) {
    let key = keys[_i2];
    ret += `[${key}]

`;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = map.get(key)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        let _step$value = _step.value,
            name = _step$value.name,
            opt = _step$value.opt;
        // Print the doc.
        ret += comment(opt.doc); // Print the default value.

        if (opt.defaultVal !== null) {
          let defaultVal = opt.defaultDoc || opt.defaultVal;
          ret += comment(`Can be removed; defaults to "${defaultVal}".`);
        }

        ret += comment(`Overriden by the ${opt.envName} environment variable, if it's set.`); // Print an example value.

        if (!opt.docExample && opt.defaultVal === null) {
          throw new Error('missing documentation example or default value');
        }

        let exampleValue = opt.docExample ? opt.docExample : opt.defaultVal;
        ret += comment(`Example:
            ${name}=${exampleValue}`); // Print the actual value.

        ret += `${name}=

`;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  return ret;
}

function apply(config = {}) {
  // Assume development mode if NODE_ENV isn't set.
  if (typeof process.env.NODE_ENV === 'undefined' || process.env.NODE_ENV.length === 0) {
    process.env.NODE_ENV = 'development';
  }

  process.kresus = {
    user: {
      // Put a fake value here until we get proper identity management.
      login: 'user'
    }
  };
  (0, _helpers.assert)(typeof config === 'object' && config !== null, 'a configuration object, even empty, must be provided');

  for (var _i3 = 0; _i3 < OPTIONS.length; _i3++) {
    let option = OPTIONS[_i3];
    processOption(config, option);
  }

  log.info('Running Kresus with the following parameters:');
  log.info(`NODE_ENV = ${process.env.NODE_ENV}`);
  log.info(`KRESUS_LOGIN = ${process.kresus.user.login}`);

  for (var _i4 = 0; _i4 < OPTIONS.length; _i4++) {
    let option = OPTIONS[_i4];
    let displayed = ['password', 'salt'].includes(option.processPath.toLowerCase()) ? '(hidden)' : process.kresus[option.processPath];
    log.info(`${option.envName} = ${displayed}`);
  }
}