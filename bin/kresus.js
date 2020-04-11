#!/usr/bin/env node

/* eslint no-console: 0 */
/* eslint no-process-exit: 0 */
/* eslint import/no-dynamic-require: 0 */

let path = require('path');
let fs = require('fs');
let ini = require('ini');

function help(binaryName) {
    console.log(
        `Usage: ${binaryName}\n` +
            '\t-h or --help or help: displays this message.\n' +
            '\t-c $path or --config $path: path to the configuration file.\n' +
            '\tcreate:user $login: creates a new user with given login, and assigns it an ID.\n'
    );
}

let explainedChmodError = false;
function tryChmod(pathname, mode) {
    try {
        fs.chmodSync(pathname, mode);
    } catch (err) {
        if (!explainedChmodError) {
            console.warn(`To help ensuring your private data is safe, Kresus tried to chmod the
data directory (datadir in config.ini, or KRESUS_DATA_DIR as environment variable) with predefined
restrictive settings, but an error occurred:`);
            explainedChmodError = true;
        }
        console.warn('Unable to chmod', pathname);
    }
}

function recursiveChmod(pathname, fileMode, dirMode) {
    let stats = fs.statSync(pathname);
    if (stats.isFile()) {
        if (stats.mode !== fileMode) {
            tryChmod(pathname, fileMode);
        }
        return;
    }
    if (stats.isDirectory(pathname)) {
        if (stats.mode !== dirMode) {
            tryChmod(pathname, dirMode);
        }
        fs.readdirSync(pathname).forEach(dir => {
            recursiveChmod(path.join(pathname, dir), fileMode, dirMode);
        });
    }
}

function readConfigFromFile(pathname) {
    // In the stats retrieved from a file, the rights are the last 9 bits :
    // user rights / group rights / other rights
    let configFileACLMask = 0x1ff;

    let content = null;
    try {
        let mode = fs.statSync(pathname).mode;

        let rights = mode & configFileACLMask;

        // Allow:
        // - readable by user
        // - writeable by user
        // - readable by group
        let allowedFlags = fs.constants.S_IRUSR | fs.constants.S_IWUSR | fs.constants.S_IRGRP;

        // In production, check the config file has r or rw rights for the owner.
        if (process.env.NODE_ENV === 'production' && (rights & ~allowedFlags) !== 0) {
            console.error(`For security reasons, the configuration file ${pathname} should be at
most readable by its owner and group, writable by its owner. Please make sure to restrict
permissions on this file using the chmod command.`);
            process.exit(-1);
        }

        content = fs.readFileSync(pathname, { encoding: 'utf8' });
    } catch (e) {
        console.error(
            'Error when trying to read the configuration file (does the file at this path exist?)',
            e.toString(),
            '\n\n',
            e.stack
        );
        process.exit(-1);
    }

    let config = {};
    try {
        config = ini.parse(content);
    } catch (e) {
        console.error(
            'INI formatting error when reading the configuration file:',
            e.toString(),
            '\n\n',
            e.stack
        );
        process.exit(-1);
    }

    return config;
}

const ROOT = path.join(path.dirname(fs.realpathSync(__filename)), '..', 'build');
const configurator = require(path.join(ROOT, 'server', 'config.js'));

function runServer() {
    // Then only, import the server.
    let server = require(path.join(ROOT, 'server'));

    let dataDir = process.kresus.dataDir;
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    // The server should only create files with +rw permissions for the current
    // user.
    let processUmask = 0o0077;
    process.umask(processUmask);

    // Ensure the data directory contains files only the current user can read and
    // write.
    recursiveChmod(
        dataDir,
        fs.constants.S_IRUSR | fs.constants.S_IWUSR,
        fs.constants.S_IRUSR | fs.constants.S_IWUSR | fs.constants.S_IXUSR
    );

    process.chdir(dataDir);

    let dbName = path.join(dataDir, 'db');
    server.start(ROOT, dbName);
}

function createUser(login) {
    let cli = require(path.join(ROOT, 'server', 'cli'));
    cli.createUser(login);
}

// First two args are [node, binaryname]
let numActualArgs = Math.max(process.argv.length - 2, 0);
function actualArg(n) {
    return process.argv[2 + n];
}

let command = runServer;
let commandArgs = [];

let config = null;
let binaryName = actualArg(-1);
for (let i = 0; i < numActualArgs; i++) {
    let arg = actualArg(i);
    if (['help', '-h', '--help'].includes(arg)) {
        help(binaryName);
        process.exit(0);
    } else if (['-c', '--config'].includes(arg)) {
        if (numActualArgs <= i + 1) {
            console.error('Missing config file path.');
            help(binaryName);
            process.exit(-1);
        }
        let configFilePath = actualArg(i + 1);
        i += 1;
        config = readConfigFromFile(configFilePath);
    } else if (arg === 'create:user') {
        if (numActualArgs <= i + 1) {
            console.error('Missing user login.');
            help(binaryName);
            process.exit(-1);
        }
        let login = actualArg(i + 1);
        i += 1;
        command = createUser;
        commandArgs.push(login);
        break;
    } else if (arg === 'create:config') {
        console.log(configurator.generate());
        process.exit(0);
    } else {
        console.error('Unknown command:', arg);
        help(binaryName);
        process.exit(-1);
    }
}

if (!config) {
    console.warn(
        // eslint-disable-next-line max-len
        "Configuration file not provided. If this is intentional and you did not provide configuration directives through environement variables you'll see error messages during database setup."
    );
}

// First, define process.kresus.
configurator.apply(config || {});

// Then, call the right command.
command(...commandArgs);
