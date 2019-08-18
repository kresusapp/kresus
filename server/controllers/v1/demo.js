import Accesses from '../../models/accesses';
import Categories from '../../models/categories';
import Settings from '../../models/settings';
import { asyncErr, KError, translate as $t } from '../../helpers';

import {
    createAndRetrieveData as createAndRetrieveAccessData,
    destroyWithData as destroyAccessWithData
} from './accesses';

import DefaultCategories from '../../shared/default-categories.json';

export async function isEnabled(userId) {
    return await Settings.findOrCreateDefaultBooleanValue(userId, 'demo-mode');
}

export async function enable(req, res) {
    try {
        let { id: userId } = req.user;

        let isDemoEnabled = await isEnabled(userId);
        if (isDemoEnabled) {
            throw new KError('Demo mode is already enabled, not enabling it.', 400);
        }

        // Set the demo mode to true.
        isDemoEnabled = await Settings.findOrCreateByKey(userId, 'demo-mode', 'true');
        if (isDemoEnabled.value !== 'true') {
            // The setting already existed and has the wrong value.
            await Settings.updateByKey(userId, 'demo-mode', 'true');
        }

        // Create default categories.
        for (let category of DefaultCategories) {
            await Categories.create(userId, {
                label: $t(category.label),
                color: category.color
            });
        }

        const data = await createAndRetrieveAccessData(userId, {
            vendorId: 'demo',
            login: 'mylogin',
            password: 'couldnotcareless',
            customLabel: 'Demo bank'
        });
        res.status(201).json(data);
    } catch (err) {
        return asyncErr(res, err, 'when enabling demo mode');
    }
}

export async function disable(req, res) {
    try {
        let { id: userId } = req.user;

        const isDemoEnabled = await isEnabled(userId);
        if (!isDemoEnabled) {
            throw new KError('Demo mode was not enabled, not disabling it.', 400);
        }

        // Reset everything.
        await Settings.updateByKey(userId, 'demo-mode', 'false');

        const accesses = await Accesses.all(userId);
        for (let acc of accesses) {
            await destroyAccessWithData(userId, acc);
        }

        const categories = await Categories.all(userId);
        for (let cat of categories) {
            await Categories.destroy(userId, cat.id);
        }

        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when disabling demo mode');
    }
}
