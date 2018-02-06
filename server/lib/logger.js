import log4js from 'log4js';

log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: process.env.NODE_ENV !== 'production' ? 'coloured' : 'basic'
            }
        },
        app: {
            type: 'file',
            filename: 'kresus.log'
        }
    },
    categories: {
        default: {
            appenders: ['out', 'app'],
            level: 'debug'
        }
    }
});

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
        let text = texts.map(this.stringify).join(' ');
        return this.logger.trace(texts.map(this.stringify).join(' '));
    }
}
