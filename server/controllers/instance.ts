import express from 'express';

import { Setting } from '../models';

import * as woob from '../providers/woob';
import getEmailer from '../lib/emailer';
import { sendTestNotification } from '../lib/notifications';
import { WOOB_NOT_INSTALLED } from '../shared/errors.json';

import { KError, asyncErr, checkMinimalWoobVersion, UNKNOWN_WOOB_VERSION } from '../helpers';
import { DEMO_MODE } from '../shared/settings';
import { IdentifiedRequest } from './routes';

export async function getWoobVersion(_req: express.Request, res: express.Response) {
    try {
        const version = await woob.getVersion(/* force = */ true);
        if (version === UNKNOWN_WOOB_VERSION) {
            throw new KError('cannot get woob version', 500, WOOB_NOT_INSTALLED);
        }
        res.json({
            version,
            hasMinimalVersion: checkMinimalWoobVersion(version),
        });
    } catch (err) {
        asyncErr(res, err, 'when getting woob version');
    }
}

export async function updateWoob(_req: express.Request, res: express.Response) {
    try {
        await woob.updateModules();
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when updating woob');
    }
}

export async function testEmail(req: IdentifiedRequest<void>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const { email } = req.body;
        if (!email) {
            throw new KError('Missing email recipient address when sending a test email', 400);
        }

        const emailer = getEmailer();
        if (emailer !== null) {
            await emailer.sendTestEmail(userId, email);
        } else {
            throw new KError('No emailer found');
        }
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when trying to send an email');
    }
}

export async function testNotification(req: IdentifiedRequest<void>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const { appriseUrl } = req.body;
        if (!appriseUrl) {
            throw new KError('Missing apprise url when sending a notification', 400);
        }
        await sendTestNotification(userId, appriseUrl);
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when trying to send a notification');
    }
}

export function isDemoForced(): boolean {
    return process.kresus.forceDemoMode === true;
}

export async function isDemoEnabled(userId: number): Promise<boolean> {
    return isDemoForced() || (await Setting.findOrCreateDefaultBooleanValue(userId, DEMO_MODE));
}
