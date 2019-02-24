import log4js from 'log4js';

let loggerConfig = {
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: process.env.NODE_ENV !== 'production' ? 'coloured' : 'basic'
            }
        }
    },
    categories: {
        default: {
            appenders: ['out'],
            level: 'debug'
        }
    }
};

if (process.env.NODE_ENV === 'test') {
    // Disable application logging for testing.
    loggerConfig.categories.default.level = 'off';
}

log4js.configure(loggerConfig);

export function setLogFilePath(path) {
    loggerConfig.appenders.app = {
        type: 'file',
        filename: path
    };
    loggerConfig.categories.default.appenders.push('app');

    log4js.configure(loggerConfig);
}

export default class Logger {
    constructor(prefix) {
        this.prefix = prefix;
        this.logger = log4js.getLogger(prefix);
    }

    stringify(text) {
        if (text instanceof Error && text.stack) {
            return text.stack;
        }
        if (text instanceof Object) {
            return JSON.stringify(text);
        }
        return text;
    }

    info(...texts) {
        return this.logger.info(texts.map(this.stringify).join(' '));
    }

    warn(...texts) {
        return this.logger.warn(texts.map(this.stringify).join(' '));
    }

    error(...texts) {
        return this.logger.error(texts.map(this.stringify).join(' '));
    }

    debug(...texts) {
        if (process.env.DEBUG) {
            return this.logger.debug(texts.map(this.stringify).join(' '));
        }
    }

    raw(...texts) {
        return this.logger.trace(texts.map(this.stringify).join(' '));
    }
}
