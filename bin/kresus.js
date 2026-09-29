#!/usr/bin/env node

const path = require('node:path');
const fs = require('node:fs');
const { parseArgs } = require('node:util');
const ini = require('ini');

function help(binaryName) {
    console.log(
        `Usage: ${binaryName}\n` +
            '\t-h or --help or help: displays this message.\n' +
            '\t-c $path or --config $path: path to the configuration file.\n' +
            '\tcreate:config: creates an empty configuration file up to date.\n' +
            '\tcreate:user $login [--admin]: creates a new user with given login,\n' +
            '\t\tand assigns it an ID. Pass "--admin" to create an administrator.\n' +
            '\tdelete:user $login: deletes a user with given login\n' +
            '\tlist:users: lists all the users with their id, login and admin status.'
    );
}

let explainedChmodError = false;
function tryChmod(pathname, mode) {
    try {
        fs.chmodSync(pathname, mode);
    } catch (_err) {
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
    const stats = fs.statSync(pathname);
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
    const configFileACLMask = 0x1ff;

    let content = null;
    try {
        const mode = fs.statSync(pathname).mode;

        const rights = mode & configFileACLMask;

        // Allow:
        // - readable by user
        // - writeable by user
        // - readable by group
        const allowedFlags = fs.constants.S_IRUSR | fs.constants.S_IWUSR | fs.constants.S_IRGRP;

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
    const server = require(path.join(ROOT, 'server'));

    const dataDir = process.kresus.dataDir;
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir);
    }

    // The server should only create files with +rw permissions for the current
    // user.
    const processUmask = 0o0077;
    process.umask(processUmask);

    // Ensure the data directory contains files only the current user can read and
    // write.
    recursiveChmod(
        dataDir,
        fs.constants.S_IRUSR | fs.constants.S_IWUSR,
        fs.constants.S_IRUSR | fs.constants.S_IWUSR | fs.constants.S_IXUSR
    );

    process.chdir(dataDir);

    server.start();
}

function createUser(login, admin = false) {
    const cli = require(path.join(ROOT, 'server', 'cli'));
    cli.createUser(login, admin).catch(error => {
        console.error(error);
        process.exit(-1);
    });
}

function deleteUser(login) {
    const cli = require(path.join(ROOT, 'server', 'cli'));
    cli.deleteUser(login).catch(error => {
        console.error(error);
        process.exit(-1);
    });
}

function listUsers() {
    const cli = require(path.join(ROOT, 'server', 'cli'));
    cli.listUsers().catch(error => {
        console.error(error);
        process.exit(-1);
    });
}

const binaryName = process.argv[1];

function exitWithError(...message) {
    console.error(...message);
    help(binaryName);
    process.exit(-1);
}

let parsedArgs;
try {
    parsedArgs = parseArgs({
        options: {
            help: { type: 'boolean', short: 'h' },
            config: { type: 'string', short: 'c' },
            admin: { type: 'boolean' },
        },
        allowPositionals: true,
    });
} catch (err) {
    exitWithError(err.message);
}

const { values, positionals } = parsedArgs;
const [commandName, ...commandPositionals] = positionals;

if (values.help || commandName === 'help') {
    help(binaryName);
    process.exit(0);
}

if (values.admin && commandName !== 'create:user') {
    exitWithError('The --admin option can only be used with create:user.');
}

const expectedPositionals = ['create:user', 'delete:user'].includes(commandName) ? 1 : 0;
if (commandPositionals.length > expectedPositionals) {
    exitWithError('Unexpected argument:', commandPositionals[expectedPositionals]);
}

let command = runServer;
const commandArgs = [];

switch (commandName) {
    case undefined:
        break;
    case 'create:config':
        console.log(configurator.generate());
        process.exit(0);
        break;
    case 'create:user':
    case 'delete:user': {
        const login = commandPositionals[0];
        if (!login) {
            exitWithError('Missing user login.');
        }
        if (commandName === 'create:user') {
            command = createUser;
            commandArgs.push(login, !!values.admin);
        } else {
            command = deleteUser;
            commandArgs.push(login);
        }
        break;
    }
    case 'list:users':
        command = listUsers;
        break;
    default:
        exitWithError('Unknown command:', commandName);
}

const config = values.config ? readConfigFromFile(values.config) : null;

if (!config) {
    console.warn(
        "Configuration file not provided. If this is intentional and you did not provide configuration directives through environment variables you'll see error messages during database setup."
    );
}

// First, define process.kresus.
configurator.apply(config || {});

// Then, call the right command.
command(...commandArgs);
