import Budgets from '../../models/budgets';
import Categories from '../../models/categories';
import Operation from '../../models/operation';

import { makeLogger, KError, asyncErr } from '../../helpers';

let log = makeLogger('controllers/categories');

export async function create(req, res) {
    try {
        let { id: userId } = req.user;
        let cat = req.body;

        // Missing parameters
        if (typeof cat.title === 'undefined') {
            throw new KError('Missing category title', 400);
        }
        if (typeof cat.color === 'undefined') {
            throw new KError('Missing category color', 400);
        }

        if (typeof cat.parentId !== 'undefined') {
            let parent = await Categories.find(userId, cat.parentId);
            if (!parent) {
                throw new KError(`Category ${cat.parentId} not found`, 404);
            }
        }

        let created = await Categories.create(userId, cat);
        res.status(200).json(created);
    } catch (err) {
        return asyncErr(res, err, 'when creating category');
    }
}

export async function preloadCategory(req, res, next, id) {
    try {
        let { id: userId } = req.user;
        let category;
        category = await Categories.find(userId, id);

        if (!category) {
            throw new KError('Category not found', 404);
        }

        req.preloaded = { category };
        return next();
    } catch (err) {
        return asyncErr(res, err, 'when preloading a category');
    }
}

export async function update(req, res) {
    try {
        let { id: userId } = req.user;
        let params = req.body;

        // Missing parameters
        if (typeof params.title === 'undefined') {
            throw new KError('Missing title parameter', 400);
        }
        if (typeof params.color === 'undefined') {
            throw new KError('Missing color parameter', 400);
        }

        let category = req.preloaded.category;
        let newCat = await Categories.update(userId, category.id, params);
        res.status(200).json(newCat);
    } catch (err) {
        return asyncErr(res, err, 'when updating a category');
    }
}

export async function destroy(req, res) {
    try {
        let { id: userId } = req.user;

        let replaceby = req.body.replaceByCategoryId;
        if (typeof replaceby === 'undefined') {
            throw new KError('Missing parameter replaceby', 400);
        }

        let former = req.preloaded.category;

        let categoryId;
        if (replaceby.toString() !== '') {
            log.debug(`Replacing category ${former.id} by ${replaceby}...`);
            let categoryToReplaceBy = await Categories.find(userId, replaceby);
            if (!categoryToReplaceBy) {
                throw new KError('Replacement category not found', 404);
            }
            categoryId = replaceby;
        } else {
            log.debug('No replacement category, replacing by None.');
            categoryId = null;
        }

        let operations = await Operation.byCategory(userId, former.id);
        for (let op of operations) {
            await Operation.update(userId, op.id, { categoryId });
        }

        await Budgets.destroyForCategory(userId, former.id, categoryId);

        await Categories.destroy(userId, former.id);
        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when deleting a category');
    }
}
