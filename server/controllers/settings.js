import Config from '../models/config';

import * as weboob from '../lib/sources/weboob';

import { KError, asyncErr } from '../helpers';

export async function save(req, res) {
    try {
        let pair = req.body;

        if (typeof pair.key === 'undefined')
            throw new KError('Missing key when saving a setting', 400);
        if (typeof pair.value === 'undefined')
            throw new KError('Missing value when saving a setting', 400);

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
    try {
        await weboob.updateWeboobModules();
        res.sendStatus(200);
    } catch (err) {
        return asyncErr(res, err, 'when updating weboob');
    }
}
