/* eslint no-console: 0 */

import moment from 'moment';

const resetColor = '\x1B[39m';

const colors = {
    cyan: '\x1B[36m',
    green: '\x1B[32m',
    red: '\x1B[31m',
    yellow: '\x1B[33m'
};

const levelColors = {
    error: colors.red,
    debug: colors.cyan,
    warn: colors.yellow,
    info: colors.green
};

export default class Logger {
    constructor(prefix) {
        this.prefix = prefix;
    }

    colorify(text, color) {
        return `${color}${text}${resetColor}`;
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

    format(level, texts) {
        let maybeLevel = `${process.env.NODE_ENV !== 'production'
            ? this.colorify(level, levelColors[level])
            : level} - `;

        let maybePrefix = this.prefix ? `${this.prefix} | ` : '';

        let text = texts.map(this.stringify).join(' ');

        let date = moment()
            .utc()
            .toISOString();

        return `[${date}] ${maybeLevel}${maybePrefix}${text}`;
    }

    info(...texts) {
        return console.info(this.format('info', texts));
    }

    warn(...texts) {
        return console.warn(this.format('warn', texts));
    }

    error(...texts) {
        return console.error(this.format('error', texts));
    }

    debug(...texts) {
        if (process.env.DEBUG) {
            return console.info(this.format('debug', texts));
        }
    }

    raw(...texts) {
        return console.log(console, texts);
    }
}
