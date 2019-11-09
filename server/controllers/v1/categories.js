import Budgets from '../../models/budgets';
import Categories from '../../models/categories';
import Transactions from '../../models/transactions';

import { makeLogger, KError, asyncErr } from '../../helpers';
import { checkExactFields, checkAllowedFields } from '../../shared/validators';

let log = makeLogger('controllers/categories');

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

export async function create(req, res) {
    try {
        let { id: userId } = req.user;

        let error = checkExactFields(req.body, ['label', 'color']);
        if (error) {
            throw new KError(`when creating a category: ${error}`, 400);
        }

        let created = await Categories.create(userId, req.body);
        res.status(200).json(created);
    } catch (err) {
        return asyncErr(res, err, 'when creating category');
    }
}

export async function update(req, res) {
    try {
        let { id: userId } = req.user;

        let error = checkAllowedFields(req.body, ['label', 'color']);
        if (error) {
            throw new KError(`when updating a category: ${error}`, 400);
        }

        let category = req.preloaded.category;
        let newCat = await Categories.update(userId, category.id, req.body);
        res.status(200).json(newCat);
    } catch (err) {
        return asyncErr(res, err, 'when updating a category');
    }
}

export async function destroy(req, res) {
    try {
        let { id: userId } = req.user;

        let error = checkExactFields(req.body, ['replaceByCategoryId']);
        if (error) {
            throw new KError('Missing parameter replaceByCategoryId', 400);
        }

        let former = req.preloaded.category;

        let replaceBy = req.body.replaceByCategoryId;
        if (replaceBy !== null) {
            log.debug(`Replacing category ${former.id} by ${replaceBy}...`);
            let categoryToReplaceBy = await Categories.find(userId, replaceBy);
            if (!categoryToReplaceBy) {
                throw new KError('Replacement category not found', 404);
            }
        } else {
            log.debug('No replacement category, replacing by the None category.');
        }
        let categoryId = replaceBy;

        let operations = await Transactions.byCategory(userId, former.id);
        for (let op of operations) {
            await Transactions.update(userId, op.id, { categoryId });
        }

        await Budgets.destroyForCategory(userId, former.id, categoryId);

        await Categories.destroy(userId, former.id);
        res.status(200).end();
    } catch (err) {
        return asyncErr(res, err, 'when deleting a category');
    }
}
