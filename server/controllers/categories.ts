import express from 'express';

import { Budget, Category, Transaction } from '../models';
import { makeLogger, KError, asyncErr } from '../helpers';
import { hasForbiddenOrMissingField, hasForbiddenField } from '../shared/validators';

import { IdentifiedRequest, PreloadedRequest } from './routes';

const log = makeLogger('controllers/categories');

export async function preloadCategory(
    req: IdentifiedRequest<Category>,
    res: express.Response,
    nextHandler: Function,
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

export async function create(req: IdentifiedRequest<Category>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const error = hasForbiddenOrMissingField(req.body, ['label', 'color']);
        if (error) {
            throw new KError(`when creating a category: ${error}`, 400);
        }

        const created = await Category.create(userId, req.body);
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

export async function destroy(req: PreloadedRequest<Category>, res: express.Response) {
    try {
        const { id: userId } = req.user;

        const error = hasForbiddenOrMissingField(req.body, ['replaceByCategoryId']);
        if (error) {
            throw new KError('Missing parameter replaceByCategoryId', 400);
        }

        const former = req.preloaded.category;

        const replaceBy = req.body.replaceByCategoryId;
        if (replaceBy !== null) {
            log.debug(`Replacing category ${former.id} by ${replaceBy}...`);
            const categoryToReplaceBy = await Category.find(userId, replaceBy);
            if (!categoryToReplaceBy) {
                throw new KError('Replacement category not found', 404);
            }
        } else {
            log.debug('No replacement category, replacing by the None category.');
        }
        const categoryId = replaceBy;

        const operations = await Transaction.byCategory(userId, former.id);
        for (const op of operations) {
            await Transaction.update(userId, op.id, { categoryId });
        }

        await Budget.destroyForCategory(userId, former.id, categoryId);

        await Category.destroy(userId, former.id);
        res.status(200).end();
    } catch (err) {
        asyncErr(res, err, 'when deleting a category');
    }
}
