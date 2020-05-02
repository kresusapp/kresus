import express from 'express';

import { Access, Budget, Category, Setting } from '../models';
import { asyncErr, KError, translate as $t } from '../helpers';

import DefaultCategories from '../shared/default-categories.json';

import { IdentifiedRequest } from './routes';
import { isDemoForced, isDemoEnabled } from './settings';

import {
    createAndRetrieveData as createAndRetrieveAccessData,
    destroyWithData as destroyAccessWithData,
} from './accesses';

export async function setupDemoMode(userId: number) {
    // Create default categories.
    for (const category of DefaultCategories) {
        await Category.create(userId, {
            label: $t(category.label),
            color: category.color,
        });
    }

    const data = await createAndRetrieveAccessData(userId, {
        vendorId: 'demo',
        login: 'mylogin',
        password: 'couldnotcareless',
        customLabel: 'Demo bank',
    });

    // Set the demo mode to true only if other operations succeeded.
    const isEnabled = await Setting.findOrCreateByKey(userId, 'demo-mode', 'true');
    if (isEnabled.value !== 'true') {
        // The setting already existed and has the wrong value.
        await Setting.updateByKey(userId, 'demo-mode', 'true');
    }

    return data;
}

export async function enable(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const isEnabled = await isDemoEnabled(userId);
        if (isEnabled) {
            throw new KError('Demo mode is already enabled, not enabling it.', 400);
        }

        const data = await setupDemoMode(userId);

        res.status(201).json(data);
    } catch (err) {
        asyncErr(res, err, 'when enabling demo mode');
    }
}

export async function disable(req: IdentifiedRequest<any>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        if (isDemoForced()) {
            throw new KError('Demo mode is forced at the server level, not disabling it.', 400);
        }

        const isEnabled = await isDemoEnabled(userId);
        if (!isEnabled) {
            throw new KError('Demo mode was not enabled, not disabling it.', 400);
        }

        const accesses = await Access.all(userId);
        for (const acc of accesses) {
            await destroyAccessWithData(userId, acc);
        }

        // Delete categories and associated budgets.
        const categories = await Category.all(userId);
        for (const cat of categories) {
            await Budget.destroyForCategory(userId, cat.id /* no replacement category */);
            await Category.destroy(userId, cat.id);
        }

        // Only reset the setting value if all the destroy operations
        // succeeded.
        await Setting.updateByKey(userId, 'demo-mode', 'false');

        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when disabling demo mode');
    }
}
