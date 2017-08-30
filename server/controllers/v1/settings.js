import Config from '../../models/config';

import * as weboob from '../../lib/sources/weboob';
import Emailer from '../../lib/emailer';

import {
    KError,
    asyncErr,
    setupTranslator
} from '../../helpers';

function postSave(key, value) {
    switch (key) {
        case 'email-recipient':
            Emailer.forceReinit(value);
            break;
        case 'locale':
            setupTranslator(value);
            break;
        default:
            break;
    }
}

export async function save(req, res) {
    try {
        let pair = req.body;

        if (typeof pair.key === 'undefined') {
            throw new KError('Missing key when saving a setting', 400);
        }
        if (typeof pair.value === 'undefined') {
            throw new KError('Missing value when saving a setting', 400);
        }

        let found = await Config.findOrCreateByName(pair.key, pair.value);
        if (found.value !== pair.value) {
            found.value = pair.value;
            await found.save();
        }

        postSave(pair.key, pair.value);

        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when saving a setting');
    }
}

export async function updateWeboob(req, res) {
    try {
        await weboob.updateWeboobModules();
        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when updating weboob');
    }
}

export async function testEmail(req, res) {
    try {
        let { email } = req.body;
        if (!email) {
            throw new KError('Missing email recipient address when sending a test email', 400);
        }
        await Emailer.sendTestEmail(email);
        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when trying to send an email');
    }
}
