import log4js, { Logger as LoggerType, Configuration } from 'log4js';

const loggerConfig: Configuration = {
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: process.env.NODE_ENV !== 'production' ? 'coloured' : 'basic',
            },
        },
    },
    categories: {
        default: {
            appenders: ['out'],
            level: 'debug',
        },
    },
};

if (process.env.NODE_ENV === 'test' && typeof process.env.FORCE_LOGS === 'undefined') {
    // Disable application logging for testing.
    loggerConfig.categories.default.level = 'off';
}

log4js.configure(loggerConfig);

export function setLogFilePath(path: string) {
    loggerConfig.appenders.app = {
        type: 'file',
        filename: path,
    };
    loggerConfig.categories.default.appenders.push('app');

    log4js.configure(loggerConfig);
}

// Accept All The Things!
type LogArg = string | number | Record<string, unknown> | Error | undefined;

export default class Logger {
    prefix: string;
    logger: LoggerType;

    constructor(prefix: string) {
        this.prefix = prefix;
        this.logger = log4js.getLogger(prefix);
    }

    stringify(text: LogArg) {
        if (text instanceof Error && text.stack) {
            return text.stack;
        }
        if (text instanceof Object) {
            return JSON.stringify(text);
        }
        return text;
    }

    info(...texts: LogArg[]) {
        return this.logger.info(texts.map(this.stringify).join(' '));
    }

    warn(...texts: LogArg[]) {
        return this.logger.warn(texts.map(this.stringify).join(' '));
    }

    error(...texts: LogArg[]) {
        return this.logger.error(texts.map(this.stringify).join(' '));
    }

    debug(...texts: LogArg[]) {
        if (process.env.DEBUG) {
            return this.logger.debug(texts.map(this.stringify).join(' '));
        }
    }

    raw(...texts: LogArg[]) {
        return this.logger.trace(texts.map(this.stringify).join(' '));
    }
}
