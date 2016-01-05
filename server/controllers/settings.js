import Config from '../models/config';

import * as weboob from '../lib/sources/weboob';

import { sendErr, asyncErr } from '../helpers';

export async function save(req, res) {
    let pair = req.body;

    if (typeof pair.key === 'undefined')
        return sendErr(res, 'missing key in settings', 400,
                       'Missing key when saving a setting');

    if (typeof pair.value === 'undefined')
        return sendErr(res, 'missing value in settings', 400,
                       'Missing value when saving a setting');

    try {
        let found = await Config.findOrCreateByName(pair.key, pair.value);
        if (found.value !== pair.value) {
            found.value = pair.value;
            await found.save();
        }
        res.sendStatus(200);
    } catch (err) {
        return asyncErr(res, err, 'when saving a setting');
    }
}

export async function updateWeboob(req, res) {
    let body = req.body;
    let action = (!body || !body.action) ? 'core' : body.action;

    if (['core', 'modules'].indexOf(action) === -1)
        return sendErr(res, 'Bad parameters for updateWeboob', 400,
                       'Bad parameters when trying to update weboob.');

    try {
        if (action === 'modules') {
            await weboob.updateWeboobModules();
        } else {
            await weboob.installOrUpdateWeboob(true);
        }
        res.sendStatus(200);
    } catch (err) {
        return asyncErr(res, err, 'when updating weboob');
    }
}
