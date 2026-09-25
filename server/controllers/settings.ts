import type express from 'express';
import { asyncErr, KError } from '../helpers';

import getEmailer from '../lib/emailer';
import getNotifier from '../lib/notifications';
import { resetTranslator } from '../lib/translator';
import { Setting } from '../models';
import { APPRISE_URL, EMAIL_RECIPIENT, LOCALE } from '../shared/settings';
import type { IdentifiedRequest } from './routes';

function postSave(userId: number, key: string, value: string) {
    switch (key) {
        case EMAIL_RECIPIENT: {
            const emailSender = getEmailer();
            if (emailSender !== null) {
                emailSender.forceReinit(value);
            }
            break;
        }
        case APPRISE_URL: {
            const notifier = getNotifier(userId);
            if (notifier !== null) {
                notifier.forceReinit(value);
            }
            break;
        }
        case LOCALE:
            resetTranslator(userId, value);
            break;
        default:
            break;
    }
}

export async function save(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const pair = req.body;

        if (typeof pair.key === 'undefined') {
            throw new KError('Missing key when saving a setting', 400);
        }
        if (typeof pair.value === 'undefined') {
            throw new KError('Missing value when saving a setting', 400);
        }

        const userId = req.user.id;
        await Setting.updateByKey(userId, pair.key, pair.value);
        postSave(userId, pair.key, pair.value);

        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when saving a setting');
    }
}
