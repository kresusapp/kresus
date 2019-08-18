import Settings from '../../models/settings';

import * as weboob from '../../lib/sources/weboob';
import Emailer from '../../lib/emailer';
import { WEBOOB_NOT_INSTALLED } from '../../shared/errors.json';

import { KError, asyncErr, setupTranslator, checkWeboobMinimalVersion } from '../../helpers';

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

        let { id: userId } = req.user;
        await Settings.updateByKey(userId, pair.key, pair.value);
        postSave(pair.key, pair.value);

        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when saving a setting');
    }
}

export async function getWeboobVersion(req, res) {
    try {
        const version = await weboob.getVersion(/* force = */ true);
        if (version <= 0) {
            throw new KError('cannot get weboob version', 500, WEBOOB_NOT_INSTALLED);
        }
        res.json({
            data: {
                version,
                isInstalled: checkWeboobMinimalVersion(version)
            }
        });
    } catch (err) {
        return asyncErr(res, err, 'when getting weboob version');
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

export function isDemoForced() {
    return process.kresus.forceDemoMode === true;
}

export async function isDemoEnabled(userId) {
    return isDemoForced() || (await Settings.findOrCreateDefaultBooleanValue(userId, 'demo-mode'));
}
