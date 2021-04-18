import express from 'express';

import { Access, Budget, Category, Setting } from '../models';
import { assert, asyncErr, KError, translate as $t } from '../helpers';

import DefaultCategories from '../shared/default-categories.json';
import { DEMO_MODE } from '../shared/settings';

import { IdentifiedRequest } from './routes';
import { isDemoForced, isDemoEnabled } from './instance';

import {
    createAndRetrieveData as createAndRetrieveAccessData,
    CreateAndRetrieveDataResult,
    destroyWithData as destroyAccessWithData,
} from './accesses';

export async function setupDemoMode(userId: number): Promise<CreateAndRetrieveDataResult> {
    // Create default categories, unless they already existed.
    const existingCategories = new Set((await Category.all(userId)).map(cat => cat.label));
    for (const category of DefaultCategories) {
        if (existingCategories.has($t(category.label))) {
            continue;
        }
        await Category.create(userId, {
            label: $t(category.label),
            color: category.color,
        });
    }

    const response = await createAndRetrieveAccessData(userId, {
        vendorId: 'demo',
        login: 'mylogin',
        password: 'couldnotcareless',
        customLabel: 'Demo bank',
    });

    assert(response.kind === 'value', "demo account shouldn't require a user action");

    const data = response.value;

    // Set the demo mode to true only if other operations succeeded.
    const isEnabled = await Setting.findOrCreateByKey(userId, DEMO_MODE, 'true');
    if (isEnabled.value !== 'true') {
        // The setting already existed and has the wrong value.
        await Setting.updateByKey(userId, DEMO_MODE, 'true');
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

        const accesses = await Access.all(userId);
        if (accesses.length > 0) {
            throw new KError('Demo mode cannot be enabled if there already are accesses', 400);
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

        // Keep the categories (and rules), in case the user created
        // interesting ones. Delete all the budgets, though.
        await Budget.destroyAll(userId);

        // Only reset the setting value if all the destroy operations
        // succeeded.
        await Setting.updateByKey(userId, DEMO_MODE, 'false');

        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when disabling demo mode');
    }
}
