import express from 'express';

import { Budget, Category, Transaction } from '../models';
import { makeLogger, KError, asyncErr } from '../helpers';
import { hasForbiddenOrMissingField, hasForbiddenField } from '../shared/validators';

import { IdentifiedRequest, PreloadedRequest } from './routes';
import { updateCategorizeRules } from '../lib/rule-engine';

const log = makeLogger('controllers/categories');

export async function preloadCategory(
    req: IdentifiedRequest<Category>,
    res: express.Response,
    nextHandler: () => void,
    id: number
) {
    try {
        const { id: userId } = req.user;
        const category = await Category.find(userId, id);

        if (!category) {
            throw new KError('Category not found', 404);
        }

        req.preloaded = { category };
        nextHandler();
    } catch (err) {
        asyncErr(res, err, 'when preloading a category');
    }
}

export async function createOneCategory(userId: number, pod: any) {
    const error = hasForbiddenOrMissingField(pod, ['label', 'color']);
    if (error) {
        throw new KError(`when creating a category: ${error}`, 400);
    }
    return await Category.create(userId, pod);
}

export async function create(req: IdentifiedRequest<Category>, res: express.Response) {
    try {
        const { id: userId } = req.user;
        const created = await createOneCategory(userId, req.body);
        res.status(200).json(created);
    } catch (err) {
        asyncErr(res, err, 'when creating category');
    }
}

export async function update(req: PreloadedRequest<Category>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const error = hasForbiddenField(req.body, ['label', 'color']);
        if (error) {
            throw new KError(`when updating a category: ${error}`, 400);
        }

        const category = req.preloaded.category;
        const newCat = await Category.update(userId, category.id, req.body);
        res.status(200).json(newCat);
    } catch (err) {
        asyncErr(res, err, 'when updating a category');
    }
}

export async function destroyOneCategory(
    userId: number,
    formerId: number,
    replaceById: number | null
) {
    if (replaceById !== null) {
        log.debug(`Replacing category ${formerId} by ${replaceById}...`);
        const categoryToReplaceBy = await Category.find(userId, replaceById);
        if (!categoryToReplaceBy) {
            throw new KError('Replacement category not found', 404);
        }
    } else {
        log.debug('No replacement category, replacing by the None category.');
    }

    if (replaceById !== null) {
        await Transaction.replaceCategory(userId, formerId, replaceById);
        await Budget.replaceForCategory(userId, formerId, replaceById);
    }

    await updateCategorizeRules(userId, formerId, replaceById);

    await Category.destroy(userId, formerId);
}

export async function destroy(req: PreloadedRequest<Category>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const error = hasForbiddenOrMissingField(req.body, ['replaceByCategoryId']);
        if (error) {
            throw new KError('Missing parameter replaceByCategoryId', 400);
        }

        const formerId = req.preloaded.category.id;
        const replaceById = req.body.replaceByCategoryId || null;

        await destroyOneCategory(userId, formerId, replaceById);

        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when deleting a category');
    }
}
