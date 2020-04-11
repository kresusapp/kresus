import { Setting } from '../models';

import * as weboob from '../providers/weboob';
import getEmailer from '../lib/emailer';
import getNotifier, { sendTestNotification } from '../lib/notifications';
import { WEBOOB_NOT_INSTALLED } from '../shared/errors.json';

import {
    KError,
    asyncErr,
    setupTranslator,
    checkWeboobMinimalVersion,
    UNKNOWN_WEBOOB_VERSION
} from '../helpers';

function postSave(userId, key, value) {
    switch (key) {
        case 'email-recipient':
            getEmailer().forceReinit(value);
            break;
        case 'apprise-url':
            getNotifier(userId).forceReinit(value);
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
        const pair = req.body;

        if (typeof pair.key === 'undefined') {
            throw new KError('Missing key when saving a setting', 400);
        }
        if (typeof pair.value === 'undefined') {
            throw new KError('Missing value when saving a setting', 400);
        }

        const { id: userId } = req.user;
        await Setting.updateByKey(userId, pair.key, pair.value);
        postSave(userId, pair.key, pair.value);

        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when saving a setting');
    }
}

export async function getWeboobVersion(req, res) {
    try {
        const version = await weboob.getVersion(/* force = */ true);
        if (version === UNKNOWN_WEBOOB_VERSION) {
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
        const { email } = req.body;
        if (!email) {
            throw new KError('Missing email recipient address when sending a test email', 400);
        }
        await getEmailer().sendTestEmail(email);
        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when trying to send an email');
    }
}

export async function testNotification(req, res) {
    try {
        const { appriseUrl } = req.body;
        if (!appriseUrl) {
            throw new KError('Missing apprise url when sending a notification', 400);
        }
        await sendTestNotification(appriseUrl);
        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when trying to send a notification');
    }
}

export function isDemoForced() {
    return process.kresus.forceDemoMode === true;
}

export async function isDemoEnabled(userId) {
    return isDemoForced() || (await Setting.findOrCreateDefaultBooleanValue(userId, 'demo-mode'));
}
