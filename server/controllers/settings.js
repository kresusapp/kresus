let log = require('printit')({
    prefix: 'controllers/settings',
    date: true
});

let Config = require('../models/kresusconfig');
let Cozy   = require('../models/cozyinstance');
let h      = require('../helpers');

let weboob = require('../lib/sources/weboob');

export function save(req, res) {
    let pair = req.body;

    if (typeof pair.key === 'undefined')
        return h.sendErr(res, 'missing key in settings', 400, 'Missing key when saving a setting');

    if (typeof pair.value === 'undefined')
        return h.sendErr(res, 'missing value in settings', 400, 'Missing value when saving a setting');

    Config.findOrCreateByName(pair.key, pair, (err, found) => {
        if (err)
            return h.sendErr(res, err);

        if (found.value !== pair.value) {
            found.value = pair.value;
            found.save(err => {
                if (err)
                    return h.sendErr(res, err);
                res.sendStatus(200);
            });
            return
        }

        res.sendStatus(200);
    });
}


export function updateWeboob(req, res) {
    let body = req.body;
    let action = !body || !body.action ? 'core' : body.action;

    if (['core', 'modules'].indexOf(action) === -1)
        return h.sendErr(res, "Bad parameters for updateWeboob", 400, "Bad parameters when trying to update weboob.");

    function after() {
        Config.byName('weboob-installed', (err, pair) => {
            if (err)
                return h.sendErr(res, err);

            let isInstalled = typeof pair !== 'undefined' && pair.value === 'true';

            Config.byName('weboob-log', (err, pair) => {
                if (err)
                    return h.sendErr(res, err);

                let log = typeof pair === 'undefined' || !pair.value ? 'no log' : pair.value;

                let ret = {
                    isInstalled,
                    log
                }

                res.status(200).send(ret);
            });
        });
    }

    if (action === 'modules') {
        weboob.UpdateWeboobModules(err => {
            if (err)
                return h.sendErr(res, err, 500, `Error when updating weboob modules: ${err}`);
            after();
        });
        return;
    }

    // First parameter is 'forceUpdate'
    weboob.InstallOrUpdateWeboob(true, err => {
        if (err)
            return h.sendErr(res, err, 500, `Error when updating weboob: ${err}`);
        after();
    });
}

