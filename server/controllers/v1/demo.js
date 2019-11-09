import Accesses from '../../models/accesses';
import Budgets from '../../models/budgets';
import Categories from '../../models/categories';
import Settings from '../../models/settings';
import { asyncErr, KError, translate as $t } from '../../helpers';

import { isDemoForced, isDemoEnabled } from './settings';

import {
    createAndRetrieveData as createAndRetrieveAccessData,
    destroyWithData as destroyAccessWithData
} from './accesses';

import DefaultCategories from '../../shared/default-categories.json';

export async function setupDemoMode(userId) {
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

    // Set the demo mode to true only if other operations succeeded.
    const isEnabled = await Settings.findOrCreateByKey(userId, 'demo-mode', 'true');
    if (isEnabled.value !== 'true') {
        // The setting already existed and has the wrong value.
        await Settings.updateByKey(userId, 'demo-mode', 'true');
    }

    return data;
}

export async function enable(req, res) {
    try {
        let { id: userId } = req.user;

        let isEnabled = await isDemoEnabled(userId);
        if (isEnabled) {
            throw new KError('Demo mode is already enabled, not enabling it.', 400);
        }

        const data = await setupDemoMode(userId);

        res.status(201).json(data);
    } catch (err) {
        return asyncErr(res, err, 'when enabling demo mode');
    }
}

export async function disable(req, res) {
    try {
        let { id: userId } = req.user;

        if (isDemoForced()) {
            throw new KError('Demo mode is forced at the server level, not disabling it.', 400);
        }

        const isEnabled = await isDemoEnabled(userId);
        if (!isEnabled) {
            throw new KError('Demo mode was not enabled, not disabling it.', 400);
        }

        const accesses = await Accesses.all(userId);
        for (let acc of accesses) {
            await destroyAccessWithData(userId, acc);
        }

        // Delete categories and associated budgets.
        const categories = await Categories.all(userId);
        for (let cat of categories) {
            await Budgets.destroyForCategory(userId, cat.id /* no replacement category */);
            await Categories.destroy(userId, cat.id);
        }

        // Only reset the setting value if all the destroy operations
        // succeeded.
        await Settings.updateByKey(userId, 'demo-mode', 'false');

        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when disabling demo mode');
    }
}
