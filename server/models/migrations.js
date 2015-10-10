let log = require('printit')({
    prefix: 'models/migrations',
    date: true
});

import Config from './kresusconfig';

// migration #1: remove weboob-log and weboob-installed from the db
async function m1() {
    let weboobLog = await Config.byName('weboob-log');
    if (weboobLog) {
        log.info('Destroying Config[weboob-log].');
        await weboobLog.destroy();
    }

    let weboobInstalled = await Config.byName('weboob-installed');
    if (weboobInstalled) {
        log.info('Destroying Config[weboob-installed].');
        await weboobInstalled.destroy();
    }
}

export async function run() {
    await m1();
}
